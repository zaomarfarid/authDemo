const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const bcrypt = require('bcrypt');
const session = require('express-session');
const User = require('./models/user');
const app = express();
const port = 3001;

mongoose.connect('mongodb://localhost:27017/authDemo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

const sessionConfig = {
    secret: 'notagoodsecret',
    resave: false,
    saveUninitialized: false
}

app.use(session(sessionConfig));

app.use((req, res, next) => {
    res.locals.title = 'Auth Demo';
    next();
})

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login');
    }
    next();
}

app.get('/', (req, res) => {
    res.send('home');
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const user = new User({ username, password })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' })
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        return res.redirect('/secret');
    }
    res.redirect('/login')
});

app.get('/secret', requireLogin, (req, res) => {
    res.render('secret');
});

app.get('/topsecret', requireLogin, (req, res) => {
    res.send('top secret');
});

app.post('/logout', (req, res) => {
    // req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
});

app.listen(port, () => {
    console.log(`listening to http://localhost:${port}`);
});
const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const app = express();
const port = 3001;

mongoose.connect('mongodb://localhost:27017/authDemo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

app.use((req, res, next) => {
    res.locals.title = 'Auth Demo';
    next();
})

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('home');
});

app.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 12);
    const user = new User({ username, password: hash })
    await user.save();
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login', { title: 'Login' })
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = User.findOne({ username });
    const validPassword = await bcrypt.compare(password, user.password);
    if (validPassword) {
        res.redirect('/');
    }
    res.redirect('/login')
});

app.get('/secret', (req, res) => {
    res.send('secret');
});

app.listen(port, () => {
    console.log(`listening to http://localhost:${port}`);
});
const express = require('express');
const fs = require('fs');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser')
// const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
const port = 3001;
const cors = require('cors');

const SECRET_KEY = 'super-secret-key'

app.use(cors())
// app.use(express.json());
app.use(bodyParser.json())
// app.use(express.static('public'));
dotenv.config();

mongoose.connect(process.env.MONGO_CONNECT);
const db = mongoose.connection;

db.on('error', (error) => console.error(error));
db.once('open', () => {
    console.log('Connected to MongoDB Database');
});

const userSchema = new mongoose.Schema({
    name: String,
    username: String,
    password: String,
});

const UserModel = mongoose.model('auth', userSchema);

const router = express.Router();
app.use('/', router);

router.route('/')
    .get(getStart);

async function getStart(req, res) {
    fs.readFile('./index.html', (err, html) => {
        res.writeHeader(200, { 'Content-Type': 'text/html' });
        res.write(html);
        res.end();
    });
}

router.route('/login')
    .post(postLogin)
    .get(getLogin);

router.route('/signup')
    .post(postSign);

async function postLogin(req, res) {
    const { username, password } = req.body;
    const user = await UserModel.findOne({ username, password });
    if (!user) {
        res.status(401).json({ message: 'Invalid Credentials,Please Sign Up first' });
    } else {
        // res.status(200).json({ name: user.name, username: user.username, message: 'Data Found' });
        const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1hr' })
        res.json({ message: 'Login successful', token: token, name: user.name })
    }
    res.end();
};

async function getLogin(req, res) {
    res.status(200).json({ message: 'Login Page' });
    res.end();
}

async function postSign(req, res) {
    try {
        const userData = req.body;
        const { username, password } = req.body;
        const user = await UserModel.findOne({ username, password });
        if (user) {
            res.status(401).json({ message: 'User already exists' });
        } else {
            const newUser = new UserModel(userData);
            await newUser.save();
            res.status(200).json('User added to MongoDB!');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error adding user to MongoDB');
    }
    res.end();
};

router.route('/user')
    .post(getUser);

async function getUser(req, res) {
    const { username } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
        res.status(401).json({ message: 'Invalid Credentials,Please Sign Up first' });
    }
    else {
        res.status(200).json({ name: user.name, message: 'Success' });
    }
    res.end();
}


const eventSchema = new mongoose.Schema({
    username: String,
    eventname: String,
    description: String,
    date: Date
});

const EventModel = mongoose.model('event', eventSchema);

router.route('/createevent')
    .post(postEvent);


async function postEvent(req, res) {

    const { username, eventname, eventdescription, eventdate } = req.body;

    const newEvent = new EventModel({
        username: username,
        eventname: eventname,
        description: eventdescription,
        date: eventdate,
    });

    await newEvent.save();
    res.status(200).json({ message: 'Event Created' });
}

router.route('/getevents')
    .post(getEvents);

async function getEvents(req, res) {
    const { username } = req.body;
    try {
        const events = await EventModel.find({ username }).sort({ date: -1 });
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching events from MongoDB');
    }
    res.end();
}

router.route('/home')
    .post(getHome);

async function getHome(req, res) {
    const { username } = req.body;
    const user = await UserModel.findOne({ username });
    if (!user) {
        res.status(401).json({ message: 'Invalid Credentials,Please Sign Up first' });
    } else {
        res.status(200).json({ name: user.name, username: user.username, message: 'Data Found' });
    }
    res.end();
};

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
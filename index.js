const express = require('express');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
//import your mongoose models
var Message = require('./models/Message.model');
var User = require('./models/User.model');
// initialize our express app
const app = express();
//move it to env file later
let port = 1234;

//this is the path where the service of mngo db is hosted
var db = "mongodb://localhost:27017/chat-app-db";
mongoose.connect(db, { useNewUrlParser: true });

app.listen(port, () => {
    console.log('Server is up and running on port numner ' + port);
});
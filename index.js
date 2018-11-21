const express = require('express');
const bodyParser = require('body-parser');
var mongoose = require('mongoose');
var cors = require('cors');
//import your mongoose models
var Message = require('./models/Message.model');
var User = require('./models/User.model');
// initialize our express app
const app = express();
//move it to env file later
let port = 1234;
//middle ware to allow CORS
app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(require('method-override')());
//this is the path where the service of mngo db is hosted
var db = "mongodb://localhost:27017/chat-app-db";
mongoose.connect(db, { useNewUrlParser: true });

app.use(require('./routes'));

//if none of the routes match, forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });


app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(err.status || 500);

    res.json({'errors': {
      message: err.message,
      error: err
    }});
  });

app.listen(port, () => {
    console.log('Server is up and running on port numner ' + port);
});

module.exports = app;
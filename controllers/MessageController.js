var _ = require('lodash');
var mongoose = require('mongoose');
var router = require('express').Router();
var Message = mongoose.model('Message');
var crypto = require('crypto');
var auth = require('../routes/auth');

//get all messages sent to or from this user
// this will also update the read status of messages to UNREAD
//after that emit to all users that this user has received all messages sent by them
exports.getAllMessagesForUserId = function(req, res, next)
{
  //update read status of messages requested by the user and status equal to "SENT", to "UNREAD"
  Message.updateMany({"user_to" : req.params.userId, "read_status" : "SENT"},
                    {"read_status": "UNREAD"},
                    (err, model) => console.log('Error in updating read status')
         );
  //find all messages sent to this user or sent by this user
    var messages = Message.find( { $or: [ {user_from: req.params.userId}, {user_to: req.params.userId} ] } )
    .exec(function(err, mssgs) {
        if(err)
            next();
        return res.json({allMessages: mssgs});
    });
}

//get all messages between two users
//TODO:
// this will also update the read status of messages to UNREAD
//after that emit to all users that this user has received all messages sent by them.
exports.getAllMessagesForSenderAndReceiverIds = function(req, res, next)
{
  //update read status of messages requested by the user and status equal to "SENT", to "UNREAD"
    Message.updateMany({"user_to" : req.params.receiverId, "read_status" : "SENT"},
                    {"read_status": "UNREAD"},
                    (err, model) => console.log('Error in updating read status')
         );
    var messages = Message.find({user_from: req.params.senderId, user_to: req.params.receiverId})
    .exec(function(err, mssgs){
        if(err)
            next();
        return res.json({messages: mssgs});
    })
}

//send a message from a user to another user
exports.sendMessage = function(req, res, next)
{
    if(!req.body.user_from || !req.body.user_to || !req.body.content)
        return res.status(422).json({errors: "Cannot send this message."});

    var mssg = new Message();
    mssg.user_from = req.body.user_from;
    mssg.user_to = req.body.user_to;
    mssg.content = req.body.content;
    mssg.time = req.body.time;
    mssg.message_type = "TEXT";
    mssg.read_status = "SENT";
    mssg.save().then(function(){
        return res.json({mssgSent: true});
    }).catch(next);
}

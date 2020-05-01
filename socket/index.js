var constant = require('../constants');
var io = require('socket.io')();
var secret = require('../config/index');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Message = mongoose.model('Message');
var jwt = require('jsonwebtoken');
var messageEventHandlers = require('./messageUtils');
var userEventHandlers = require('./userUtils');

function getRoomName(id){
    return "Room_" + id;
}

exports.startIo = (server) => {

    io.use((socket, next) => {
        const token = socket.handshake.query.Token;
        // verify token
        jwt.verify(token, secret.secret, (err, decoded) => {
          if(err) return next(err);
          //verify that token passed is correct and map user id to socket id
          var user = User.findById(decoded.id);
          if(!user)
            socket.disconnect();
          next();
        });
    });

    io = io.listen(server);

    io.on(constant.SOCKET_CONNECTION, socket => {
        //to handle single user multiple connections, every connection joins a room defined by user id.
        //so, multiple connections of same user goes to same room.
        socket.join(getRoomName(socket.handshake.query.userid));
        //tell every client that a new user connected
        socket.broadcast.emit(constant.SOCKET_USER_CONNECTED, {userid: socket.handshake.query.userid});
        //register all required events
        userEventHandlers(socket, io);
        messageEventHandlers(socket, io);
    });


    return io;
};

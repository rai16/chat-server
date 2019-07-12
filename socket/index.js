var constant = require('../constants');
var io = require('socket.io')();
var secret = require('../config/index');
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Message = mongoose.model('Message');
var jwt = require('jsonwebtoken');

function getRoomName(id){
    return "Room_" + id;
}

function updateMessageReadStatus(mssgId, status){
    Message.findByIdAndUpdate(mssgId, {read_status: status}, 
        (err, model) => console.log('Error in updating status for '+ mssgId));
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
        socket.on(constant.SOCKET_MESSAGE, onNewMessage);
        socket.on(constant.SOCKET_MESSAGE_UNREAD, onMessageUnread);
        socket.on(constant.SOCKET_MESSAGE_READ, onMessageRead);

        //handler for when user sends new message
        function onNewMessage(payload){
            //check if payload is complete
            if(!payload.user_from || !payload.user_to || !payload.content)
                socket.emit(constant.SOCKET_MESSAGE_ERROR, 'One or more message parameters missing');
            else{
                var mssg = new Message();
                mssg.user_from = payload.user_from;
                mssg.user_to =  payload.user_to;
                mssg.content = payload.content;
                mssg.time = payload.time;
                mssg.message_type = "TEXT";
                mssg.read_status = "SENT";
                //save message in DB
                mssg.save().then(function(){
                    console.log(mssg._id);
                    //emit event for message saved at DB
                    socket.emit(constant.SOCKET_MESSAGE_SENT, {messageId: mssg._id});
                    //if user connected send it to him 
                    if(isUserConnected(payload.user_to)){
                        socket.to(getRoomName(mssg.user_to)).emit(constant.SOCKET_MESSAGE_RECEIVED, mssg);
                        //tell client that message sent to user
                        socket.emit(constant.SOCKET_MESSAGE_UNREAD, {userId: mssg.user_to});
                        //update message status in DB
                        updateMessageReadStatus(mssg._id, "UNREAD");
                    }
                    
                }).catch(socket.emit(constant.SOCKET_MESSAGE_ERROR, 'Error in saving message'));
            }
        }

        function onMessageUnread(payload){
            if(isUserConnected(payload.user_to))

        }

        function onMessageRead(payload){

        }
    });

    function isUserConnected(userId){
        return io.sockets.adapter.rooms[getRoomName(userId)];
    }
    
    return io;
};

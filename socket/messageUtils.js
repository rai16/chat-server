var constant = require('../constants');

module.exports = function(socket, io){

  socket.on(constant.SOCKET_MESSAGE_TYPING, onMessageTyping);
  socket.on(constant.SOCKET_MESSAGE, onNewMessage);
  socket.on(constant.SOCKET_MESSAGE_UNREAD, onMessageUnread);
  socket.on(constant.SOCKET_MESSAGE_READ, onMessageRead);

  function updateMessageReadStatus(mssgId, status)
  {
      Message.findByIdAndUpdate(mssgId, {read_status: status},
          (err, model) => console.log('Error in updating status for '+ mssgId));
  }

  function getRoomName(id){
      return "Room_" + id;
  }

  function isUserConnected(id){
    return io.sockets.adapter.rooms[getRoomName(id)];
  }

  //handler for when a user is typing. Payload contains user_from ie the person typing and user_to ie the person being typed to
  function onMessageTyping(payload)
  {
    if(!payload.user_from || !payload.user_to)
        socket.emit(constant.SOCKET_MESSAGE_ERROR, 'Could not send message.');
    else
    {
       //if the user being typed to is connected let him know
        if(isUserConnected(payload.user_to))
            socket.to(getRoomName(mssg.user_to)).emit(constant.SOCKET_MESSAGE_TYPING, {user: user_from});
    }
  }

  //handler for when user sends new message
  function onNewMessage(payload)
  {
      //check if payload is complete
      if(!payload.user_from || !payload.user_to || !payload.content)
          socket.emit(constant.SOCKET_MESSAGE_ERROR, 'Could not send message.');
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
              //emit event for message saved at DB
              socket.emit(constant.SOCKET_MESSAGE_SENT, {message: mssg});
              //if user connected send it to him
              if(isUserConnected(payload.user_to))
                  socket.to(getRoomName(mssg.user_to)).emit(constant.SOCKET_MESSAGE_RECEIVED, {message: mssg});

          }).catch(socket.emit(constant.SOCKET_MESSAGE_ERROR, 'Error in saving message'));
      }
  }

//User acknowledging that message that was sent has now been received.
//If the user that sent that message is still connected, let him know.
  function onMessageUnread(payload)
  {
    if(!payload.messageId)
        socket.emit(constant.SOCKET_MESSAGE_ERROR, 'Unrecognized payload');
    else
    {
        var message = Message.findById(payload.messageId);
        updateMessageReadStatus(payload.messageId, "UNREAD");
        //if sender of message connected, let him know that all his messages now received
        if(isUserConnected(message.user_from))
          socket.to(getRoomName(message.user_from)).emit(constant.SOCKET_MESSAGE_UNREAD, payload.messageId);
    }
  }

//user that received a message that was previously unread is now read. The payload will contain user from id and
//user_to id (user_from : id of user who had sent messages, user_to: id of user who has now read all mssgs)
  function onMessageRead(payload)
  {
      if(!payload.user_from || !payload.user_to)
          socket.emit(constant.SOCKET_MESSAGE_ERROR, 'Unrecognized payload');
      else {
          Message.updateMany(
              {user_from: payload.user_from, user_to: payload.user_to},
              {$set: {read_status: "READ"}},
              (err, model) => console.log('Error in updating read status for '+ payload.user_from)
          );
          //if sender of messages is connected, let him know that all his messages were read
          if(isUserConnected(payload.user_from))
            socket.to(getRoomName(payload.user_from)).emit(constant.SOCKET_MESSAGE_READ, {userId : payload.user_to});
      }
  }
}

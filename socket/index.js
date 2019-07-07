var io = require('socket.io');

exports.startIo = (server) => {
    console.log('inside function');
    io = io.listen(server);
    io.on('connection', socket => {
        console.log("user connected!");
        console.log(socket);
    });
    return io;
    };

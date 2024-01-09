const io = require("socket.io")();
const socket = {
    io: io
};

// add your socket.io logic here
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("message", (data) => {
        console.log('Received data:', data);
    });
});

module.exports = socket;

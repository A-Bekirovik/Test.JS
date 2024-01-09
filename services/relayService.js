const relayEmitter = require("./emitter");
const socket = require("./socketService");
const mqttService = require("./mqttService");

// relay for socket messages
relayEmitter.on('socket', (data) => {
    console.log('Received data from WebSocket client:', data);
});

// relay for MQTT messages
relayEmitter.on('mqtt', (data) => {
    let jsonData = JSON.parse(data);
    console.log('Received data from MQTT broker:', jsonData);
    socket.io.emit('message', jsonData);
});
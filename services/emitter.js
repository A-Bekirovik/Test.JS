const EventEmitter = require('events');

class SocketMqttRelay extends EventEmitter {}

const relayEmitter = new SocketMqttRelay();

module.exports = relayEmitter;

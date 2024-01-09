const mqtt = require('mqtt');
const relayEmitter = require("./emitter")
const sqlService = require("./sqlService")

// broker connection and authentication
const brokerUrl = 'mqtt://81.172.209.161:1883';
const username = 'group3';
const password = '0x1+pie';

const options = {
    username: username,
    password: password,
};

async function init() {
    const mqttClient = mqtt.connect(brokerUrl, options);

    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker');
        mqttClient.subscribe('esp/data');
    });

    var currentPumpStatus = await sqlService.getInitialPumpStatus();

    mqttClient.on('message', async (topic, message) => {
        // relay data to sockets
        relayEmitter.emit('mqtt', message);

        const data = JSON.parse(message);
        if(currentPumpStatus != data.pumpActive) {
            console.log('Updating pump toggle');
            await sqlService.updatePumpToggle(data);
            currentPumpStatus = data.pumpActive;
        }
    });

    process.on('exit', () => {
        mqttClient.end();
    });
}

module.exports = {
    init,
};
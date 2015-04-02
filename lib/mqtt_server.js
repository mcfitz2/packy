var mosca = require('mosca');
var mqtt = require("mqtt");
module.exports = function (options, callback) {
	var ascoltatore = {
		//using ascoltatore
		type: 'mongo',
		url: options.db_url || "mongodb://localhost:27017/mqtt",
		pubsubCollection: 'ascoltatori',
		mongo: {}
	};

	var settings = {
		port: options.port || 1883,
		backend: ascoltatore
	};
	var mserver = new mosca.Server(settings);
	mserver.on('clientConnected', function (client) {
		console.log('client connected', client.id);
	});
	var mclient = mqtt.connect("mqtt://localhost");
	// fired when a message is received
	mserver.on('published', function (packet, client) {
		console.log('Published', packet);
	});
	mserver.client = mclient;
	callback(null, mserver);
};
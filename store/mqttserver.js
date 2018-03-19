var mosca = require("mosca");

var ascoltatore = {
	//using ascoltatore
	// type: 'mongo',
	// url: 'mongodb://localhost:27017/mqtt',
	// pubsubCollection: 'ascoltatori',
	// mongo: {}
};

Array.prototype.indexOf = function(val) {
	for (var i = 0; i < this.length; i++) {
		if (this[i] == val) return i;
	}
	return -1;
};

Array.prototype.remove = function(val) {
	var index = this.indexOf(val);
	if (index > -1) {
		this.splice(index, 1);
	}
};

var settings = {
	port: 1883,
	backend: ascoltatore
};

var server = new mosca.Server(settings);

// fired when the mqtt server is ready
server.on('ready',function(){
	console.log('Mosca Server is up and running ....');
});

// fired when a message is received
server.on('published',function(packet,client){
	var buffer = packet.payload;
	console.log("Published:", buffer);
	console.log("===String:===", buffer.toString());
});

server.on('subscribed',function(topic,client){
	console.log("subscribed:", topic);
});

server.on('unsubscribed',function(topic,client){
	console.log("unsubcribed:", topic);
});

server.on('clientConnected',function(client){
	/*if(clientId[0] == 'C'){	
		server.publish({
			topic: 'online',
			payload: client.id,
			qos: 1
		});
	}*/
	console.log('client connected:',client.id);
});

server.on('clientDisconnected',function(client){
	console.log('client disConnected:',client.id);
});

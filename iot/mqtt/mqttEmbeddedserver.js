var mosca = require("mosca");

var ascoltatore = {
	//using ascoltatore
	// type: 'mongo',
	// url: 'mongodb://localhost:27017/mqtt',
	// pubsubCollection: 'ascoltatori',
	// mongo: {}
};

var settings = {
	port: 1883,
	backend: ascoltatore,
	http: {
		port: 3000,
		bundle: true,
		static: './'
	}
};

var server = new mosca.Server(settings);

// fired when the mqtt server is ready
server.on('ready',function(){
	console.log('Mosca Server is up and running ....');
});

// fired when a message is received
server.on('published',function(packet,client){
	var buffer = packet.payload;
	console.log("============published:==========", buffer);
});

server.on('subscribed',function(topic,client){
	console.log("subscribed:", topic);
});

server.on('unsubscribed',function(topic,client){
	console.log("unsubcribed:", topic);
});

server.on('clientConnected',function(client){
	console.log('client connected:',client.id);
});

server.on('clientDisconnected',function(client){
	console.log('client disConnected:',client.id);
});
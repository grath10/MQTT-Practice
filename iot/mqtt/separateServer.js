var mosca = require("mosca");

var ascoltatore = {
	//using ascoltatore
	// type: 'mongo',
	// url: 'mongodb://localhost:27017/mqtt',
	// pubsubCollection: 'ascoltatori',
	// mongo: {}
};

var http = require('http'),
	httpServ = http.createServer();
	
var settings = {
};

var server = new mosca.Server(settings);

server.attachHttpServer(httpServ);
httpServ.listen(3000);

// fired when the mqtt server is ready
server.on('ready',function(){
	console.log('Mosca Server is up and running ....');
});

// fired when a message is received
server.on('published',function(packet,client){
	var buffer = packet.payload;
	var topic = packet.topic;
	console.log(topic + "============published:==========", buffer);
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
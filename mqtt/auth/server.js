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
	backend: ascoltatore
};

var server = new mosca.Server(settings);

// fired when the mqtt server is ready
server.on('ready', setup);

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
	var clientId = client.id;
	console.log('client connected:',clientId);
});

server.on('clientDisconnected',function(client){
	console.log('client disConnected:',client.id);
});

var authenticate = function(client, username, password, callback) {
  var authorized = (username === 'test' && password.toString() === 'passwd');
  if (authorized) client.user = username;
  callback(null, authorized);
}

function authPub(client, topic, payload, callback) {
  callback(null, payload);
}

function authSub(client, topic, callback) {
  callback(null, topic);
}

function setup() {
  server.authenticate = authenticate;
  server.authorizePublish = authPub;
  server.authorizeSubscribe = authSub;

  console.log('Mosca server is up and running....');
}

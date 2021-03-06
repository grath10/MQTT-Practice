var mosca = require("mosca");
var db = require('./db.js');

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
  validateUser(client, username, password, callback);
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

function validateUser(client, username, password, callback){
	console.log("userName: " + username + ",password: " + password);
	var SELECT_SQL = "select count(1) hasUser from client where clientid='" + username + "' and password='" + password.toString() + "'";
	db.query(SELECT_SQL, function(err, rows, fields){
        if(err){
            console.log('[QUERY ERROR]-', err.message);
            return;
        }
        console.log('----------QUERY-----------');
        console.log('QUERY Result:', rows);
		var row = rows[0];
		var authorized = false;
		if(row['hasUser']){
			authorized = true;
			client.user = username;
		}
		callback(null, authorized);
        // console.log('---------------------------');
    });
}

const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', function(){
	console.log('>>> connected');
	client.subscribe('/notice');
});	

client.on('message', function(topic, message){
	var perf = parseInt(message.toString());
	var data = {perf};
	
	if(perf > 100){
		data.tips = '液位过高';
	}else if(perf > 20){
		data.tips = '液位正常';
	}else{
		data.tips = '液位过低';
	}
	var dataStr = JSON.stringify(data);
	client.publish('/tips', dataStr);
	console.log(dataStr);
});

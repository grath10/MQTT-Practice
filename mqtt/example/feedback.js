const Koa = require('koa');
const mqtt = require('mqtt');
const app = new Koa();

var msg = {
	perf: '-',
	tips: ''
};
app.use(
	ctx => {
		ctx.body = '当前液位:' + msg.perf + " \n " + ', 动作提示:' + msg.tips + "\n";
});

app.listen(3000);

var client = mqtt.connect('mqtt://localhost:1883');
client.on('connect', function(){
	console.log('>>> connected');
	client.subscribe('/tips');
});

client.on('message', function(topic, message){
	var message = message.toString();
	var data = JSON.parse(message);
//	console.log(message);
	var tips = data.tips;
//	console.log(tips);
	msg = data;
	var cmd = getCmd(tips);
	client.publish('/control', cmd);
});

function getCmd(data){
	var cmd = '';
	if(data == '液位过低'){
		cmd = '注水';
	}else if(data == '液位过高'){
		cmd = '放水';
	}else{
		cmd = '无操作';
	}
	return cmd;
}

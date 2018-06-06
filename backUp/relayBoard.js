var mqtt = require('mqtt');
// var client = mqtt.connect('ws://test.mosquitto.org:8080');
var client = mqtt.connect('tcp://localhost:1883',{
	clientId: 'C1810001'
});

var adder = 0;

// X/TP: 温度数据
// X/WT: 湿度
// X/NI: 噪音
// X/CO: 二氧化碳浓度
// X/AQ: 空气质量
// X/PR: 压力值
// X/PW: 电表
// X/WM: 水表
// X/WL: 液位
// X/IN: 开关输入
// X/VR: 版本号
// X/RQ：申请下发参数
// X/HB：综合

var relationMap = ['TP', 'WT', 'NI', 'CO', 'AQ', 'PR', 'PW', 'WM', 'WL', 'IN', 'VR', 'RQ', 'HB'];
client.on('connect', function(){
	console.log('>>> connected');
	/* setInterval(  
		() => {   */
			// var random = createRandom(0, 12);
			var random = adder % 13;
			// var random = 12;
			var keyword = relationMap[random];
			client.publish('X/' + keyword, mockPerfs(keyword), {qos:1});
			adder++;
	/*	},
		8000
	 ); */
	client.subscribe('A/+', {qos:1});
});

client.on('message', function(topic, message){
	var theme = topic.substring(2);
	console.log("主题关键字:" + theme);
	if(theme == 'BC'){
		var broadcast = message.slice(2).toString();
		console.log(broadcast);
	}else{
		var content = getVal(message);
		console.log(content);
		if(content == '50'){
			var keyword = 'VR';
			client.publish('X/' + keyword, mockPerfs(keyword), {qos:1});
		}
	}
});

function mockPerfs(keyword){
	var buffer;
	if(keyword == 'VR'){
        var data = 'N.01.17.08.01';
	    var fixed = Buffer.from([0,0,1,8,6,1,7,8,0,0,0,1,2,0,1,7,0,9,0,1,1,3,1,1,0,0xD]);
		buffer = Buffer.concat([fixed, Buffer.alloc(13, data)]);
    }else if(keyword == 'RQ'){
        buffer = Buffer.from([0,0,0,5,0,1,6,1,7,8,0,0,0,1]);
    }else if(keyword == 'WM'){
        buffer = Buffer.from([0,0,0,0xF,6,1,7,8,0,0,0,1,2,0,1,7,0,9,0,1,1,3,1,1,0,4,0,0,0,0,4,0,3,4]);
    }else if(keyword == 'PW'){
        buffer = Buffer.from([0,0,2,3,6,1,7,8,0,0,0,1,2,0,1,7,0,9,0,1,0,8,2,0,1,8,0,0,0,2,1,5,7,0,0,0,0,0,0,0,7,4,0,0,0,0,0,6,0,7,0,0,0,0,0,0,4,6,0,0,0,0,4,9,0,7,0,0,0,0,0,0,4,5]);
    }else if(keyword == 'HB'){
		buffer = Buffer.from([0,0,2,7,6,1,7,8,0,0,0,1,2,0,1,7,0,9,0,1,1,3,0,5,0,2,0,0,2,6,6,1,7,8,0,0,0,2,2,0,1,7,0,9,0,1,1,4,0,0,0,2,0,0,1,7,6,1,7,8,0,0,0,3,2,0,1,7,0,9,0,1,1,2,2,0,0,2,0,0,0,4]);	
	}else{
        buffer = Buffer.from([0,0,0,0xD,6,1,7,8,0,0,0,1,2,0,1,7,0,9,0,1,1,3,0,1,0,2,0,0,2,7]);
    }
	return buffer;
}

function createRandom(lower, upper){
	var value = "";
	var range = upper - lower;
	value = lower + Math.round(Math.random() * range);
	return value;
}

function getVal(buffer){
	var str = "";
	for(var i=0;i<buffer.length;i++){
		str += buffer[i].toString(16);
	}
	return str;
}

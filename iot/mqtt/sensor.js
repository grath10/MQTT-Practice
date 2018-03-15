var mqtt = require('mqtt');
// var client = mqtt.connect('ws://test.mosquitto.org:8080');
var client = mqtt.connect('tcp://localhost:1883');

// X/TP : 温度数据
// X/WT : 湿度
// X/NI : 噪音
// X/CO : 二氧化碳浓度
// X/AQ : 空气质量
// X/PR: 压力值
// X/PW: 电表
// X/WT: 水表
// X/WL: 液位
// X/IN: 开关输入
// X/VR: 版本号
// X/RQ：申请下发参数
// X/HB ：综合

var relationMap = ['TP', 'WT', 'NI', 'CO', 'AQ', 'PR', 'PW', 'WT', 'WL', 'IN', 'VR', 'RQ', 'HB'];

client.on('connect', function(){
	console.log('>>> connected');
	setInterval(
		() => {
			var random = createRandom(0, 12);
			// var random = 11;
			var keyword = relationMap[random];
			client.publish('X/' + keyword, mockPerfs(keyword), {qos:1});
		},
		5000
	);
	client.subscribe('A/+', {qos:1});
});

client.on('message', function(topic, message){
	var theme = topic.substring(2);
	console.log("主题:", theme);
	console.log("消息内容:", message);
	if(theme == 'BC'){
		console.log(message.toString());
	}else{
		console.log(message.toString('hex'));
	}
});

function mockPerfs(keyword){
	var buffer;
	if(keyword == 'VR'){
        var data = 'N.01.17.08.01';
	    var fixed = Buffer.from([0,0x0D,0x61,0x78,0,0x01,0x20,0x17,9,1,0x13,0x11,13]);
		buffer = Buffer.concat([fixed, Buffer.alloc(13, data)]);
    }else if(keyword == 'RQ'){
        buffer = Buffer.from([0,5,1,0x61,0x78,0,1]);
    }else if(keyword == 'WT'){
        buffer = Buffer.from([0,0x0D,0x61,0x78,0,0x01,0x20,0x17,9,1,0x13,0x11,4,0x12,0x34,0x12,0x34]);
    }else if(keyword == 'PW'){
        buffer = Buffer.from([0,0x23,0x61,0x78,0,0x01,0x20,0x17,9,1,0x13,0x11,0x18,0x4,0x5,0,0x7,0x5,0x7,0,0x5,0x4,0x06,0,0x7,0x4,0x06,0,0x7,0x4,0x6,0,0x7,0x4,0x5,0,0x7]);
    }else if(keyword == 'HB'){
		buffer = Buffer.from([0,0x27,0x61,0x78,0,0x01,0x20,0x17,9,1,0x13,0x11,2,0x42,0x56,0x61,0x78,0,0x02,0x20,0x17,9,1,0x14,0x00,2,0x45,0x67,0x61,0x78,0,0x03,0x20,0x17,9,1,0x12,0x20,2,0x12,0x34]);	
	}else{
        buffer = Buffer.from([0,0x0D,0x61,0x78,0,0x01,0x20,0x17,9,1,0x13,0x11,2,0x45,0x67]);
    }
	return buffer;
}

function createRandom(lower, upper){
	var value = "";
	var range = upper - lower;
	value = lower + Math.round(Math.random() * range);
	return value;
}

Date.prototype.Format = function (fmt) { 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)){
	 	fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}    
	for (var k in o){
		if (new RegExp("(" + k + ")").test(fmt)){
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}
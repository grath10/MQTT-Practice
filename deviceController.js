var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', function(){
	console.log('>>> connected');
	setInterval(
		() => { 
			client.publish('/notice', mockCollectedPerfs());
		},
		10000
	);
	client.subscribe(['/control', '/voice']);
});

client.on('message', function(topic, message){
	console.log(message.toString());
});

function mockCollectedPerfs(){
	var valArr = [];
	for(var i = 0; i < 4; i++){
		valArr.push(getPerfVal(i));
	}
	return valArr.join("&&");
}

function getPerfVal(index){
	var value;
	switch(index){
		case 0:
			value = new Date().Format ("yyyy-MM-dd hh:mm:ss");
			break;
		case 1:
			value = createRandom(20, 40);
			break;
		case 2:
			value = createRandom(0, 1000);
			break;
		case 3:
			value = createRandom(0, 10);
			break;
	}
	return value;
}

function createRandom(lower, upper){
	var value = "";
	var range = upper - lower;
	value = lower + Math.round(Math.random() * range);
	return value;
}

Date.prototype.Format = function (fmt) { 
    var o = {
        "M+": this.getMonth() + 1, // month
        "d+": this.getDate(), // day 
        "h+": this.getHours(), // hour 
        "m+": this.getMinutes(), // minute
        "s+": this.getSeconds(), // second 
        "q+": Math.floor((this.getMonth() + 3) / 3), // quarter 
        "S": this.getMilliseconds() // millisecond
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

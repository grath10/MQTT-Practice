const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');
var db = require('./db.js');
var TEST_TABLE = 'perfstore';

client.on('connect', function(){
	console.log('>>> connected');
	client.subscribe('/notice');
});	

client.on('message', function(topic, message){
	// message为Buffer
	var str = message.toString();
	// 将str拆分成指定格式，分别提取出相应数值
	var perfArr = str.split("&&");
	// console.log(perfArr);
	var cmdArr = [];
	for(var i = 1; i < 4;i++){
		cmdArr.push(getCmdControl(perfArr[i], i));
	}	
	var INSERT_SQL = 'insert into ' + TEST_TABLE + '(collecttime, temperature, current, voltage) values (?,?,?,?)';
	db.query(INSERT_SQL, perfArr, function(err, rows){
		if(err){
			console.log('[INSERT ERROR]-', err.message);
			return;
		}
		// console.log('----------INSERT-----------');
		// console.log('INSERT Result:', rows);
		// console.log('---------------------------');
	});
	var cmdstr = cmdArr.join(" ");
	// console.log('====控制命令====', cmdstr);
	client.publish('/control', cmdstr);
});

function getCmdControl(value, index){
	var cmd = '';
	var limitArr = getLimitByType(index);
	var perf = getNameByIndex(index);
	if(value < limitArr[0]){
		cmd = ' 低于下限' + limitArr[1];
	}else if(value <= limitArr[1]){
		cmd = ' 正常';
	}else{
		cmd = ' 高于上限' + limitArr[1];
	}
	return perf + ':' + value + cmd;	
}

function getLimitByType(index){
	var arr = [];
	if(index == 1){
		arr = [25, 35];
	}else if(index == 2){
		arr = [100, 800];
	}else{
		arr = [1, 6];
	}
	return arr;
}

function getNameByIndex(index){
	var name = '';
	if(index == 1){
		name = '温度';
	}else if(index == 2){
		name = '电流';
	}else{
		name = '电压';
	}
	return name;
}
	


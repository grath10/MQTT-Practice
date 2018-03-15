const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');
var db = require('./db.js');
var TEST_TABLE = 'perfstore';

client.on('connect', function(){
	console.log('>>> connected');
	client.subscribe('/notice');
});	

client.on('message', function(topic, message){
	// message is Buffer
	var str = message.toString();
	// extract the values from str based on corresponding format
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
	// console.log('====control command:====', cmdstr);
	client.publish('/control', cmdstr);
});

function getCmdControl(value, index){
	var cmd = '';
	var limitArr = getLimitByType(index);
	var perf = getNameByIndex(index);
	if(value < limitArr[0]){
		cmd = ' lower than ' + limitArr[1];
	}else if(value <= limitArr[1]){
		cmd = ' normal';
	}else{
		cmd = ' higher than ' + limitArr[1];
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
		name = 'Temperture';
	}else if(index == 2){
		name = 'current';
	}else{
		name = 'voltage';
	}
	return name;
}
	


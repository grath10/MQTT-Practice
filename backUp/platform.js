const mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883', {
	clientId: 'Platform'
});
var db = require('./db.js');

client.on('connect', function(){
	console.log('>>> connected');
	// client.subscribe(['online', 'X/+'],{qos:1});
	client.subscribe(['$SYS/+/new/clients', 'X/+'],{qos:1});
	// 广播消息(格式为GB2312，是否必须要手动转编码格式，待验证)
	// 将UTF-8编码格式转换成GB2312
	// var encodedText = iconv.encode(text, 'gb2312');
	// client.publish('A/BC', '测试消息', {qos:1});
	// var buffer = makePayload('61780005');
	// client.publish('A/CN', buffer, {qos:1});
});	

function makePayload(clientid){
	var buffer = Buffer.alloc(8);
	buffer.writeInt16BE(8);
	var numArr = [];
	// 目标格式：0x61,0x78,0x00,0x01
	for(var i=0;i< clientid.length;i+=2){
		var numInt = parseInt(clientid[i]+ clientid[i+1], 16);
		numArr.push(numInt);
	}
	console.log("处理数组:", numArr);
	var clientBuf = Buffer.from(numArr);
	clientBuf.copy(buffer, 2);
	buffer.writeInt16BE(0x1002, 6);
	return buffer;
}
	
client.on('message', function(topic, message){
	// message为Buffer类型，直接进行处理，不用转换成字符串格式
	console.log("当前消息主题:", topic);
	// if(topic == 'online'){
	if(topic.indexOf('$SYS') > -1){
		// 中转板编号
		var clientid = message.toString();
		getSensorParameters(clientid, function(rows, fields){
			// 数据类型为对象
			for(var j=0;j<rows.length;j++){
				var row = rows[j];
				// console.log("============查询结果:==========" + row);
				// console.log("============字段名称:==========" + fields);
				if(row){
					var buffer = Buffer.alloc(2 * 6 + 1);
					buffer.writeInt16BE(13);
					// console.log("查询字段个数:", fields.length);
					for(var i=0;i<fields.length;i++){
						var field = fields[i]['name'];
						// console.log("字段名称:", field);
						var val = row[field];
						// console.log("参数数值:", val);
						if(i == 0){
							buffer.writeInt8(val, 2);
						}else{
							buffer.writeInt16BE(val, 2*i+1);
						}
					}
					client.publish('A/PM', buffer);
				}
			}
		});
	}else{
		processTopicContent(topic, message);
	}
});

function processTopicContent(topic, message){
	var keyword = topic.substring(2);
	console.log("消息关键字:", keyword);
	// 总字节数
	// 是否需要校验总字节数
	var total = message.slice(0, 2).readInt16BE();
	var info = message.slice(2);
	// 传感器标识号Subid（4）+年份（2）+月份（1）+日份（1）+小时（1）+分钟（1）+有效数据长度（1）+数据（N）
    var returnResult;
    if(keyword == 'HB'){
		// 综合信息帧
        splitLines(total, info);
	}else if(keyword == 'RQ'){
		// 申请下发参数
        var cmd = info.slice(0, 1);
        var clientBuf = info.slice(1);
		// 客户端编号中十六进制大小写统一
		var clientid  = clientBuf.toString('hex').toUpperCase();
		console.log("客户端编号:", clientid);
        returnResult = [cmd, clientid];
		
        // 总字节数（2）+上限阈值（2）+下限阈值（2）+Delta阈值（2）+常规采样周期（2）+异常采样周期（2）
        // Number(data).toString(16), 从其他途径获取配置参数(是否需要关联数据库查询得到)
		getParameters(clientid, function(rows, fields){
			// 数据类型为对象
			var row = rows[0];
			console.log("============查询结果:==========", row);
			console.log("============字段名称:==========", fields);
			var buffer = Buffer.alloc(2 * 6);
			buffer.writeInt16BE(12);
			for(var i=0;i<fields.length;i++){
				console.log("参数数值:", row[fields[i]['name']]);
				buffer.writeInt16BE(row[fields[i]['name']], 2*(i+1));
			}
			client.publish('A/PM', buffer);
		});
	}else{
        returnResult = formatOneFrame(info, keyword);
		console.log("========结果:========", JSON.stringify(returnResult));
        // insert2Db(returnResult);
	}
}

function getSensorParameters(clientid, cb){
	var SELECT_SQL = "select id,highthreshold,lowthreshold,delta,normalsample,abnormalsample from module "
		+ "join hardware on keyword = type where parent='" + clientid + "' group by id";
	db.query(SELECT_SQL, function(err, rows, fields){
        if(err){
            console.log('[QUERY ERROR]-', err.message);
            return;
        }
        console.log('----------QUERY-----------');
        console.log('QUERY Result:', rows);
		cb(rows, fields);
        console.log('---------------------------');
    });
}

function getParameters(clientid, callback){
	var SELECT_SQL = "select highthreshold,lowthreshold,delta,normalsample,abnormalsample from module join hardware on keyword = type where clientid='" + clientid + "'";
	db.query(SELECT_SQL, function(err, rows, fields){
        if(err){
            console.log('[QUERY ERROR]-', err.message);
            return;
        }
        console.log('----------QUERY-----------');
        console.log('QUERY Result:', rows);
		callback(rows, fields);
        console.log('---------------------------');
    });
}
	
function splitLines(total, data) {
    var remaining = total;
    var fixedheader = 10;
    while(total > 0){
        var single = data.slice(10, 11);
        var dataLen = single.readInt8();
        var frameLen = 11 + dataLen;
        var digital = data.slice(11, 11 + dataLen);
        var realData = getRealData(dataLen, digital);
        var obj = extractField(data);
        console.log("========提取信息:========", JSON.stringify(obj));
		var formatObj = {
			'clientid': obj['subid'],
			'keyword': null,
			'collecttime': obj['datetimeStr'],
			'data': obj['realData']
		};
		// insert2Db(formatObj);
        total -= frameLen;
        data = data.slice(frameLen);
    }
}

function insert2Db(result) {
    var key = result['keyword'];
    var perfArr = [result['clientid'], null, result['collecttime']];
    var data = result['data'];
    if(key != 'PW'){
        perfArr.push(data, null, null, null, null, null);
    }else{
        perfArr = perfArr.concat(data.split(","));
    }
	console.log("数值列表:", perfArr);
	if(key != 'VR'){
		var INSERT_SQL = 'insert into perf (clientid, keyword, collecttime, value1, value2, value3, value4, value5, value6) values (?,?,?,?,?,?,?,?,?)';
		db.query(INSERT_SQL, perfArr, function(err, rows){
			if(err){
				console.log('[INSERT ERROR]-', err.message);
				return;
			}
			console.log('----------INSERT-----------');
			console.log('INSERT Result:', rows);
			console.log('---------------------------');
		});
	}else{
		
	}
}

function extractField(info) {
	console.log("消息报文内容:", info);
    var subid = info.slice(0, 4);
    var year = info.slice(4, 6);
    var month = info.slice(6, 7);
    var day = info.slice(7, 8);
    var hour = info.slice(8, 9);
    var minute = info.slice(9, 10);
    var validLen = info.slice(10, 11);
	var len = validLen.readInt8();
    var data = info.slice(11, 11 + len);
	console.log("有效数据长度:" + len);
	console.log("待解析数据内容:", data);
    var subidstr = subid.toString('hex');
    var yearstr = year.toString('hex');
    var monthstr = month.toString('hex');
    var daystr = day.toString('hex');
    var hourstr = hour.toString('hex');
    var minutestr = minute.toString('hex');
    var datetimeStr = yearstr + "-" + monthstr + '-' + daystr + " " + hourstr + ":" + minutestr;
	console.log("采集时间:", datetimeStr);
    var realData = getRealData(len, data);
	console.log("解析得到结果:", realData);
    return {
		subid: subidstr, 
		datetimeStr: datetimeStr, 
		realData: realData
	};
}

// 单一信息帧
function formatOneFrame(info, keyword) {
    var obj = extractField(info);
    var subid = obj.subid;
    var datetimeStr = obj.datetimeStr;
    var realData = obj.realData;
    return {
        'clientid': subid,
        'keyword': keyword,
        'collecttime': datetimeStr,
        'data': realData
    }
}

function getRealData(len, data) {
    var realData;
    // 水表 keyword == 'WM'
    if(len == 4){
        realData = data.readInt32BE();
    }else if(len == 13){
        // 版本 keyword == 'VR'
		realData = data.toString();
    }else if(len == 24){
        // 电表 keyword == 'PW'
		// 电表数值解析有疑问
		var arr = [];
		// var voltage = data.slice(0, 4);
		// var current = data.slice(4, 8);
		// var activepower = data.slice(8, 12);
		// var powerfactor = data.slice(12, 16);
		// var frequency = data.slice(16, 20);
		// var totalelec = data.slice(20);
		for(var i=0;i<6;i++){
			var perf = data.slice(4*i, 4*(i + 1));
			console.log("性能量值:", perf);
			var integer = perf.slice(0, 2);
			var decimal = perf.slice(2);
			console.log("整数部分:" + integer.readInt16BE() + ", 小数部分:" + decimal.readInt16BE());
			arr.push(integer.readInt16BE() + "." + decimal.readInt16BE());
		}
		realData = arr.join(",");
    }else{
        realData = data.readInt16BE();
    }
    return realData;
}
	


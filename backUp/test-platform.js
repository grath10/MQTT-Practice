const mqtt = require('mqtt');
// IP地址修正为实际broker对应地址
// tcp://192.168.0.234:1883
var client = mqtt.connect('tcp://192.168.0.234:1883', {
	clientId: 'Platform'
});
var db = require('./db.js');

client.on('connect', function(){
	console.log('>>> connected');
	client.subscribe(['$SYS/+/new/clients', 'X/+'],{qos:1});
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
	// 中转板刚上线时，会触发以下处理逻辑
	if(topic.indexOf('$SYS') > -1){
		var clientid = message.toString();
		// 中转板编号
		// 浏览器客户端连接时clientId为随机码
		if(clientid.indexOf('mqtt') == -1){
			console.log("中转板编号:", clientid);
			getSensorParameters(clientid, function(rows, fields){
				// 数据类型为对象
				for(var j=0;j<rows.length;j++){
					var row = rows[j];
					// console.log("============查询结果:==========" + row);
					// console.log("============字段名称:==========" + fields);
					if(row){
						var buffer = Buffer.alloc(2 * 6 * 2 + 2);
						var totalBytes = 11 * 2;
						var hexStr = totalBytes.toString(16);
						setVal(hexStr, buffer, 0, 4);
						// console.log("查询字段个数:", fields.length);
						for(var i=0;i<fields.length;i++){
							var field = fields[i]['name'];
							// console.log("字段名称:", field);
							var val = row[field];
							var fieldHex = row[field].toString(16);
							// console.log("参数数值:", val);
							if(i == 0){
								setVal(fieldHex, buffer, 4, 2);
							}else{
								setVal(fieldHex, buffer, 2 + 4 * i,4);
							}
						}
						client.publish('A/PM', buffer);
					}
				}
			});
		}
	}else{
		processTopicContent(topic, message);
	}
});

// 00 00 02 03 06 01 07 08 00 00 00 01 
// 01 09 07 00 00 01 00 01 00 00 02 03 01 08 00 00 00 02 00 09 
// 04 04 00 00 00 00 00 00 01 02 00 00 00 00 01 09 01 07 00 00
function processTopicContent(topic, message){
	var keyword = topic.substring(2);
	console.log("消息关键字:", keyword);
	// 总字节数
	// 是否需要校验总字节数
	var totalResp = message.slice(0, 4);
	var totalHex = getVal(totalResp);
	var total = parseInt(totalHex, 16);
	var info = message.slice(4);
	// 传感器标识号Subid（4）+年份（2）+月份（1）+日份（1）+小时（1）+分钟（1）+有效数据长度（1）+数据（N）
    var returnResult;
    if(keyword == 'HB'){
		// 综合信息帧
        splitLines(total, info);
	}else if(keyword == 'RQ'){
		// 申请下发参数 00 01
        var cmd = info.slice(0, 2);
        var clientBuf = info.slice(2);
		var clientid  = getVal(clientBuf);
		console.log("客户端编号:", clientid);
        returnResult = [cmd, clientid];
		var cmdstr = getVal(cmd);
		console.log("命令字:", cmdstr);
		if(cmdstr == '01'){
			// 总字节数（2）+上限阈值（2）+下限阈值（2）+Delta阈值（2）+常规采样周期（2）+异常采样周期（2）
			// Number(data).toString(16), 从其他途径获取配置参数(是否需要关联数据库查询得到)
			getSensorParameters(clientid, function(rows, fields){
				// 数据类型为对象
				var row = rows[0];
				console.log("============查询结果:==========", row);
				// console.log("============字段名称:==========", fields);
				var buffer = Buffer.alloc(2 * 6 * 2 + 2);
				var totalBytes = 11 * 2;
				var hexStr = totalBytes.toString(16);
				setVal(hexStr, buffer, 0, 4);
				console.log("最新内容:", buffer);
				for(var i=0;i<fields.length;i++){
					var field = fields[i]['name'];
					// console.log("参数数值:", row[field]);
					var fieldHex = row[field].toString(16);
					console.log("参数16进制数值:", fieldHex);
					if(i == 0){
						setVal(fieldHex, buffer, 4, 2);
					}else{
						setVal(fieldHex, buffer, 2 + 4 * i,4);
					}
					// console.log("最新内容:", buffer);
				}
				client.publish('A/PM', buffer);
			});
		}
	}else{
        returnResult = formatOneFrame(info, keyword);
		console.log("========结果:========", JSON.stringify(returnResult));
        insert2Db(returnResult);
	}
}

// 0x0a
// 00 00 00 0a
function setVal(value, buffer, start, length){
	var cmpLen = value.length;
	// console.log("写入字符串长度:", cmpLen);
	for(var i=start;i<start+length;i++){
		// 表示轮次数
		var turn = i - start;
		if(value[cmpLen - 1 - turn]){
			// console.log("写入buffer编号:", start - turn - 1 + length);
			buffer[start - turn - 1 + length] = parseInt(value[cmpLen - 1 - turn], 16);
		}
	}
}

function getSensorParameters(clientid, cb){
	var SELECT_SQL = "select `index`,highthreshold,lowthreshold,delta,normalsample,abnormalsample from module a "
		+ "join module_config b on a.keyword = b.keyword where b.clientid='" + clientid + "'";
	db.query(SELECT_SQL, function(err, rows, fields){
        if(err){
            console.log('[QUERY ERROR]-', err.message);
            return;
        }
        // console.log('----------QUERY-----------');
        // console.log('QUERY Result:', rows);
		cb(rows, fields);
        // console.log('---------------------------');
    });
}

function getParameters(clientid, callback){
	var SELECT_SQL = "select highthreshold,lowthreshold,delta,normalsample,abnormalsample from module "
		+ "join hardware on keyword = type where clientid='" + clientid + "'";
	db.query(SELECT_SQL, function(err, rows, fields){
        if(err){
            console.log('[QUERY ERROR]-', err.message);
            return;
        }
        // console.log('----------QUERY-----------');
        // console.log('QUERY Result:', rows);
		callback(rows, fields);
        // console.log('---------------------------');
    });
}
	
function splitLines(total, data) {
    var remaining = total;
    var fixedheader = 20;
	console.log("总字节数:", total);
	var realTotal = total * 2;
    while(realTotal > 0){
        var single = data.slice(20, 22);
        var lenHex = getVal(single);
		var dataLen = parseInt(lenHex, 16);
		console.log("数据区域长度:", dataLen);
        var frameLen = 22 + dataLen * 2;
        var digital = data.slice(22, 22 + dataLen * 2);
        var realData = getRealData(dataLen, digital);
        var obj = extractField(data);
        console.log("========提取信息:========", JSON.stringify(obj));
		var formatObj = {
			'clientid': obj['subid'],
			'keyword': null,
			'collecttime': obj['datetimeStr'],
			'data': obj['realData']
		};
		insert2Db(formatObj);
        realTotal -= frameLen;
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
			// console.log('----------INSERT-----------');
			console.log('INSERT Result:', rows);
			// console.log('---------------------------');
		});
	}
}

// 提取报文解析
// 06 01 07 08 00 00 00 01 01 09 07 00 00 01 00 01 00 00 02 03 01 08 00 00 00 02 00 09 
// 04 04 00 00 00 00 00 00 01 02 00 00 00 00 01 09 01 07 00 00
function extractField(info) {
	console.log("消息报文内容:", info);
    var subid = info.slice(0, 8);
    var year = info.slice(8, 12);
    var month = info.slice(12, 14);
    var day = info.slice(14, 16);
    var hour = info.slice(16, 18);
    var minute = info.slice(18, 20);
    var validLen = info.slice(20, 22);
	var lenHex = getVal(validLen);
	var len = parseInt(lenHex, 16);
    var data = info.slice(22, 22 + len * 2);
	console.log("有效数据长度:", len);
	console.log("待解析数据内容:", data);
	var subidstr = getVal(subid);
    var yearstr = getVal(year);
    var monthstr = getVal(month);
    var daystr = getVal(day);
    var hourstr = getVal(hour);
    var minutestr = getVal(minute);
    var datetimeStr = yearstr + "-" + monthstr + '-' + daystr + " " + hourstr + ":" + minutestr;
    var realData = getRealData(len, data);
	console.log("采集时间:", datetimeStr);
	console.log("解析结果:", realData);
    return {
		subid: subidstr, 
		datetimeStr: datetimeStr, 
		realData: realData
	}
}

function getVal(buffer){
	var str = "";
	for(var i=0;i<buffer.length;i++){
		str += buffer[i].toString(16);
	}
	return str;
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
	var tmpData;
    // 水表 keyword == 'WM'
    if(len == 4){
		tmpData = getVal(data);
		realData = parseInt(tmpData)/100;
    }else if(len == 13){
        // 版本 keyword == 'VR'
		realData = data.toString();
    }else if(len == 24){
        // 电表 keyword == 'PW'
		// 00 00 00 02 00 09 04 04 
		// 00 00 00 00 00 00 01 02 
		// 00 00 00 00 01 09 01 07
		var arr = [];
		for(var i=0;i<6;i++){
			var perf = data.slice(8*i, 8*(i + 1));
			var showData = getVal(perf);
			var decimal = parseInt(showData)/100;
			console.log("实际值:", decimal);
			arr.push(decimal);
		}
		realData = arr.join(",");
    }else{
        tmpData = getVal(data);
		realData = parseInt(tmpData);
    }
    return realData;
}
	


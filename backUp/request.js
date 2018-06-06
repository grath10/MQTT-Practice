var request = require('request');

// 人脸识别
function postFaceData(requestData){
	request({
		url: 'http://****/faceIdentify.json', 
		method: 'POST',
		json: true,
		body: requestData
	}, function(error, response, body) {
		console.log('==============');
		console.log("错误信息:", error);
		console.log("状态码:", response && response.statusCode);
		// console.log('body:', body);
	});
}

// 车牌号码识别
function postLicenseData(requestData){
	request({
		url: 'http://****/vehicleIdentify.json', 
		method: 'POST',
		json: true,
		body: requestData
	}, function(error, response, body) {
		console.log('==============');
		console.log("错误信息:", error);
		console.log("状态码:", response && response.statusCode);
		// console.log('body:', body);
	});
}

// 设备注册
function postDeviceData(requestData){
	request({
		url: 'http://****/registDev.json', 
		method: 'POST',
		json: true,
		body: requestData
	}, function(error, response, body) {
		console.log('==============');
		console.log("错误信息:", error);
		console.log("状态码:", response && response.statusCode);
		// console.log('body:', body);
	});
}

// 公共能耗报警
function postEnergyData(requestData){
	request({
		url: 'http://****/SavingWarnings/EnergyAlarm.json', 
		method: 'POST',
		json: true,
		body: {
			"data": [requestData],
			"info": ""
		}
	}, function(error, response, body) {
		console.log('==============');
		console.log("错误信息:", error);
		console.log("状态码:", response && response.statusCode);
		console.log('body:', body);
	});
}

// 地下室环境报警
function postBasementData(requestData){
	request({
		url: 'http://****/SavingWarnings/BasementAlarm.json', 
		method: 'POST',
		json: true,
		body: {
			"data": [requestData],
			"info": ""
		}
	}, function(error, response, body) {
		console.log('==============');
		console.log("错误信息:", error);
		console.log("状态码:", response && response.statusCode);
		console.log('body:', body);
	});
}

// postFaceData({
// 	"lng": 120.136,
// 	"lat": 31.556,
// 	"location": "第一小区",
// 	"fileUrl": "",
// 	"happen_time": 1514736000000,
// 	"name": "张三",
// 	"identityId": "320xxxxxxxxxxx",
// 	"familyAddress": "213栋502室",
// 	"accuracy": 90.5,
// 	"devCode":"ASD0009",
// 	"type": 1
// });

// postLicenseData({
// 	"lng": 120.136,
// 	"lat": 31.556,
// 	"location": "第一小区",
// 	"fileUrl": "",
// 	"happen_time": 1514736000000,
// 	"licensePlateNumber": "苏B123456",
// 	"familyAddress": "213栋502室",
// 	"devCode":"ASD0009",
// 	"type": 1
// });

// postDeviceData({
// 	"lng": 120.136,
// 	"lat": 31.556,
// 	"location": "一楼中部",
// 	"name": "一楼中部",
// 	"devCode":"X12-34",
// 	"type": "消防栓"
// });

postEnergyData({
	"alarm_code": "F12345",
    "dev_code":"",
    "lng": 120.136,
    "lat": 31.556,
    "description": "三区1号楼地下室公共用电",
    "type": "电压欠压",
    "alarm_time": 1514736000000,
    "alarm_param": 95.22,
    "reference_param": 80.00
});

postBasementData({
	"alarm_code": "",
    "dev_code":"",
    "lng": 120.136,
    "lat": 31.556,
    "description": "三区1号楼地下室强电间",
    "type": "禁区有人",
    "alarm_time": 1514736000000,
    "alarm_param": 95.22,
    "reference_param": 80.00
});

var express = require('express');
var router = express.Router();
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');
var iconv = require('iconv-lite');

/* Send voice text */
router.post('/', function(req, res, next) {
	var text = req.body.text;
	console.log(text);
	res.send({
		"status": "success"
	});
	// 将UTF-8编码格式转换成GB2312
	var encodedText = iconv.encode(text, 'gb2312');
	// var encodedText1 = encodedText.toString('binary');
	var encodedText1 = encodedText.toString();
	console.log('编码后:' + encodedText + "\t 转换:" + encodedText1);
	client.publish('/voice', encodedText1);
});

client.on('connect', function(){
	console.log('>>> connected');
});

module.exports = router;

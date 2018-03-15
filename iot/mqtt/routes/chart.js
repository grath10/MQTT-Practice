var express = require('express');
var router = express.Router();
var db = require('../tools/db');
var TEST_TABLE = 'perfstore';

/* GET display data */
router.get('/', function(req, res, next) {
	getDataFromDB(res);
});

function getDataFromDB(res){
	var sql = 'select collecttime, temperature, current, voltage from ' + TEST_TABLE;
	db.query(sql, function(err, rows, fields){
		if(err){
			console.log('[query ERROR]-', err.message);
			return;
		}
		var dataArr = processResultset(rows, fields);	
		res.render('data', { title: '采集数据展示', data: dataArr });
	});
}
module.exports = router;

function processResultset(rows, fields){
	var dataArr = [];
	for(var i = 0;i < rows.length; i++){
		var obj = rows[i];
		var rowArr = [];
		for(var j = 0; j < fields.length; j++){
			rowArr.push(obj[fields[j]['name']]);
		}
		dataArr.push(rowArr);
	}
	return dataArr;
}
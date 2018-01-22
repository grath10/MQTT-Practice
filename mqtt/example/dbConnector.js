var mysql = require('mysql');
var TEST_TABLE = 'perfstore';
// 创建连接
var connection = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: 'root',
	port: '3306',
	database: 'test'
});
// 连接数据库
connection.connect(handleError);
connection.on('error', handleError);

/*
connection.query('select * from ' + TEST_TABLE, function (err, rows, fields){
	if(err)	throw err;
	console.log('The results are:' + rows.length);
});
*/

var INSERT_SQL = 'insert into ' + TEST_TABLE + '(collecttime, temperature, current, voltage) values (?,?,?,?)';
var INSERT_PARAMS = ['2017-07-25 10:21:30', 36, 4, 6];
connection.query(INSERT_SQL, INSERT_PARAMS, function(err, result){
	if(err){
		console.log('[INSERT ERROR]-', err.message);
		return;
	}
	console.log('----------INSERT-----------');
	console.log('INSERT Result:', result);
	console.log('---------------------------');
});	
// 关闭连接
connection.end();

function handleError(err){
	if(err){
		// 如果连接断开，自动重新连接
		if(err.code == 'PROTOCOL_CONNECTION_LOST'){
			connection.connect(handleError);
			connection.on('error', handleError);
		}else{
			console.error(err.stack || err);
		}
	}
}

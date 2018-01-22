var mysql = require('mysql');
// 创建连接池
var pool = mysql.createPool({
	host: '127.0.0.1',
	user: 'root',
	password: 'root',
	database: 'platform'
});

function query(sql, params, callback){
	pool.getConnection(function (err, connection){
		if(err){
			callback(err, null, null);
		}else{	
			connection.query(sql, params, function(err, rows, fields){
				callback(err, rows, fields);
				connection.release();
			});
		}
	});
}

exports.query = query;

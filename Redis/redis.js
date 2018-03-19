var redis = require('redis'),
    RDS_PORT = 6379,        	//端口号
    RDS_HOST = '127.0.1.1',     //服务器IP
    RDS_OPTS = {},            	//设置项
    client = redis.createClient(RDS_PORT,RDS_HOST,RDS_OPTS);

client.on('ready',function(res){
    console.log('ready...');    
});

client.on('connect', function(){
	console.log('connect...');
});

client.on('error', function(err){
	console.log("Error " + err);
});

function rpush(key,json){
	client.rpush(key, json, function(err, res){
		if(err){
			console.log(err);
		}
	});
}

function ltrim(key, start, end){
	client.ltrim(key, start, end,function(err, res){
		if(err){
			console.log(err);
		}
	});
}

function lrange(key, start, end){
	client.lrange(key, start, end, function(err, res){
		if(err){
			console.log(err);
		}else{
			res.forEach(function(element){
				console.log('=============' + typeof element);
				var obj = JSON.parse(element);
				for(var key in obj){
					console.log(obj[key]);
				}
			});
		}
	});
}

module.exports = {
	rpush: rpush,
	ltrim: ltrim
}

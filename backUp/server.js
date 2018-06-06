var http = require('http');

http.createServer(function(req, resp){
	var url = req.url;
	if(url.indexOf('json') > -1){
		resp.writeHead(200, {'content-type': 'application/json'});
		var data = {
			'success': 1,
			'data': ''
		};
		resp.end(JSON.stringify(data));
	}else{
		resp.writeHead(200, {'content-type': 'text/plain'});
		resp.end('Hello world\n');
	}
}).listen(8080);

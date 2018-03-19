module.exports = {
	perf: {
		name: 'perf:#deviceID#',
		getDeviceID: function(name){
			return name.split(':')[1];
		}
	},
	getKey: function(key, json){
		var params = key.match(/#.*?#/g);
		params.forEach(function(param, index){
			var jsonKey = param.replace(/#/g, '');
			if(json[jsonKey] == undefined){
				throw new Error('Invalid redis key... KEY:' + key + ' PARAMS:' + json);
			}
			key = key.replace(param, json[jsonKey]);
		});
		return key;
	}
}

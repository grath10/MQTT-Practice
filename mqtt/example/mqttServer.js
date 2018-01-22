var mosca = require("mosca");
var server = new mosca.Server({
  http:{
    port:3000,
    bundle:true,
    static:'./'
  }
});
server.on('ready',function(){
  console.log('MQTT Server started....');
});
server.on('published',function(packet,client){
  console.log(' Published:',packet.payload);
});
server.on('subscribed',function(topic,client){
  console.log(' subscribed:',topic);
});
server.on('unSubscribed',function(topic,client){
  console.log(' unSubscribed:',topic);
});
server.on('clientConnected',function(client){
  console.log('client connected:',client.id);
});
server.on('clientDisConnected',function(client){
  console.log('client disConnected:'+client.id+' userNumber:'+usermap.keys.length);
});

// var client = mqtt.connect("ws://test.mosquitto.org:8080");
var client = mqtt.connect("mqtt://localhost:1883");

function sendMsg() {
    var msg = $("#msgContent").val();
    client.publish('A/BC', msg);
}

function sendFeedback() {
    var cmd = $("#cmd-content").val();
    var clientid = $("#sensorId").val();
    var buf = buffer["Buffer"].alloc(8);
    buf.writeInt16BE(8);
    for (var i = 0; i < clientid.length; i += 2) {
        var numStr = clientid[i] + clientid[i + 1];
        var numHex = parseInt(numStr, 16);
        buf.writeInt8(numHex, 2 + i / 2);
    }
    buf.writeInt16BE(parseInt(cmd), 6);
    client.publish('A/CN', buf);
    console.log(buf);
}
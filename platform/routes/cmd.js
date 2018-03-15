var express = require('express');
var router = express.Router();

/* GET feedback control command. */
router.get('/', function (req, res, next) {
    var clientid = req.query.clientid;
    var cmd = req.query.cmd;
    var buf = buffer.alloc(8);
    buf.writeInt16BE(8);
    for (var i = 0; i < clientid.length; i += 2) {
        var numhex = parseInt(clientid[i] + clientid[i + 1], 16);
        buf.writeInt8(numhex, 2 + i/2);
    }
    buf.writeInt16BE(cmd, 6);
    res.send(buf);
});

module.exports = router;

var express = require('express');
var router = express.Router();

/* Input voice text */
router.get('/', function(req, res, next) {
	res.render('voice', { message: '请输入文本', title: '文本控制'});
});

module.exports = router;

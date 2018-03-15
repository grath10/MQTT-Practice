const Koa = require('koa');
const app = new Koa();

app.use(
	ctx => {
		ctx.body = '当前液位:' + msg.perf + " \n " + ', 动作提示:' + msg.tips + "\n";
});

app.listen(3000);
	
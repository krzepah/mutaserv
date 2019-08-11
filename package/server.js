const polka = require('polka');
const httpServer = require('http');
// const io = require('socket.io');
const { json } = require('body-parser');
const dbService = require('./services/db');
const http = require('./http');
const logger = require('./config/logger');

dbService().start();

function log(req, res, next) {
	logger.info(req.method + ' ' + req.url + ' ' + res.statusCode);
	next();
}

const server = httpServer.createServer();

const app = polka({ server })
	.use(json())
	.use('user', http)
	.use(log);

if (process.env.SERVE !== 'false') {
	logger.info('Serving files from ' + process.env.SERVE);
	const serve = require('sirv')(process.env.SERVE);
	app.use(serve);
}
else if (process.env.SERVE === 'true') {
	logger.error('-s --serve command requieres a parameter. Cannot serve any file.');
}

module.exports = app;

const polka = require('polka');
// const httpServer = require('http');
// const io = require('socket.io');
const { json } = require('body-parser');
const dbService = require('./services/db');
const http = require('./http');
const logger = require('./config/logger');
const cors = require('cors');

dbService().start();

// const server = httpServer.createServer();

const log = (req, res, next) => {
	logger.info(req.method + ' ' + req.url);
	next();
};

const app = polka()
	.use(cors({ origin: process.env.ORIGIN, optionsSuccessStatus: 200 }))
	.use('/', log)
	.use(json())
	.use('user', http);

if (process.env.SERVE !== undefined && process.env.SERVE !== 'false') {
	logger.info('Serving files from ' + process.env.SERVE);
	const serve = require('sirv')(process.env.SERVE);
	app.use(serve);
}
else if (process.env.SERVE === 'true') {
	logger.error('-s --serve command requieres a parameter. Cannot serve any file.');
}

module.exports = app;

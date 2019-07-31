const polka = require('polka');
const http = require('http');
// const io = require('socket.io');
const { json } = require('body-parser');
const dbService = require('./services/db');
const userHandler = require('./handlers/user');
const logger = require('./config/logger');

dbService().start();

function log(req, res, next) {
	logger.info(req.method + ' ' + req.url + ' ' + res.statusCode);
	next();
}

const server = http.createServer();

const app = polka({ server })
	.use(json())
	.get('/', (req, res) => { res.end('Hello World'); })
	.use('user', userHandler)
	.use(log);

module.exports = app;

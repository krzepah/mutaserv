const polka = require('polka');
const { json } = require('body-parser');
const dbService = require('./services/db');
const userHandler = require('./handlers/user');

dbService().start();

function logger(req, res, next) {
	console.log(`${req.method} - ${req.url}`);
	next();
}

const app = polka()
	.use(json())
	.use(logger)
	.get('/', (req, res) => { res.end('Hello World'); })
	.use('user', userHandler);

module.exports = app;

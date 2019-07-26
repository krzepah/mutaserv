// const { http } = require('uws');
const polka = require('polka');
const { json } = require('body-parser');
const config = require('../config/');
const dbService = require('./services/db');
const userHandler = require('./handlers/user');

const { PORT=2017 } = process.env;

const environment = process.env.NODE_ENV;
const DB = dbService(environment, config.migrate).start();

function logger(req, res, next) {
	console.log(`${req.method} - ${req.url}`);
	next();
}

const { handler } = polka()
	.use(json())
	.use(logger)
	.get('/', (req, res) => { res.end('Hello World'); })
	.use('user', userHandler)
  .listen(PORT, err => {
		if (err) throw err;
		console.log(`> Running on localhost:${PORT}`);
	});

// http.createServer(handler).listen(PORT, err => {
// 	console.log(`> Running on localhost:${PORT}`);
// });

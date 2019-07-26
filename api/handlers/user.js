const polka = require('polka');
const ramda = require('ramda');
const mutations = require(process.env.MUTATIONS)(ramda);
const authmiddleware = require('../middlewares/auth');


module.exports = polka()
	.post('/login', (req, res) => {
		res.end('ok');
	})
	.post('/sign', (req, res) => {
		res.end('ok');
	})
	.use('/mutate', authmiddleware)
	.post('/mutate', (req, res) => {
		res.end('ok');
	})
	.get('/get-state', (req, res) => {
		res.end('ok');
	});

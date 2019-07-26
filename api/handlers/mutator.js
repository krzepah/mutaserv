const polka = require('polka');
const ramda = require('ramda');
const mutations = require(process.env.MUTATIONS)(ramda);
const authmiddleware = require('../middlewares/auth');

module.exports = polka()
	.use('/apply', authmiddleware)
	.post('/apply', (req, res) => {
		res.end('ok');
	})
	.get('/get-state', (req, res) => {
		res.end('ok');
	});

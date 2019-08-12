const jwt = require('jsonwebtoken');
const process = require('process');

const secret = process.env.SECRET;

const authService = () => {
	const issue = (payload) => jwt.sign(payload, secret, { expiresIn: 10800 });
	const verify = (token, cb) => jwt.verify(token, secret, {}, cb);
	const decode = (token) => jwt.decode(token, secret);

	return {
		issue,
		verify,
		decode
	};
};

module.exports = authService;

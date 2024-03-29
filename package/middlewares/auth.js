const authService = require('../services/auth');

// usually: "Authorization: Bearer [token]" or "token: [token]"
module.exports = (req, res, next) => {
	let tokenToVerify;

	if (req.headers.Authorization || req.headers.authorization) {
		const parts = req.headers.Authorization ? req.headers.Authorization.split(' ') : req.headers.authorization.split(' ');

		if (parts.length === 2) {
			const scheme = parts[0];
			const credentials = parts[1];

			if (/^Bearer$/.test(scheme)) {
				tokenToVerify = credentials;
			}
			else {
				res.statusCode = 401;
				res.end('Format for Authorization: Bearer [token]');
			}
		}
		else {
			res.statusCode = 401;
			res.end('Format for Authorization: Bearer [token]');
		}
	}
	else if (req.body.token) {
		tokenToVerify = req.body.token;
		delete req.query.token;
	}
	else {
		res.statusCode = 401;
		res.end('No Authorization was found');
	}

	return authService().verify(tokenToVerify, (err, thisToken) => {
		if (err) {
			res.statusCode = 401;
			res.end({ err });
		}
		req.token = thisToken;
		return next();
	});
};

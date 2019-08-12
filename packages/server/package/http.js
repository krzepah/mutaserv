const polka = require('polka');
const ramda = require('ramda');
const send = require('@polka/send-type');
const authService = require('./services/auth');
const bcryptService = require('./services/bcrypt');
const dbService = require('./services/db');
const authMiddleware = require('./auth');
const User = require('./user');
const logger = require('./config/logger');

let reducers;

const mutationReloader = (mod) => {
	reducers = mod;
	try {
		dbService().drop();
		dbService().sync();
		logger.info('Dropped database');
	}
	catch (err) {
		logger.error(err);
	}
};

reducers = require('./loader')(process.env.REDUCERS, mutationReloader);
module.exports = polka()
	.post('/login', async (req, res) => {
		const { email, password } = req.body;

		if (email && password) {
			try {
				const user = await User
					.findOne({
						where: {
							email
						}
					});
				if (!user)
					return send(res, 400, { msg: 'Bad Request: User not found' });
				if (bcryptService().comparePassword(password, user.password)) {
					const token = authService().issue({ id: user.id });
					const userData = JSON.parse(user.data);
					return send(res, 200, ({ token, user, ...userData }));
				}
				return send(res, 401, { msg: 'Unauthorized' });
			}
			catch (err) {
				logger.error(err);
				return send(res, 500, { msg: 'Internal server error' });
			}
		}
		return send(res, 400, { msg: 'Bad Request: Email or password is wrong' });
	})
	.post('/sign', async (req, res) => {
		const { body } = req;
		if (body.password === body.password2) {
			try {
				const user = await User.create({
					email: body.email,
					password: body.password,
					data: JSON.stringify(reducers.defaults)
				});
				const token = authService().issue({ id: user.id });
				return send(res, 200, { token, user });
			}
			catch (err) {
				logger.error(JSON.stringify(err));
				return send(res, 500, { ...ramda.map((e) => e.message, err.errors) });
			}
		}
		return send(res, 400, { msg: 'Bad Request: Passwords don\'t match' });
	})
	.use('/mutate', authMiddleware)
	.post('/mutate', async (req, res) => {
		const { assign } = Object;
		const { id } = req.token;
		const user = await User.findOne({ where: { ...id } });
		const { acts } = req.body;
		let state = JSON.parse(user.data);
		ramda.map((act) => {
			const key = Object.keys(act)[0];
			const update = reducers.reducers[key](state, act[key]);
			state = assign(assign({}, state), update);
		}, acts);
		user.data = JSON.stringify(state);
		user.save();
		return send(res, 200, { msg: 'Ok !' });
	})
	.use('/get-state', authMiddleware)
	.get('/get-state', async (req, res) => {
		const { id } = req.token;
		const user = await User.findOne({ where: { ...id } });
		return send(res, 200, user.data, { 'content-type': 'application/json' });
	});

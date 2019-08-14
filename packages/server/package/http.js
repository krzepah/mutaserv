const polka = require('polka');
const ramda = require('ramda');
const send = require('@polka/send-type');
const authService = require('./services/auth');
const bcryptService = require('./services/bcrypt');
const dbService = require('./services/db');
const authMiddleware = require('./auth');
const User = require('./user');
const logger = require('./config/logger');

let store;
const mutationReloader = (mod) => {
	store = mod;
	try {
		dbService().drop();
		dbService().sync();
		logger.info('Dropped database');
	}
	catch (err) {
		logger.error(err);
	}
};
store = require('./loader')(process.env.REDUCERS, mutationReloader);

module.exports = polka()
	.post('/login', async ({ body }, res) => {
		if (!body.username) return send(res, 401, { failure: 'Username is mandatory' });
		if (!body.password) return send(res, 401, { failure: 'Password is mandatory' });
		const { username, password } = body;
		try {
			const user = await User.findOne({ where: { username } });
			if (!user) return send(res, 400, { failure: 'User not found' });
			if (bcryptService().comparePassword(password, user.password)) {
				const token = authService().issue({ id: user.id });
				const userData = JSON.parse(user.data);
				return send(res, 200, ({ token, user, ...userData }));
			}
		}
		catch (err) {
			logger.error(err);
			return send(res, 500, { failure: 'Internal server error' });
		}
		return send(res, 401, { failure: 'Username or password is wrong' });
	})
	.post('/sign', async ({ body }, res) => {
		if (!body.username) return send(res, 401, { failure: 'Username is mandatory' });
		if (!body.password) return send(res, 401, { failure: 'Password is mandatory' });
		if (body.password != body.verification) return send(res, 401, { failure: 'Passwords don\'t match' });
		try {
			const user = await User.create({
				username: body.username,
				password: body.password,
				data: JSON.stringify(store.defaults)
			});
			const token = authService().issue({ id: user.id });
			return send(res, 200, { token, user });
		}
		catch (err) {
			if (err.errors) return send(res, 400, { failure: { ...ramda.map((e) => e.message, err.errors) } });
			logger.error('' + err);
			return send(res, 500, 'An error occured');
		}
	})
	.use('/mutate', authMiddleware)
	.post('/mutate', async ({ body, token }, res) => {
		const { assign } = Object; const { id } = token; const { acts } = body;
		const user = await User.findOne({ where: { ...id } });
		let state = JSON.parse(user.data);
		ramda.map((act) => {
			const key = Object.keys(act)[0];
			const update = store.reducers[key](state, act[key]);
			state = assign(assign({}, state), update);
		}, acts);
		user.data = JSON.stringify(state);
		user.save();
		return send(res, 200, { msg: 'Ok !' });
	})
	.use('/get-state', authMiddleware)
	.get('/get-state', async ({ token }, res) => {
		const { id } = token;
		const user = await User.findOne({ where: { ...id } });
		return send(res, 200, user.data, { 'content-type': 'application/json' });
	});

const request = require('supertest');
const {
	beforeAction,
	afterAction
} = require('../setup/_setup');
const User = require('../../package/user');

let api;

beforeAll(async () => {
	api = await beforeAction();
});

afterAll(() => {
	afterAction();
});

test('User | create', async () => {
	const res = await request(api)
		.post('/user/sign')
		.set('Accept', /json/)
		.send({
			email: 'martin@mail.com',
			password: 'securepassword',
			password2: 'securepassword'
		})
		.expect(200);

	expect(res.body.user).toBeTruthy();

	const user = await User.findByPk(res.body.user.id);

	expect(user.id).toBe(res.body.user.id);
	expect(user.email).toBe(res.body.user.email);

	await user.destroy();
});

test('User | login', async () => {
	const user = await User.create({
		email: 'martin@mail.com',
		password: 'securepassword'
	});

	const res = await request(api)
		.post('/user/login')
		.set('Accept', /json/)
		.send({
			email: 'martin@mail.com',
			password: 'securepassword'
		})
		.expect(200);

	expect(res.body.token).toBeTruthy();

	expect(user).toBeTruthy();

	await user.destroy();
});

test('User | get-state (auth)', async () => {
	const user = await User.create({
		email: 'martin@mail.com',
		password: 'securepassword',
		data: JSON.stringify({ elements: {}, elementsIds: [] })
	});

	const login = await request(api)
		.post('/user/login')
		.set('Accept', /json/)
		.send({
			email: 'martin@mail.com',
			password: 'securepassword'
		})
		.expect(200);
	
	expect(login.body.token).toBeTruthy();

	const state = await request(api)
		.get('/user/get-state')
		.set('Accept', /json/)
		.set('Authorization', `Bearer ${login.body.token}`)
		.set('Content-Type', 'application/json')
		.expect(200);
	expect(state.body.elements).toEqual({ });
	expect(state.body.elementsIds).toEqual([]);

	await user.destroy();
});

test('User | mutate (auth)', async () => {
	const user = await User.create({
		email: 'martin@mail.com',
		password: 'securepassword',
		data: JSON.stringify({ elements: {}, elementsIds: [] })
	});

	const login = await request(api)
		.post('/user/login')
		.set('Accept', /json/)
		.send({
			email: 'martin@mail.com',
			password: 'securepassword'
		})
		.expect(200);

	await request(api)
		.post('/user/mutate')
		.set('Accept', /json/)
		.set('Authorization', `Bearer ${login.body.token}`)
		.set('Content-Type', 'application/json')
		.send({
			acts: [
				{ newElement: { text: 'foo', newId: 'bar' } }
			]
		})
		.expect(200);

	const state = await request(api)
		.get('/user/get-state')
		.set('Accept', /json/)
		.set('Authorization', `Bearer ${login.body.token}`)
		.set('Content-Type', 'application/json')
		.expect(200);

	expect(state.body.elements).toEqual({ bar: { text: 'foo', id: 'bar' } });
	expect(state.body.elementsIds).toEqual(['bar']);

	await user.destroy();
});

const {
	beforeAction,
	afterAction
} = require('../setup/_setup');
const User = require('../../package/user');

let user;

beforeAll(async () => {
	await beforeAction();
});

afterAll(() => {
	afterAction();
});

beforeEach(async () => {
	user = await User.create({
		username: 'martin@mail.com',
		password: 'securepassword'
	});
});

test('User is created correctly', async () => {
	const sendUser = user.toJSON();
	expect(user.username).toBe('martin@mail.com');
	expect(sendUser.password).toBeFalsy();

	await user.destroy();
});

test('User is updated correctly', async () => {
	await user.update({
		username: 'peter@mail.com'
	});

	expect(user.username).toBe('peter@mail.com');

	await user.destroy();
});


import mutasync from '../index';

const storeMock = () => {
	let store = {};
	store.getState = () => store;
	store.setState = (val) => Object.assign(store, val);
	return store;
};

describe('sync object', () => {
	beforeEach(() => fetch.resetMocks());
	let sync = mutasync('localhost', storeMock());
	
	it('should be instantiable', () => {
		expect(sync).toMatchObject({
			login: expect.any(Function),
			logout: expect.any(Function),
			sign: expect.any(Function),
			sync: expect.any(Function)
		});
	});
});

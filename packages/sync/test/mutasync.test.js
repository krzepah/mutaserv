
import mutasync from '../package/index';

describe('sync object', () => {
	beforeEach(() => fetch.resetMocks());
	let sync = mutasync({ host: 'foo' });
	
	it('should be instantiable', () => {
		expect(sync).toMatchObject({
			listen: expect.any(Function),
			auth: expect.any(Function),
			retrieveLocal: expect.any(Function),
			clearLocal: expect.any(Function)
		});
	});
});

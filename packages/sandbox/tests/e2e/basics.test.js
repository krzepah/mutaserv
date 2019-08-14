jest.setTimeout(10000);

describe('Mutaserv', () => {
	beforeAll(async () => {
		await page.goto('http://localhost:8000');
	});

	it('should be titled "Mutaserv sandbox"', async () => {
		await expect(page.title()).resolves.toMatch('Mutaserv sandbox');
	});
});

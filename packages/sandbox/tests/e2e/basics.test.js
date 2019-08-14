/* global jest page beforeAll */

jest.setTimeout(10000);

const click = (selector, customPage = page) => customPage.evaluate(selector => {
	document.querySelector(selector).click();
}, selector);

describe('Mutaserv sandbox', () => {
	beforeAll(async () => await page.goto('http://localhost:8000'));
	it('should be titled "Mutaserv sandbox"', async () => {
		await expect(page.title()).resolves.toMatch('Mutaserv sandbox');
	});
	it('should have an input', async () => await page.waitForSelector('input'));
	it('should have a button', async () => await page.waitForSelector('button'));
	it('should have an ul', async () => await page.waitForSelector('ul'));
	it('should have a populated list after adding an element', async () => {
		await page.type('#input', 'foo');
		await new Promise( f => setTimeout(f, 15));
		await click('button');
		await new Promise( f => setTimeout(f, 15));
	});
});

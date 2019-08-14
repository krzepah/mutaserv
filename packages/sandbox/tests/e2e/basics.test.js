/* global jest page beforeAll */

jest.setTimeout(10000);

const click = (selector, customPage = page) => customPage.evaluate(selector => {
	document.querySelector(selector).click();
}, selector);

describe('Mutaserv', () => {
	beforeAll(async () => await page.goto('http://localhost:8000'));
	it('should be titled "Mutaserv sandbox"', async () => {
		await expect(page.title()).resolves.toMatch('Mutaserv sandbox');
	});
});

const goTo = async (selector) => {
	await page.goto('http://localhost:8000/');
	await page.waitForSelector(selector);
	const spy = jest.fn();
	page.once('domcontentloaded', spy);
	await click(selector);
	await page.wait;
	await new Promise( f => setTimeout(f, 10));
};


const testForm = (description, type, fields) =>
	describe(description, () => {
		beforeAll(async () => { await goTo('a[href="/' + type + '"]'); });
		it('should be titled "Mutaserv - ' + type + '"', async () => await expect(
			page.title()).resolves.toMatch('Mutaserv - ' + type));
		it('should have a form', async () => await page.waitForSelector('form'));
		it('should have all fields', async () => {
			for (let field of fields) await page.waitForSelector('input[id="' + field + '"]');
		});
		it('should have a button', async () => await page.waitForSelector('button'));
	});

testForm('Mutaserv login', 'login', ['username', 'password']);
testForm('Mutaserv sign', 'sign', ['username', 'password', 'verification']);

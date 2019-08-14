/* global jest page beforeAll */

jest.setTimeout(10000);

const click = (selector, customPage = page) => customPage.evaluate(selector => {
	document.querySelector(selector).click();
}, selector);

const goTo = async (selector) => {
	await page.goto('http://localhost:8000/');
	await page.waitForSelector(selector);
	const spy = jest.fn();
	page.once('domcontentloaded', spy);
	await click(selector);
	await page.wait;
	await new Promise( f => setTimeout(f, 10));
};

const getText = async selector => {
	const element = await page.$(selector);
	const text = await page.evaluate(element => element.textContent, element);
	return text;
};

describe('Mutaserv sandbox', () => {
	beforeAll(async () => await page.goto('http://localhost:8000'));
	it('should be titled "Mutaserv sandbox"', async () => {
		await expect(page.title()).resolves.toMatch('Mutaserv sandbox');
	});
	it('should have an input', async () => await page.waitForSelector('input'));
	it('should have a button', async () => await page.waitForSelector('button'));
});

const testForm = (description, type, fields, extra) =>
	describe(description, () => {
		beforeAll(async () => { await goTo('a[href="/' + type + '"]'); });
		it('should be titled "Mutaserv - ' + type + '"', async () => await expect(
			page.title()).resolves.toMatch('Mutaserv - ' + type));
		it('should have a form', async () => await page.waitForSelector('form'));
		it('should have all fields', async () => {
			for (let field of fields) await page.waitForSelector('input[id="' + field + '"]');
		});
		it('should have a button', async () => await page.waitForSelector('button'));
		it('should have an error div', async () => await page.waitForSelector('div[id="error"]'));
		it('should have an empty error div', async () => {
			const text = await getText('div[id="error"]');
			await expect(text).toBe('');
		});
		it('should have an failure div', async () => await page.waitForSelector('div[id="failure"]'));
		it('should have an empty failure div', async () => {
			const text = await getText('div[id="failure"]');
			await expect(text).toBe('');
		});
		it('should have a mandatory username field', async () => {
			await click('button');
			await new Promise( f => setTimeout(f, 10));
			const text = await getText('div[id="failure"]');
			await expect(text).toBe('Username is mandatory');
		});
		it('should have a mandatory password field', async () => {
			await page.type('#username', 'username');
			await click('button');
			await new Promise( f => setTimeout(f, 10));
			const text = await getText('div[id="failure"]');
			await expect(text).toBe('Password is mandatory');
		});
		if (extra !== undefined) extra();
	});

testForm('Mutaserv sandbox - login', 'login', ['username', 'password'], () => {
	it('should have a failure with an unknown user', async () => {
		await page.type('#username', 'foo');
		await page.type('#password', 'bar');
		await click('button');
		await new Promise( f => setTimeout(f, 10));
		const text = await getText('div[id="failure"]');
		await expect(text).toBe('User not found');
	});
});

testForm('Mutaserv sandbox - sign', 'sign', ['username', 'password', 'verification'], () => {
	it('should have a mandatory verification field', async () => {
		await page.type('#username', 'foo');
		await page.type('#password', 'bar');
		await click('button');
		await new Promise( f => setTimeout(f, 10));
		const text = await getText('div[id="failure"]');
		await expect(text).toBe('Passwords don\'t match');
	});
	it('should route to home on a correct sign', async () => {
		await page.type('#verification', 'bar');
		await new Promise( f => setTimeout(f, 10));
		await click('button');
		await new Promise( f => setTimeout(f, 10));
		expect(await page.url()).toMatch('/');
	});
});

describe('Mutaserv - login #2', () => {
	beforeAll(async () => { await goTo('a[href="/login"]'); });
	it('should be routed to home on successful login', async () => {
		await page.type('#username', 'foo');
		await page.type('#password', 'bar');
		await new Promise( f => setTimeout(f, 10));
		await click('button');
		await new Promise( f => setTimeout(f, 10));
		expect(await page.url()).toMatch('/');
	});
});

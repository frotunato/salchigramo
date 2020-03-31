(async () => {
	const puppeteer = require('puppeteer');
	const devices = require('puppeteer/DeviceDescriptors');
	const mobile = devices['iPhone XR'];
	const browser = await puppeteer.launch({headless: false, args: ['--no-sandbox', '--disable-setuid-sandbox',  '--disable-dev-shm-usage']});
	const page = await browser.newPage();
	const delay = require('delay');
	await page.emulate(mobile);

	await page.goto('https://mobile.facebook.com/');
	
	await page.type('#m_login_email', "frotunato3@gmail.com", {delay: 30})
	await page.type('#m_login_password', "mayonesa", {delay: 20})

	await Promise.all([
	  page.click('button[name="login"]', {delay: 20}),
	  page.waitForNavigation({waitUntil: 'networkidle0'}),
	]);
	/*
	const reminder = await page.$('form[action="/login/device-based/update-nonce/"')
	if (reminder)
		await Promise.all([
			page.click('a[href="/login/save-device/cancel/?flow=interstitial_nux&nux_source=regular_login"]', {delay: 20}),
			page.waitForNavigation({waitUntil: 'networkidle0'}),
		]);
	*/

	await page.goto("https://mobile.facebook.com/Test_SIE2020-109404094047039/")
	await Promise.all([
		page.waitForNavigation({waitUntil: 'networkidle0'}),
		page.click('a[aria-label="Publicar"]', {delay: 40}),
	])
	await page.waitFor('button[title="Añade una foto"]')
	
	
	const [fileChooser] = await Promise.all([
	    page.waitForFileChooser(),
	    page.click('button[title="Añade una foto"]', {delay: 50}),
	]);

	//await page.waitFor(100);
	console.log('starting upload')
	await Promise.all([
		//page.waitFor({waitUntil: 'networkidle0'}),
		//page.waitForSelector('button[value="Publicar"][type="submit"][disabled]', {visible: true}),
		page.waitFor('div[data-sigil="marea"] > form > div:nth-child(4) > div > div > div > img[alt]', { visible: true, waitUntil: 'networkidle0' }),
		fileChooser.accept(['C:/Users/Salchiport/Documents/salchigramo/sended picture.png']),
	]);
	console.log('finished upload')

	console.log('waiting for button to be enabled')
	//await page.waitForFunction("document.querySelector('button[value=" + '"Publicar"]).disabled !== false' + "");


	await page.waitFor('div[data-sigil="composer-header"] > div > div:last-child > div > button:not([disabled])');

	//await page.type('textarea[aria-label="Escribe algo..."]', "hola mundo", {delay: 25});

	//await page.waitFor('button[value="Publicar"][type="submit"]:not([disabled])')
	//await waitFor('button[data-sigil="touchable submit_composer"][disabled="false"]')
	//const blocked = await page.waitForSelector('button[value="Publicar"][type="submit"]:not([disabled])');
	console.log('the button should be clickable?')
	await page.type('textarea[aria-label="Escribe algo..."]', "hola mundo", {delay: 25})

	await Promise.all([
		page.waitForNavigation({waitUntil: 'networkidle0'}),
		page.click('div[data-sigil="composer-header"] > div > div:last-child > div > button', {delay: 40}),
	])

})()
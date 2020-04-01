const puppeteer = require('puppeteer');
const delay = require('delay');
const devices = require('puppeteer/DeviceDescriptors');
const mobile = devices['iPhone XR'];
//const puppeteerOpts = {headless: true, args: ['single-process','--no-sandbox', '--disable-setuid-sandbox',  '--disable-dev-shm-usage']};

async function post (browser, username, password, pageId, description, imgPath, cb) {
	//const browser = await puppeteer.launch(puppeteerOpts);
	const page = await browser.newPage();
	await page.emulate(mobile);
	try {
		await page.goto('https://mobile.facebook.com/', {waitUntil: 'networkidle0'});
		
		await page.waitForSelector('#m_login_email', {visible: true})
		await page.type('#m_login_email', username, {delay: 30})
		await page.type('#m_login_password', password, {delay: 20})

		await Promise.all([
		  page.click('button[name="login"]', {delay: 20}),
		  page.waitForNavigation({waitUntil: 'networkidle0'}),
		]);

		await page.goto("https://mobile.facebook.com/" + pageId)

		await Promise.all([
			page.waitForNavigation({waitUntil: 'networkidle0'}),
			page.click('a[aria-label="Publicar"]', {delay: 40}),
		])
		await page.waitFor('button[title="Añade una foto"]');
		
		//$("#pages_msite_body_contents > div > div:nth-child(3) > div > div > article")
		const [fileChooser] = await Promise.all([
		    page.waitForFileChooser(),
		    page.click('button[title="Añade una foto"]', {delay: 50}),
		]);

		console.log('starting upload');
		await Promise.all([
			page.waitFor('div[data-sigil="marea"] > form > div:nth-child(4) > div > div > div > img[alt]', { visible: true, waitUntil: 'networkidle0' }),
			fileChooser.accept([imgPath]),
		]);
		console.log('finished upload, waiting for the publish button to be enabled');

		await page.waitFor('div[data-sigil="composer-header"] > div > div:last-child > div > button:not([disabled])');

		console.log('the button should be clickable?');
		await page.type('textarea[aria-label="Escribe algo..."]', description, {delay: 25})

		await Promise.all([
			page.waitForNavigation({waitUntil: 'networkidle0'}),
			page.click('div[data-sigil="composer-header"] > div > div:last-child > div > button', {delay: 40}),
		])

		await page.goto("https://m.facebook.com/" +  pageId + "/posts/", {waitUntil: 'networkidle0'});

		const elementHandle = await page.$('.story_body_container > header > div:nth-child(2) > div > div > div > div:nth-child(2) > a');
		var postUrl = await page.evaluate(el => el.href, elementHandle);
		postUrl = postUrl.substr(0, postUrl.indexOf("/?type"))
		postUrl = postUrl.replace("m.facebook.com", "facebook.com")
		var postId = postUrl.substr(postUrl.lastIndexOf("/") + 1)
		await page.close();
		cb(null, postUrl, postId);
	} catch (error) {
		await page.close();
		cb(error, null)
	}
}

async function destroy (browser, username, password, pageId, postId, cb) {
	//const browser = await puppeteer.launch(puppeteerOpts);
	const page = await browser.newPage();
	await page.emulate(mobile);
	try {
		await page.goto('https://mobile.facebook.com/', {waitUntil: 'networkidle0'});
		
		await page.waitForSelector('#m_login_email', {visible: true})
		await page.type('#m_login_email', username, {delay: 30})
		await page.type('#m_login_password', password, {delay: 20})

		await Promise.all([
		  page.click('button[name="login"]', {delay: 20}),
		  page.waitForNavigation({waitUntil: 'networkidle0'}),
		]);

	} catch (error) {
		await browser.close();
		return cb(error.message);
	}

	try {
		await page.goto("https://mobile.facebook.com/photo.php?fbid=" + postId + "&id=" + pageId + "&delete", {waitUntil: 'networkidle0'})
		const deletedPost = await page.$('div[class="message"][data-sigil="error-message"]')
		if (deletedPost) {
		  throw new Error("selected page does not exist")
		}
	} catch (error) {
		await browser.close()
		return cb(null);
	}

	try {
		await page.click('button[type="submit"]')
		await page.waitForNavigation({waitUntil: 'networkidle0'})
		await browser.close();
		cb(null);
	} catch (error) {
		await browser.close();
		cb(error)
	}
}
	//await page.waitFor(100);

module.exports.post = post;
module.exports.destroy = destroy;
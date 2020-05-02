const puppeteer = require('puppeteer');
const delay = require('delay');
const devices = require('puppeteer/DeviceDescriptors');
const mobile = devices['iPhone XR'];
//const puppeteerOpts = {headless: true, args: ['single-process','--no-sandbox', '--disable-setuid-sandbox',  '--disable-dev-shm-usage']};

async function login (browser, username, password, pageId) {
	const page = await browser.newPage();
	await page.emulate(mobile);
	await page.goto("https://m.facebook.com/login.php?next=https://m.facebook.com/" + pageId)
	const loginRequired = await page.$('#m_login_email');
	if (loginRequired) {
		console.log('[FACEBOOK-LOGIN] login is required!, no cookies found')
		//await page.waitForSelector('#m_login_email', {visible: true})
		await page.type('#m_login_email', username)
		await page.type('#m_login_password', password)

		await Promise.all([
		  page.click('button[name="login"]'),
		  page.waitForNavigation(/*{waitUntil: 'networkidle2'}*/),
		]);

		if (page.url().includes('save-device')) {
			console.log('[FACEBOOK-LOGIN] saving cookies for future logins')
			await Promise.all([
			  page.click('button[type="submit"]'),
			  page.waitForNavigation(/*{waitUntil: 'networkidle2'}*/),
			]);
		}
	} else {
		console.log('[FACEBOOK-LOGIN] login NOT required')
	}
	return page;
}

async function post (browser, username, password, pageId, description, imgPath, cb) {
	//const browser = await puppeteer.launch(puppeteerOpts);
	var datea = Date.now();
	const page = await login(browser, username, password, pageId);
	
	try {
		await Promise.all([
			page.waitForNavigation(),
			page.click('a[aria-label="Publicar"]'),
		])
		await page.waitFor('button[title="Añade una foto"]');
		//$("#pages_msite_body_contents > div > div:nth-child(3) > div > div > article")
		const [fileChooser] = await Promise.all([
		    page.waitForFileChooser(),
		    page.click('button[title="Añade una foto"]'),
		]);

		console.log('[FACEBOOK-POST] starting upload');
		await Promise.all([
			page.waitFor('div[data-sigil="marea"] > form > div:nth-child(4) > div > div > div > img[alt]', { visible: true, waitUntil: 'networkidle2' }),
			fileChooser.accept([imgPath]),
		]);
		console.log('[FACEBOOK-POST] finished upload, waiting for the publish button to be enabled');

		await page.waitFor('div[data-sigil="composer-header"] > div > div:last-child > div > button:not([disabled])');

		console.log('[FACEBOOK-POST] the publish button should be clickable?');
		await page.type('textarea[aria-label="Escribe algo..."]', description)

		await Promise.all([
			page.waitForNavigation(),
			page.click('div[data-sigil="composer-header"] > div > div:last-child > div > button'),
		])

		await page.goto("https://m.facebook.com/" +  pageId + "/posts/");

		const elementHandle = await page.$('.story_body_container > header > div:nth-child(2) > div > div > div > div:nth-child(2) > a');
		var postUrl = await page.evaluate(el => el.href, elementHandle);
		postUrl = postUrl.substr(0, postUrl.indexOf("/?type"))
		postUrl = postUrl.replace("m.facebook.com", "facebook.com")
		var postId = postUrl.substr(postUrl.lastIndexOf("/") + 1)
		await page.close();
		//console.log("[FACEBOOK-POST]", Date.now() - datea, 'seconds to post to facebook')
		console.log("[FACEBOOK-POST] posted successfully");
		cb(null, postUrl, postId);
	} catch (error) {
		await page.close();
		cb(error, null)
	}
}

async function destroy (browser, username, password, pageId, postId, cb) {
	//const browser = await puppeteer.launch(puppeteerOpts);
	var page;
	try {
		page = await login(browser, username, password, pageId);
	} catch (error) {
		console.log('[FACEBOOK-DESTROY] error', error)
		await page.close();
		return cb(error);
	}
	try {
		await page.goto("https://mobile.facebook.com/photo.php?fbid=" + postId + "&id=" + pageId + "&delete", {waitUntil: 'networkidle2'})
		console.log('[FACEBOOK-DESTROY] navigated to post page', "https://mobile.facebook.com/photo.php?fbid=" + postId + "&id=" + pageId + "&delete")

		//const deletedPost = await page.$('div[class="message"][data-sigil="error-message"]')
		const deletedPost = await page.$('button[type="submit"]')
		if (!deletedPost) {
		  throw new Error("selected page does not exist")
		}
	} catch (error) {
		console.log('[FACEBOOK-DESTROY] error', error)
		await page.close()
		return cb(null);
	}

	try {
		console.log('[FACEBOOK-DESTROY] submitting deletion')
		await page.click('button[type="submit"]')
		await page.waitForNavigation({waitUntil: 'networkidle2'})
		await page.close();
		console.log('[FACEBOOK-DESTROY] post deleted successfully')
		cb(null);
	} catch (error) {
		console.log('[FACEBOOK-DESTROY] error', error)
		await page.close();
		cb(error)
	}
}

module.exports.post = post;
module.exports.destroy = destroy;
const puppeteer = require('puppeteer');
const delay = require('delay');
const user = {username: 'sie_terry2020', password: 'mayonesa'};
const devices = require('puppeteer/DeviceDescriptors');
const mobile = devices['iPhone XR'];
const path = require('path');
const puppeteerOpts = {headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox',  '--disable-dev-shm-usage']};

async function post (description, imgPath, cb) {
  const browser = await puppeteer.launch(puppeteerOpts);
  const page = await browser.newPage();
  await page.emulate(mobile);
  try {
      await page.goto('https://www.instagram.com/', {waitUntil: 'networkidle0'});

      //await page.waitFor('button[type="button"]');
      //await page.click('button[type="button"]');
      
      await Promise.all([
        page.waitForSelector('input[name=username]', { visible: true }),
        page.waitForSelector('button[type="button"]', { visible: true }),
        page.click('button[type="button"]'),
      ])

      //await page.waitFor('input[name=username]', { visible: true });
      
      await delay(120);
      await page.click('input[name=password]', {delay: 50});
      await page.type('input[name=password]', user.password, { delay: 32 });

      await delay(40)
      await page.click('input[name=username]', {delay: 50});
      await page.type('input[name=username]', user.username, { delay: 47 });


      //await page.click('button[type="submit"]');
     // await page.waitForNavigation();
      
      await Promise.all([
        page.waitForNavigation(),
        page.click('button[type="submit"]'),
      ]);

      await page.waitFor(50);

      console.log('passed login')
      ////await page.screenshot({path: 'after login.png'});
      await page.goto('https://www.instagram.com/' + user.username, { waitUntil: 'networkidle0' });
      //await page.waitFor(100);

      /*
      const keyHole = await page.$(".coreSpriteKeyhole")
      if (keyHole) {
        await Promise.all([
          page.click('main > div > div > div > button', {delay: 50}),
          page.waitForNavigation(),
        ]);
      }      
      */
      ////await page.screenshot({path: 'after notification.png'});

      //await page.waitFor('div[role="dialog"]', { visible: true });
      //await page.click('div[role="dialog"] > div > div:last-child > button:last-child');
      ////await page.screenshot({path: 'after popup.png'});


      const [fileChooser] = await Promise.all([
          page.waitForFileChooser(),
          page.click('div[data-testid="new-post-button"]'), // INSTAGRAM PLUS BUTTON
      ]);

      //await page.waitFor(50);
      
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        fileChooser.accept([imgPath]),
      ]);
      
      //await page.waitFor(50);

      ////await page.screenshot({path: 'sended image.png'});

      console.log('sended picture');
      
      //first step
      //await page.waitFor(50);

      await page.waitFor('header > div > div:last-child > button', { visible: true });

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click("header > div > div:last-child > button"),
      ]);

      //await page.click("header > div > div:last-child > button")
      //await page.waitForNavigation();
      //await page.waitFor(50);

      console.log('sended picture');
      ////await page.screenshot({path: 'sended picture.png'});

      //second step (last one!)
      await page.waitForSelector('textarea', { visible: true });
      await page.type('textarea', description, { delay: 47 });

      await page.waitForSelector('header > div > div:last-child > button', { visible: true });
      //await page.waitFor(50);

      console.log('filled data');

      //await page.click("header > div > div:last-child > button")
      //await page.waitForNavigation();
      //await page.waitFor(50);

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        page.click("header > div > div:last-child > button"),
      ]);

      console.log('waiting for main')
      await page.screenshot({path: 'waiting for main.png'});

      await page.waitForSelector('main[role="main"]', {visible: true})
      console.log('main appeared')
      
      const elementHandle = await page.$("article:nth-child(1) > div:nth-child(3) > div > a");
      const postUrl = await page.evaluate(el => el.href, elementHandle);
      const postId = postUrl.split("/p/")[1].replace('/', '')
      //const postId = await elementHandle.$eval("article:nth-child(1) > div:nth-child(3) > div > a", el => el.href);

      //document.getElementsByTagName("time")[0].parentElement.href
      //const text = await page.evaluate(element => element.href, element);

      console.log('posted image', postUrl, postId);

      //await page.waitFor('div[role="dialog"]', { visible: true });
      //await page.click('div[role="dialog"] > div > div:last-child > button:last-child');
      

      await browser.close();
      console.log('boom');
      //await Promise.all([
      //  page.waitForNavigation(),
      //  signup.click({ delay: 30 })
      //]);
      cb(postUrl, postId, null);
    } catch (error) {
      console.log('exploded', error)
      await browser.close();
      cb(null, null, error);
    }
};

async function destroy (postUrl, cb) {
  const browser = await puppeteer.launch(puppeteerOpts);
  const page = await browser.newPage();
  console.log('deleting post at', postUrl)
  await page.emulate(mobile);
  try {
      await page.goto('https://instagram.com', {waitUntil: 'networkidle0'});

      await Promise.all([
        page.waitForSelector('input[name=username]', { visible: true }),
        page.waitForSelector('button[type="button"]', { visible: true }),
        page.click('button[type="button"]'),
      ])
      //await page.waitFor('button[type="button"]');
      //await page.click('button[type="button"]');
//
      //await page.waitFor('input[name=username]', { visible: true });
      
      await delay(150);
      await page.click('input[name=password]');
      await page.type('input[name=password]', user.password, { delay: 32 });

      await delay(40)
      await page.click('input[name=username]');
      await page.type('input[name=username]', user.username, { delay: 47 });
      
      console.log('filled form')

      //await page.click('button[type="submit"]');
      // await page.waitForNavigation();
      
      await Promise.all([
        page.waitForNavigation(),
        page.click('button[type="submit"]'),
      ]);
      console.log('passed login')

      /*
      const keyHole = await page.$(".coreSpriteKeyhole")
      if (keyHole) {
        await Promise.all([
          page.waitForNavigation({ waitUntil: 'networkidle0' }),
          page.click('main > div > div > div > button', {delay: 50}),
        ]);
      }
      console.log('passed keylogin')
      */
  } catch (error) {
      await browser.close();
      return cb (error)
  }

  try {
    console.log('navigating to post url:', postUrl)
    await page.goto(postUrl, {waitUntil: 'networkidle0'});
    const deletedPost = await page.$(".error-container")

    if (deletedPost) {
      throw new Error("selected page does not exist")
    }
  } catch (error) {
    console.log('catch: the page does not exist!');
    await browser.close();
    return cb(null)
  }

  try {
    await page.waitForSelector('article > div:last-child > button', { visible: true });
    console.log('navigated to post url')
    await delay(100)
    console.log('trying to click three dots')
    await Promise.all([
      page.waitForSelector('div[role="dialog"]', { visible: true }),
      page.click("article > div:last-child > button", {delay: 120}),
    ]);
    console.log('clicked on three dots')
    await delay(100)
    await Promise.all([
      page.waitForSelector('div[role="dialog"]', { visible: true }),
      page.click('div[role="dialog"] > div > div > button', {delay: 120}),
    ]);
    console.log('clicked on delete')
    await delay(100)
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('div[role="dialog"] > div > div:last-child > button'),
    ]);
    console.log('clicked on delete confirmation')

    await browser.close();
    return cb(null);

    } catch (error) {
      console.log('exploded', error)
      await browser.close();
      cb(error);
    }
}

module.exports.post = post;
module.exports.destroy = destroy;
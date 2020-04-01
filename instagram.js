const puppeteer = require('puppeteer');
const delay = require('delay');
const devices = require('puppeteer/DeviceDescriptors');
const mobile = devices['iPhone XR'];
const puppeteerOpts = {headless: true, args: ['single-process','--no-sandbox', '--disable-setuid-sandbox',  '--disable-dev-shm-usage']};

async function post (username, password, description, imgPath, cb) {
  const browser = await puppeteer.launch(puppeteerOpts);
  const page = await browser.newPage();
  await page.emulate(mobile);
  try {
      await page.goto('https://www.instagram.com/accounts/login/', {waitUntil: 'networkidle0'});
      await page.waitForSelector('input[name="username"]', {visible: true })
  
      await page.click('input[name="username"]');
      await page.type('input[name="username"]', username, { delay: 25 });

      await page.waitForSelector('input[name="username"][value="' + username + '"]')
      await page.click('input[name="password"]');
      await page.type('input[name="password"]', password, { delay: 25 });

      await page.click('button[type="submit"]')
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      console.log('passed login')
      ////await page.screenshot({path: 'after login.png'});
      await page.goto('https://www.instagram.com');
      //await page.waitForNavigation({ waitUntil: 'networkidle0' });

      /*
      const keyHole = await page.$(".coreSpriteKeyhole")
      if (keyHole) {
        await Promise.all([
          page.click('main > div > div > div > button', {delay: 50}),
          page.waitForNavigation(),
        ]);
      }      
      */

      await page.screenshot({path: 'after popup.png'});
      //await delay(150)
      await page.waitForSelector('div[data-testid="new-post-button"]', {visible: true}); // INSTAGRAM PLUS BUTTON

      const [fileChooser] = await Promise.all([
          page.waitForFileChooser(),
          page.click('div[data-testid="new-post-button"]'), // INSTAGRAM PLUS BUTTON
      ]);
      //await delay(150)

      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle0' }),
        fileChooser.accept([imgPath]),
      ])

      console.log('sended picture');
      
      await page.waitForSelector('header > div > div:last-child > button', { visible: true })
      await page.click("header > div > div:last-child > button")
      await page.waitForNavigation({ waitUntil: 'networkidle0' })

      console.log('sended picture');
      ////await page.screenshot({path: 'sended picture.png'});
      //await delay(150)

      //second step (last one!)
      await page.waitForSelector('textarea', { visible: true });
      await page.type('textarea', description, { delay: 47 });
      await page.waitForSelector('header > div > div:last-child > button', { visible: true });
      //await page.waitForSelector(50);

      console.log('filled data');
      //await delay(150)

      await page.click("header > div > div:last-child > button"),
      await page.waitForNavigation({ waitUntil: 'networkidle0' }),
      //await delay(150)

      console.log('waiting for main')

      await page.waitForSelector('main[role="main"]', {visible: true})
      console.log('main appeared')
      
      const elementHandle = await page.$("article:nth-child(1) > div:nth-child(3) > div > a");
      const postUrl = await page.evaluate(el => el.href, elementHandle);
      const postId = postUrl.split("/p/")[1].replace('/', '')
      console.log('posted image', postUrl, postId);

      await browser.close();
      console.log('boom');
      cb(null, postUrl, postId);
    } catch (error) {
      console.log('exploded', error)
      await browser.close();
      cb(error, null, null);
    }
};

async function destroy (username, password, postUrl, cb) {
  const browser = await puppeteer.launch(puppeteerOpts);
  const page = await browser.newPage();
  console.log('deleting post at', postUrl)
  await page.emulate(mobile);
  try {
     await page.goto('https://www.instagram.com/accounts/login/', {waitUntil: 'networkidle0'});
     await page.waitForSelector('input[name="username"]', {visible: true })
     
     await page.click('input[name="username"]');
     await page.type('input[name="username"]', username, { delay: 25 });

     await page.waitForSelector('input[name="username"][value="' + username + '"]')
     await page.click('input[name="password"]');
     await page.type('input[name="password"]', password, { delay: 25 });

     await page.click('button[type="submit"]')
     await page.waitForNavigation({ waitUntil: 'networkidle0' })
    
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
    //await delay(100)
    console.log('trying to click three dots')
      
    await page.click("article > div:last-child > button")
    await page.waitForSelector('div[role="dialog"] > div > div > button', { visible: true })

    console.log('clicked on three dots')
    //await delay(100)
    
    await page.click('div[role="dialog"] > div > div > button')
    //await delay(100)
    await page.waitForSelector('div[role="dialog"] > div > div:last-child > button', { visible: true })
    

    console.log('clicked on delete')
    //await delay(100)

    await page.click('div[role="dialog"] > div > div:last-child > button')
    await page.waitForNavigation({ waitUntil: 'networkidle0' })

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
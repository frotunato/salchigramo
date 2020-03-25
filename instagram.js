const puppeteer = require('puppeteer');
const delay = require('delay');
const user = {username: 'yayoloco2', password: 'encore'};
const devices = require('puppeteer/DeviceDescriptors');
const mobile = devices['iPhone XR'];
const path = require('path');

async function post (description, imgPath, cb) {
  const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();
  await page.emulate(mobile);
  try {
      
      await page.goto('https://www.instagram.com/');

      await page.waitFor('button[type="button"]');
      await page.click('button[type="button"]');

      await page.waitFor('input[name=username]', { visible: true });
      
      await delay(520);
      await page.type('input[name=password]', user.password, { delay: 32 });

      await delay(500);
      await page.type('input[name=username]', user.username, { delay: 47 });


      await page.click('button[type="submit"]');
      await page.waitForNavigation();
      

      console.log('passed login')

      await page.$(".coreSpriteKeyhole")
      await page.click('main > div > div > div > button');
      await page.waitForNavigation();
      await page.waitFor('div[role="dialog"]', { visible: true });
      await page.click('div[role="dialog"] > div > div:last-child > button:last-child');
  
      await delay(500);

      const [fileChooser] = await Promise.all([
          page.waitForFileChooser(),
          page.click('div[data-testid="new-post-button"]'), // INSTAGRAM PLUS BUTTON
      ]);


      await page.waitFor(500);
      console.log("navigated to home page");
      await fileChooser.accept([imgPath]); 

      await page.waitForNavigation();
      console.log('sended picture');
      
      //first step

      await page.waitFor('header > div > div:last-child > button', { visible: true });
      await page.click("header > div > div:last-child > button")
      await page.waitForNavigation();

      console.log('sended picture');

      //second step (last one!)
      await page.waitFor('textarea', { visible: true });
      await page.type('textarea', description, { delay: 27 });

      await page.waitFor('header > div > div:last-child > button', { visible: true });

      console.log('filled data');

      await page.click("header > div > div:last-child > button")
      await page.waitForNavigation();

      console.log('posted image');

      await page.waitFor('div[role="dialog"]', { visible: true });
      await page.click('div[role="dialog"] > div > div:last-child > button:last-child');
      

      await browser.close();
      console.log('boom');
      //await Promise.all([
      //  page.waitForNavigation(),
      //  signup.click({ delay: 30 })
      //]);
      cb(null);
    } catch (error) {
      await browser.close();
      cb(error);
    }
};

module.exports.post = post;
const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()
const fs = require('fs');
const urlencodedParser = bodyParser.urlencoded({ extended: false, limit: '50mb' })
const Instagram = require('./instagram.js');
const Facebook = require('./facebook.js');
const RequestQ = require('express-request-queue');
const q = new RequestQ();

app.use(morgan('combined'));


var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.lstatSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

deleteFolderRecursive('./tmp');
fs.mkdirSync('./tmp');
//deleteFolderRecursive('./user_data');


const puppeteer = require('puppeteer');
const delay = require('delay');
const devices = require('puppeteer/DeviceDescriptors');
const mobile = devices['iPhone XR'];
const puppeteerOpts = {headless: false, userDataDir: "./user_data", args: ['--no-sandbox', '--disable-setuid-sandbox',  '--disable-dev-shm-usage']};


(async function () {
	const browser = await puppeteer.launch(puppeteerOpts);

	app.get('/', q.run(async (req, res) => {
		res.json({msg: "hola mundo"})
	}));

	app.post('/instagram', urlencodedParser, q.run(async (req, res) => {
		let tmpImgPath = "./tmp/" + Date.now() + "_image.png";
		if (!req.body.image || !req.body.description || !req.headers.username || !req.headers.password)
			return res.status(400).json({status: 'error', message: 'invalid request, its missing essential fields'});
		fs.writeFile(tmpImgPath, req.body.image, 'base64', function(e) {
			//console.log(req.headers)
			Instagram.post(browser, req.headers.username, req.headers.password, req.body.description, tmpImgPath, function (err, postUrl, postId) {
				if (err) {
					fs.unlink(tmpImgPath, function () {
						res.status(400).json({status: 'error', message: err.message});
					})
				} else {
					fs.unlink(tmpImgPath, function () {
						res.json({status: 'success', id: postId, url: postUrl});
					})
				}
			});
		});
	}));

	app.delete('/instagram', urlencodedParser, q.run(async (req, res) => {
		//console.log(req.headers, req.body)
		if (!req.body.url || !req.headers.username || !req.headers.password)
			return res.status(400).json({status: 'error', message: 'invalid request, its missing essential fields'});
		Instagram.destroy(browser, req.headers.username, req.headers.password, req.body.url, function (err) {
			if (err)
				res.status(400).json({message: err.message});
			else
				res.json({message: 'success'});
		});
	}));


	app.post('/facebook', urlencodedParser, q.run(async (req, res) => {
		if (!req.body.image || !req.body.description || !req.headers.username || !req.headers.password)
			return res.status(400).json({status: 'error', message: 'invalid request, its missing essential fields'});
		let tmpImgPath = "./tmp/" + Date.now() + "_image.png";
		fs.writeFile(tmpImgPath, req.body.image, 'base64', function(e) {
			//console.log(req.headers)
			Facebook.post(browser, req.headers.username, req.headers.password, req.body.pageId, req.body.description, tmpImgPath, function (err, postUrl, postId) {
				if (err) {
					fs.unlink(tmpImgPath, function () {
						res.status(400).json({message: err.message});
					})
				} else {
					fs.unlink(tmpImgPath, function () {
						console.log({message: 'success', id: postId, url: postUrl})
						res.json({message: 'success', id: postId, url: postUrl});
					})
				}
			});
		});
	}));

	app.delete('/facebook', urlencodedParser, q.run(async (req, res) => {
		//console.log(req.headers, req.body)
		if (!req.body.pageId || !req.body.postId || !req.headers.username || !req.headers.password)
			return res.status(400).json({status: 'error', message: 'invalid request, its missing essential fields'});
		Facebook.destroy(browser, req.headers.username, req.headers.password, req.body.pageId, req.body.postId, function (err) {
			if (err)
				res.status(400).json({message: err.message});
			else
				res.json({message: 'success'});
		});
	}));

	app.listen(process.env.PORT || 8000, () => {
		console.log('Server listening!');
	});
})()

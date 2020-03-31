const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json()
const fs = require('fs');
const urlencodedParser = bodyParser.urlencoded({ extended: false, limit: '50mb' })
const Instagram = require('./instagram.js');
const RequestQ = require('express-request-queue');
const q = new RequestQ();


app.use(morgan('combined'));

app.get('/', q.run(async (req, res) => {
	setTimeout(function () {
		console.log('query!!')
		res.json({msg: "hola mundo"})
	}, 1000)
}));

app.post('/', urlencodedParser, q.run(async (req, res) => {
	let tmpImgPath = "./tmp/" + Date.now() + "_image.png";
	fs.writeFile(tmpImgPath, req.body.image, 'base64', function(err) {
		Instagram.post(req.body.description, tmpImgPath, function (postUrl, postId, err) {
			if (err)
				res.status(400).json({status: 'error', message: err.message});
			else
				res.json({status: 'success', id: postId, url: postUrl});
		});
	});
}));

app.delete('/', urlencodedParser, q.run(async (req, res) => {
	Instagram.destroy(req.body.url, function (err) {
		if (err)
			res.status(400).json({status: 'error', message: err.message});
		else
			res.json({status: 'success'});
	});
}));

app.listen(process.env.PORT || 8000, () => {
	console.log('Server listening!');
});
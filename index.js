const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json()
var fs = require('fs');
var urlencodedParser = bodyParser.urlencoded({ extended: false, limit: '50mb' })
var Instagram = require('./instagram.js');

app.use(morgan('combined'));

app.get('/', (req, res) => {
	res.json({msg: "hola mundo"})
});

app.post('/', urlencodedParser, (req, res) => {
	let tmpImgPath = "./tmp/" + Date.now() + "_image.png";
	fs.writeFile(tmpImgPath, req.body.image, 'base64', function(err) {
		Instagram.post(req.body.description, tmpImgPath, function (err) {
			res.end();
		});
	});
});

app.listen(8000, () => {
	console.log('Server listening on 8000');
});
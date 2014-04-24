var crypto = require('crypto');
var fs = require('fs');
var gm = require('gm');

var express = require('express');
var app = express();

app.use(express.bodyParser({
	keepExtensions: true,
	uploadDir: __dirname + "/tmp"
}));

app.use(function (req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');
	res.setHeader('Access-Control-Allow-Credentials', true);
	next();
});

app.use('/uploads', express.static(__dirname + '/uploads'));

var getFileExtension = function(file) {
	return '.' + file.split('.').pop();
};

var getUniqueFilename = function(file) {
	return crypto.randomBytes(20).toString('hex') + getFileExtension(file);
};

app.post('/api/upload/avatar', function(req, res) {
	var __tmp_path = req.files.image.path;
	var __filename = getUniqueFilename(__tmp_path);
	var __target_path = __dirname + '/uploads/' + __filename;
	gm(__tmp_path)
		.crop(req.body.width, req.body.height, req.body.x1, req.body.y1)
		.resize(160, 160)
		.write(__target_path, function(err) {
			if (!err) {
				fs.unlink(__tmp_path);
				res.send(200, {
					filename: __filename
				});
			}
		});
});

app.post('/api/upload/image', function(req, res) {
	console.log(req.files);
	// var __tmp_path = req.files.image.path;
	var __tmp_path = req.files.file.path;
	var __filename = getUniqueFilename(__tmp_path);
	var __target_path = __dirname + '/uploads/' + __filename;
	gm(__tmp_path)
		.write(__target_path, function(err) {
			if (!err) {
				fs.unlink(__tmp_path);
				res.send(200, {
					filename: __filename
				});
			}
		});
});


app.post('/uploads', function(req, res) {

	var tmp_path;
	if (req.files.file)
		tmp_path = req.files.file.path;
	else
		tmp_path = req.files.path;
	var filename = getUniqueFilename() + getFileExtension(tmp_path);
	var target_path = __dirname + '/uploads/' + filename
	if (req.body && req.body.width) {
		gm(tmp_path)
			.crop(req.body.width, req.body.height, req.body.x1, req.body.y1)
			.resize(160, 160)
			.write(target_path, function(err) {
				if (!err) {
					fs.unlink(tmp_path, function() {});
					res.send(200, { filename: filename });
				}
			}
		);
	} else {
		gm(tmp_path)
			.write(target_path, function(err) {
				if (!err) {
					fs.unlink(tmp_path, function() {});
					res.send(200, { filename: filename });
				}
			}
		);
	}
});

app.listen(8081, function() {
	console.log('SCS is Running at 8081');
});

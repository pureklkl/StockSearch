'use strict';

var express = require('express');
var path = require('path');
var dataService = require('./src/database/dataService');

var app = express();

app.use(express.static(path.join(__dirname, '/frontend/dist')));
app.use('/test', express.static(path.join(__dirname, '/test')));
require('./src/config/middleware')(app);
require('./routes')(app);
var config = require('./src/config/settings.js');

var port = process.env.PORT || 3000;

dataService.init(config.mongodb).then(
	()=>{
		var server = app.listen(port, function () {
    		console.log('Server running at http://127.0.0.1:' + port + '/');
		});
	}, 
	(err)=>{
		console.log(err);
	}
);
/*
var server = app.listen(port, function () {
	console.log('Server running at http://127.0.0.1:' + port + '/');
});
*/

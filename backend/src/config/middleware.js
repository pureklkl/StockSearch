'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');

var fs = require('fs');
var morgan = require('morgan');
var path = require('path');
var rfs = require('rotating-file-stream');


module.exports = function(app) {
	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
		res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
		next();
	});

	var logDirectory = path.join(__dirname, 'log');

	// ensure log directory exists
	if(!fs.existsSync(logDirectory)) {fs.mkdirSync(logDirectory);}

	// create a rotating write stream
	var accessLogStream = rfs('access.log', {
	  interval: '1d', // rotate daily
	  path: logDirectory
	});

	// setup the logger
	app.use(morgan('combined', {stream: accessLogStream}));

	app.use(compression());
	app.use(bodyParser.urlencoded({extended: false}));
	app.use(bodyParser.json());
	app.use(cookieParser());
};
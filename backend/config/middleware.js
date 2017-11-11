'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var compression = require('compression');

module.exports = function(app) {
	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});
	app.use(compression());
	app.use(bodyParser.urlencoded({
	extended: false
	}));
	app.use(bodyParser.json());
	app.use(cookieParser());
}
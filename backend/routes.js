'use strict';

var path = require('path');

module.exports = function(app) {
	app.use('/api/stock', require('./src/api/stock'));
	app.use('/api/user', require('./src/api/user'));
	app.use('/api/chart', require('./src/api/chart'));
	app.use('/auth', require('./src/auth/login'));
	app.get('/*', function(req, res) {
	  res.sendFile(path.join(__dirname + '/frontend/dist/index.html'));
	});
};
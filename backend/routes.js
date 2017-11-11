'use strict';

var path = require('path');

module.exports = function(app) {
	app.use('/api/stock', require('./api/stock'));
	app.use('/api/user', require('./api/user'));
	app.use('/api/chart', require('./api/chart'));
	app.use('/auth', require('./auth/login'));
	app.get('/*', function(req, res) {
	  res.sendFile(path.join(__dirname + '/frontend/dist/index.html'));
	});
};
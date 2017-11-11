'use strict';

var express = require('express');
var path = require('path');
var dataService = require('./database/dataService');

var app = express();

app.use(express.static(path.join(__dirname, '/frontend/dist')));
app.use('/test', express.static(path.join(__dirname, '/test')));
require('./config/middleware')(app);
require('./routes')(app);

var port = process.env.PORT || 3000;

/*dataService.init().then(
	()=>{
		var server = app.listen(port, function () {
    		console.log('Server running at http://127.0.0.1:' + port + '/');
		});
	}, 
	(err)=>{
		console.log(err);
	}
);*/

var server = app.listen(port, function () {
	console.log('Server running at http://127.0.0.1:' + port + '/');
});


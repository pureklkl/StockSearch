"use strict";

var queryApi = require('../../utils/queryApi.js');

const highchart_server_api = 'http://export.highcharts.com/';

exports.create = function (req, res) {
	var chartOption = req.body;
	var query = new queryApi(highchart_server_api);
	query
	.queryPost(chartOption)
	.then((link)=>{
		res.send(link.data);
	});
};
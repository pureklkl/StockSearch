"use strict";

var dataService = require('../../database/dataService');
var getData = require('./getData');

function test() {
	dataService.init().then(
		()=>{
			getData.getData('PIH', 'SMA', 200).then(res=>console.log(res));
			getData.getData('PIH', 'TIME_SERIES_DAILY_ADJUSTED', 200).then(res=>console.log(res));
		}
		);
}

test();
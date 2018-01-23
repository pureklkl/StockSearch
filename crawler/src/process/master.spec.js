'use strict';

const master = require('./master.js');
var schedule = require('node-schedule');

function test1(){
	//master.getCalendar().then(table=>console.log(master.checkHoliday(table)));
	let test = 
	{ 'January 1, 2018': 'Closed',
	  'January 20, 2018': '1:00 p.m.',
	  'February 19, 2018': 'Closed',
	  'March 30, 2018': 'Closed',
	  'May 28, 2018': 'Closed',
	  'July 3, 2018': '1:00 p.m.',
	  'July 4, 2018': 'Closed',
	  'September 3, 2018': 'Closed',
	  'November 22, 2018': 'Closed',
	  'November 23, 2018': '1:00 p.m.',
	  'December 24, 2018': '1:00 p.m.',
	  'December 25, 2018': 'Closed',
	  'December 25, 2017': 'Closed' };
	console.log(master.checkHoliday(test));
}
//test1();

function test2(){
	function callbackTest(conn){
		console.log('inited');
		setTimeout(function() { conn.close(); process.exit(0); }, 500);
	}
	master.init(callbackTest);
}

//test2();

function test3(){
	master.init(master.initDaily);
}
//test3();

function test4(){
	schedule.scheduleJob({rule:'1 * * * 1-5'}, console.log('time'));
}

//test4();
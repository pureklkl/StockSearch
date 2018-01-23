'use strict';
const fs = require('fs');

var axios = require('axios');
var csvparse = require('csv-parse/lib/sync');
var amqp = require('amqplib/callback_api');
var schedule = require('node-schedule');
var moment = require('moment-timezone');
const cheerio = require('cheerio');

const { logger } = require('../logger/logger.js');

var dq = 'task_queue';

const EST_STR = "America/New_York";
const FUNC = ['TIME_SERIES_DAILY_ADJUSTED', 'SMA', 'EMA', 'STOCH', 'RSI', 'ADX', 'CCI', 'BBANDS', 'MACD'];
const BATCH_FUNC = "BATCH_STOCK_QUOTES";
var dailyCh = null;

const nasdaq = "http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nasdaq&render=download";
const nyse = "http://www.nasdaq.com/screening/companies-by-name.aspx?letter=0&exchange=nyse&render=download";
const nasdaqFile = 'nasdaq.csv';
const nyseFile = 'nyse.csv';


const holidayUrl = "https://www.nasdaqtrader.com/Trader.aspx?id=calendar";
const holidayDate = 0, holidayStatus = 2, holidayClosed = "Closed";
/**
 * init message queue
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function init() {
	var config = JSON.parse(fs.readFileSync('config.json'));
	return new Promise((res, rej)=>{
		amqp.connect(config.taskBase, function(err, conn) {
			if(err){
				logger.error(err);
				rej();
				return;
			}
			conn.createChannel(function(err, ch) {
			    let queue = ch.assertQueue(dq, {durable: true});
			    ch.purgeQueue(dq);
			    logger.info('daily task queue inited');
			    dailyCh = queue;
			    res();
			});
		});
	});

}

function download(url, dest) {
	return axios.get(url, {transformResponse: (req) => {return req;}})
	.then(response=>{csvparse(response.data); return response;})
	.then((response)=>{
		let file = fs.openSync(dest, 'w');
		fs.writeSync(file, response.data);
		fs.closeSync(file);
		logger.info('symbols file downloaded, file %s', dest);
	})
	.catch((err)=>{
		logger.error('file download error file %s' + dest);
	});
}

function readSymbols(){
	var syms = csvparse(fs.readFileSync(nasdaqFile), {columns: true});
	var syms1 = csvparse(fs.readFileSync(nyseFile), {columns: true});
	syms = syms.concat(syms1);
	//symbol may have ^E,^D,^C suffix which cannot be download
	syms = syms.filter(sym=>sym.Symbol.indexOf('^')<0);
	//symbol with . or space should be trimed
	syms = syms.map(sym=>
		{
			sym.Symbol = sym.Symbol.trim();
			if(sym.Symbol.indexOf('.')>0)
				sym.Symbol = sym.Symbol.substring(0, sym.Symbol.indexOf('.'));
			return sym;
		});
	return syms;
}
function batchSyms(syms) {
	var syms100 = [];
	syms = syms.map(sym=>sym.Symbol);
	while(syms.length > 0) {
		syms100.push(syms.splice(0, 100));
	}
	return syms100;
}
function initDailJob(q, ch){
	let syms = readSymbols();
	FUNC.forEach((func)=>{
		syms.forEach((sym)=>{
			ch.sendToQueue(q, new Buffer(JSON.stringify({sym:sym.Symbol, ind:func})), {persistent: true});
		});
	});

	logger.info('daily job inited');
	return batchSyms(syms.slice());
}

/**
 * refresh symbol files and init daily job
 * @param  {[type]} q  [description]
 * @param  {[type]} ch [description]
 * @return {[type]}    [description]
 */
function initDaily(q = dq, ch = dailyCh) {
	return download(nasdaq, 'nasdaq.csv')
			.then(()=> download(nyse, 'nyse.csv'))
			.then(()=>initDailJob(q, ch));
}

function initBatchJob(syms100, q = dq, ch = dailyCh){
	for(let batch of syms100) {
		ch.sendToQueue(dq, new Buffer(JSON.stringify({sym:batch, ind:BATCH_FUNC})), {persistent: true});
	}
	logger.verbose('batch job inited');
	return true;
}

function initBatch(q = dq, ch = dailyCh){
	return download(nasdaq, 'nasdaq.csv')
			.then(()=> download(nyse, 'nyse.csv'))
			.then(()=>{
				let syms = readSymbols();
				return initBatchJob(batchSyms(syms.slice()));
			});
}
function scheduleBatch(syms100, earlyEnd = false, batchChJob = initBatchJob, q = dq, ch = dailyCh){
	var today = moment().tz(EST_STR).format("yyyy-MM-dd");
	var start = today +" 09:30:00";
	var end = today;
	if(earlyEnd) {
		end += " 13:00:00";
	} else {
		end += " 16:00:00";
	}

	schedule.scheduleJob({rule:'0 * * * *', 
						 startDate:start, endDate: end, 
						 tz:EST_STR}, 
						 batchChJob.bind(null, syms100));
	logger.info('batch job scheduled');
}


function getCalendar() {
	return axios.get(holidayUrl, {transformResponse: (req) => {return req;}})
	.then((response)=>{
		const $ = cheerio.load(response.data);
		let table = {};
		$('tr').each((_, row)=>{
			let nr = [];
			$('td', row).each((_, col)=>{
				nr.push($(col).text().trim());
			});
			if(nr.length > 0) {
				table[nr[holidayDate]] = nr[holidayStatus];
			}
		});
		logger.info('calendar downloaded');
		return table;
	});
}
function checkHoliday(table) {
	var td = moment().tz('America/New_York').format('MMMM D, YYYY');
	if(table[td] == holidayClosed) {
		return false;
	} else if(table[td] === undefined || table[td] === null){
		return true;
	} else {
		return table[td];
	}
}

/**
 * check holidy, start daily job routing
 * @return {[type]} [description]
 */
function goDaily(task = initDaily){
	getCalendar().then((table)=>{
		let td = checkHoliday(table);
		logger.info('holiday checked %s', td);
		if(td == true) {
			initDaily().then((syms100)=>scheduleBatch(syms100));
		} else if(td == false) {
			return;//today is holiday!
		} else {//todo: build end date according to table
			initDaily().then((syms100)=>scheduleBatch(syms100, td));
		}
	});
}

const SCEHDULE = 0;
const DAILY = 1;
const BATCH = 2;
function master(argvs = 0){
	init().then(()=>{
		switch(argvs) {
			case SCEHDULE:
			schedule.scheduleJob({rule:'5 4,16 * * 1-5', tz:"America/New_York"}, goDaily);
			logger.info('master job scheduled');
			break;
			case DAILY:
			logger.info('start immediate daily job...');
			initDaily().then(()=>logger.info('immediate daily job scheduled'));
			break;
			case BATCH:
			logger.info('start immediate batch job...');
			initBatch().then(()=>logger.info('immediate batch job scheduled'));
			break;
		}
	});
}

//init(master);
//just for test
module.exports = {
	init: init,
	checkHoliday: checkHoliday,
	getCalendar: getCalendar,
	initBatchJob: initBatchJob,
	initDailJob: initDailJob,
	initDaily:initDaily,
	master: master
};
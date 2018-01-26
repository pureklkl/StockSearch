'use strict';
const rx = require('rxjs/Rx');
const { logger } = require('../logger/logger.js');

const database = require('../database/dataService.js');
const store = require('../database/storeStock.js');
const parser = require('../database/parser.js');
const crawler = require('../crawler/crawler.js');
const stock = require('../crawler/stock.js');

const NOT_ALL = 0;//update last
const ALL_SHORT = 1;//update all
const ALL_LONG = 2;//retry a full history download and update all

const ALL_LONG_RETRY = "ALL_LONG_RETRY";
const BATCH_FUNC = "BATCH_STOCK_QUOTES";

var stCraw = null;
var queueCallBack = {};


function myAck(key){
	queueCallBack[key]();
	delete queueCallBack[key];
	logger.verbose('ack %s', key );
}

function myNack(key) {
	queueCallBack[key](true);
	delete queueCallBack[key];
	logger.error('nack %s', key);
}

function recallKey(config){
	if(config.params.function == BATCH_FUNC) {
		return config.params.symbols;
	} else {
		let ind = config.params.function,
			sym = config.params.symbol;
		return getCallbackKey(sym, ind);
	}
}

function init(config, key){
	if(stCraw == null) {
		stCraw = new stock.StockSearch(key, 
		new crawler.QueryApiRateLimit(config.api, config.rateLimit));
		stCraw.catch(
			err=>{
				let curKey = recallKey(err.config),
	    			nack = myNack.bind(null, curKey);
				logger.error("error after received %s", err.config);
				nack();
				return rx.Observable.empty();
			});
		stCraw.subscribe(
			(res)=>{
				let ind = res.config.params.function,
					curKey = recallKey(res.config),
	    			ack = myAck.bind(null, curKey),
	    			nack = myNack.bind(null, curKey);

	    		if(res.data == null ||
	    			typeof res.data === 'undefined') {
		   			logger.error("network error or server error %s", curKey);
		   			nack();
		   			return;
	    		}
	    		if(ind == BATCH_FUNC) {
	    			store.updateBatch(res.data).then(()=>ack())
	    			.catch(e=>{
    					logger.error("batch store error %s", e);
    					nack();
    				});
	    		} else {
					update(res).then(()=>ack())
					.catch(e=>{
						if(e != ALL_LONG_RETRY) {
					   		logger.error("daily store error %s", e);
					   		nack();
						}
					});
				}
			});
	}
}

function update(res) {
	let ind = res.config.params.function,
	    sym = res.config.params.symbol;
	if(ind.indexOf(parser.TIME_SERIES_FUNC) >= 0 && 
		res.config.params.outputsize == 'full') {
		let curKey = getCallbackKey(sym, ind);
		return store.updateAll(res.data);
	} else {
		let handler = checkAndUpate.bind(null, ind, sym, res);
		return store.getMetaData(ind, sym).then(
				(metaRes)=>handler(metaRes));
	}
}

function checkAndUpate(ind, sym, res, metaRes) {
	let retry = ALL_LONG;
	let data = parser.parseResult(res.data);
	if(metaRes != null) {
		let last = metaRes.lf;
		let cur = data.newData[0][parser.META_DATA][parser.Last_Refreshed];
		let newEnd = data.newData[data.newData.length-1][parser.META_DATA][parser.Last_Refreshed];
		retry = shouldUpdateAll(cur, newEnd, last);
	}
	if(ind.indexOf(parser.TIME_SERIES_FUNC) < 0 && retry == ALL_LONG) {
		retry = ALL_SHORT;//other indicator cannot output full size
	}
	let curKey = getCallbackKey(sym, ind);
	switch(retry) {
		case NOT_ALL:
			return store.updateAll(res.data);
		case ALL_SHORT:
			return store.updateAll(res.data);
		case ALL_LONG:
			stCraw.search(sym, ind, 1000);
			throw ALL_LONG_RETRY;
	}
}

const DAY_TIME = 24 * 60 * 60 * 1000;
function shouldUpdateAll(cur, newDataEnd, lastRefreshed) {
	cur = (new Date(cur)).getTime();
	let last = (new Date(lastRefreshed)).getTime();
	if(cur <= DAY_TIME + last) {
		return NOT_ALL;
	}
	let newEnd = (new Date(newDataEnd)).getTime();
	if(newEnd < last) {
		return ALL_SHORT;
	} else {
		return ALL_LONG;
	}
}
function getEndDate(data) {
	let endDate = data.newData[parser.META_DATA][parser.Last_Refreshed];
	let endDateT = (new Date(endDate)).getTime();
	let dateId = data.newData._id;
	dateId = dateId.substring(dateId.indexOf(":") + 1);
	for(let date in data.newData) {
		let fullDate = dateId + '-' + date;
		let fullDateT = (new Date(fullDate)).getTime();
		if(fullDateT < endDateT) {
			endDateT = fullDateT;
			endDate = fullDate;
		}
	}
	return endDate;
}

function getCallbackKey(sym, ind) {
	if(ind == BATCH_FUNC) {
		return sym.join(',');
	}
	return sym + '-' + ind;
}
/**
 * [updateStock description]
 * @param  {[type]}   sym  [description]
 * @param  {[type]}   ind  [description]
 * @param  {Function} done 
 * the ack callback, where callback() means success, callback(true) means failure
 * @return {[type]}        [description]
 */
function updateStock(sym, ind, done = ()=>logger.verbose("job done")) {
	let newKey = getCallbackKey(sym, ind);
	if(queueCallBack[newKey] != null) {
		done(new Error("job repeated!" + newKey));
	}
	queueCallBack[newKey] = done;
	stCraw.search(sym, ind, 10);//just a small number for api
}

module.exports = {
	shouldUpdateAll:shouldUpdateAll,
	getEndDate:getEndDate,
	updateStock:updateStock,
	init:init,
	BATCH_FUNC:BATCH_FUNC,
	getCallbackKey:getCallbackKey
};


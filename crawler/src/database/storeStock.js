"use strict";

const { logger } = require('../logger/logger.js');

const colls = require('./dataService.js').colls;
const parser = require('./parser.js');

const META_DATA_KEY = ":META_DATA";

/**
 * For price with day/minute resolution data
 * _id:AAPL:2018-01-15
 * open:
 * close:
 * high:
 * low:
 * volume 
 * values:{
 * 	930:{open:[value], close:[value], high:[value], low:[value], volume:[value]}
 * } 
 * minutes 9:30~16:00 (390 data point expected, 1min delay) 
 *
 * For other indicator with only daily data
 * _id:AAPL:2018-01
 * "Meta Data":[value]
 * values:{
 * 15:{SMA: [value]}
 * } 
 * 28/29/30/31 daily data (1 day delay)
 */

function shortInd(ind){
	if(ind.indexOf(':') < 0) {
		return ind;
	}
	return ind.substring(ind.indexOf(':')+2);
}
/**
 * map indicator / function name to collection
 * @param  {[type]} ind [description]
 * @return {[type]}     [description]
 */
function indToColl(ind) {
	if(ind.indexOf(parser.TIME_SERIES) >= 0 ||
	   ind.indexOf(parser.TIME_SERIES_FUNC) >= 0) {
		ind = 'Price';
	} else {
		ind = shortInd(ind);
	}
	return colls[ind];
}
function storeOne(ind, id, newData) {
	var coll = indToColl(ind);
	newData = parser.compressMeta(newData);
	return coll.updateOne({_id: id}, {$set: newData}, {upsert : true}).then(
			res=>res,
			err=>{
				logger.error("mongodb error %s", err.errmsg);
				throw err;
			});
}


function getMetaDataKey(sym){
	return sym + META_DATA_KEY;
}
/**
 * store a cache of last modified data's meta data
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function updateMeta(ind, meta) {
	let metaId = getMetaDataKey(meta.Symbol);
	return storeOne(ind, metaId, meta);
}


var META_FILTER = {};
META_FILTER[parser.META_DATA] = true;
/**
 * nested object {a:{b:{c:1}}}=>{a.b.c:1}
 * empty object will be omit e.g {a:{b:{},c:1}}=>{a.c:1} 
 * to avoid overwriting 
 * @param  {[type]} data      [description]
 * @param  {[type]} parentKey [description]
 * @param  {[type]} filter    [description]
 * @return {[type]}           [description]
 */
function getNestedOp(data, parentKey = null, filter = META_FILTER) {
	if(typeof data === 'object' && data != null) {
		var tmp = {};
		for(let key in data) {
		    let newKey = parentKey == null ? key : parentKey + "." + key;
			if(filter[key]){
				tmp[newKey] = data[key];
			} else {
				Object.assign(tmp, getNestedOp(data[key], newKey, filter));
			}
		}
		return tmp;
	}  else {
		if(parentKey == null) {
			return data;
		}
		let tmp = {};
		tmp[parentKey] = data;
		return tmp;
	}
}


/**
 * update lasted data (last month for indicators, last day for price), 
 * will insert new document if necessary
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function updateLast(data) {
	data = parser.parseResult(data);
	if(data == null) {
		throw 'parse data failed';
	}
	return 	updateMeta(data.ind, data.newData[parser.META_DATA])
	.then(()=> storeOne(data.ind, data.newData._id, getNestedOp(data.newData)));
}

/**
 * update all availabe data, will insert new document if necessary
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
function updateAll(data) {
	try{
		data = parser.parseResult(data, false);
	}
	catch(e) {	
		return Promise.reject("data invalid " + e);
	}
	for(let i = 0; i < data.newData.length; i++) {
		data.newData[i] = getNestedOp(data.newData[i]);
	}
	return 	updateMeta(data.ind, data.newData[0][parser.META_DATA])
	.then(()=> {
		let all = [];
		for(let newData of data.newData){
			all.push(storeOne(data.ind, newData._id, getNestedOp(newData)));
		}
		return Promise.all(all);
	});
}

function getMetaData(ind, sym) {
	var coll = indToColl(ind);
	return coll.findOne({_id:getMetaDataKey(sym)});
}

function updateBatch(data) {
	data = parser.parseBatch(data);
	let all = [];
	for(let sym in data){
		all.push(storeOne('Price', sym, getNestedOp(data[sym], 'values')));
	}
	return Promise.all(all);
}

module.exports = {
	updateLast: updateLast,
	updateAll:updateAll,
	updateBatch: updateBatch,
	getMetaData:getMetaData
};

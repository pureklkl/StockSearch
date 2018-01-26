"use strict";

var dataService = require('../../database/dataService');
const { logger } = require('../../logger/logger.js');
var colls = dataService.colls;

const TRADING_PER_YEAR = 250;

const TIME_SERIES = "Time Series";
const TIME_SERIES_FUNC = "TIME_SERIES_DAILY_ADJUSTED";
const TIME_SERIES_IND = "TIME_SERIES_DAILY";
const META_DATA_KEY = ":META_DATA";
const META_DATA = "Meta Data";
const LAST_REFRESH = "Last Refreshed";

const LAST_REFRESH_S = "lf";
/*
var keymap = {
	open: 1,
	high: 2,
	low: 3,
	close: 4,
	volume: 5,
	"adjusted close": 6,

	SMA: 1,
	EMA: 1,
	ADX: 1,
	"Real Middle Band": 1,
	"Real Upper Band": 2,
	"Real Lower Band": 3,
	CCI: 1,
	MACD_Hist:1,
	MACD:2,
	MACD_Signal:3,
	RSI:1,
	SlowK:1,
	SlowD:1
};

 */
const ENTRY_KEY_REVERSE = {
	Price:{
		1:'open',
		2:'high',
		3:'low',
		4:'close',
		5:'volume',
		6:'adjusted close'
	},
	SMA:{1:'SMA'},
	EMA:{1:'EMA'},
	ADX:{1:'ADX'},
	BBANDS:{
		1:"Real Middle Band",
		2:"Real Upper Band",
		3:"Real Lower Band"
	},
	CCI:{1:'CCI'},
	MACD:{
		1:'MACD_Hist',
		2:'MACD',
		3:'MACD_Signal'
	},
	RSI:{1:'RSI'},
	STOCH:{1:'SlowK', 2:'SlowD'}
};

function getDateKey(number) {
	let date = new Date();
	let keys = [];
	for(let i = 0; i < number/ TRADING_PER_YEAR + 2; i++) {
		keys.push(date.getFullYear() - i);
	}
	return keys;
}

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
	if(ind.indexOf(TIME_SERIES) >= 0 ||
	   ind.indexOf(TIME_SERIES_FUNC) >= 0) {
		ind = 'Price';
	} else {
		ind = shortInd(ind);
	}
	return colls[ind];
}

function convertEntry(entry, ind) {
	let res = {};
	for(let key in entry) {
		if(ENTRY_KEY_REVERSE[ind][key]) {
			res[ENTRY_KEY_REVERSE[ind][key]] = entry[key];
		}
	}
	return res;
}

function convertDaily(data){
	let result = {};
	let dateKey = data[META_DATA][LAST_REFRESH_S];
	result[dateKey] = {};
	Object.assign(result[dateKey], convertEntry(data, 'Price'));
	return result;
}

function convertInd(data, func){
	let result = {};
	let monKey = data._id.substring(data._id.indexOf(':') + 1);
	for(let dayKey in data.values) {
		result[monKey+'-'+dayKey] = {};
		Object.assign(result[monKey+'-'+dayKey], convertEntry(data.values[dayKey], func));
	}
	return result;
}

function convertMeta(meta){
	meta[LAST_REFRESH] = meta[LAST_REFRESH_S];
	delete meta[LAST_REFRESH_S];
	return meta;
}

function extractSymbol(id){
	return id.substring(0, id.indexOf(":"));
}

function getDataFromDB(sym, func, number) {
	let keys = getDateKey(number);
	let coll = indToColl(func);
	let query = [];
	query.push({_id:sym+META_DATA_KEY});
	for(let key of keys) {
		query.push({_id: new RegExp('^'+sym+':'+key)});
	}
	return coll.find({$or:query}).toArray().then(
		(dataArr)=>{
			let ind = func == TIME_SERIES_FUNC ? TIME_SERIES_IND : func;
			let result = {};
			result[ind] = {};
			for(let data of dataArr){
				if(data._id == sym + META_DATA_KEY) {
					result[META_DATA] = convertMeta(data);
					result[META_DATA].Symbol = extractSymbol(data._id);
					delete result[META_DATA]._id;
				} else if(ind == TIME_SERIES_IND) {
					Object.assign(result[ind], convertDaily(data));
				} else {
					Object.assign(result[ind], convertInd(data, func));
				}
			}
			return result;
		});
}

function getBatchDataFromDB(syms) {
	let coll = colls.Price;
	let all = [];
	syms.forEach(
		sym=>{
			all.push(
				coll.findOne({_id: sym + META_DATA_KEY})
				.then(res=>{
					if(res == null) {
						return null;
					}
					let lastDay = res[LAST_REFRESH_S];
					return coll.findOne({_id:sym + ":" + lastDay});
				})
				.then(res=>{
					if(res == null) {
						return null;
					}
					let values = res.values;
					if(!values || values.length == 0) {
						let meta = res[META_DATA];
						let id = res._id;
						res = convertDaily(res);
						res[META_DATA] = convertMeta(meta);
						res[META_DATA].Symbol = extractSymbol(id);
						return res;
					}
					let max = Object.keys(values)[0];
					for(let key in values) {
						max = key > max ? key : max;
					}
					let final = values[max];
					final._id = res._id;
					final[META_DATA] = {};
					final[META_DATA][LAST_REFRESH] = max;
					return final;
	 			})
 			);
		}
	);
	return Promise.all(all);
}

function getBatchData(req, res) {
	let syms = req.body.favors;

	if(Array.isArray(syms)) {
		getBatchDataFromDB(syms)
		.then((result)=>{
			res.json(result);
		})
		.catch(e=>{
			logger.error("get batch data error %O", e);
			res.status(500).json("server error");
		});
	} else {
		res.status(400).json("please send me a symbol array");
	}
}

function getData(req, res) {
	let sym = req.query.symbol, func = req.query.func, number = parseInt(req.query.number);
	if(!sym||!func||!number){
		res.status(400).json("not enough parameter");
	} else {
		getDataFromDB(sym, func, number)
		.then((result)=>res.json(result))
		.catch(e=>{
			logger.error('getData %O', e);
			res.status(500).json("server error");
		});
	}
}



module.exports = {
	getData: getData,
	getDataFromDB:getDataFromDB,
	getBatchDataFromDB:getBatchDataFromDB,
	getBatchData:getBatchData
};
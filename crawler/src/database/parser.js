'use strict';



//2018-01-12 16:00
//0123456789012345
//0000000000111111
const date_part_pos = {month: [5,6], day:[8,9], min:[11, 15]};
const DAY = 'day';
const MONTH = 'month';
const MINU = 'min';

const BATCH_IND = "Stock Quotes";
const ERROR_MSG = "Error Message";
const META_DATA = "Meta Data";
const Last_Refreshed = "Last Refreshed";
const TIME_SERIES = "Time Series";
const TIME_SERIES_MIN = "Time Series (1min)";
const TIME_SERIES_DAILY = "Time Series (Daily)";
const TIME_SERIES_FUNC = "TIME_SERIES_DAILY";
						 //01234567890
						 //00000000001


/**
 * parse series json file to database storage format
 * @param  {[type]}  data [data]
 * @param  {Boolean} last [parse the last predefined date]
 * @return {ind:string, newData:Object}       [description]
 */
function parseResult (data) {
	if(Object.keys(data).length == 0) {
		throw 'empty object';
	}
	let res = {};
	for(let key in data){
		if(key != META_DATA && key != ERROR_MSG) {
			let idEnd = key.substring(0, 11) == TIME_SERIES ? DAY : MONTH; 
			res.ind = key;
			res.newData = parseAll(data, date_part_pos[DAY], date_part_pos[idEnd][1], key);
			return res;
		} else if(key == ERROR_MSG) {
			throw data[ERROR_MSG];
		}
	}
	throw 'invalid object:\n' + JSON.stringify(data);
}



function parseBatch(data) {
	if(!data[BATCH_IND]) {
		throw 'invalid object';
	}
	let res = {}; 
	for(let entry of data[BATCH_IND]) {
		let ce = cleanEntry(entry);
		let _id = calID(ce.symbol, ce.timestamp.substring(0, date_part_pos[DAY][1] + 1));
		res[_id] = {};
		let hhmm = ce.timestamp.substring(date_part_pos[MINU][0], date_part_pos[MINU][1] + 1);
		hhmm = hhmm.replace(":", "_");
		delete ce.symbol;
		delete ce.timestamp;
		ce = parseEntry(ce);
		res[_id][hhmm] = ce;
	}
	return res;
}

function shortMeta(meta){
	var res = {};
	//remove seq number
	for(let key in meta) {
		res[key.substring(3)] = meta[key];
	}
	return res;
}


/**
 * 	{
 * 		Meta Data:{...}
 * 		_id:Symbol:id
 * 		[open, close, high, low, volume](only for daily)
 * 		values:{
 * 			*date2:{...}
 * 			*date1:{...}
 * 		}
 * 	}
 * @param  {[type]} data     [description]
 * @param  {[type]} datePos  [description]
 * @param  {[type]} idEnd    [description]
 * @param  {[type]} ind      [description]
 * @param  {[type]} lastDate [description]
 * @return {[type]}          [description]
 */
function parseLast(data, datePos, idEnd, ind) {
	var sMeta = shortMeta(data[META_DATA]);
	var lastDate = sMeta[Last_Refreshed];
	var res = {}, filter = lastDate.substring(0, idEnd + 1);
	var series = data[ind];
	for(let date in series ) {
		let id = date.substring(0, idEnd + 1);
		if(id == filter) {
			res = parseOne(res, sMeta, date, datePos, series[date], ind);
			res._id = getID(sMeta, id);
		}
	}
	return res;
}

/**
 * [
 * 	{
 * 		Meta Data:{...}
 * 		_id:Symbol:id
 * 		[open, close, high, low, volume](only for daily)
 * 		values:{
 * 			*date2:{...}
 * 			*date1:{...}
 * 		}
 * 	},
 * 	{...}
 * ]
 * @param  {[type]} data    [description]
 * @param  {[type]} datePos [description]
 * @param  {[type]} idEnd   [description]
 * @param  {[type]} ind     [description]
 * @return {[type]}         [description]
 */
function parseAll(data, datePos, idEnd, ind) {
	var res = {};
	var series = data[ind];
	var sMeta = shortMeta(data[META_DATA]);
	if(Object.keys(series) == 0) {
		res[META_DATA] = sMeta;
		res._id = getID(sMeta, sMeta[Last_Refreshed].substring(0, idEnd + 1));
		res.values = {};
		return [res];
	}
	for(let date in series ) {
		let id = date.substring(0, idEnd + 1);
		let newDateObj = new Date(date);
		res[id] = parseOne(res[id] || {}, sMeta, date, datePos, series[date], ind);
		if( !res[id].DATE_OBJ || res[id].DATE_OBJ.getTime() < newDateObj.getTime()) {
			res[id].DATE_OBJ = newDateObj;
			res[id][META_DATA][Last_Refreshed] = date;
		}
	}
	var arr = [];
	for(let id in res) {
		res[id]._id = getID(res[id][META_DATA], id);
  		arr.push(res[id]);
	}
	arr.sort((d1, d2)=>d2.DATE_OBJ.getTime() - d1.DATE_OBJ.getTime());
	arr.forEach(d=>delete d.DATE_OBJ);
	return arr;
}

function calID(sym, id) {
	return sym +":"+ id;
}
function getID(meta, id) {
	return calID(meta.Symbol, id);
}

function parseOne(cur, meta, date, datePos, entry, ind) {
	if(!cur[META_DATA]) {
		cur[META_DATA] = {};
		Object.assign(cur[META_DATA], meta);
	}
	cur.values = cur.values || {};
	if(ind == TIME_SERIES_DAILY) {
		Object.assign(cur, parseEntry(entry));
	} else {
		let shortDate = date.substring(datePos[0], datePos[1] + 1);
		cur.values[shortDate] = parseEntry(entry);
	}
	return cur;
}
var keymap = {

	open: 1,
	high: 2,
	low: 3,
	close: 4,
	volume: 5,
	"adjusted close": 6,
	price: 7,
	symbol: 8,

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
	SlowD:2
};

function cleanEntry(entry) {
	var res = {};
	for(let entryKey in entry) {
		let cleanKey = entryKey.replace(/[\d\.]/g, "").trim();
		res[cleanKey] = entry[entryKey];
	}
	return res;
}

function parseEntry(entry) {
	var res = {};
	entry = cleanEntry(entry);
	for(let entryKey in entry) {
		if(keymap[entryKey]) {
			res[keymap[entryKey]] = parseFStoInteger(entry[entryKey]);
		}
	}
	return res;
}

//100.0000 => 1000000
function parseFStoInteger(str) {
	var num = 0, i = 0, sign = 1;
	if(str[0] == '-') {
		i = 1;
		sign = -1;
	}
	for(; i < str.length; i++) {
		if(str[i] != '.' && (str[i] < '0' || str[i] > '9')){
			return str;
		}
		if(str[i] != '.') {
			num*=10;
			num+=parseInt(str[i]);
		} 
	}
	return num * sign;
}

function compressMeta(data) {
	let sMeta = {};
	if(data[META_DATA]) {
		sMeta.lf = data[META_DATA][Last_Refreshed];
		data[META_DATA] = sMeta;
		return data;
	} else {
		sMeta.lf = data[Last_Refreshed];
		return sMeta;
	}
}

module.exports = {
	META_DATA: META_DATA,
	Last_Refreshed:Last_Refreshed,
	TIME_SERIES: TIME_SERIES,
	parseResult: parseResult,
	parseBatch:parseBatch,
	TIME_SERIES_DAILY:TIME_SERIES_DAILY,
	TIME_SERIES_FUNC: TIME_SERIES_FUNC,
	compressMeta:compressMeta
};


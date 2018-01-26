const fs = require('fs');

var talib = require("talib"),
    util = require('util');
var functions = talib.functions;
const database = require('../database/dataService.js');


var indicators = ['SMA', 'EMA', 'STOCH', 'RSI', 'ADX', 'CCI', 'BBANDS', 'MACD'];
// Display module version
function explain(){
	console.log();
	console.log("TALib Version: " + talib.version);
	for(let ind of indicators) {
	  // Display ADX indicator function specifications
	  console.log(util.inspect(talib.explain(ind), { depth:3 }));
	}
}
explain();
const Price = {
	open: 1,
	high: 2,
	low: 3,
	close: 4,
	volume: 5,
	"adjusted close": 6,
	price: 7,
	symbol: 8,
};
var META_DATA = 'Meta Data';
talib.executeP = function(params, callback = null){
	if(callback) {
		talib.execute(params, callback);
	} else {
		return new Promise((res, rej)=>{
			talib.execute(params, (err, result)=>{
				if(err) {
					rej(err);
				} else {
					res(result);
				}
			});
		});
	}
};
function sma(series, data, ind) {
	return talib.executeP({
	    name: ind,
	    startIdx: 0,
	    endIdx: series.close.length - 1,
	    inReal: series.close,
	    optInTimePeriod: 30
	})
	.then(result=>{
		console.log(data[result.begIndex]);
		result.begDate = data[result.begIndex][META_DATA].lf;
	    // Show the result array
	    console.log(ind + " Function Results:");
	    console.log(result.result.outReal.slice(0, 10));
	    return result;
	});
}

function stoch(series, data, ind) {
	return talib.executeP({
	    name: ind,
	    startIdx: 0,
	    endIdx: series.close.length - 1,
	    inPriceHLC: series
	})
	.then(result=>{
		console.log(data[result.begIndex]);
		result.begDate = data[result.begIndex][META_DATA].lf;
	    // Show the result array
	    console.log(ind + " Function Results:");
	    console.log(result.result.outReal.slice(0, 10));
	    return result;
	});
}

function test(ind){
	console.log(util.inspect(talib.explain(ind), { depth:3 }));
	console.log();
	console.log(ind);
	var config = JSON.parse(fs.readFileSync('config.json'));
	var startDate = null;
	database.init(config.mongodb)
	.then(()=>database.colls.Price.find({_id:/^AAPL:2017/}).toArray())
	.then((res, err)=>{
		if(err) {
			console.log(err);
			return;
		}
		
		res.sort((d1, d2)=>{
			return (new Date(d1[META_DATA].lf)).getTime() - (new Date(d2[META_DATA].lf)).getTime();
		});
		let series = {close:[]};
		function cunit(data) {
			return data / 10000;
		}
		for(let entry of res) {
			series.close.push(cunit(entry[Price.close]));
			series.open.push(cunit(entry[Price.close]));
			series.high.push(cunit(entry[Price.close]));
			series.low.push(cunit(entry[Price.close]));
		}
		switch(ind) {
			case 'SMA': return sma(series, res, ind);
			//case 'EMA': return ema(series, res, ind); error accum from begining
			case 'STOCH':
			case 'RSI':
			//case 'ADX': rely on EMA
			case 'CCI':
			case 'BBANDS':
			//case 'EMA'
		}
	})
	.then(result=>{
		//2018-01-01
		//01234567
		startDate  = result.begDate;
		return database.colls[ind].findOne({_id: 'AAPL:' + startDate.substring(0, 7)});
	})
	.then(result=>{
		let startDateI = (new Date(startDate)).getTime();
		let curMonth = result._id.substring(result._id.indexOf(':') + 1);
		for(let entry in result.values){
			let curDateStr = curMonth + '-' + entry;
			let curDateI = (new Date(curDateStr)).getTime();
			if(curDateI >= startDateI) {
				console.log(curDateStr + " " + JSON.stringify(result.values[entry]));
			}
		}
	});

}

//test('SMA');
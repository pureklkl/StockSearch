"use strict";


var queryApi = require('../../utils/queryApi.js');
var settings = require('../../config/settings');


class searchStock {

 	static getStockApi() { return "https://www.alphavantage.co/query?"; }
 	static getStockApiKey() { return settings.AlphaVantageKey; }
 	//http://localhost:3000/search?symbol=AAPL&func=TIME_SERIES_DAILY_ADJUSTED&number=10
 	static parseResult(data, number) {
 		number = Math.max(number, 1);
 		for(let key in data){
 			if(key != "Meta Data" && key != "Error Message") {
 				var dates = [];
 				var stData = data[key];
 				for(let date in stData){
 					dates.push(date);
 				}
 				dates.sort((d1, d2) => {
						return (new Date(d2)).getTime() - (new Date(d1)).getTime();});
 				dates = dates.slice(0, number);
 				var filteredData = {};
 				dates.forEach(date=>{
 					filteredData[date] = stData[date];
 				});
 				data[key] = filteredData;
 				break;
 			}
 		}
 		return data;
 	}

	static searchSymbol(symbol, func, number) {
		if(!symbol || !func || !number){
			return Promise.resolve({"Error Message":"Missing parameters"});
		}
		var params = {};
		params["function"] = func;
		params.symbol = symbol;
		params.apikey = this.key;
		switch(func){
			case "TIME_SERIES_INTRADAY" :
				params.interval = "1min";
				break;
			case "TIME_SERIES_DAILY_ADJUSTED" :
				if(number>100){
					params.outputsize = "full";
				}
				break;
			case "BBANDS" :
			case "RSI" :
			case "SMA" :
			case "EMA" :
				params.series_type="close";
				/* falls through */
			case "ADX" :
			case "CCI" :
				params.time_period= "30";
				/* falls through */
			case "STOCH" :
				params.interval = "daily";
				break;
			case "MACD" :
				params.interval = "daily";
				params.series_type = "close";
				break;
			default:
				throw 'unknown indicator' + func;
		}
		//console.log(params);
		var query = new queryApi(this.getStockApi());
		return query.queryJson(params)
		.then((res)=>{
			return this.parseResult(res, number);
		})
		.catch((e)=>{
			//if(e!==''){
			//	console.log(e);
			//}
			throw e;
		});
	}

	static queryStockList(symbols){
		if(!symbols || !symbols.length){
			return Promise.resolve({"Error Message":"Missing parameters"});
		}
		var queries = [];
		symbols.forEach(symbol=>{
			queries.push(this.searchSymbol(symbol, "TIME_SERIES_DAILY_ADJUSTED", 1));
		});
		return Promise.all(queries).then(values=>{return values;});
	}
}

exports.searchOne = function(req, res){
	searchStock.searchSymbol(req.query.symbol, req.query.func, parseInt(req.query.number))
	.then(searchResult=>{
		res.json(searchResult);})
	.catch(e=>{res.status(500).json(e.message);});
};

exports.searchList = function(req, res){
	searchStock.queryStockList(req.body)
	.then(searchResult=>{
		res.json(searchResult);})
	.catch(e=>{res.status(500).json(e.message);});
};

exports.test = function(req, res){
	searchStock.queryStockList([req.query.symbol1, req.query.symbol2])
	.then(searchResult=>{res.json(searchResult);})
	.catch(e=>{res.status(500).json(e.message);});
};



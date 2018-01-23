'use strict';

class StockSearch {

	constructor(key, crawler){
		this.key = key;
		this.crawler = crawler;
		this.subscription = null;
	}
	search(sym, ind, number) {
		var params = this.getParams(sym, ind, number);
		return this.crawler.queryJsonLimit(params);
	}
	searchBatch(syms) {
		var params = this.getParams(syms, "BATCH_STOCK_QUOTES");
		return this.crawler.queryJsonLimit(params);
	}
	subscribe(callback) {
		this.subscription = this.crawler.timer.subscribe(callback);
	}
	unsubscribe() {
		if(this.this.crawler.subscription != null) {
			this.subscription.unsubscribe();
		}
	}
	catch(callback) {
		this.crawler.catch(callback);
	}
	/**
	 * getParams according to stock symbol, indicator, and data number required
	 * @param  {string} symbol [stock symbol]
	 * @param  {string} func   [indicator]
	 * @param  {integer} number [data number]
	 * @return {[type]}        [generated query parameters]
	 */
	getParams(symbol, func, number = 1) {
		if(!symbol || !func){
			throw "not enough params";
		}
		var params = {};
		params["function"] = func;
		if(func == "BATCH_STOCK_QUOTES") {
			params.symbols = symbol.join(',');
		} else {
			params.symbol = symbol;
		}
		params.apikey = this.key;
		switch(func){
			case "BATCH_STOCK_QUOTES":
				break;
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
				throw 'unknown indicator: ' + func;
		}
		return params;
	}
}

module.exports = {
	StockSearch: StockSearch,
};
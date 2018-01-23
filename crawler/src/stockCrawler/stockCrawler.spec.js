'use strict';
const fs = require('fs');

var csvparse = require('csv-parse/lib/sync');

const crawler = require('../crawler/crawler.js');
const stock = require('../crawler/stock.js');
const database = require('../database/dataService.js');
const store = require('../database/storeStock.js');
const parser = require('../database/parser.js');
const stockCrawler = require('../stockCrawler.js');


function test4() {
	var syms = csvparse(fs.readFileSync('./companylist.csv'), {columns: true});
	syms = syms.slice(0, 10);
	var config = JSON.parse(fs.readFileSync('config.json'));
	var stCraw = new stock.StockSearch(config.key, 
		new crawler.QueryApiRateLimit(config.api, config.rateLimit));
	var count = 0;
	stCraw.subscribe(
		(res)=>{
			store.updateLast(res).then(
				()=>{
					count++;
					if(count == syms.length) {
						database.close();
						stCraw.unsubscribe();
					}
				}
				);
		},
		(err)=>{
			console.log(err);
		});
	database.init().then(
		()=>syms.forEach((sym)=>stCraw.search(sym.Symbol, 'TIME_SERIES_DAILY', 10))
		);
}

//test4();

function test5() {
	var syms = csvparse(fs.readFileSync('./companylist.csv'), {columns: true});
	syms = syms.slice(0, 10);
	var config = JSON.parse(fs.readFileSync('config.json'));
	var stCraw = new stock.StockSearch(config.key, 
		new crawler.QueryApiRateLimit(config.api, config.rateLimit));
	var count = 0;
	stCraw.subscribe(
		(res)=>{
			store.updateLast(res).then(
				()=>{
					count++;
					if(count == syms.length) {
						database.close();
						stCraw.unsubscribe();
					}
				}
				);
		},
		(err)=>{
			console.log(err);
		});
	database.init().then(
		()=>syms.forEach((sym)=>stCraw.search(sym.Symbol, 'SMA', 10))
		);
}

//test5();

function test6() {
	var syms = csvparse(fs.readFileSync('./companylist.csv'), {columns: true});
	syms = syms.slice(0, 10);
	var config = JSON.parse(fs.readFileSync('config.json'));
	var stCraw = new stock.StockSearch(config.key, 
		new crawler.QueryApiRateLimit(config.api, config.rateLimit));
	var count = 0;
	stCraw.subscribe(
		(res)=>{
			store.updateLast(res).then(
				()=>{
					count++;
					if(count == syms.length) {
						database.close();
						stCraw.unsubscribe();
					}
				}
				);
		},
		(err)=>{
			console.log(err);
		});
	database.init().then(
		()=>syms.forEach((sym)=>stCraw.search(sym.Symbol, 'SMA', 10))
		);
}

//test6();

function test7() {
	var res = stockCrawler.shouldUpdateAll('2018-1-17', '2018-1-01', '2018-1-16');
	console.log(res);
	res = stockCrawler.shouldUpdateAll('2018-1-17', '2018-1-01', '2018-1-12');
	console.log(res);
	res = stockCrawler.shouldUpdateAll('2018-1-17', '2018-1-01', '2017-6-16');
	console.log(res);
}
//test7();

function test8() {
	var data = JSON.parse(fs.readFileSync('./test/sma.json'));
	data = parser.parseResult(data);
	console.log(stockCrawler.getEndDate(data));
	data = JSON.parse(fs.readFileSync('./test/dailyData.json'));
	data = parser.parseResult(data);
	console.log(stockCrawler.getEndDate(data));
}
//test8();

function test9() {
	var config = JSON.parse(fs.readFileSync('config.json'));
	database.init().then(
		()=>{
			stockCrawler.init(config, config.keys[0]);
			stockCrawler.updateStock('error', 'Price');
		}
		);
}

//test9();
var axios = require('axios');
const rx = require('rxjs/Rx');
const axiosRetry = require('axios-retry');

axiosRetry(axios, { retries: 3 });
function test10() {
		var params = {};
		params["function"] = 'TIME_SERIES_DAILY_ADJUSTED';
		params.symbol = 'AAPL';
		params.apikey = "demo";
		params.outputsize = "full";
	rx.Observable.interval(1000).flatMap(()=>{
		return rx.Observable.fromPromise(axios.get('https://www.alphavantage.co/query',
			{params: params}))
		.catch((err)=>{console.log('err'); return rx.Observable.empty();});
		
	}).subscribe((res)=>console.log(Object.keys(res.data)));
}
test10();
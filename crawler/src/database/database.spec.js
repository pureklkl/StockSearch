const fs = require('fs');
const util = require('util');

const database = require('./dataService.js');
const store = require('./storeStock.js');
const parser = require('./parser.js');


function log(myObject){
	console.log(util.inspect(myObject, {showHidden: false, depth: null}));
}

function test2(filename) {
	var data = JSON.parse(fs.readFileSync(filename));
	data = parser.parseResult(data, false);
	log(data);
}


//test2('./test/dailyData.json');
//test2('../test/macd.json');

function test21(filename) {
	var data = JSON.parse(fs.readFileSync(filename));
	database.init().then(
		res=>{
			console.log('databse inited');
			return store.updateLast(data);
		}).then(()=>{
			database.close();
			console.log('finished');
		});
}
//test21('./test/dailyData.json');

function test210(filename) {
	var data = JSON.parse(fs.readFileSync(filename));
	database.init().then(
		res=>{
			console.log('databse inited');
			return store.updateAll(data);
		}).then(()=>{
			database.close();
			console.log('finished');
		});
}

//test210('./test/dailyData.json');
//test210('./test/sma.json');
//test210('../test/macd.json');


function test22() {
	var data = JSON.parse(fs.readFileSync('./test/dailyData.json'));
	var data2 = JSON.parse(fs.readFileSync('./test/dailyData2.json'));
	database.init().then(
		res=>{
			console.log('databse inited');
			return store.updateLast(data);
		}).then(
		res=>{
			return store.updateLast(data2);
		}).then(()=>{
			database.close();
			console.log('finished');
		});
}

//test22();

function test23() {
	var data = JSON.parse(fs.readFileSync('./test/sma.json'));
	var data2 = JSON.parse(fs.readFileSync('./test/sma2.json'));
	database.init().then(
		res=>{
			console.log('databse inited');
			return store.updateLast(data);
		}).then(
		res=>{
			return store.updateLast(data2);
		}).then(()=>{
			database.close();
			console.log('finished');
		});
}

//test23();


function test24() {
	var data = JSON.parse(fs.readFileSync('../../test/batch.json'));
	console.log(data);
	database.init().then(
		res=>{
			console.log('databse inited');
			
			return store.updateBatch(data);
		}).then(()=>{
			database.close();
			console.log('finished');
		});
}
test24();
"use strict";

const MongoClient = require('mongodb').MongoClient;
const { logger } = require('../logger/logger.js');

var db = null;
var _client = null;

var colls = {
	Price : null,
	SMA : null,
	EMA : null,
	STOCH: null,
	RSI: null,
	ADX: null,
	CCI: null,
	BBANDS: null,
	MACD: null
};



class DataService{
	static getDBUrl(){
		return "mongodb://localhost:27017/";
	}
	static getDB(url){
		return MongoClient.connect(url).then((client)=>{
			_client = client;
			db = client.db("mydb");
			logger.info("Database connected !");
		},
		err=>{
			logger.error(err);
			throw err;
		});
	}
	static addColl(name){
		logger.info('add collection ' + name);
		return db.createCollection(name).then(()=>this.findColl(name));
	}
	static findColl(name){
		return new Promise((res, rej)=>{
			db.collection(name, {strict:true}, (err, coll)=>{
				if(err!=null){
					rej(err);
				} else {
					logger.info("collection " + name);
					colls[name] = coll;
					res(coll);
				}
			});
		});
	}
	static checkColls(db){
		var collsPs = [];
		for(let key in colls){
			collsPs.push(this.findColl(key).catch(()=>{this.addColl(key);}));
		}
		return Promise.all(collsPs);
	}
	static initDataService(url = this.getDBUrl()){
		return this.getDB(url).then(this.checkColls.bind(this));
	}
	static close(){
		_client.close();
	}
}



module.exports = {
	colls : colls,
	init : DataService.initDataService.bind(DataService),
	close: DataService.close
};


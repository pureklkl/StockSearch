"use strict";

const MongoClient = require('mongodb').MongoClient;

var db = null;

var colls = {
	users : null,
	stocks : null,
	tokens : null,
};

class DataService{
	static getDBUrl(){
		return "mongodb://localhost:27017/mydb";
	}
	static getDB(){
		return MongoClient.connect(this.getDBUrl()).then((database)=>{
			db = database;
			console.log("Database connected !");
		});
	}
	static addColl(name){
		console.log('add collection ' + name);
		return db.createCollection(name).then(()=>this.findColl(name));
	}
	static findColl(name){
		return new Promise((res, rej)=>{
			db.collection(name, {strict:true}, (err, coll)=>{
				if(err!=null){
					rej(err);
				} else {
					console.log("collection " + name);
					colls[name] = coll;
					res(coll);
				}
			});
		});
	}
	static checkColls(db){
		var collsPs = [];
		for(let key in colls){
			collsPs.push(this.findColl(key).catch(()=>{this.addColl(key)}));
		}
		return Promise.all(collsPs);
	}
	static initDataService(){
		return this.getDB().then(this.checkColls.bind(this));
	}
}



module.exports = {
	colls : colls,
	init : DataService.initDataService.bind(DataService),
};


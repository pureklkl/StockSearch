'use strict';

var crypto = require('crypto');
var _ = require("lodash");
var dataService = require('../../database/dataService');
var ObjectID = require('mongodb').ObjectID;
var colls = dataService.colls;

var userSchema = {
	username : '',
	displayname : '',
	_password : '',
	register_date: '',
	salt : '',
	provider: 'local',
	role: 1,
	data : {}
};

class User {
	constructor(user = userSchema){
		Object.assign(this, user);
	}
	get password(){
		return this._password;
	}
	hashPassword(password){
		return crypto.pbkdf2Sync(password, new Buffer(this.salt), 10000, 64, 'sha256').toString('base64');
	}
	set password(password){
		this.salt = crypto.randomBytes(16).toString('base64');
		this._password = this.hashPassword(password);
	}
	get data(){
		return this._data;
	}
	set data(data){
		this._data = _.defaults(this.data, data);
	}

	prepareData(){
		var saved = _.pick(this, _.keys(userSchema));
		saved.data = JSON.stringify(saved.data);
		return saved;
	}

	/*create(){// return null when succeed, not good
		var saved = this.prepareData();
		return users.findOneAndUpdate(
			{username : saved.username},
			{$setOnInsert: saved},
			{upsert: true}
		)
	}*/
	create(){
		var saved = this.prepareData();
		return colls.users.insertOne(saved);
	}
	validPassword(password){
		return this._password == this.hashPassword(password);
	}
	update(){
		var saved = this.prepareData();
		return colls.users.updateOne(
			{username : saved.username},
			saved);
	}	
}

function findOne(query, option = {}){
	return colls.users.findOne(query, option);
}
function findOneById(id){
	if(!(id instanceof ObjectID)){
		id = ObjectID(id);
	}
	return findOne({_id : id});
}
function findOneByUsername(username){
	return findOne({username : username});
}

function count(query){
	return colls.users.count(query);
}

function deleteOne(id){
	if(!(id instanceof ObjectID)){
		id = ObjectID(id);
	}
	return colls.users.deleteOne({_id : id});
}

module.exports = {
	User : User,
	findOneById : findOneById,
	findOneByUsername : findOneByUsername,
	count : count,
	deleteOne: deleteOne
};
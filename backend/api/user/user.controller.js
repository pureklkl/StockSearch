'use strict';

var jwt = require('jsonwebtoken');
var moment = require('moment-timezone');

var users = require('./user.model');
var settings = require('../../config/settings');
var auth = require('../../auth/auth.service');

function checkUserForm(form){
	if(form.username == null || form.password == null){
		return false;
	}
	if(form.username.trim()==''||form.password.trim()==null){
		return false;
	}
	return true;
}

exports.create = function(req, res){
	var newUser = new users.User();
	if(!checkUserForm(req.body)){
		res.status(400).json({message: 'invalid form'});
		return;
	}
	newUser.username = req.body.username;
	newUser.password = req.body.password;
	newUser.displayname = newUser.username;
	newUser.register_date = moment().tz("America/Los_Angeles").format();
	users.findOneByUsername(newUser.username).then(
		user => {
			if(true){
				return newUser.create();
			} else {
				res.status(401).json({message: 'username duplicate'});
				throw new Error('handled');
			}
		}
	).then(
		(result) => {
			var user = result.ops[0];
			return users.count({username: user.username})//double check for asychronize
			.then(num=>{
				if(num > 1){
					users.deleteOne(user._id);
					res.status(401).json({message: 'username duplicate ' + user.username});
					throw new Error('handled');
				}
				return user;
			});
		}
	).then(
		user => {
				var token = auth.getToken(user._id);
				res.json({token: token});
		}
	).catch(
		err => {
			if(err.message != 'handled'){
				res.status(500).json(err.message);
			}
		}
	);
};

exports.info = function(req, res){
	var userId = req.user._id;
	users.findOneById(userId).then(
			(user)=>{
				res.json(user);
			},
			(err)=>{
				res.status(500).json(err.message);
			}
		);
};
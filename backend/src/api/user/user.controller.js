'use strict';

var jwt = require('jsonwebtoken');
var moment = require('moment-timezone');
const { logger } = require('../../logger/logger.js');

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
	if(!checkUserForm(req.body)){
		res.status(400).json({message: 'invalid form'});
		return;
	}
	var newUser = new users.User();
	newUser.username = req.body.username;
	newUser.password = req.body.password;
	newUser.displayname = newUser.username;
	newUser.register_date = moment().tz("America/Los_Angeles").format();
	users.findOneByUsername(newUser.username).then(
		user => {
			if(true){
				return newUser.create();
			} else {
				res.status(401).json({message: 'username duplicate ' + user.username});
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
				var curUser = new users.User(user);
				res.status(200).json({token: token, userInfo: curUser.getInfo()});
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
				var curUser = new users.User(user);
				res.json({userInfo: curUser.getInfo()});
			},
			(err)=>{
				res.status(500).json({message: "user not found"});
			}
		);
};

exports.getFavor = function(req, res) {
	res.status(200).json({message: req.user.favors});
};

function userInfoUpdate(user, op, args, res) {
	var curUser = new users.User(user);
	curUser[op](args);
	curUser.update().then(
		(result)=>{
			res.status(200).json({message: args});
			
		},
		(err)=>{
			logger.error("user info update error %O", err);
			res.status(500).json({message: "server error"});
		}
	);
}

exports.addFavor = function(req, res){
	userInfoUpdate(req.user, 'addFavor', req.params.stock, res);
};

exports.deleteFavor = function(req, res){
	userInfoUpdate(req.user, 'deleteFavor', req.params.stock, res);
};
exports.isFavor = function(req, res){
	res.status(200).json({message: (req.params.stock in req.user.favors)});
};
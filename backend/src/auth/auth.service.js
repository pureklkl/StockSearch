'use strict';

var settings = require('../config/settings');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var users = require('../api/user/user.model');

var validateJwt = expressJwt({ secret: settings.jwtSignKey });

function getToken(id){
	let token = jwt.sign({_id: id }, settings.jwtSignKey, settings.tokenExpire);
	return token;
}

function isAuthenticated() {
	return compose()
	.use((req, res, next) => {
			if(req.cookies && req.cookies.token){
				req.headers.authorization = 'Bearer ' + req.cookies.token;
			} 
			else if(req.query && req.query.hasOwnProperty('access_token')) {
				req.headers.authorization = 'Bearer ' + req.query.access_token;
			}
			validateJwt(req, res, next);
	})
	.use((err, req, res, next)=>{
		if (err.name === 'UnauthorizedError') {
			res.status(401).send('invalid token...');
			return;
		}
		next();
	})
	.use((req, res, next) => {
		if(!req.user._id){
			return res.status(401).json({message: 'token invalid'});
		} else {
			users.findOneById(req.user._id).then(
					user => {
						if(user == null){
							res.status(401).json({message: 'user not found'});
						} else {
							req.user = user;
							next();
						}
					},
					err =>{
						res.status(500).json(err.message);
					}
				);
		}
	});
}

function hasRole(roleRequired){
	return compose()
	.use(isAuthenticated())
	.use((req, res, next) => {
		if(req.user.role > roleRequired){
			next();
		} else {
			res.status(403).json({message: 'role level not meet'});
		}
	});
}

exports.getToken = getToken;
exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;

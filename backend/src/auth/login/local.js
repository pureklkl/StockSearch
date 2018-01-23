/* jshint node: true */
'use strict';
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var users = require('../../api/user/user.model');

exports.setup = function () {
	passport.use(
	new LocalStrategy({
		usernameField: 'username',
		passwordField: 'password'
	},
	(username, password, done) => {
		users.findOneByUsername(username).then(
			user => {
				if(user == null){
					return done(null, false, { message: 'This email is not registered.' });
				}
				var userObj = new users.User(user);
				if(!userObj.validPassword(password)){
					return done(null, false, { message: 'This password is not correct.' });
				}
				return done(null, userObj);
			},
			err => {
				if (err) return done(err);
			});
	}));
};
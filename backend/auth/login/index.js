"use strict";

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

require('./local').setup();

router.post('/local', function(req, res, next) {
	passport.authenticate('local', (err, user, info) => {
		var error = err || info;
		if (error) return res.status(401).json(error);
		if (!user) return res.status(404).json({message: 'Something went wrong, please try again.'});

    	var token = auth.getToken(user._id, user.role);
    	res.cookie('token', token);
    	res.redirect('/userInfo.html');
	})(req, res, next);
});

module.exports = router;
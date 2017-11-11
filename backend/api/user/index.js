'use strict';

var express = require('express');
var controller = require('./user.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', controller.create);
router.get('/info', auth.isAuthenticated(), controller.info);

module.exports = router;
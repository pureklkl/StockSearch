'use strict';

var express = require('express');
var controller = require('./user.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/', controller.create);
router.get('/info', auth.isAuthenticated(), controller.info);
router.get('/favors', auth.isAuthenticated(), controller.getFavor);
router.put('/favor/:stock', auth.isAuthenticated(), controller.addFavor);
router.delete('/favor/:stock', auth.isAuthenticated(), controller.deleteFavor);
router.get('/favor/:stock', auth.isAuthenticated(), controller.isFavor);
module.exports = router;
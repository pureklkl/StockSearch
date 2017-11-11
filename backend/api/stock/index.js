'use strict';

var express = require('express');
var searchData = require('./searchData');
var searchNews = require('./searchNews');
var symbolHint = require('./symbolHint');

var router = express.Router();

router.get('/data', searchData.searchOne);
router.post('/data', searchData.searchList);
router.get('/data/test', searchData.test);

router.get('/news', searchNews.getNews);
router.get('/hint', symbolHint.getHint);

module.exports = router;
var express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
var app = express();

var search = require('./search.js');
var searchNews = require('./searchNews.js');
var symbolHint = require('./symbolHint.js');

app.use(express.static(path.join(__dirname, '/frontend/dist')));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use(bodyParser.json());

app.use('/search', search);
app.use('/searchNews', searchNews);
app.use('/symbolHint', symbolHint);

app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname + '/frontend/dist/index.html'));
});

var port = process.env.PORT || 3000;

var server = app.listen(port, function () {
    console.log('Server running at http://127.0.0.1:' + port + '/');
});

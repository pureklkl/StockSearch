var express = require('express');
var router = express.Router();
var queryApi = require('./queryApi.js');

class SymbolHint{
	static getHintApi(){return "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json";}
	static searchSymbol(symbol){
		if(!symbol){
			return Promise.resolve("Missing parameters");
		}
		return (new queryApi(this.getHintApi())).queryJson({input: symbol});
	}
}

router.get('/', function(req, res){
	SymbolHint.searchSymbol(req.query.symbol)
	.then(searchResult=>{res.json(searchResult);})
	.catch(e=>{res.status(500).json(e.message);});
});

module.exports = router;
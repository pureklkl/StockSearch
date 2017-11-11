var queryApi = require('../../utils/queryApi.js');

class SymbolHint{
	static getHintApi(){return "http://dev.markitondemand.com/MODApis/Api/v2/Lookup/json";}
	static searchSymbol(symbol){
		if(!symbol){
			return Promise.resolve("Missing parameters");
		}
		return (new queryApi(this.getHintApi())).queryJson({input: symbol});
	}
}

exports.getHint = function(req, res){
	SymbolHint.searchSymbol(req.query.symbol)
	.then(searchResult=>{res.json(searchResult);})
	.catch(e=>{res.status(500).json(e.message);});
};

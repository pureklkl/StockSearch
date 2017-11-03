var express = require('express');
var router = express.Router();
var queryApi = require('./queryApi.js');

class searchNews {
	static getNewsApi() {return "https://seekingalpha.com/api/sa/combined/";}

	static parseResult(data){
		var newses = data.rss.channel[0].item.filter(news=>{
			return news.link[0].indexOf("/article/") > 0;
		});
		return newses.slice(0, 5);
	}

	static search(symbol){
		if(!symbol){
			return Promise.resolve({"Error Message":"Missing parameters"});
		}
		var query = new queryApi(this.getNewsApi()+symbol+'.xml');
		return query.queryXml({})
		.then((res)=>{
			return this.parseResult(res);
		})
		.catch((e)=>{
			throw e;
		});
	}
}

router.get('/', function(req, res){
	searchNews.search(req.query.symbol)
	.then(searchResult=>{res.json(searchResult);})
	.catch(e=>{
		console.log(e.response.status);
		if(e.response.status == 404){
			res.json("No Symbol Found");
		} else {
			res.status(500).json(e.message);
		}
	});
});

module.exports = router;
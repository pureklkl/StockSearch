const axios = require('axios');
const xml2js = require('xml2js');

class QueryApi {
	constructor(api){
		this.api = api;
	}

	query(params){
		return axios.get(this.api, 
			{params: params, transformResponse: 
				(req) => {return req;}
			});
	}

	queryJson(params){
		return this.query(params)
		.then((res)=>{
			return JSON.parse(res.data);
		})
		.catch((e)=>{
			//console.log(e);
			throw e;
		});
	}
	queryXml(params){
		return this.query(params)
		.then((res)=>{
			return new Promise((resolve, reject)=>{
							xml2js.parseString(res.data, (err, result)=>{
								if(err){
									reject(err);
								} else {
									resolve(result);
								}
							});
			});
		})
		.catch(e=>{
			//console.log(e);
			throw e;
		});
	}
}

module.exports = QueryApi;
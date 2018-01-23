'use strict';

var axios = require('axios');
const xml2js = require('xml2js');
const rx = require('rxjs/Rx');
const axiosRetry = require('axios-retry');
const { logger } = require('../logger/logger.js');

//axiosRetry(axios, { retries: 3 });

class QueryApi {
	constructor(api){
		this.api = api;
	}

	query(params){
		logger.verbose('request %O', params);
		return axios.get(this.api, 
			{params: params,
			 transformResponse: (req) => {return req;}
			}).catch(e=>{
				logger.error('request error, throw at query');
				throw e;
			});
	}

	queryPost(params){
		return axios.post(this.api, params);
	}

	queryJson(params){
		return this.query(params)
		.then((res)=>{
			res.data = JSON.parse(res.data);
			return res;
		})
		.catch((e)=>{
			logger.error('request error, throw at json');
			e.config = e.config || {};
			e.config.params = params;
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
			logger.error('request error, throw at xml');
			throw e;
		});
	}
}

class QueryApiRateLimit extends QueryApi{
	constructor(api, rate){
		super(api);
		this.rate = rate;
		this.queue = [];
		this._timer = rx.Observable.interval(rate).flatMap(()=>
				{
					if(this.queue.length != 0){
						var nextQuery = this.queue.pop();
						return new rx.Observable(
							o=>{
								nextQuery.func.call(this, nextQuery.params)
									.then(response=>{o.next(response);o.complete();})
									.catch(err=>{
										logger.error('request error, throw at timer %s', err);
										o.next(err);
										o.complete();
									});
								});
					} else {
						return rx.Observable.empty();
					}
				});
	}
	queryPostLimit(params){
		this.queue.push({func: super.queryPost, params: params});
	}
	queryJsonLimit(params){
		this.queue.push({func: super.queryJson, params: params});
	}
	queryXmlLimit(params){
		this.queue.push({func: super.queryXml, params: params});
	}
	get timer() {
		return this._timer;
	}
	catch(callback) {
		this._timer = this._timer.catch(callback);
	}
}

module.exports = {QueryApi: QueryApi,
				  QueryApiRateLimit: QueryApiRateLimit};
'use strict';
const fs = require('fs');

var amqp = require('amqplib/callback_api');
const { logger } = require('../logger/logger.js');

const database = require('../database/dataService.js');
const stockCrawler = require('../stockCrawler/stockCrawler.js');

const DAILY_QUEUE = 'Stock Daily Update Queue';

var q = 'task_queue';
const PREFETCH_NUM = 10;//set a large number so that http won't idle
function slave(){
	var config = JSON.parse(fs.readFileSync('config.json'));
	amqp.connect(config.taskBase, function(err, conn) {
		if(err){logger.error(err);return;}
		conn.createChannel(function(err, ch) {
			if(err){logger.error(err);return;}
    		ch.assertQueue(q, {durable: true});
   			ch.prefetch(PREFETCH_NUM);
   			updateStock(ch, config);
		});
		
	});
	
}

var retryTime = {};
const retryLimit  = 3;
function updateStock(ch, config){
	return database.init(config.mongodb)
	.then(()=>{
		stockCrawler.init(config, config.keys[config.keyId]);
		logger.info(" [*] Waiting for messages in %s. To exit press CTRL+C", q);
		ch.consume(q, function(msg) {
			let job = JSON.parse(msg.content.toString());
			logger.info("receive job: %s" , JSON.stringify(job));
			stockCrawler.updateStock(job.sym, job.ind, 
				(e)=>{
					if(e) {
						let jk = stockCrawler.getCallbackKey(job.sym, job.ind);
						retryTime[jk] = retryTime[jk] || 0;
						retryTime[jk]++;
						if(retryTime[jk] > retryLimit) {
							ch.nack(msg, false, false);
							logger.error("job discard !: %s, %s", e, jk);
						} else {
							logger.error("job error: %s", e); ch.nack(msg);
						} 
					} 
					else { ch.ack(msg);}
				}
			);
		}, {noAck: false});
	})
	.catch(err=>logger.error('slave cannot connet to database %s'. err));
}

slave();
'use strict';

const master = require('./masterlib.js');
const { logger } = require('../logger/logger.js');

const SCEHDULE = 0;
const DAILY = 1;
const BATCH = 2;

const argvmap = {
	SCEHDULE: 0,
	DAILY: 1,
	BATCH: 2
};

function main(){
	if (process.argv.length <= 2) {
		master.master();
	}
	else if(argvmap[process.argv[2].toUpperCase()]){
		master.master(argvmap[process.argv[2].toUpperCase()]);
	} else {
		logger.error("invalid commnad argument");
	}
}

main();

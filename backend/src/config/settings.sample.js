'use strict';

module.exports = {
	jwtSignKey : "your jwt sign key", //hs256
	tokenExpire: { expiresIn: '2 days' },
	roleLv:{
		notVerified: 0,
		regular : 1,
		admin : 100
	},
	mongodb: "your mongodb connection string",
	AlphaVantageKey: "your AlphaVantage Key"
};
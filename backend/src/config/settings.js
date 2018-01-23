'use strict';

module.exports = {
	jwtSignKey : "VpSPg9AUZLJYoNq4CZrgeAqEwwmvE0KqVLJLNwcnZj8", //hs256
	tokenExpire: { expiresIn: '2 days' },
	roleLv:{
		notVerified: 0,
		regular : 1,
		admin : 100
	},
	mongodb: "mongodb://admin:pureklkl@54.187.238.255/mydb",
	AlphaVantageKey: "I1MVB74HWHGOUD33"
};
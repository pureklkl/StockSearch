'use strict';

module.exports = {
	jwtSignKey : "VpSPg9AUZLJYoNq4CZrgeAqEwwmvE0KqVLJLNwcnZj8", //hs256
	tokenExpire: { expiresIn: '2 days' },
	roleLv:{
		notVerified: 0,
		regular : 1,
		admin : 100
	}
}
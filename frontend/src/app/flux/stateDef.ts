export const AsyncState = {
	init: 'init',				//wait for start request (because of data outdate etc...)
	failed: 'failed',			//network error etc...
	invalid: 'invalid',			//get rejected, probably by auth
	canceled: 'canceled',		//user canceled in ongoing state
	success: 'success',			//reponse with 20X!
	ongoing: 'ongoing',			//your response is on the way

	refreshing: 'refreshing'	//new request after success
};

export const STATE_DEF = {
	USER : 'USER',
	USER_AS : 'USER_AS',
	REGISTER_AS : 'REGISTER_AS',
	
	HINTS : 'HINTS',
	HINTS_AS : 'HINTS_AS',

	AUTO : 'AUTO',
	FAVOR_SET : 'FAVOR_SET',
	FAVOR_SET_AS : 'FAVOR_SET_AS',
	FAVOR_SET_LOCAL : 'FAVOR_SET_LOCAL',

	FAVOR_ARRAY : 'FAVOR_ARRAY',
	FAVOR_ARRAY_FIELD: 'FAVOR_ARRAY_FIELD',
	FAVOR_ARRAY_ORDER: 'FAVOR_ARRAY_ORDER',
	FAVOR_ARRAY_AS : 'FAVOR_ARRAY_AS',

	DETAIL_SYM : 'DETAIL_SYM',
	CURRENT_TAB : 'CURRENT_TAB',
	CURRENT_IND : 'CURRENT_IND',

	TABLE : 'TABLE',
	TABLE_AS : 'TABLE_AS',
	CHART : 'CHART',
	CHART_AS : 'CHART_AS',
	CHART_OPTION : 'CHART_OPTION',
	HIST : 'HIST',
	HIST_AS : 'HIST_AS',
	NEWS : 'NEWS',
	NEWS_AS : 'NEWS_AS'
};

export const TABS = {
	DETAIL : 'table-chart',
	HIST : 'hist',
	NEWS : 'news'
};
export const INDS = {
	_sharePrice : "sharePrice",
	PRICE : "Price"
};

export const INIT_STATE = {
	USER: null,
	USER_AS: AsyncState.init,
	REGISTER_AS: AsyncState.init,
	
	HINTS: [],
	HINTS_AS: AsyncState.init,

	AUTO: false,
	FAVOR_SET: {},
	FAVOR_SET_AS: AsyncState.init,
	FAVOR_SET_LOCAL: true,

	FAVOR_ARRAY: [],
	FAVOR_ARRAY_FIELD: 'addTime',
	FAVOR_ARRAY_ORDER: 1,
	FAVOR_ARRAY_AS: AsyncState.init,

	DETAIL_SYM: null,
	CURRENT_TAB: TABS.DETAIL,
	CURRENT_IND: INDS.PRICE,

	TABLE: null,
	TABLE_AS: AsyncState.init,
	CHART: {},
	CHART_AS: {'Price': AsyncState.init},
	CHART_OPTION: null,
	HIST: null,
	HIST_AS: AsyncState.init,
	NEWS: null,
	NEWS_AS: AsyncState.init
}

export const ACTION_DEF =  {
	CLEAR : 'clear',
	
	LOGIN : 'login',
	SET_USER : 'set user',
	LOGOUT : 'logout',
	REGISTER : 'register',
	LOAD_HINT : 'load hint',
	SET_HINT : 'set hint',
	REMOVE_FAVOR : 'remove favor',
	ADD_FAVOR : 'add favor',
	SET_AUTO : 'set auto',
	SET_LOCAL_FAVOR_SET : 'set local favor set',
	LOAD_FAVOR_ARRAY : 'load favor array',
	SET_FAVOR_ARRAY: 'set favor array',
	SORT_FAVOR_ARRAY: 'sort favor array',
	REVERSE_FAVOR_ARRAY: 'reverse favor array',

	SET_DETAIL_SYM: 'set detail sym',
	SET_TAB: 'set tab',
	SET_IND: 'set ind',

	SHARE_PRICE: 'share price',
	LOAD_TABLE: 'load table',
	SET_TABLE: 'set table',
	LOAD_CHART: 'load chart',
	SET_CHART_OPTION: 'set chart option',
	SET_CHART: 'set chart',
	LOAD_HIST: 'load hist',
	SET_HIST: 'set hist',
	LOAD_NEWS: 'load news',
	SET_NEWS: 'set news'
};

export interface AppAction {
	type: string,
	payload: {}
}

export interface FavorAction {
	type: string,
	stock: string,
	payload: {}
}

export interface IndAction {
	type: string,
	ind: string,
	payload: {}
}
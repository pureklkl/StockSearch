import { StoreService } from '../services/';
import { STATE_DEF, ACTION_DEF, INDS, AppAction, IndAction, FavorAction, AsyncState } from './stateDef';
import { DATA_PATH, queryData, FavorStock } from '../services/parsers'


export function configReducers(store: StoreService) {
	
	function asyncReducer(asyncAction, setAction) {
		return function(state:any, action:AppAction):{} {
			if(action.type == asyncAction) {
				return action.payload;
			} else if(action.type == setAction) {
				return AsyncState.success;
			}
			return state;
		}
	}
	function setResultReducer(actionType) {
		return function(state:any, action:AppAction):{} {
			if(action.type == actionType) {
				return action.payload;
			}
			return state;
		}
	}

	store.addReducer(STATE_DEF.HINTS,
		(state:any, action:AppAction):{} => { 
			if(action.type == ACTION_DEF.CLEAR) {
				return null;
			}
			return setResultReducer(ACTION_DEF.SET_HINT)(state, action);
		});
	store.addReducer(STATE_DEF.HINTS_AS, 
		(state:any, action:AppAction):{} => { 
			if(action.type == ACTION_DEF.CLEAR) {
				return AsyncState.init;
			}
			return asyncReducer(ACTION_DEF.LOAD_HINT, ACTION_DEF.SET_HINT)(state, action);
		});
	
	store.addReducer(STATE_DEF.USER, 
		(state:any, action:AppAction):{} => {
		 	switch (action.type) {
		 		case ACTION_DEF.SET_USER: return action.payload;
		 		case ACTION_DEF.LOGOUT: return null;
		 		default: return state;
		 	}
		});
	store.addReducer(STATE_DEF.USER_AS, 
		(state:any, action:AppAction):{} => {
		 	switch (action.type) {
		 		case ACTION_DEF.LOGIN: return action.payload;
		 		case ACTION_DEF.LOGOUT: return AsyncState.init;
		 		case ACTION_DEF.SET_USER: return AsyncState.success;
		 		default: return state;
		 	}
		});

	
	store.addReducer(STATE_DEF.REGISTER_AS, setResultReducer(ACTION_DEF.REGISTER));

	store.addReducer(STATE_DEF.FAVOR_SET_AS,
		(state:any, action:AppAction):{} => {
		  	switch (action.type) {
		 		case ACTION_DEF.LOGIN: return action.payload;
		 		case ACTION_DEF.SET_USER: return AsyncState.success;
		 		case ACTION_DEF.SET_LOCAL_FAVOR_SET: return AsyncState.success;
		  		default: return state;
		  	}
		});

	store.addReducer(STATE_DEF.FAVOR_SET_LOCAL,
		(state:any, action:AppAction):{} => {
		  	switch (action.type) {
		  		case ACTION_DEF.SET_USER: return false;
		 		case ACTION_DEF.SET_LOCAL_FAVOR_SET: return true;
		  		default: return state;
		  	}
		});
	store.addReducer(STATE_DEF.FAVOR_SET,
		(state:any, action:FavorAction):{} => {
		  	let newState = Object.assign({}, state);
		  	switch (action.type) {
		  		case ACTION_DEF.SET_USER: return action.payload['userInfo']['favors'];
		 		case ACTION_DEF.SET_LOCAL_FAVOR_SET: return action.payload;
		 		case ACTION_DEF.ADD_FAVOR:
		 			newState[action.stock] = action.payload;
		 			return newState;
		 		case ACTION_DEF.REMOVE_FAVOR:
		 			delete newState[action.stock];
		 			return newState;
		  		default: return state;
		  	}
		});

	store.addReducer(STATE_DEF.AUTO, 
			(state:any, action:AppAction):{} => {
			  	switch (action.type) {
			  		case ACTION_DEF.SET_AUTO: return !state;
			  		default: return state;
			  	}
			}
		);

	store.addReducer(STATE_DEF.FAVOR_ARRAY_AS, 
		(state: Array<FavorStock>, action:AppAction):{} => {
			switch (action.type) {
				case ACTION_DEF.ADD_FAVOR: return AsyncState.init;
				case ACTION_DEF.LOAD_FAVOR_ARRAY: return action.payload;
				case ACTION_DEF.SET_LOCAL_FAVOR_SET: return AsyncState.init;
				case ACTION_DEF.SET_USER: return AsyncState.init;
				case ACTION_DEF.SET_FAVOR_ARRAY: return AsyncState.success;
				default: return state;
			}
		});
	store.addReducer(STATE_DEF.FAVOR_ARRAY,
		(state: Array<FavorStock>, action:AppAction):{} => {
			function sortByField(st1, st2){
				if(typeof st1[this.sortField] === "string"){
					return st1[this.sortField].localeCompare(st2[this.sortField]) * this.order;
				}
				return this.order * (st1[this.sortField] - st2[this.sortField]);
			}
			let newState: Array<FavorStock> = null;
		  	switch (action.type) {
		  		case ACTION_DEF.SET_FAVOR_ARRAY:
		  			let favArray = action.payload['favArray'];
		  			let favSet = action.payload['favSet'];
		  			for(let stock of favArray) {
		  				stock['addTime'] = favSet[stock['Symbol']]['addTime'];
		  			} 
		  			return favArray;
		 		case ACTION_DEF.SORT_FAVOR_ARRAY:
		 			newState = state.slice();
		 			newState.sort(sortByField.bind(action.payload));
		 			return newState;
		 		case ACTION_DEF.REVERSE_FAVOR_ARRAY:
		 			newState = state.reverse();
		 			return newState;
		 		case ACTION_DEF.REMOVE_FAVOR:
		 			newState = state.filter(stock=>{return stock.Symbol != action['stock']});
		 			return newState;
		  		default: return state;
		  	}
		});

	store.addReducer(STATE_DEF.FAVOR_ARRAY_FIELD,
		(state:any, action:AppAction):{} => {
			switch (action.type) {
				case ACTION_DEF.SORT_FAVOR_ARRAY: return action.payload['sortField'];
				default: return state;
			}
		});

	store.addReducer(STATE_DEF.FAVOR_ARRAY_ORDER,
		(state:any, action:AppAction):{} => {
			switch (action.type) {
				case ACTION_DEF.REVERSE_FAVOR_ARRAY: return -state;
				default: return state;
			}
		});

	store.addReducer(STATE_DEF.DETAIL_SYM, 
		(state:any, action:AppAction):{} => {
			if(action.type == ACTION_DEF.CLEAR) {
				return null;
			}
			return setResultReducer(ACTION_DEF.SET_DETAIL_SYM)(state, action); 
		});
	store.addReducer(STATE_DEF.CURRENT_TAB, setResultReducer(ACTION_DEF.SET_TAB));
	store.addReducer(STATE_DEF.CURRENT_IND, setResultReducer(ACTION_DEF.SET_IND));

	//shared with price chart
	function tableAsyncStateReducer(state:any, action:AppAction):{} {
	  	switch (action.type) {
	  		case ACTION_DEF.CLEAR:
		  	case ACTION_DEF.SET_DETAIL_SYM: return AsyncState.init;
	  		case ACTION_DEF.LOAD_TABLE: return action.payload;
	  		case ACTION_DEF.SET_TABLE: return AsyncState.success;
	  		default: return state;
	  	}
	}
	store.addReducer(STATE_DEF.TABLE_AS, tableAsyncStateReducer);
	//shared with price chart
	function tableStateReducer(state:any, action:AppAction):{} {
	  	switch (action.type) {
	  		case ACTION_DEF.SET_TABLE: return action.payload;
	  		default: return state;
	  	}
	}
	store.addReducer(STATE_DEF.TABLE, tableStateReducer);


	store.addReducer(STATE_DEF.CHART_AS,
		(state:any, action:IndAction):{} => {
			let newState = Object.assign({}, state);
		  	if(state[INDS._sharePrice]) {
		  		newState[INDS.PRICE] = tableAsyncStateReducer(state[INDS.PRICE], action);
		  	}
		  	switch (action.type) {
		  		case ACTION_DEF.CLEAR:
		  		case ACTION_DEF.SET_DETAIL_SYM: 
		  			for(let key of Object.keys(newState)){
		  				if(key != INDS._sharePrice) {
		  					newState[key] = AsyncState.init;
		  				}
		  			}return newState;
		  		case ACTION_DEF.SET_IND:
		  			if(newState[String(action.payload)] == null) {
		  				newState[String(action.payload)] = AsyncState.init;
		  			}
		  			return newState;
		  		case ACTION_DEF.SHARE_PRICE:
		  			newState[INDS._sharePrice] = action.payload;
		  			return newState;
		  		case ACTION_DEF.LOAD_CHART:
		  			newState[action.ind] = action.payload;
		  			return newState;
		  		case ACTION_DEF.SET_CHART:
		  			newState[action.ind] = AsyncState.success; 
		  			return newState;
		  		default: return newState;
		  	}
		});

	store.addReducer(STATE_DEF.CHART,
		(state:any, action:IndAction):{} => {
			let newState = Object.assign({}, state);
		  	if(state[INDS._sharePrice]) {
		  		newState[INDS.PRICE] = tableStateReducer(state[INDS.PRICE], action);
		  	}
		  	switch (action.type) {
		  		case ACTION_DEF.SHARE_PRICE:
		  			newState[INDS._sharePrice] = action.payload; 
		  			return newState;
		  		case ACTION_DEF.SET_CHART: 
		  			newState[action.ind] = action.payload;
		  			return newState;
		  		default: return newState;
		  	}
		});
	store.addReducer(STATE_DEF.CHART_OPTION, setResultReducer(ACTION_DEF.SET_CHART_OPTION));

	store.addReducer(STATE_DEF.HIST_AS, 
		(state:any, action:AppAction):{}=>{
			if(action.type == ACTION_DEF.SET_DETAIL_SYM
				|| action.type == ACTION_DEF.CLEAR) {
				return AsyncState.init;
			}
			return asyncReducer(ACTION_DEF.LOAD_HIST, ACTION_DEF.SET_HIST)(state, action);
		});
	store.addReducer(STATE_DEF.HIST, setResultReducer(ACTION_DEF.SET_HIST));

	store.addReducer(STATE_DEF.NEWS_AS,
		(state:any, action:AppAction):{}=>{ 
			if(action.type == ACTION_DEF.SET_DETAIL_SYM
				|| action.type == ACTION_DEF.CLEAR) {
				return AsyncState.init;
			}
			return asyncReducer(ACTION_DEF.LOAD_NEWS, ACTION_DEF.SET_NEWS)(state, action);
		});
	store.addReducer(STATE_DEF.NEWS, setResultReducer(ACTION_DEF.SET_NEWS));
}
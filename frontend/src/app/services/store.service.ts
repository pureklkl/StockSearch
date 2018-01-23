import { Injectable } from '@angular/core';

export type reducer = ((state:any, action:{})=>{});
export type listener = ((state:{})=>void);
@Injectable()
export class StoreService {
	private listeners: listener[] = [];
	private reducers:{} = {};
	private state:{} = {};
	
	/**
	 * initial store with intial state, not necessary
	 * @param {{}} initState the initial state
	 */
	init(initState: {}) {
		this.state = initState;
	}

	/**
	 * the final reducer that combined by other reducers
	 * any reducer should not have side effect on state
	 * otherwise the result will be unpredictable
	 * @param {{}} state previous state
	 * @param {{}} action the dispatch action
	 * @return {{}} the new state
	 */
	private fReducer(state:{}, action:{}): {} {
		const keys = Object.keys(this.reducers);
		return keys.reduce<{}>((result, key)=>{
			result[key] = this.reducers[key](state[key], action);
			return result;
		}, {})
	}

	/**
	 * add a listner to linsten to the action
	 * @param {listner} newListner the added listener
	 * @return {()=>void} a function will remove the listener
	 */
	addListener(newListner: listener): ()=>void {
		this.listeners.push(newListner);
		return ()=>{
			this.listeners.splice(this.listeners.indexOf(newListner), 1);
		}
	}

	/**
	 * add a reducer to the final reducer.
	 * each reducer should have a key indicating the sub-state it wants to manage.
	 * if two reducers have the same key, the later one won't be added.
	 * reducer should not have side effect on state.
	 * @param {string} key the sub-state
	 * @param {reducer} newReducer the new reducer
	 */
	addReducer(key: string, newReducer: reducer): void {
		if(this.reducers[key] == null) {
			this.reducers[key] = newReducer;
		}
	}

	/**
	 * replace an exsisting reducer
	 * @param {string} key the sub-state
	 * @param {reducer} newReducer the new reducer
	 */
	replaceReducer(key: string, newReducer: reducer): void {
		this.reducers[key] = newReducer;
	}

	/**
	 * dispatch the action
	 * @param {{}} action the action will be dispatched to reducers & listners
	 */
	dispatch(action:{}): void{
		console.log(action);
		Object.freeze(this.state);
		this.state = this.fReducer(this.state, action);
		console.log(this.state);
		this.listeners.forEach(listener=>listener(this.state))
	}

	getState(): {}{
		return this.state;
	}
}

export function makeAction(type: string, payload: {}): {}{
	return {type: type, payload: payload};
}
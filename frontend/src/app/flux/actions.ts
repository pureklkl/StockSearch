import { AsyncState, STATE_DEF, ACTION_DEF } from './stateDef';
import { StoreService, RequestApiService } from '../services/';


export function makeAction(type, payload:{}) {
	return {type: type, payload: payload};
}
export function makeIndAction(type, ind:string, payload:{}) {
	return {type: type, ind:ind, payload: payload};
}
export function makeFavorAction(type, stock:string, payload:{}) {
	return {type: type, stock:stock, payload:payload};
}

export function setFavorArray(favArray, favSet){
	return {type: ACTION_DEF.SET_FAVOR_ARRAY, payload : {favArray: favArray, favSet: favSet}};
}
export function sortFavor(field:string, order:number) {
	return {type: ACTION_DEF.SORT_FAVOR_ARRAY, payload:{sortField: field, order:order}};
}

export function loadFavor(store: StoreService) {
	let state = store.getState();
	if(state[STATE_DEF.FAVOR_SET_AS] == AsyncState.init) {
		return true;
	}
	if(state[STATE_DEF.FAVOR_SET_AS] != AsyncState.success
		&& state[STATE_DEF.FAVOR_SET_AS] != AsyncState.ongoing) {
		let localFavor = JSON.parse(localStorage.getItem('favSet'));
		localFavor = localFavor || {};
		store.dispatch(makeAction(ACTION_DEF.SET_LOCAL_FAVOR_SET, localFavor));
		return true;
	}
	return false;
}

export function flipFavor(sym: string, apis: RequestApiService, store: StoreService): void {
	let state = store.getState();
	let isLocal = state[STATE_DEF.FAVOR_SET_LOCAL];
	let favorSet = state[STATE_DEF.FAVOR_SET];
	let op = favorSet[sym] == null ? ACTION_DEF.ADD_FAVOR : ACTION_DEF.REMOVE_FAVOR;
	store.dispatch(makeFavorAction(op, sym, {'addTime': (new Date()).getTime()}));
	if(!isLocal) {
		let opstr = favorSet[sym] == null ? 'add' : 'delete';
		apis.editFavor(opstr, sym);
	} else {
		favorSet = store.getState()[STATE_DEF.FAVOR_SET];
		localStorage.setItem("favSet", JSON.stringify(favorSet));
	}
}
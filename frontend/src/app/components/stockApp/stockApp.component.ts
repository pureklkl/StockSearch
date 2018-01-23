import { Component } from '@angular/core';
import { slideAnime } from '../../utils/animations';
import { StoreService, RequestApiService} from '../../services';

import { configReducers } from '../../flux/reducers';
import { STATE_DEF, ACTION_DEF, INIT_STATE, AsyncState} from '../../flux/stateDef';
import { makeAction } from '../../flux/actions';



declare var $:any;
declare var Cookies:any;
@Component({
  selector: 'stock-app',
  templateUrl: './stockApp.component.html',
  styleUrls: ['./stockApp.component.css'],
  animations : [slideAnime('routerAnimation', ['favorite', 'stock-detail'])]
})
export class StockApp{

	trigger: (any, {})=>void;
	constructor(store: StoreService,
		        apis: RequestApiService) {

		this.trigger = (type, payload)=>store.dispatch(makeAction(type, payload));

		configReducers(store);
		store.init(INIT_STATE);
		this.trigger(ACTION_DEF.LOGIN, AsyncState.ongoing);
		apis.getUserInfo().subscribe(
			(result)=>{
				if(result) {
					this.trigger(ACTION_DEF.SET_USER, result);
				} else {
					this.trigger(ACTION_DEF.LOGIN, AsyncState.failed);
				}
			},
			(err)=>this.trigger(ACTION_DEF.LOGIN, AsyncState.invalid)
		);
	}

	getRouteAnimation(outlet) {
		return outlet.activatedRouteData.animation
	}
}
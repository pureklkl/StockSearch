import { AfterViewInit, Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import {Router} from "@angular/router";
import {Observable, Subscription} from 'rxjs/Rx';

import { StoreService, RequestApiService } from '../../services/';
import { STATE_DEF, ACTION_DEF, AsyncState } from '../../flux/stateDef';
import { makeAction, loadFavor, flipFavor, sortFavor, setFavorArray } from '../../flux/actions';

declare var $:any;

const INIT = 'init';
const SUCCESS = 'success';
const PROGRESS = 'progress';
const ERROR = 'error';

@Component({
  moduleId: module.id.toString(),
  selector: 'favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css', '../../utils/spin.css'],
})
export class Favorite implements OnInit, AfterViewInit, OnDestroy{

	interval : Subscription;
	favArray : Array<any>;
	unsubscribe: ()=>void;
	trigger: (any, {})=>void;
	favorLoading: string = INIT;
	constructor(private store: StoreService,
			 	private apis: RequestApiService,
			    private router : Router,
			    private app: ChangeDetectorRef){
		this.trigger = (type, payload)=>this.store.dispatch(makeAction(type, payload));
		this.unsubscribe = this.store.addListener((state)=>{
			if(loadFavor(this.store)){
				return;
			}
			switch (state[STATE_DEF.FAVOR_ARRAY_AS]) {
				case AsyncState.init:
					if(state[STATE_DEF.FAVOR_SET_AS] == AsyncState.success) {
						this.downloadSt();
						return;
					}
					break;
				case AsyncState.ongoing:
					this.favorLoading = PROGRESS;
					app.detectChanges();
					break;
				case AsyncState.success:
					this.favorLoading = SUCCESS;
					this.favArray = state[STATE_DEF.FAVOR_ARRAY];
					app.detectChanges();
					break;
				case AsyncState.failed:
				case AsyncState.invalid:
					this.favorLoading = ERROR;
					app.detectChanges();
					break;
				default:
					break;
			}
			if(state[STATE_DEF.AUTO] && (this.interval == null || this.interval.closed)) {
				this.interval = Observable.interval(5000).subscribe(this.downloadSt.bind(this));
			} else if(!state[STATE_DEF.AUTO] && (this.interval != null && !this.interval.closed)) {
				this.interval.unsubscribe();
			}

			$('.goDetail').prop('disabled', state[STATE_DEF.DETAIL_SYM]==null);
			$('#auto-refresh').prop('checked', state[STATE_DEF.AUTO]);

		});
	}
	
	ngOnInit(){
		this.store.dispatch({type: 'favor init'});
	}
	
	ngAfterViewInit() {
	 	(<any>$('#auto-refresh')).bootstrapToggle();
	 	//use native selector on mobile
	 	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    		$('.selectpicker').selectpicker('mobile');
		} else {
			$('.selectpicker').selectpicker();
		}
	 	//programmatically update ui after disable
	 	//$('#dropdownMenu2').selectpicker('refresh');
	 	//event...
	 	$('#dropdownMenu1').on('changed.bs.select', this.setSortField.bind(this));
	 	$('#dropdownMenu2').on('changed.bs.select', this.setSortOrder.bind(this));
	 	$('#auto-refresh').change(this.autoRefresh.bind(this));
	}
	
	ngOnDestroy(){
		if(this.interval != null){
			this.interval.unsubscribe();
		}
		this.unsubscribe();
	}

	downloadSt(){
		let favors = this.store.getState()[STATE_DEF.FAVOR_SET];
		this.trigger(ACTION_DEF.LOAD_FAVOR_ARRAY, AsyncState.ongoing);
		this.apis.searchStockList(Object.keys(favors)).subscribe(
				(result)=>{
					if(result != null) {
						console.log(result);
						this.store.dispatch(setFavorArray(result, favors));
					} else {
						this.trigger(ACTION_DEF.LOAD_FAVOR_ARRAY, AsyncState.failed);
					}
				},
				(err)=> this.trigger(ACTION_DEF.LOAD_FAVOR_ARRAY, AsyncState.failed)
			);
	}

	autoRefresh(e){
		this.trigger(ACTION_DEF.SET_AUTO, {});
	}

	refresh(){
		this.downloadSt();
	}
	
	setSortField(e){
		let sortField = $(e.target).val();
		this.store.dispatch(sortFavor(sortField, this.store.getState()[STATE_DEF.FAVOR_ARRAY_ORDER]));
	}
	setSortOrder(e){
		let order = +$(e.target).val();
		this.trigger(ACTION_DEF.REVERSE_FAVOR_ARRAY, {});
	}

	deleteFavor(e){
		let symbol = $(e.currentTarget).attr('stsymbol');
		flipFavor(symbol, this.apis, this.store);
	}
	
	goDetail(){
		let symbol = this.store.getState()[STATE_DEF.DETAIL_SYM];
		if(symbol != null){
			this.router.navigateByUrl('stock-detail/' + symbol);
		}
	}

	naviFavor(e) {
		let symbol = $(e.target).text();
		this.router.navigateByUrl('stock-detail/'+symbol);
	}
}

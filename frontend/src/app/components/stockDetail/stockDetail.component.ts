import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Rx';


import {StoreService, RequestApiService } from '../../services/';
import { STATE_DEF, ACTION_DEF, INDS, AsyncState } from '../../flux/stateDef';
import { makeAction, makeIndAction, loadFavor, flipFavor } from '../../flux/actions';

declare var $:any;
declare var FB:any;

const HALF_YEAR = 130;
const TABLE_DATA = 2;
const HIST_NUM = 1000;

const SUCCESS = 'success';
const PROGRESS = 'progress';
const ERROR = 'error';
@Component({
  moduleId: module.id.toString(),
  selector: 'stock-detail',
  templateUrl: './stockDetail.component.html',
  styleUrls: ['./stockDetail.component.css'],
})
export class StockDetail implements OnInit, AfterViewInit, OnDestroy{
	static initState(){
		return {tab: "table-chart", ind: 'Price'};
	}
	static stateStore = StockDetail.initState();

	static dataNum = 130;
	static historyNum = 1000;

	showTableState : string = '';
	showChartState : string = '';
	showStockChartState: string = '';
	showStockNewsState: string = '';

	tableData : any;
	chartData : any;
	stockData : any;
	newsData : any;

	unsubscribe:()=>void;
	trigger: (any, {})=>void;
	triggerInd: (any, string, {})=>void;
	constructor(private store: StoreService,
				private route: ActivatedRoute,
				private apis: RequestApiService){

		this.trigger = (type, payload)=>store.dispatch(makeAction(type, payload));
		this.triggerInd = (type, ind, payload)=>store.dispatch(makeIndAction(type, ind, payload));

		let state = this.store.getState();


		this.unsubscribe = this.store.addListener((state): void=>{
			let sym = state[STATE_DEF.DETAIL_SYM];
			if(sym == null) {
				return;
			}
			if(loadFavor(this.store)){
				return;
			}
			let favSet = state[STATE_DEF.FAVOR_SET];
			this.isFavor = favSet[sym] != null;
			let tab = state[STATE_DEF.CURRENT_TAB];
			if(tab == 'table-chart') {
				//init table
				let dataNum = TABLE_DATA;
				let tableState = state[STATE_DEF.TABLE_AS];
				if(tableState == AsyncState.init) {
					//load half year data if shared with indicator chart
					if(state[STATE_DEF.CHART[INDS._sharePrice]]) {
						dataNum = HALF_YEAR;
					}
					this.trigger(ACTION_DEF.LOAD_TABLE, AsyncState.ongoing);
					apis.searchStock(sym, 'Price', HALF_YEAR).subscribe(
						result=>{
							if(result['Error Message'] == null) {
								this.trigger(ACTION_DEF.SET_TABLE, result);
							} else {
								this.trigger(ACTION_DEF.LOAD_TABLE, AsyncState.invalid);
							}
						},
						err=>this.trigger(ACTION_DEF.LOAD_TABLE, AsyncState.failed));
					return;
				}
				//init chart
				let curInd = state[STATE_DEF.CURRENT_IND];
				let chartState = state[STATE_DEF.CHART_AS][curInd];
				if(chartState == AsyncState.init) {
					$('#stockDetail-shareFB').prop('disabled', true);
					this.triggerInd(ACTION_DEF.LOAD_CHART, curInd, AsyncState.ongoing);
					apis.searchStock(sym, curInd, HALF_YEAR).subscribe(
						result=>{
							if(result['Error Message'] == null) {
								this.triggerInd(ACTION_DEF.SET_CHART, curInd, result);
							} else {
								this.triggerInd(ACTION_DEF.LOAD_CHART, curInd, AsyncState.invalid);
							}
						},
						err=>this.triggerInd(ACTION_DEF.LOAD_CHART, curInd, AsyncState.failed));
					return;
				}
				this.buttonAvail();
				this.stateToUI('showTableState', tableState, 'tableData', state[STATE_DEF.TABLE]);
				this.stateToUI('showChartState', chartState, 'chartData', state[STATE_DEF.CHART][curInd]);
			}
			if(tab == 'stock-chart') {
				let histState = state[STATE_DEF.HIST_AS];
				if(histState == AsyncState.init) {
					this.trigger(ACTION_DEF.LOAD_HIST, AsyncState.ongoing);
					apis.searchStock(sym, INDS.PRICE, HIST_NUM).subscribe(
						result=>{
							if(result['Error Message'] == null) {
								this.trigger(ACTION_DEF.SET_HIST, result);
							} else {
								this.trigger(ACTION_DEF.LOAD_HIST, AsyncState.invalid);
							}
						},
						err=>this.trigger(ACTION_DEF.LOAD_HIST, AsyncState.failed));
					return;
				}
				this.stateToUI('showStockChartState', histState, 'stockData', state[STATE_DEF.HIST]);
			}
			if(tab == 'stock-news') {
				let newsState = state[STATE_DEF.NEWS_AS];
				if(newsState == AsyncState.init) {
					this.trigger(ACTION_DEF.LOAD_NEWS, AsyncState.ongoing);
					apis.searchNews(sym).subscribe(
							result=>this.trigger(ACTION_DEF.SET_NEWS, result),
							err=>this.trigger(ACTION_DEF.LOAD_NEWS, AsyncState.failed));
					return;
				}
				this.stateToUI('showStockNewsState', newsState, 'newsData', state[STATE_DEF.NEWS]);
			}
			this.showInfoTab();
		})
	}
	
	stateToUI(ui: string, state: string, data:string, stateData) {
		switch (state) {
			case AsyncState.success:
				this[ui] = SUCCESS;
				this[data] = stateData;
				break;
			case AsyncState.ongoing:
				this[ui] = PROGRESS;
				break;
			default:
				this[ui] = ERROR;
				break;
		}
	}
	paramSub: Subscription
	ngOnInit() {
		this.paramSub = this.route.params.subscribe(params=>{
			let state = this.store.getState();
			if(state[STATE_DEF.DETAIL_SYM] != params['sym']) {
				if(state[STATE_DEF.CURRENT_IND] == INDS.PRICE) {
					this.trigger(ACTION_DEF.SHARE_PRICE, true);
				} else {
					this.trigger(ACTION_DEF.SHARE_PRICE, false);
				}
				this.trigger(ACTION_DEF.SET_DETAIL_SYM, params['sym']);
			} else {
				this.trigger('load cached detail', {});
			}
		});
	}

	ngAfterViewInit(){

		$('#stockDetail-favorite').prop('disabled', true);
		$('#stockDetail-shareFB').prop('disabled', true);
		$('a.chart-ind').on('click', this.onIndTabChange.bind(this));
		$('a.info-ind').on('click', this.onInfoTabChange.bind(this));
		this.showInfoTab();
		this.buttonAvail();
	}

	ngOnDestroy(){
		this.paramSub.unsubscribe();
		this.unsubscribe();
	}

	showInfoTab(){
		let state = this.store.getState();
		let tab = state[STATE_DEF.CURRENT_TAB];
		let ind = state[STATE_DEF.CURRENT_IND];
		switch (tab) {
			case "table-chart":
				$('#stockDetail-navInfo li a[href="#current-stock"]').tab('show');
				$('#stockDetail-navInd li a[href="#'+ind+'"]').tab('show');
				break;
			case "stock-chart":
				$('#stockDetail-navInfo li a[href="#historical-charts"]').tab('show');
				break;
			case "stock-news":
				$('#stockDetail-navInfo li a[href="#news-feeds"]').tab('show');
				break;
			default:
				break;
		}
	}

	buttonAvail(){
		let state = this.store.getState()
		let curInd = state[STATE_DEF.CURRENT_IND];
		if(state[STATE_DEF.TABLE_AS] == AsyncState.success) {
			$('#stockDetail-favorite').prop('disabled', false);
		}
		if(state[STATE_DEF.CHART_AS][curInd] == AsyncState.success) {
			$('#stockDetail-shareFB').prop('disabled', false);
		}
	}

	onIndTabChange(e): void {
		$('#stockDetail-shareFB').prop('disabled', true);
		var ind = $(e.currentTarget).text(); 
		this.trigger( ACTION_DEF.SET_IND, ind);
	}

	onInfoTabChange(e) : void{
		$('#stockDetail-navInd li a[href="#'+StockDetail.stateStore.ind+'"]').tab('show');
		let tab = $(e.currentTarget).attr('id');
		this.trigger(ACTION_DEF.SET_TAB, tab);
	}

	isFavor : boolean;
	favSet : {};
	onFlipFavor(){
		let state = this.store.getState();
		let sym = state[STATE_DEF.DETAIL_SYM];
		flipFavor(sym, this.apis, this.store);
	}

	shareOnFB(event){
		event.preventDefault();
		let chartData = this.store.getState()[STATE_DEF.CHART_OPTION];
		this.apis.getChartImg(chartData).subscribe(data=>{
			console.log('http://export.highcharts.com/'+data._body);
			FB.ui({
				method: 'feed',
				caption: 'Stock Search',
				link : 'http://export.highcharts.com/'+data._body
			}, function(response){
				console.log(response);
			});
		})

	}
}

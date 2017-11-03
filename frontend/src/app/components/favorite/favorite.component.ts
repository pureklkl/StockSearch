import { AfterViewInit, Component, OnInit, ApplicationRef } from '@angular/core';
import { trigger,state,style,transition,animate,keyframes } from '@angular/animations';
import { SearchFavorService, SymbolSearchService } from '../../services/';
import {Router} from "@angular/router";
import {Observable, Subscription} from 'rxjs/Rx';

declare var $:any;

@Component({
  moduleId: module.id.toString(),
  selector: 'favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.css'],
})
export class Favorite implements OnInit, AfterViewInit{
	constructor(private dataSource : SearchFavorService,
			    private symbolDetailSource : SymbolSearchService,
			    private router : Router,
			    private appRef : ApplicationRef){
		
	}
	favSet:{};
	favArray : Array<any>;
	stCmp : Function;
	favArrayShow : Array<any>;
	onDownLoad : number;
	ngOnInit(){
		this.favSet = JSON.parse(localStorage.getItem('favSet'));
		this.onDownLoad = 0;
		this.order = 1;
		this.sortField = 'addTime';
		this.symbolDetailSource.setAsscoiateFavor(this);
		if(!this.symbolDetailSource.haveDetail){
			$('.goDetail').prop('disabled', true);
		}
		this.favArray = [];
		this.downloadSt();
	}
	downloadSt(){
		let symbols = [];
		for(let key in this.favSet){
			symbols.push(key);
		}
		this.dataSource.searchFavorit(symbols).subscribe((value)=>{
			this.showFavor(value);
		});
	}

	showFavor(value) {
		if(value==null||value.length==null){
			return;
		}
		let favArray = [];
		for(let stock of value){
			if(stock["Meta Data"] != null){
				let symbol = stock["Meta Data"]["2. Symbol"];
				let date = Object.keys(stock["Time Series (Daily)"])[0];
				let info = stock["Time Series (Daily)"][date];
				if(this.favSet[symbol] != null){
					let stInfo = {};
					stInfo['addTime'] = this.favSet[symbol]['addTime'];
					stInfo['Symbol'] = symbol;
					stInfo['Price'] = +info["5. adjusted close"];
					stInfo['Change'] = stInfo['Price'] - (+info["1. open"]);
					stInfo['Change Percent'] = (stInfo['Change']) / (+info["1. open"]);
					stInfo['Volume'] = +info["6. volume"];
					stInfo['VolumeStr'] = parseInt(info["6. volume"]).toLocaleString("en", {useGrouping:true});
					stInfo['addTime'] = this.favSet[symbol]['addTime'];
					favArray.push(stInfo);
				}
			} else {
				this.downloadSt();
				return;
			}
		}
		favArray.sort(this.sortByField.bind(this));
		this.favArray = favArray;
		this.appRef.tick();
	}

	disableNavi(){
		$('.goDetail').prop('disabled', true);
	}

	interval : Subscription;
	autoRefresh(e){
		console.log(e);
		if(e.target.checked){
			this.interval = Observable.interval(5000).subscribe(this.downloadSt.bind(this));
		} else {
			if(this.interval != null){
				this.interval.unsubscribe();
			}
		}
	}
	refresh(){
		this.downloadSt();
	}
	setSortField(e){
		console.log(e);
		this.sortField = $(e.target).val();
		if(this.sortField == 'Default'){
			this.sortField = 'addTime';
			this.order = 1;
			$('#dropdownMenu2').selectpicker('val', 'Ascending');
			$('#dropdownMenu2').prop('disabled', true);
			$('#dropdownMenu2').selectpicker('refresh');
		} else {
			$('#dropdownMenu2').prop('disabled', false);
			$('#dropdownMenu2').selectpicker('refresh');
		}
		this.favArray.sort(this.sortByField.bind(this));
	}
	setSortOrder(e){
		if($(e.target).val()=="Ascending"){
			this.order = 1;
		} else {
			this.order = -1;
		}
		this.favArray.sort(this.sortByField.bind(this));
	}
	naviFavor(e) {
		let symbol = $(e.target).text();
		this.symbolDetailSource.symbol = symbol;
		this.symbolDetailSource.searching = true;
		this.router.navigateByUrl('stock-detail');
	}
	deleteFavor(e){
		let symbol = $(e.currentTarget).attr('stsymbol');
		console.log(symbol);
		delete this.favSet[symbol];
		this.favArray = this.favArray.filter(stock=>{
			return this.favSet[stock.Symbol] != null;
		});
		localStorage.setItem("favSet", JSON.stringify(this.favSet));
	}

	ngAfterViewInit() {
	 	(<any>$('#auto-refresh')).bootstrapToggle();
	 	console.log('set');
	 	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
    		$('.selectpicker').selectpicker('mobile');
		} else {
			$('.selectpicker').selectpicker();
		}
	 	$('#dropdownMenu1').on('changed.bs.select', this.setSortField.bind(this));
	 	$('#dropdownMenu2').on('changed.bs.select', this.setSortOrder.bind(this));
	 	$('#auto-refresh').change((e)=>{
	 		this.autoRefresh(e);
	 	});
	 	$('#dropdownMenu2').prop('disabled', true);
	 	$('#dropdownMenu2').selectpicker('refresh');
	}

	sortByField(st1, st2){
		if(typeof st1[this.sortField] === "string"){
			return st1[this.sortField].localeCompare(st2[this.sortField]) * this.order;
		}
		return this.order * (st1[this.sortField] - st2[this.sortField]);
	}

	order : number;
	sortField : string;

}

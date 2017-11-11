import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SymbolSearchService, 
		 SymbolNewsService,
		 ChartExportService } from '../../services/'

declare var $:any;
declare var FB:any;

@Component({
  moduleId: module.id.toString(),
  selector: 'stock-detail',
  templateUrl: './stockDetail.component.html',
  styleUrls: ['./stockDetail.component.css'],
})
export class StockDetail implements OnInit, AfterViewInit{
	static initState(){
		return {tab: "table-chart", ind: 'Price'};
	}
	static stateStore = StockDetail.initState();

	static dataNum = 130;
	static historyNum = 1000;

	showTableState : string;
	showChartState : string;
	showStockChartState: string;
	showStockNewsState: string;

	tableData : any;
	chartData : any;
	stockData : any;
	newsData : any;

	
	constructor(private dataSource : SymbolSearchService, 
				private newsSource : SymbolNewsService,
				private chartExport : ChartExportService){
		this.showTableState = '';
		this.showChartState = '';
		this.showStockChartState = '';
		this.showStockNewsState = '';
	}

	ngOnInit() {
		this.favSet = JSON.parse(localStorage.getItem("favSet")) || {};
		this.isFavor = this.favSet[this.dataSource.symbol] != null;
		this.dataSource.setAssociateDetail(this);
		$('#stockDetail-favorite').prop('disabled', true);
		$('#stockDetail-shareFB').prop('disabled', true);
		this.getData();
	}

	ngAfterViewInit(){
		$('a.chart-ind').on('click', this.onIndTabChange.bind(this));
		$('a.info-ind').on('click', this.onInfoTabChange.bind(this));
		this.showInfoTab();
	}

	showInfoTab(){
		switch (StockDetail.stateStore.tab) {
			case "table-chart":
				$('#stockDetail-navInfo li a[href="#current-stock"]').tab('show');
				$('#stockDetail-navInd li a[href="#'+StockDetail.stateStore.ind+'"]').tab('show');
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

	onIndTabChange(e): void {
		$('#stockDetail-shareFB').prop('disabled', true);
		var func = $(e.currentTarget).text(); // activated tab
		StockDetail.stateStore.ind = func;
		this.searchInd();
	}

	onInfoTabChange(e) : void{
		$('#stockDetail-navInd li a[href="#'+StockDetail.stateStore.ind+'"]').tab('show');
		let type = $(e.currentTarget).attr('id');
		StockDetail.stateStore.tab = type;
		this.getData();
	}

	isFavor : boolean;
	favSet : {};
	onFlipFavor(){
		if(this.isFavor){
			delete this.favSet[this.dataSource.symbol];
		} else {
			this.favSet[this.dataSource.symbol] = 
			{
				symbol : this.dataSource.symbol,
				addTime : (new Date()).getTime()
			}
		}
		localStorage.setItem("favSet", JSON.stringify(this.favSet));
		this.isFavor = !this.isFavor;
	}

	shareOnFB(event){
		event.preventDefault();
		this.chartExport.chartExport().subscribe(data=>{
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

	getData(): void{
		switch (StockDetail.stateStore.tab) {
			case "table-chart":
				if(StockDetail.stateStore.ind == 'Price'){
					this.searchDetail();
				} else {
					this.searchTable();
					this.searchInd();
				}
				break;
			case "stock-chart":
				this.searchHistory();
				break;
			case "stock-news":
				this.searchNews();
				break;
		}
	}

	searchDetail() : void{
		this.showTableState = 'progress';
		this.showChartState = 'progress';
		this.dataSource.searchSymbol(
			this.dataSource.symbol, 
			'TIME_SERIES_DAILY_ADJUSTED', 
			StockDetail.dataNum,
			this.onDetailSuccess.bind(this),
			this.onDetailProgress.bind(this, true),
			this.onDetailError.bind(this, true));
	}

	searchTable(): void{
		this.showTableState = 'progress';
		this.dataSource.searchSymbol(
			this.dataSource.symbol, 
			'TIME_SERIES_DAILY_ADJUSTED', 
			StockDetail.dataNum,
			this.onTableSuccess.bind(this),
			this.onTableProgress.bind(this, true),
			this.onTableError.bind(this, true));
	}

	searchInd(): void{
		let func = StockDetail.stateStore.ind
		if(func == "Price"){
		  	func = 'TIME_SERIES_DAILY_ADJUSTED';
		}
		console.log("searchInd " + func);
		this.showChartState = 'progress';
		this.dataSource.searchSymbol(
			this.dataSource.symbol, 
			func, 
			StockDetail.dataNum,
			this.onChartSuccess.bind(this),
			this.onChartProgress.bind(this),
			this.onChartError.bind(this));
	}

	searchHistory(): void{
		this.showStockChartState = 'progress';
		this.dataSource.searchSymbol(
			this.dataSource.symbol, 
			'TIME_SERIES_DAILY_ADJUSTED', 
			StockDetail.historyNum,
			this.onStockSuccess.bind(this),
			this.onStockProgress.bind(this),
			this.onStockError.bind(this));
	}

	searchNews(): void{
		this.showStockNewsState = 'progress';
		this.newsSource.searchSymbol(
			this.dataSource.symbol,
			this.onNewsSuccess.bind(this),
			this.onNewsProgress.bind(this),
			this.onNewsError.bind(this));
	}

	onDetailSuccess(data){
		if(data != null && data["Error Message"] == null){
			$('#stockDetail-favorite').prop('disabled', false);
			$('#stockDetail-shareFB').prop('disabled', false);
			this.showTableState = "success";
			this.tableData = data;
			this.showChartState = 'success';
			data.chartId = "stock-ind-chart";
			this.chartData = data;
		} else if(data["Error Message"] != null){
			this.showTableState = 'error';
			this.onChartError();
		}
	}
	onDetailProgress(data){
		this.showTableState = 'progress';
		(<any>$('.progress-bar')).attr("aria-valuenow", String(data)).css("width", String(data)+'%')
		this.showChartState = 'progress';
		(<any>$('#chart-progress')).attr("aria-valuenow", String(data)).css("width", String(data)+'%');
	}
	onDetailError(data){
		this.showTableState = 'error';
		this.showChartState = 'error';
	}

	onTableSuccess(data){
		if(data != null && data["Error Message"] == null){
			$('#stockDetail-favorite').prop('disabled', false);
			$('#stockDetail-shareFB').prop('disabled', false);
			this.showTableState = "success";
			this.tableData = data;
		} else if(data["Error Message"] != null){
			this.showTableState = 'error';
		}
	}

	onTableProgress(data) {
		this.showTableState = 'progress';
		(<any>$('.progress-bar')).attr("aria-valuenow", String(data)).css("width", String(data)+'%')
	}

	onTableError(){
		this.showTableState = 'error';
	}

	onChartSuccess(data){
		if(data != null && data["Error Message"] == null){
			$('#stockDetail-favorite').prop('disabled', false);
			$('#stockDetail-shareFB').prop('disabled', false);
			this.showChartState = 'success';
			data.chartId = "stock-ind-chart";
			this.chartData = data;
		} else if(data["Error Message"] != null){
			this.onChartError();
		}
	}

	onChartProgress(isProgressTable=false, data) {
		this.showChartState = 'progress';
		(<any>$('#chart-progress')).attr("aria-valuenow", String(data)).css("width", String(data)+'%');
	}

	onChartError(isErrorTable=false){
		this.showChartState = 'error';
	}

	onStockSuccess(data){
		if(data != null && data["Error Message"] == null){
			data.chartId = "stock-price-chart";
			this.showStockChartState = 'success';
			this.stockData = data;
		} else {
			this.onStockError();
		}
	}
	onStockProgress(data){
		this.showStockChartState = 'progress';
		(<any>$('#stock-progress')).attr("aria-valuenow", String(data)).css("width", String(data)+'%');
	}
	onStockError(){
		this.showStockChartState = 'error';
	}

	onNewsSuccess(data){
		if(!(data instanceof Array) || data.length==null){
			this.showStockNewsState = 'error';
			return;
		}
		this.showStockNewsState = 'success';
		this.newsData = data;
	}
	onNewsProgress(data){
		this.showStockNewsState = 'progress';
		(<any>$('#news-progress')).attr("aria-valuenow", String(data)).css("width", String(data)+'%');
	}
	onNewsError(data){
		this.showStockNewsState = 'error';
	}
}

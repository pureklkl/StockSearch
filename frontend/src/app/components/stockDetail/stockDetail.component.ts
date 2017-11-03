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
	showTableState : string;
	showChartState : string;
	showStockChartState: string;
	showStockNewsState: string;

	dataNum : number;
	constructor(private dataSource : SymbolSearchService, 
				private newsSource : SymbolNewsService,
				private chartExport : ChartExportService){
		this.showTableState = '';
		this.showChartState = '';
		this.showStockChartState = '';
		this.showStockNewsState = '';
		this.dataNum = 130;
	}
	ngAfterViewInit(){
		$('a.chart-ind').on('click', this.indTabChange.bind(this));
		$('a.info-ind').on('click', this.infoTabChange.bind(this));
	}

	indTabChange(e) : void{
		$('#stockDetail-shareFB').prop('disabled', true);
		var func = $(e.currentTarget).text(); // activated tab
		if(func == "Price"){
		  	func = 'TIME_SERIES_DAILY_ADJUSTED';
		}
		this.showChartState = 'progress';
		
		this.dataSource.searchSymbol(this.dataSource.symbol, func, this.dataNum,
			this.onChartSuccess.bind(this),
			this.onChartProgress.bind(this),
			this.onChartError.bind(this));
	}

	infoTabChange(e) : void{
		let type = $(e.currentTarget).attr('id');
		switch (type) {
			case "table-chart":
				// load at initial, do nothing
				break;
			case "stock-chart":
				this.showStockChartState = 'progress';
				this.dataSource.searchSymbol(this.dataSource.symbol, 'TIME_SERIES_DAILY_ADJUSTED',1000,
					this.onStockSuccess.bind(this),
					this.onStockProgress.bind(this),
					this.onStockError.bind(this));
				break;
			case "stock-news":
				this.showStockNewsState = 'progress';
				this.newsSource.searchSymbol(this.dataSource.symbol,
					this.onNewsSuccess.bind(this),
					this.onNewsProgress.bind(this),
					this.onNewsError.bind(this));
				break;
		}
	}

	tableData : any;
	chartData : any;
	stockData : any;
	newsData : any;
	progress : number;

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
			if(data.ind == "Time Series (Daily)"){
				this.onTableSuccess(data);
			}
		} else if(data["Error Message"] != null){
			this.onChartError();
			this.onTableError();
		}
	}

	onChartProgress(isProgressTable=false, data) {
		this.showChartState = 'progress';
		(<any>$('#chart-progress')).attr("aria-valuenow", String(data)).css("width", String(data)+'%');
		if(isProgressTable===true){
			this.onTableProgress(data);
		}
	}

	onChartError(isErrorTable=false){
		this.showChartState = 'error';
		if(isErrorTable===true){
			this.onTableError();
		}
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
			FB.ui({
				method: 'feed',
				//link: 'http://www-scf.usc.edu/~yuanfanp/',
				caption: 'An example caption',
				link : this.chartExport.api+data._body
			}, function(response){
				console.log(response);
			});
		})

	}

	searchNew() {
		$('#stockDetail-favorite').prop('disabled', true);
		$('#stockDetail-shareFB').prop('disabled', true);
		this.showTableState = 'progress';
		this.showChartState = 'progress';
		this.isFavor = this.favSet[this.dataSource.symbol]==null?false:true;
		this.dataSource.searchSymbol(this.dataSource.symbol, 'TIME_SERIES_DAILY_ADJUSTED', this.dataNum,
			this.onChartSuccess.bind(this),
			this.onChartProgress.bind(this, true),
			this.onChartError.bind(this, true));
		$('#stockDetail-navInfo a[href="#current-stock"]').tab('show');
		$('#stockDetail-navInd a[href="#Price"]').tab('show');
	}

	ngOnInit() {
		this.favSet = JSON.parse(localStorage.getItem("favSet")) || {};
		this.dataSource.setAssociateDetail(this);
		this.searchNew();
	}

}

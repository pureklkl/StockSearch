import { Directive, 
		 Input,
		 ElementRef,
		 OnDestroy } from '@angular/core';
import * as moment from 'moment';

import { StoreService } from '../../services'
import { ACTION_DEF } from '../../flux/stateDef'
import { makeAction } from '../../flux/actions'

import { processSeries, getTickDate, shortInd, ParsedKey} from './stockChartDataParser'

import { DefaultChart, DefaultStockChart } from './stockChartOptionTemplate'


declare var Highcharts : any;

function labelFormat(){
	return moment(this.value).format("M/D");
}

@Directive({
  selector: '[stock-chart]'
})
export class StockChart implements  OnDestroy {

	chartId:string;
	chart : any;
    options: {};
    timestamp : string;
    constructor( private store: StoreService,
    			private el: ElementRef) {
    	this.chart = null;
    	this.chartId = el.nativeElement.id;
    }
    ngOnDestroy() {
    	if(this.chart != null){
    		this.chart.destroy();
    	}
    }
    
	@Input()
	set stockData(data){
		let symbol = data["Meta Data"]["Symbol"];
		let series = data[data.ind];
		var priceKey = "close";
		var pdata = processSeries(data.dates, series, [{name: priceKey, parse: parseFloat}]);

		let options = new DefaultStockChart();
		options.title.text = symbol + ' Stock Price';
		options.series[0].name = symbol;
		options.series[0].data = pdata[priceKey].vals;

		if(this.chart!==null){
			this.chart.destroy();
		}
		this.chart = Highcharts.stockChart(this.chartId, options);
	}
    
    @Input()  
	set data(data : any) {
		let ind = data.ind;
		if(data.dates.length > 130) {
			data.dates = data.dates.slice(0, 130);
		}
		if(ind == "TIME_SERIES_DAILY") {
			this.showPriceChart(data, ind);
		} else {
			let sInd = shortInd(ind);
			this.showIndChart(data, ind, sInd, ParsedKey[sInd]);
		}
	}
	showPriceChart(data, ind) : void{
		var symbol = data["Meta Data"]["Symbol"];
		var series = data[data.ind];
		var dates = data.dates;
		var priceKey = "close", volumeKey = "volume";
		var pdata = processSeries(dates, series, [
				{name: priceKey, parse: parseFloat},
				{name: volumeKey, parse: parseInt}
			]);

		var curDate = new Date(dates[0]);
		var tickpos = getTickDate(dates);

		var options = new DefaultChart()

		options.title.text = symbol + ' Price and Volume';
		options.xAxis.tickPositions = tickpos;
		options.xAxis.tickLength = 2;
		options.yAxis[0].title.text = 'Stock Price';
		options.yAxis[0].min = pdata[priceKey].min;
		options.yAxis[0].max = pdata[priceKey].max;
		options.yAxis.push({
				title: {
					text: "Volume"
				},
				min: 0,
				max: pdata[volumeKey].max * 2,
				opposite:true
			});
		options.series =  [{
				type: "area",
				name: symbol,
				data: pdata[priceKey].vals,
				color: "#4286f4",

			},
			{
				type: "column",
				name: symbol + " volume",
				yAxis : 1,
				data: pdata[volumeKey].vals,
				color: "#CE0D41"
			}];
		if(this.chart!==null){
			this.chart.destroy();
		}
		this.store.dispatch(makeAction(ACTION_DEF.SET_CHART_OPTION, options));
		this.chart = Highcharts.chart(this.chartId, options);
	}

	showIndChart(data, ind, acronym, keys){
		var symbol = data["Meta Data"]["Symbol"];
		var indName = ind;
		var series = data[ind];
		var dates = data.dates;
		var pdata = processSeries(dates, series, keys);
		var tickpos = getTickDate(dates);
		var options = new DefaultChart();
		options.title.text = indName;
		options.xAxis.tickPositions = tickpos;
		options.yAxis[0].title.text = acronym;
		options.yAxis[0].min = pdata['min'];
		options.yAxis[0].max = pdata['max'];
		options.series = [];
		keys.forEach((key) => {
			options.series.push({
				type: "line",
				name: symbol+" "+key.name,
				data: pdata[key.name].vals,
			});
		});
		if(this.chart!==null){
			this.chart.destroy();
		}
		this.store.dispatch(makeAction(ACTION_DEF.SET_CHART_OPTION, options));
		this.chart = Highcharts.chart(this.chartId, options);
	}
}
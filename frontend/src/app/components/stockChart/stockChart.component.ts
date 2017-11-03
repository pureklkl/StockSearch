import { Component, 
		 Input,
		 ElementRef,
		 ViewChild,
		 OnDestroy } from '@angular/core';
import * as moment from 'moment';

import { ChartExportService } from '../../services'


declare var Highcharts : any;

function labelFormat(){
	return moment(this.value).format("M/D");
}

@Component({
  moduleId: module.id.toString(),
  selector: 'stock-chart',
  templateUrl: './stockChart.component.html',
  styleUrls: ['./stockChart.component.css'],
})
export class StockChart implements  OnDestroy {
	chart : any;
    options: {};
    timestamp : string;
    constructor(private chartExport : ChartExportService) {
    	this.chart = null;
    }
    ngOnDestroy() {
    	if(this.chart != null){
    		this.chart.destroy();
    	}
    }

    @Input()  
	set data(data : any) {
		let ind = data.ind;
		console.log(data.ind);
		switch(ind){
			case "Time Series (Daily)": 
				this.showPriceChart(data, ind, "Stock Price");break;
			case "Technical Analysis: EMA":
				this.showIndChart(data, ind, "EMA", [{name:"EMA", parse:parseFloat}]);break;
			case "Technical Analysis: SMA": 
				this.showIndChart(data, ind, "SMA", [{name:"SMA", parse:parseFloat}]);break;
			case "Technical Analysis: STOCH":
				this.showIndChart(data, ind, "STOCH", 
					[{name:"SlowK", parse:parseFloat}, {name:"SlowD", parse:parseFloat}]);break;
			case "Technical Analysis: RSI":
				this.showIndChart(data, ind, "RSI", [{name:"RSI", parse:parseFloat}]);break;
			case "Technical Analysis: ADX":
				this.showIndChart(data, ind, "ADX", [{name:"ADX", parse:parseFloat}]);break;
			case "Technical Analysis: CCI":
				this.showIndChart(data, ind, "CCI", [{name:"CCI", parse:parseFloat}]);break;
			case "Technical Analysis: BBANDS":
				this.showIndChart(data, ind, "BBANDS", 
					[{name:"Real Middle Band", parse:parseFloat},
					 {name:"Real Upper Band", parse:parseFloat},
					 {name:"Real Lower Band", parse:parseFloat}]);break;
			case "Technical Analysis: MACD":
				this.showIndChart(data, ind, "MACD", 
					[{name:"MACD_Signal", parse:parseFloat},
					 {name:"MACD", parse:parseFloat},
					 {name:"MACD_Hist", parse:parseFloat}
					]);break;
		}
	}
	@Input()
	set stockData(data){
		let symbol = data["Meta Data"]["2. Symbol"];
		let series = data[data.ind];
		var priceKey = "4. close";
		var pdata = this.processSeries(data.dates, series, [
				{name: priceKey, parse: parseFloat}]);

		let options = {
			title: {
	            text: symbol + ' Stock Price'
	        },
			subtitle:{
				useHTML: true,
				text: "<a href = \"https:\/\/www.alphavantage.co\/\" target=\"_blank\">Source: Alpha Vantage<\/a>"
			},
			xAxis: {
		    	 crosshair: false,
		    },
		     tooltip: {
        		formatter: function () {
        			//console.log(this);
        			var s = '<b>' + Highcharts.dateFormat('%A, %b %e, %Y', this.x) + '</b><br/>';
        			s+='<span style="color:'+this.points[0].color+'">\u25CF</span>'
        			+this.points[0].series.name+': <b>'
        			+this.y.toFixed(2)+'</b><br/>';
        			return s;
        		}
        	},
			rangeSelector: {
				selected: 0,
				buttons: [{
					type: 'week',
					count: 1,
					text: '1w'
				},
				{
				    type: 'month',
				    count: 1,
				    text: '1m'
				}, {
				    type: 'month',
				    count: 3,
				    text: '3m'
				}, {
				    type: 'month',
				    count: 6,
				    text: '6m'
				}, {
				    type: 'ytd',
				    text: 'YTD'
				}, {
				    type: 'year',
				    count: 1,
				    text: '1y'
				}, {
				    type: 'all',
				    text: 'All'
				}]
			},
	        series: [{
	        	name: symbol,
	        	data: pdata[priceKey].vals,
	        	type: 'area',
	        	tooltip: {
                	valueDecimals: 2,
            	}
	        }]
		};

		if(this.chart!==null){
			this.chart.destroy();
		}
		console.log(symbol);
		console.log('show');
		this.chart = Highcharts.stockChart(data.chartId, options);
	}

	defaultChart() : any {
			return {
				subtitle:{
					useHTML: true,
					text: "<a href = \"https:\/\/www.alphavantage.co\/\" target=\"_blank\">Source: Alpha Vantage<\/a>"
				},
				chart: {
					borderColor: "#ccc",
					borderWidth : 3,
					type: "line"
				},
				xAxis:{
					type: "datetime",
					ordinal: true,
					labels: {
				        formatter: labelFormat,
				        style:{fontSize: "8px"}
					},
	    			tickLength: 0
				},
				tooltip: {
					dateTimeLabelFormats: {day:"%m/%d"}
				},
				legend: {
			        align: "center",
			        verticalAlign: "bottom"
				},
				exporting: {
        			url: 'http://export.highcharts.com/'
    			},				
			};
	}
	processSeries(dates, series, keys) : {} {
		var res = {};
		keys.forEach((key) => {
			res[key.name] = {
				vals:[],
				min: key.parse(series[dates[0]][key.name]),
				max: key.parse(series[dates[0]][key.name]),
			};
		});
		res['min'] = res[keys[0].name].min;
		res['max'] = res[keys[0].name].max;
		for(let i = dates.length-1; i >=0; i--){
			let utc = (new Date(dates[i])).getTime();
			keys.forEach((key) => {
				let val = key.parse(series[dates[i]][key.name]);
				res[key.name].vals.push([utc, val]);
				res[key.name].min = Math.min(val, res[key.name].min);
				res[key.name].max = Math.max(val, res[key.name].max);
				res['min'] = Math.min(res['min'], res[key.name].min);
				res['max'] = Math.max(res['max'], res[key.name].max);
			});
		}
		return res;
	}
	getTickDate(dates) : Array<any> {
		var tickpos = [(new Date(dates[0])).getTime()];
		var cur = tickpos[0];
		for(let i = 0; i < dates.length; i++){
			let utc = (new Date(dates[i])).getTime();
			if(cur - utc >= 7 * 24 * 3600 * 1000){
				tickpos.unshift(utc);
				cur = utc;
			}
		}
		return tickpos;
	}
	showPriceChart(data, ind, title) : void{
		var symbol = data["Meta Data"]["2. Symbol"];
		var series = data[ind];
		var dates = data.dates;
		var priceKey = "4. close", volumeKey = "6. volume";
		var pdata = this.processSeries(dates, series, [
				{name: priceKey, parse: parseFloat},
				{name: volumeKey, parse: parseInt}
			]);

		var curDate = new Date(dates[0]);
		var tickpos = this.getTickDate(dates);

		var options = this.defaultChart();

		options.title = {text: title + "Price and Volume"};
		options.xAxis.tickPositions = tickpos;
		options.xAxis.tickLength = 2;
		options.yAxis = [{
				title: {
					text: "Stock Price" 
				},
				min: pdata[priceKey].min,
				max: pdata[priceKey].max

			},{
				title: {
					text: "Volume"
				},
				softMax: 300 * 1000 * 1000,
				opposite:true
			}];
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
		this.chartExport.setChartOption(options);
		this.chart = Highcharts.chart(data.chartId, options);
	}
	showIndChart(data, ind, acronym, keys){
		var symbol = data["Meta Data"]["1: Symbol"];
		var indName = data["Meta Data"]["2: Indicator"];
		var series = data[ind];
		var dates = data.dates;
		var pdata = this.processSeries(dates, series, keys);
		var tickpos = this.getTickDate(dates);
		var options = this.defaultChart();
		options.title = {text: indName};
		options.xAxis.tickPositions = tickpos;
		options.yAxis = [{
				title: {
					text: acronym 
				},
				min: pdata['min'],
				max: pdata['max']
			}];
		options.plotOptions = {
			series: {
				lineWidth: 1,
				marker: {
					enabled: true,
					radius: 2
				}
			}
		};
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
		this.chartExport.setChartOption(options);
		this.chart = Highcharts.chart(data.chartId, options);
	}
}
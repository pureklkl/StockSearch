import * as moment from 'moment';
declare var Highcharts : any;
function labelFormat(){
	return moment(this.value).format("M/D");
}
export class DefaultChart  {
	title:{text:string} = {
		text: ''
	};
	subtitle:{
		useHTML: true,
		text: "<a href = \"https:\/\/www.alphavantage.co\/\" target=\"_blank\">Source: Alpha Vantage<\/a>"
	};
	chart: {
		borderColor: "#ccc",
		borderWidth : 3,
		type: "line"
	};
	xAxis: {type:string,
			ordinal: boolean,
		    labels: {
		    	formatter: ()=>string,
		    	style: {fontSize: string}
		    },
			tickLength: number,
			tickPositions: any[]} = {
		type: "datetime",
		ordinal: true,
		labels: {
	        formatter: labelFormat,
	        style:{fontSize: "8px"}
		},
		tickLength: 10,
		tickPositions: [] 
	};
	yAxis: [{
		title: {text:string},
		min:number,
		max:number,
		opposite:boolean}] = [{
		title: {text: '' },
		min: 0,
		max: 0,
		opposite: false
	}];
	plotOptions: {
		series: {
			lineWidth: 1,
			marker: {
				enabled: true,
				radius: 2
			}
		}
	};
	series:any[];
	tooltip: {
		dateTimeLabelFormats: {day:"%m/%d"}
	};
	legend: {
        align: "center",
        verticalAlign: "bottom"
	};
	exporting: {
		url: 'http://export.highcharts.com/'
	}				
};
function stockTooltipFormater() {
	//console.log(this);
	var s = '<b>' + Highcharts.dateFormat('%A, %b %e, %Y', this.x) + '</b><br/>';
	s+='<span style="color:'+this.points[0].color+'">\u25CF</span>'
	+this.points[0].series.name+': <b>'
	+this.y.toFixed(2)+'</b><br/>';
	return s;
}
export class DefaultStockChart  {
	title: {text:string} = {
        text : ''//symbol + ' Stock Price'
    };
	subtitle:{
		useHTML: true,
		text: "<a href = \"https:\/\/www.alphavantage.co\/\" target=\"_blank\">Source: Alpha Vantage<\/a>"
	};
	xAxis: {
    	 crosshair: false,
    };
     tooltip: {formatter: ()=>string } = {
		formatter: stockTooltipFormater
	};
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
	};
    series: [{
    	name:string,
    	data:any[],
    	type:string,
    	tooltip: {
    		valueDecimals:number
    	}}] = [{
    	name: '',//symbol,
    	data: null,//pdata[priceKey].vals,
    	type: 'area',
    	tooltip: {
        	valueDecimals: 2,
    	}
    }]
};
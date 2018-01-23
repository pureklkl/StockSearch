import { Component, Input } from '@angular/core';
import { cunit } from '../../services/parsers';

import * as moment from 'moment-timezone';

@Component({
  moduleId: module.id.toString(),
  selector: 'stock-info',
  templateUrl: './stockInfo.component.html',
  styleUrls: ['./stockInfo.component.css'],
})
export class StockInfo{

	symbol : string;
	lastPrice : number;
	change: number;
	changePercent : string;
	timeStamp : string;
	open : number;
	close : number;
	volume : string;
	high : number;
	low : number;
	
	curClose : {};
	prevClose : {};

	constructor(){
		this.curClose = null;
		this.prevClose = null;
		this.close = null;
	}

	findClose(cur, prev) : number{
		let curtime = moment().tz('America/New_York');
		let daystart = moment().tz('America/New_York').hour(9).minute(30),
			dayend = moment.tz('America/New_York').hour(16).minute(0);
		if(	curtime.day()>0
			&&curtime.day()<6
			&&curtime.isBetween(daystart, dayend)){
			var close = cunit(prev["close"]);
		} else {
			close = cunit(cur["close"]);
		}
		this.change = this.lastPrice - this.open;
		this.changePercent = (this.change / this.open * 100.).toFixed(2) + "%";
		return close;
	}

	@Input()  
	set data(data : any) {
		this.symbol = data["Meta Data"]["Symbol"];
		let series = data[data.ind];
		let dates = data.dates;
		let cur = series[dates[0]], prev = series[dates[1]];
		this.lastPrice = cunit(cur["close"]);
		this.open = cunit(cur["open"]);
		this.close = this.findClose(cur, prev);
		this.low = cunit(cur["low"]);
		this.high = cunit(cur["high"]);
		this.volume = cur["volume"].toLocaleString("en", {useGrouping:true});
		this.timeStamp = data["Meta Data"]["Last Refreshed"]+" EDT";
	}

}

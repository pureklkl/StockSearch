import { Component, Input } from '@angular/core';

@Component({
  moduleId: module.id.toString(),
  selector: 'stock-news',
  templateUrl: './stockNews.component.html',
  styleUrls: ['./stockNews.component.css'],
})

export class StockNews {
	newses: Array<any>;
	@Input()
	set data(data : any) {
		if(data != null){
			this.newses = data;
		}
	}
}
import { Component } from '@angular/core';
import { slideAnime } from '../../utils/animations'

declare var $:any;

@Component({
  selector: 'stock-app',
  templateUrl: './stockApp.component.html',
  styleUrls: ['./stockApp.component.css'],
  animations : [slideAnime('routerAnimation', ['favorite', 'stock-detail'])]
})
export class StockApp{
	getRouteAnimation(outlet) {
		return outlet.activatedRouteData.animation
	}
}
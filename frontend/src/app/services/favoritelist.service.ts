import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Observable }  from 'rxjs/Observable';
import { BACKEND_API } from './apis'
import 'rxjs/add/operator/map';

@Injectable()
export class SearchFavorService {
	api : string;
	params : URLSearchParams;
	cache : {};
	constructor(private  http: Http) {
  		this.api = BACKEND_API + "api/stock/data";
  		this.params = new URLSearchParams();
  		this.cache = {};
	}
	searchFavorit(symbols : Array<any>){
		return this.http.post(this.api, symbols).map(response => response.json());
	}

}
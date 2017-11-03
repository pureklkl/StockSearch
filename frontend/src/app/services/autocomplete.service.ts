import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { stocks } from './mock_autocomplete';
import { Observable }  from 'rxjs/Observable';
import { BACKEND_API } from './apis';

import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/retry';

@Injectable()
export class AutoCompleteService {
	api : string;
	params : URLSearchParams;
	constructor(private  http: Http) {
		this.api = BACKEND_API + "symbolHint";
		this.params = new URLSearchParams();
	}
	getStockSymbols(term : string) : Observable<any[]> {
		this.params.set('symbol', term);
	return this.http
			   .get(this.api, {params: this.params})
			   .retry(2)
			   .map(response => response.json())
			   .catch(err => {console.log(err);return Observable.of<any[]>([])});
	}
}
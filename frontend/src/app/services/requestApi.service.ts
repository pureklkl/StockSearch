import { Injectable } from '@angular/core';
import { Http, Headers, URLSearchParams } from '@angular/http';
import { Location } from '@angular/common';
import { BACKEND_API } from './apis';

import { Observable } from 'rxjs/Observable';
import { parseFavor, sortStock } from './parsers';

import 'rxjs/add/observable/of';

declare var Cookies:any;

@Injectable()
export class RequestApiService {
	apis: {hint:string,
		   login:string,
		   register:string,
		   userInfo:string,
		   stockInfo:string,
		   favorApi:string,
		   news:string,
		   chart:string } = {
		hint: BACKEND_API + 'api/stock/hint',
		login: BACKEND_API + 'auth/local',
		register: BACKEND_API + 'api/user',
		userInfo: BACKEND_API + 'api/user/info',
		stockInfo: BACKEND_API + 'api/stock/data?',
		favorApi: BACKEND_API + 'api/user/favor/',
		news: BACKEND_API+"api/stock/news?",
		chart: BACKEND_API + 'api/chart'
	};
	constructor(private  http: Http, private location: Location) {
		for(let api in this.apis) {
			this.apis[api] = location.prepareExternalUrl(this.apis[api]);
		}
	}
	getAuth(){
		let headers = new Headers();
		headers.append('Authorization', 'Bearer ' + Cookies.get('token')); 
		return headers
	}
	authGet(url: string) {
		return this.http.get(url, {headers: this.getAuth()});
	}
	authPost(url:string, data:any) {
		return this.http.post(url, data, {headers: this.getAuth()});
	}
	authPut(url:string, data:any) {
		return this.http.put(url, data, {headers: this.getAuth()});
	}
	authDelete(url:string) {
		return this.http.delete(url, {headers: this.getAuth()});
	}

	hint(symbol:string) {
		let params = new URLSearchParams();
		params.set('symbol', symbol);
		return this.http
			   .get(this.apis.hint, {params: params})
			   .retry(2)
			   .map(response => response.json())
	}
	login(email:string, password:string) {
		let cred = {username: email, password: password};
		return this.http.post(this.apis.login, cred).map(response => response.json());
	}
	register(username:string, password:string) {
		let info = {username: username, password: password};
		return this.http.post(this.apis.register, info).map(response=>response.json());
	}
	getUserInfo() {
		if(Cookies.get('token') == null) {
			return Observable.of<any>(false)
		} else {
			return this.authGet(this.apis.userInfo).map(response => response.json());
		}
	}
	editFavor(op: string, sym: string) {
		if(op == 'add') {
			this.authPut(this.apis.favorApi+sym,{}).subscribe();
		} else if(op == 'delete'){
			this.authDelete(this.apis.favorApi+sym).subscribe();
		}
	}
	
	searchStockList(symbols : Array<any>){
		return this.http.post(this.apis.stockInfo, {favors: symbols})
		.map(response => response.json())
		.map(json => parseFavor(json));
	}
	searchStock(symbol: string, func: string, num: number){
		if(func == "Price"){
		  	func = 'TIME_SERIES_DAILY_ADJUSTED';
		}
		let queryUrl = new URLSearchParams();
		queryUrl.set('func', func);
		queryUrl.set('symbol', symbol);
		queryUrl.set('number', num.toString());
		return this.http
		.get(this.apis.stockInfo + queryUrl.toString())
		.map(response => response.json())
		.map(json => sortStock(json));
	}
	searchNews(symbol:string) {
		let queryUrl = new URLSearchParams();
		queryUrl.set('symbol', symbol);
		return this.http.get(this.apis.news + queryUrl.toString()).map(response=>response.json());
	}
	getChartImg(data) : Observable<any> {
		let postParams = {};
		postParams['async'] = true;
		postParams['type'] = 'image/png';
		postParams['options'] = JSON.stringify(data);
		return this.http.post(this.apis.chart, postParams);
	}

}
import { Injectable } from '@angular/core';

import { Observable }  from 'rxjs/Observable';
import { Http, URLSearchParams } from '@angular/http';
import { HttpRequest } from '@angular/common/http';

import { HttpClient, HttpEventType,  HttpResponse } from '@angular/common/http';

import { BACKEND_API } from './apis';

import { CanActivate, Router } from '@angular/router';

@Injectable()
export class SymbolSearchService implements CanActivate {
	api : string;
	params : URLSearchParams;
	symbol : string;
	
	haveDetail : boolean;
	searching : boolean;

	dataCache: {};

	constructor(private http: HttpClient,
			    private router : Router) {
		this.dataCache = {};
		this.symbol = "";
		//this.api = "https://www.alphavantage.co/query?";
		this.api = BACKEND_API+ "api/stock/data?";
		this.haveDetail = false;
		this.searching = false;
	}
	canActivate() {
		if(this.haveDetail || this.searching){
			return true;
		} else {
			this.router.navigateByUrl('favorite');
		}
	}

	private associateDetail : any;
	setAssociateDetail(component){
		this.associateDetail = component;
	}
	private associateFavor : any;
	setAsscoiateFavor(component){
		this.associateFavor = component;
	}

	triggerSearch(){
		if(this.associateDetail != null){
			this.associateDetail.getData();
		}
	}

	reset(){
		this.haveDetail = false;
		this.dataCache = {};
		if(this.curHttpReq!=null){
			this.curHttpReq.unsubscribe();
		}
		if(this.associateFavor!=null){
			this.associateFavor.disableNavi();
		}
	}
	
	curHttpReq : any;
	searchSymbol(symbol : string, func : string, num : number,
		success: Function,
		progress: Function,
		error: Function) : any {
		if(this.symbol == ""){
			error();
			return;
		}

		if(this.dataCache[symbol+func+num]!=null){
			success(this.dataCache[symbol+func+num]);
			return;
		}

		let queryUrl = new URLSearchParams();
		queryUrl.set('func', func);
		queryUrl.set('symbol', symbol);
		queryUrl.set('number', num.toString());
	
		let req = new HttpRequest('GET', this.api+queryUrl.toString(), {reportProgress: true});
		this.curHttpReq = this.http.request(req)
			.subscribe(
			event => {
				switch (event.type) {
					case HttpEventType.Sent:
						progress(35);
						break;
					case HttpEventType.ResponseHeader:
						progress(40);
						break;
					case HttpEventType.DownloadProgress:
						progress(Math.round(40 + 0.6 * (100 * event.loaded / event.total)));
						break;
				}
				if(event instanceof HttpResponse){
					if(event.body != null && event.body["Error Message"] == null){
						this.haveDetail = true;
						let ind = "";
						for (let key in event.body) {
							if(key != "Error Message" && key != "Meta Data") {
								ind = key;
							}
						}
						if(ind != "") {
							event.body['ind'] = ind;
							event.body['dates'] = [];
							for(let key in event.body[ind]){ 
								event.body['dates'].push(key);
							}
							event.body['dates'].sort((d1, d2) => {
								return (new Date(d2)).getTime() - (new Date(d1)).getTime();
							});
						} else if(event.body["Error Message"] == null){
							event.body["Error Message"] = "empty object error";
						}
					}
					this.dataCache[symbol+func+num] = event.body;
					success(event.body);
				}
			},
			err => {error();}
		);
		this.searching = false;
	}
}
import { Injectable } from '@angular/core';

import { Observable }  from 'rxjs/Observable';
import { Http, URLSearchParams } from '@angular/http';
import { HttpRequest } from '@angular/common/http';

import { HttpClient, HttpEventType,  HttpResponse } from '@angular/common/http';

import { BACKEND_API } from './apis';

import * as newsdata from './mockdata/mock_news';

import * as xml2js from 'xml2js';


@Injectable()
export class SymbolNewsService {
	api : string;
	params : URLSearchParams;
	symbol : string;

	constructor(private http: HttpClient) {
		this.symbol = "";
		this.api = BACKEND_API+"api/stock/news?";
	}

	testSearchSymbol(
		success: Function,
		progress: Function,
		error: Function){
		var parseString = xml2js.parseString;
		parseString(newsdata.newsstring, (err, result) => {
			success(result);
		})
	}

	searchSymbol(symbol : string,
				success: Function,
				progress: Function,
				error: Function){
		let queryUrl = new URLSearchParams();
		queryUrl.set('symbol', symbol);
		const req = new HttpRequest('GET', this.api + queryUrl.toString(), {reportProgress: true});
		this.http.request(req).subscribe(
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
					success(event.body);
				}
			},
			err=>error());
	}

}
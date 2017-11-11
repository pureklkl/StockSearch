import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Observable }  from 'rxjs/Observable';
import { BACKEND_API } from './apis';
import 'rxjs/add/operator/map';

@Injectable()
export class ChartExportService {
	api : string;
	postParams : {};
	constructor(private  http: Http) {
		this.api = BACKEND_API + 'api/chart';
		this.postParams = {};
		this.postParams['async'] = true;
		this.postParams['type'] = 'image/png';
	}

	setChartOption(chartOption : any){
		this.postParams['options'] = JSON.stringify(chartOption);
	}

	chartExport() : Observable<any>{
		return this.http.post(this.api, this.postParams);
	}

}
import { Component, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import { AutoCompleteService, SymbolSearchService } from '../../services/';
import {Router} from "@angular/router";
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';


declare var $:any;

@Component({
  selector: 'search-panel',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class AppSearch implements OnInit{
	stateCtrl: FormControl;
	autoStockInfo: Observable<any[]>;
	constructor(private autoComplete: AutoCompleteService, 
				private symbolSearch: SymbolSearchService,
				private router : Router) {
	 	this.stateCtrl = new FormControl();
	 	this.autoStockInfo = this.stateCtrl.valueChanges
	 	.debounceTime(300)
	 	.distinctUntilChanged()
	 	.switchMap((symbol, number) => {
		 		if(symbol.trim() != ""){
		 			$('#submit-symbol').prop('disabled', false);
		 			return this.autoComplete.getStockSymbols(symbol);
		 		} else {
		 			$('#submit-symbol').prop('disabled', true);
		 			return Observable.of<any[]>([]);
		 		}
	 		});
	}

	ngOnInit() {
		$('#submit-symbol').prop('disabled', true);
		(<any>$('#search-stock')).validate({
				rules: {
					symbol: {
						required:true,
						normalizer: value => {
							return (<any>$).trim(value);
						}
					}
				},
				messages: {
					symbol: "Please enter a stock ticket symbol"
				},
				errorPlacement : (label, elem) => {
					label.css('float', 'left');
					label.css('font-weight', 'unset');
					label.insertAfter(elem);
				},
				errorClass : 'has-error',
				onfocusout: (el, ev) => {
					(<any>$(el)).valid();
					if($(el).val().trim()!=""){
						$('#submit-symbol').prop('disabled', false);
					}
				},
				highlight: (el, error) => {
					(<any>$(el)).parent().addClass(error);
				},
				unhighlight: (el, error) => {
					(<any>$(el)).parent().removeClass(error);
				},
				submitHandler: (form) => {
					this.symbolSearch.symbol = $('#symbol').val().trim();
					this.symbolSearch.searching = true;
					if(this.router.url === '/favorite') {
						this.router.navigateByUrl('stock-detail');
					} else {
						this.symbolSearch.triggerSearch();
					}
				}
			}
		);
	}
	resetForm(){
		$('#search-stock').validate().resetForm();
		$('#submit-symbol').prop('disabled', true);
		this.symbolSearch.reset();
		if(this.router.url != '/favorite'){
			this.router.navigateByUrl('favorite');
		}
	}
}
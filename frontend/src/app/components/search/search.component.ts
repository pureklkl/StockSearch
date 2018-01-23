import { Component, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';

import { Router } from "@angular/router";
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';

import { makeAction } from '../../flux/actions';;
import { STATE_DEF, ACTION_DEF, AsyncState } from '../../flux/stateDef';
import {RequestApiService, StoreService } from '../../services/';

declare var $:any;

@Component({
  selector: 'search-panel',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css', '../../utils/spin.css'],
})
export class AppSearch implements OnInit{
	stateCtrl: FormControl;
	autoStockInfo: [{}];
	trigger: (any, {})=>void;
	isHinting: boolean = false;
	constructor(private apis: RequestApiService,
				private store: StoreService,
				private router : Router) {

		this.trigger = (type, payload)=>this.store.dispatch(makeAction(type, payload));
		this.store.addListener((state)=>{
			switch (state[STATE_DEF.HINTS_AS]) {
				case AsyncState.success:
					this.autoStockInfo = state[STATE_DEF.HINTS];
					break;
				case AsyncState.ongoing:
					this.isHinting = true;
					break;
				case  AsyncState.canceled:
					$('#submit-symbol').prop('disabled', true);
					this.autoStockInfo = null;
				default:
					break;
			}
			if(state[STATE_DEF.HINTS_AS] == AsyncState.ongoing) {
				this.isHinting = true;
			} else {
				this.isHinting = false;
			}
		})

	 	this.stateCtrl = new FormControl();
	 	this.stateCtrl.valueChanges
	 	.debounceTime(300)
	 	.distinctUntilChanged()
	 	.subscribe((symbol:string)=>{
	 		symbol = symbol.trim();
	 		if(symbol != "") {
	 			this.trigger(ACTION_DEF.LOAD_HINT, AsyncState.ongoing);
	 			apis.hint(symbol).subscribe(
	 			(result:[{}])=>{
	 				this.trigger(ACTION_DEF.SET_HINT, result);
	 			}, 
	 			(err)=>{
	 				this.trigger(ACTION_DEF.LOAD_HINT, AsyncState.failed);
	 			});
	 		} else {
	 			this.trigger(ACTION_DEF.LOAD_HINT, AsyncState.canceled);
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
					let symbol = $('#symbol').val().trim().toUpperCase();
					this.router.navigateByUrl('stock-detail/' + symbol);
				}
			}
		);
	}
	resetForm(){
		$('#search-stock').validate().resetForm();
		$('#submit-symbol').prop('disabled', true);
		if(this.router.url != '/favorite'){
			this.router.navigateByUrl('favorite');
		}
		this.trigger(ACTION_DEF.CLEAR, {});
	}
}
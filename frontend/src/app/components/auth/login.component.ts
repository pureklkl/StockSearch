import { Component, Inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { RequestApiService, StoreService} from '../../services/'

import { STATE_DEF, ACTION_DEF, AsyncState } from '../../flux/stateDef';
import  { makeAction } from '../../flux/actions';


declare var $:any;
declare var Cookies:any;

@Component({
  selector: 'login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class Login implements OnInit, AfterViewInit, OnDestroy {
	unregister: ()=>void;

	loginInfo: string;
	regInfo: string;
	trigger: (any, {})=>void;
	constructor(public dialogRef: MatDialogRef<Login>,
		        private apis: RequestApiService,
		        private store: StoreService,
		        @Inject(MAT_DIALOG_DATA) public data: any){
		this.trigger = (type, payload)=>this.store.dispatch(makeAction(type, payload));
		this.unregister = store.addListener((state:{})=>{
			switch (state[STATE_DEF.USER_AS]) {
				case AsyncState.success:
					dialogRef.close('success');
					break;
				case AsyncState.ongoing:
					this.loginInfo = '';
					$('#diag-login-btn').prop('disabled', true);
					break;
				case  AsyncState.invalid:
					this.loginInfo = 'username or password incorrect';
					$('#diag-login-btn').prop('disabled', false);
					break;
				case AsyncState.failed:
					this.loginInfo = 'net connection or server failure, try again later';
					$('#diag-login-btn').prop('disabled', false);
					break;
				default:break;
			}
			switch (state[STATE_DEF.REGISTER_AS]) {
				case AsyncState.failed:
					this.regInfo = 'net connection or server failure, try again later';
					$('#diag-register-btn').prop('disabled', false);
					break;
				case AsyncState.invalid:
					this.regInfo = 'username already registered';
					$('#diag-register-btn').prop('disabled', false);
					break;
				case AsyncState.ongoing:
					this.regInfo = '';
					$('#diag-register-btn').prop('disabled', true);
					break;
				default:break;
			}
		});
	}
	ngOnInit() {
		(<any>$('#login-form')).validate({
			rules: {
				username: "required",
				password: "required"
			},
			messages: {
				username: "username required",
				password: "password required"
			},
			submitHandler: (form) => {
				this.trigger(ACTION_DEF.LOGIN, AsyncState.ongoing);
				this.apis.login($("#login-username").val().trim(), $("#login-password").val())
				.subscribe(
					(result)=>{
						Cookies.set('token', result.token);
						this.store.dispatch(makeAction(ACTION_DEF.SET_USER, result));
					},
					(err)=>{ 
						if(err['status'] == 401 || err['status'] == 404) {
							this.trigger(ACTION_DEF.LOGIN, AsyncState.invalid);
						} else {
							this.trigger(ACTION_DEF.LOGIN, AsyncState.failed);
						}
					}
				);
			}
		});

		(<any>$('#register-form')).validate({
			rules: {
				username: "required",
				password: "required",
				password2: {
					required: true,
					equalTo: "#register-password"
				}
			},
			messages: {
				username: "username required",
				password: "password required",
				password2: "required and should be same with above one"
			},
			submitHandler: (form) => {
				this.trigger(ACTION_DEF.REGISTER, AsyncState.ongoing);
				this.apis.register($("#register-username").val().trim(), $("#register-password").val())
				.subscribe(
				(result)=>{
					Cookies.set('token', result.token);
					this.trigger(ACTION_DEF.SET_USER, result);
				},
				(err)=>{
					if(err.status == 401) {
						this.trigger(ACTION_DEF.REGISTER, AsyncState.invalid);
					} else {
						this.trigger(ACTION_DEF.REGISTER, AsyncState.failed);
					}
				})
			}
		});
	}
	ngAfterViewInit() {
		switch (this.data.act) {
			case 'register':
				$('#auth-dialog li a[href="#register"]').tab('show');
				break;
			case 'login':
				$('#auth-dialog li a[href="#login"]').tab('show');
				break;
			default: break;
		}
	}
	ngOnDestroy() {
		this.unregister();
	}
}
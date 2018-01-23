import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

import { Login } from '../auth/';
import { StoreService, makeAction } from '../../services/';
import { STATE_DEF, AppAction, AsyncState } from '../../flux/stateDef';

declare var $:any;
declare var Cookies:any;

@Component({
  selector: 'nav-bar',
  templateUrl: './navBar.component.html',
  styleUrls: ['./navBar.component.css'],
})
export class NavBar implements OnInit{
	loginState: string;
	username: string;
	constructor(public dialog: MatDialog,
		        private store: StoreService) {
		this.loginState = 'ongoing';
		this.store.addListener((state:{})=>{
			let user = state[STATE_DEF.USER];
			switch (state[STATE_DEF.USER_AS]) {
				case AsyncState.success:
					this.username = user['userInfo']['username']; 
					this.loginState = 'yes';
					break;
				case AsyncState.ongoing:
					this.loginState = 'ongoing';
					break;
				case AsyncState.invalid:
				case AsyncState.failed:
					this.loginState = 'no'
					break;
				default:break;
			}
		})
	}

	ngOnInit(){
		this.store.dispatch({type: 'navi init'});
	}

	showLoginState(loginState) {

	}
	register(): void{
		this.dialog.open(Login, {width: '400px', data: {act: 'register'}});
	}
	login(): void {
		let dialogRef = this.dialog.open(Login, {width: '400px', data: {act: 'login'}});
		dialogRef.afterClosed().subscribe((result)=>{
			if(result=='login-canceled') {
				this.store.dispatch(makeAction("LOGIN", {state: "failed"}));
			}
		});
	}

	logout(): void {
		Cookies.remove('token',  { path: '/' });
		 window.location.reload();
	}
}
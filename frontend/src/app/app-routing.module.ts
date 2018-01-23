import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Favorite, StockApp } from './components/';



const routes : Routes = [
	{	path: '', component: StockApp,
		children : [
			{
				path: '',
				redirectTo: 'favorite',
				pathMatch: 'full'
			},
			{	path: 'favorite',  
				component: Favorite, 
				data: { animation: 'favorite' } },
			{ 	path: 'stock-detail/:sym', 
				loadChildren: 'app/components/stockDetail/stockDetail.module#StockDetailModule', 
				data: { animation: 'stock-detail' } },
		] 
	},
	{
		path: '**', 
		redirectTo: ''
	}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

export const routedComponents = [Favorite, StockApp];
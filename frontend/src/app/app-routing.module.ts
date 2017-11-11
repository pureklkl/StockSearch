import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Favorite, StockDetail, StockApp } from './components/';
import { SymbolSearchService } from './services';



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
			{ 	path: 'stock-detail', 
				component: StockDetail, 
				data: { animation: 'stock-detail' },
				canActivate : [SymbolSearchService] },
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

export const routedComponents = [Favorite, StockDetail, StockApp];
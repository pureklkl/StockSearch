import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Favorite, StockDetail } from './components/'
import { SymbolSearchService } from './services'



const routes : Routes = [
	{	path: '', 
		redirectTo: '/favorite',
		pathMatch: 'full' },
	{	path: 'favorite',  
		component: Favorite, 
		data: { animation: 'favorite' } },
	{ 	path: 'stock-detail', 
		component: StockDetail, 
		data: { animation: 'stock-detail' },
		canActivate : [SymbolSearchService] },
	{
		path: '**', 
		redirectTo: '/favorite'
	}
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }

export const routedComponents = [Favorite, StockDetail];
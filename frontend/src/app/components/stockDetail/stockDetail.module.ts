import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import {StoreService, RequestApiService } from '../../services/';

import { StockChart } from './stockChart.directive';
import { StockDetail} from './stockDetail.component';
import { StockInfo } from './stockInfo.component';
import { StockNews } from './stockNews.component';


const stockDetailRoutes: Routes = [
  { path: '',  component: StockDetail }
];


@NgModule({
  imports: [
  	CommonModule,
  	RouterModule.forChild(stockDetailRoutes)
  ],
  declarations: [
  	StockChart,
  	StockDetail,
  	StockInfo,
  	StockNews
  ],
  exports: [ RouterModule ]
})
export class StockDetailModule {}
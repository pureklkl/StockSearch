import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material';

import { AppComponent } from './app.component';
import { AppRoutingModule, routedComponents } from './app-routing.module';
import { AppSearch, StockInfo, StockChart, StockNews } from './components/'


import { HttpModule }    from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import {  AutoCompleteService, 
		  SymbolSearchService, 
		  SymbolNewsService,
		  SearchFavorService,
		  ChartExportService } from './services/'


@NgModule({
  declarations: [
    AppComponent,
    AppSearch,
    StockInfo,
    StockChart,
    StockNews,
    routedComponents
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    HttpModule,
    HttpClientModule
  ],
  providers: [AutoCompleteService, 
  				SymbolSearchService, 
  				SymbolNewsService, 
  				SearchFavorService,
  				ChartExportService],
  bootstrap: [AppComponent]
})
export class AppModule { }

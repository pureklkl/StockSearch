import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule }   from '@angular/common';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule, MatDialogModule } from '@angular/material';

import { AppComponent } from './app.component';
import { AppRoutingModule, routedComponents } from './app-routing.module';
import { AppSearch, NavBar, Login } from './components/'


import { HttpModule }    from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import {  RequestApiService, StoreService } from './services/'


@NgModule({
  declarations: [
    AppComponent,
    AppSearch,
    NavBar,
    Login,
    routedComponents
  ],
  imports: [
  	CommonModule,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatDialogModule,
    HttpModule,
    HttpClientModule,

    AppRoutingModule
  ],
  providers: [ RequestApiService, StoreService ],
  entryComponents: [Login],
  bootstrap: [AppComponent]
})
export class AppModule { }

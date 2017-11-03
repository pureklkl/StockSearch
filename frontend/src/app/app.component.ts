import { Component } from '@angular/core';

import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
} from '@angular/animations';

@Component({
  moduleId: module.id.toString(),
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
    animations: [
    trigger('routerAnimation', [
      transition(':enter', []),
      transition('favorite => stock-detail', [
        // Initial state of new route
        query(':enter',
          style({
            width:'100%',
            transform: 'translateX(-95%)',
          }),
          {optional:true}),
        // move page in screen from left to right
        query(':enter',
          animate('1000ms ease',
            style({
              opacity: 1,
              transform: 'translateX(0)',
            })
          ),
        {optional:true}),
      ]),
      transition('stock-detail => favorite', [
        // Initial state of new route
        query(':enter',
          style({
            width:'100%',
            transform: 'translateX(95%)',
          }),
          {optional:true}),
        // move page in screen from left to right
        query(':enter',
          animate('1000ms ease',
            style({
              opacity: 1,
              transform: 'translateX(0)',
            })
          ),
        {optional:true}),
      ])
    ])
  ]

})
export class AppComponent {
  getRouteAnimation(outlet) {
    return outlet.activatedRouteData.animation
  }
}

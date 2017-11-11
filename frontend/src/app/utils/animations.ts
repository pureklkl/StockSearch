import {
  trigger,
  state,
  style,
  animate,
  transition,
  query,
} from '@angular/animations'

//current support 2
export function slideAnime(name, compos) {
	return trigger(name, [
	  transition(':enter', []),
	  transition(compos[0] + ' => ' + compos[1], [
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
	  transition(compos[1] + ' => ' + compos[0], [
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
}
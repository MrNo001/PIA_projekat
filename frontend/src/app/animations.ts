import { trigger, transition, style, query, animateChild, group, animate } from '@angular/animations';

export const routeTransitionAnimations = trigger('routeAnimations', [
  transition('* => *', [
    query(':enter, :leave', [
      style({
        position: 'absolute',
        left: 0,
        width: '100%'
      })
    ], { optional: true }),
    query(':enter', [
      style({ opacity: 0, transform: 'translateX(20px)' })
    ], { optional: true }),
    group([
      query(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(-20px)' }))
      ], { optional: true }),
      query(':enter', [
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateX(0)' }))
      ], { optional: true })
    ]),
    query(':enter', animateChild(), { optional: true })
  ])
]);


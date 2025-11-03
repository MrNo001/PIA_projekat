import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { routeTransitionAnimations } from './animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  animations: [routeTransitionAnimations],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'RTI';

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}

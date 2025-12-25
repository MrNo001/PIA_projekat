import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { routeTransitionAnimations } from './animations';
import { BackendHealthService } from './services/backend-health.service';
import { LoadingComponent } from './components/loading/loading.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingComponent, CommonModule],
  animations: [routeTransitionAnimations],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'RTI';
  backendReady = false;
  loadingError = false;

  constructor(private backendHealthService: BackendHealthService) {}

  ngOnInit() {
    this.checkBackendHealth();
  }

  checkBackendHealth() {
    this.backendHealthService.checkBackendHealth().subscribe({
      next: (ready) => {
        if (ready) {
          this.backendReady = true;
        }
      },
      error: (error) => {
        console.error('Failed to connect to backend after multiple attempts:', error);
        this.loadingError = true;
        // Still show the app after max retries, but log the error
        setTimeout(() => {
          this.backendReady = true;
        }, 2000);
      }
    });
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}

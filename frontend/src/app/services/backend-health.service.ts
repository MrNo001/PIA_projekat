import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, timer, of } from 'rxjs';
import { catchError, retryWhen, concatMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BackendHealthService {
  private baseUrl = 'https://pia-projekat-backend.onrender.com';
  private maxRetries = 30; // Try for up to 30 times
  private retryDelay = 2000; // 2 seconds between retries

  constructor(private http: HttpClient) {}

  /**
   * Checks if the backend is ready by calling the /test endpoint
   * Retries with delay until backend responds or max retries reached
   */
  checkBackendHealth(): Observable<boolean> {
    return this.http.get<{message: string}>(`${this.baseUrl}/test`).pipe(
      map(() => true),
      retryWhen(errors =>
        errors.pipe(
          concatMap((error: HttpErrorResponse, index: number) => {
            const retryAttempt = index + 1;
            if (retryAttempt > this.maxRetries) {
              return throwError(() => new Error(`Backend not available after ${this.maxRetries} attempts`));
            }
            console.log(`Backend not ready, retrying... (${retryAttempt}/${this.maxRetries})`);
            return timer(this.retryDelay);
          })
        )
      ),
      catchError(error => {
        console.error('Backend health check failed:', error);
        return throwError(() => error);
      })
    );
  }
}


import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Statistics {
  cottages: number;
  owners: number;
  tourists: number;
  reservationsLastDay: number;
  reservationsLastWeek: number;
  reservationsLastMonth: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {

  // private apiUrl = 'http://localhost:4000/statistics';
  private apiUrl = 'https://pia-projekat-backend.onrender.com/statistics';

  constructor(private http: HttpClient) { }

  // Get all statistics in one call
  getAllStatistics(): Observable<Statistics> {
    return this.http.get<Statistics>(`${this.apiUrl}/all`);
  }

  // Individual statistics methods
  getTotalCottages(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/cottages`);
  }

  getTotalOwners(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/owners`);
  }

  getTotalTourists(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/tourists`);
  }

  getReservationsLastDay(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/reservations/last-day`);
  }

  getReservationsLastWeek(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/reservations/last-week`);
  }

  getReservationsLastMonth(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/reservations/last-month`);
  }
}

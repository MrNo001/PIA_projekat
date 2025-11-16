import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservationData } from '../../_models/reservation';

export interface Reservation {
  _id?: string;
  cottageId: string | any; 
  userUsername: string;
  startDate: Date;
  endDate: Date;
  adults: number; 
  children: number;
  totalPrice: number;
  nights: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'expired';
  rating?: {
    score: number;
    comment?: string;
    ratedAt?: Date;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateReservationRequest {
  cottageId: string;
  userUsername: string;
  startDate: Date;
  endDate: Date;
  adults: number;
  children: number;
  specialRequests?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {
  private apiUrl = 'http://localhost:4000/reservations';

  constructor(private http: HttpClient) { }

  createReservation(reservationData: CreateReservationRequest): Observable<any> {
    console.log('ReservationService.createReservation - URL:', `${this.apiUrl}/create`);
    console.log('ReservationService.createReservation - Data:', reservationData);
    return this.http.post(`${this.apiUrl}/create`, reservationData);
  }

  getUserReservations(userUsername: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userUsername}`);
  }

  getCurrentReservations(userUsername: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userUsername}/current`);
  }

  getArchivedReservations(userUsername: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userUsername}/archived`);
  }

  getCottageReservations(cottageId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/cottage/${cottageId}`);
  }

  getReservationById(reservationId: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${reservationId}`);
  }

  updateReservationStatus(reservationId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/status`, { status });
  }

  cancelReservation(reservationId: string, userUsername: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/cancel`, { userUsername });
  }

  calculateNights(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  calculateTotalPrice(nights: number, pricePerNight: number): number {
    return nights * pricePerNight;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  validateReservationDates(startDate: Date, endDate: Date): { isValid: boolean; error?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    if (start < now) {
      return { isValid: false, error: 'Start date cannot be in the past' };
    }

    if (end <= start) {
      return { isValid: false, error: 'End date must be after start date' };
    }

    const nights = this.calculateNights(start, end);
    if (nights < 2) {
      return { isValid: false, error: 'Minimum stay is 2 nights' };
    }

    return { isValid: true };
  }

  validateGuestCount(adults: number, children: number): { isValid: boolean; error?: string } {
    if (adults < 1) {
      return { isValid: false, error: 'At least one adult is required' };
    }

    if (adults + children > 6) {
      return { isValid: false, error: 'Maximum 6 guests allowed' };
    }

    return { isValid: true };
  }
}

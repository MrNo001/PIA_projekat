import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservationData } from '../../_models/reservation';

export interface Reservation {
  _id?: string;
  cottageId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  adults: number;
  children: number;
  totalPrice: number;
  nights: number;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateReservationRequest {
  cottageId: string;
  userId: string;
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

  // Create a new reservation
  createReservation(reservationData: CreateReservationRequest): Observable<any> {
    return this.http.post(this.apiUrl, reservationData);
  }

  // Get all reservations for a user
  getUserReservations(userId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Get all reservations for a cottage
  getCottageReservations(cottageId: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/cottage/${cottageId}`);
  }

  // Get reservation by ID
  getReservationById(reservationId: string): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${reservationId}`);
  }

  // Update reservation status
  updateReservationStatus(reservationId: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/status`, { status });
  }

  // Cancel reservation
  cancelReservation(reservationId: string, userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${reservationId}/cancel`, { userId });
  }

  // Calculate nights between two dates
  calculateNights(startDate: Date, endDate: Date): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  // Calculate total price
  calculateTotalPrice(nights: number, pricePerNight: number): number {
    return nights * pricePerNight;
  }

  // Format date for display
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  }

  // Validate reservation dates
  validateReservationDates(startDate: Date, endDate: Date): { isValid: boolean; error?: string } {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    // Set time to start of day for comparison
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

  // Validate guest count
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

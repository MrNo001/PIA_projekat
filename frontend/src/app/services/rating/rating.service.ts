import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating, CreateRatingRequest } from '../../_models/rating';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private apiUrl = 'http://localhost:4000/ratings';

  constructor(private http: HttpClient) {}

  // Create or update a rating for a reservation
  createOrUpdateRating(ratingData: CreateRatingRequest): Observable<any> {
    return this.http.post(this.apiUrl, ratingData);
  }

  // Get rating for a specific reservation
  getReservationRating(reservationId: string): Observable<Rating> {
    return this.http.get<Rating>(`${this.apiUrl}/reservation/${reservationId}`);
  }

  // Get all ratings for a cottage (from completed reservations)
  getCottageRatings(cottageId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cottage/${cottageId}`);
  }

  // Get all ratings by a user (from their completed reservations)
  getUserRatings(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${username}`);
  }

  // Delete a rating (remove from reservation)
  deleteRating(reservationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservation/${reservationId}`);
  }
}

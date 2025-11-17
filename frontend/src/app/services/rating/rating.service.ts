import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Rating, CreateRatingRequest } from '../../_models/rating';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  // private apiUrl = 'http://localhost:4000/ratings';
  private apiUrl = 'https://pia-projekat-backend.onrender.com/ratings';

  constructor(private http: HttpClient) {}

  createOrUpdateRating(ratingData: CreateRatingRequest): Observable<any> {
    return this.http.post(this.apiUrl, ratingData);
  }

  getReservationRating(reservationId: string): Observable<Rating> {
    return this.http.get<Rating>(`${this.apiUrl}/reservation/${reservationId}`);
  }

  getCottageRatings(cottageId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cottage/${cottageId}`);
  }

  getUserRatings(username: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/${username}`);
  }

  deleteRating(reservationId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservation/${reservationId}`);
  }
}

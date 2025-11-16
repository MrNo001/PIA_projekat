import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DashboardStats {
  totalUsers: number;
  totalOwners: number;
  totalTourists: number;
  totalCottages: number;
  pendingRequests: number;
  blockedCottages: number;
}

export interface User {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'owner' | 'tourist' | 'administrator';
  isActive: boolean;
  createdAt: Date;
  rejectionReason?: string;
  rejectedAt?: Date;
}

export interface RegistrationRequest {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'owner' | 'tourist';
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface Cottage {
  _id: string;
  Title: string;
  Description: string;
  OwnerUsername: string;
  Location: {
    lat: number;
    lng: number;
  };
  PriceSummer: number;
  PriceWinter: number;
  Photos: string[];
  Amenities?: {
    WiFi: boolean;
    Kitchen: boolean;
    Laundry: boolean;
    Parking: boolean;
    PetFriendly: boolean;
  };
  isBlocked: boolean;
  blockedUntil?: Date;
  lastThreeRatings: number[];
  averageRating: number;
  hasLowRatings: boolean;
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:4000/admin';

  constructor(private http: HttpClient) { }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`);
  }

  getAllUsers(params: any = {}): Observable<{users: User[], total: number, page: number, pages: number}> {
    return this.http.get<{users: User[], total: number, page: number, pages: number}>(`${this.baseUrl}/users`, { params });
  }

  updateUser(username: string, userData: Partial<User>): Observable<{message: string, user: User}> {
    return this.http.put<{message: string, user: User}>(`${this.baseUrl}/users/${username}`, userData);
  }

  deleteUser(username: string): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.baseUrl}/users/${username}`);
  }

  getPendingRequests(params: any = {}): Observable<{requests: User[], total: number, page: number, pages: number}> {
    return this.http.get<{requests: User[], total: number, page: number, pages: number}>(`${this.baseUrl}/requests`, { params });
  }

  approveRequest(username: string): Observable<{message: string, user: User}> {
    return this.http.put<{message: string, user: User}>(`${this.baseUrl}/requests/${username}/approve`, {});
  }

  rejectRequest(username: string, rejectionReason: string): Observable<{message: string, user: User}> {
    return this.http.put<{message: string, user: User}>(`${this.baseUrl}/requests/${username}/reject`, { rejectionReason });
  }
    
  getAllCottages(params: any = {}): Observable<{cottages: Cottage[], total: number, page: number, pages: number}> {
    return this.http.get<{cottages: Cottage[], total: number, page: number, pages: number}>(`${this.baseUrl}/cottages`, { params });
  }

  blockCottage(cottageId: string, hours: number = 48): Observable<{message: string, cottage: Cottage, blockedUntil: Date}> {
    return this.http.put<{message: string, cottage: Cottage, blockedUntil: Date}>(`${this.baseUrl}/cottages/${cottageId}/block`, { hours });
  }

  unblockCottage(cottageId: string): Observable<{message: string, cottage: Cottage}> {
    return this.http.put<{message: string, cottage: Cottage}>(`${this.baseUrl}/cottages/${cottageId}/unblock`, {});
  }
}

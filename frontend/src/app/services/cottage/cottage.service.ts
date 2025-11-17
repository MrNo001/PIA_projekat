import { Injectable } from '@angular/core';
import { Cottage } from '../../_models/cottage';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CottageService {

  // private apiUrl = 'http://localhost:4000/cottages';
  // private adminApiUrl = 'http://localhost:4000/admin';
  private apiUrl = 'https://pia-projekat-backend.onrender.com/cottages';
  private adminApiUrl = 'https://pia-projekat-backend.onrender.com/admin';

  constructor(private http:HttpClient) {}

  GetAllV_():Observable<Cottage[]>{
    return this.http.get<Cottage[]>(`${this.apiUrl}/getAll`);
  }

  getById(id?: string):Observable<Cottage>{
    if (id) {
      return this.http.get<Cottage>(`${this.apiUrl}/getById/${id}`);
    }
    return this.http.get<Cottage>(`${this.apiUrl}/getById`);
  }

  insertCottage(data:FormData){
    return this.http.post(`${this.apiUrl}/insertCottage`,data);
  }

  getCottagesByOwner(ownerUsername: string): Observable<Cottage[]> {
    return this.http.get<Cottage[]>(`${this.apiUrl}/owner/${ownerUsername}`);
  }

  getCottagesByOwnerUsername(username: string): Observable<Cottage[]> {
    return this.http.get<Cottage[]>(`${this.apiUrl}/owner-username/${username}`);
  }

  updateCottage(data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, data);
  }

  deleteCottage(cottageId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cottageId}`);
  }

  getAllCottagesAdmin(params: any): Observable<any> {
    return this.http.get(`${this.adminApiUrl}/cottages`, { params });
  }

  blockCottageAdmin(cottageId: string, hours: number = 48): Observable<any> {
    return this.http.put(`${this.adminApiUrl}/cottages/${cottageId}/block`, { hours });
  }

  unblockCottageAdmin(cottageId: string): Observable<any> {
    return this.http.put(`${this.adminApiUrl}/cottages/${cottageId}/unblock`, {});
  }

}

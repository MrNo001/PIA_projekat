import { Injectable } from '@angular/core';
import { Vikendica } from '../../_models/vikendica';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VikendicaService {

  private apiUrl = 'http://localhost:4000/vikendice';

  constructor(private http:HttpClient) {}

  GetAllV_():Observable<Vikendica[]>{
    return this.http.get<Vikendica[]>(`${this.apiUrl}/getAll`);
  }

  getById(id?: string):Observable<Vikendica>{
    if (id) {
      return this.http.get<Vikendica>(`${this.apiUrl}/getById/${id}`);
    }
    return this.http.get<Vikendica>(`${this.apiUrl}/getById`);
  }

  insertCottage(data:FormData){
    return this.http.post(`${this.apiUrl}/insertCottage`,data);
  }

  getCottagesByOwner(ownerId: string): Observable<Vikendica[]> {
    return this.http.get<Vikendica[]>(`${this.apiUrl}/owner/${ownerId}`);
  }

  updateCottage(data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/update`, data);
  }

  deleteCottage(cottageId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${cottageId}`);
  }

}

import { Injectable } from '@angular/core';
import { Vikendica } from '../../_models/vikendica';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VikendicaService {

  private apiUrl = 'http://localhost:4000/vikendice/';

  constructor(private http:HttpClient) {}

  GetAllV_():Observable<Vikendica[]>{
    return this.http.get<Vikendica[]>(`${this.apiUrl}/getAll`);
  }

  getId():Observable<Vikendica>{
    return this.http.get<Vikendica>(`${this.apiUrl}/getId`);
  }

  insertCottage(data:FormData){
    return this.http.post("`${this.apiUrl}/insertCottage`",{data:data});
  }

}

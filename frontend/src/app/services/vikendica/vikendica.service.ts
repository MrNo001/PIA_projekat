import { Injectable } from '@angular/core';
import { Vikendica } from '../../_models/vikendica';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class VikendicaService {

  private apiUrl = 'http://localhost/vikendice/getAll';

  constructor(private http:HttpClient) {}

  GetAllV_():Observable<Vikendica[]>{
    return this.http.get<Vikendica[]>(this.apiUrl);
  }

}

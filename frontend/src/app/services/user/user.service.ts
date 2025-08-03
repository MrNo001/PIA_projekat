import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../../_models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  private httpClient = inject(HttpClient)
  apiUrl="http://localhost:4000"

  login(username: string, password: string): Observable<any> {
  return this.httpClient.post(`${this.apiUrl}/auth/login`, { username, password });
}

  // register(u: User){
  //   return this.httpClient.post<Message>("http://localhost:4000/users/register", u)
  // }
    register(user: User): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/auth/register`, user);
  }

  changePassword(oldPass: string, newPass: string): Observable<any> {
  return this.httpClient.post(`${this.apiUrl}/change-password`, {
    oldPassword: oldPass,
    newPassword: newPass
  });
}
  getUser(user: string){
    return this.httpClient.get<User>(`http://localhost:4000/users/getUser/${user}`, {observe: 'response'});
  }
}

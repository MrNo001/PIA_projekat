import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { User } from '../../_models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() {
    // Restore login state from localStorage
    this.loggedIn = localStorage.getItem('key') != null;
  }

  isLoggedIn(): boolean {
    return this.loggedIn;
  }

  private httpClient = inject(HttpClient)
  apiUrl="http://localhost:4000"

  public loggedIn:boolean = false
  public currentUser: User | null = null

  login(username: string, password: string): Observable<any> {
  return this.httpClient.post(`${this.apiUrl}/auth/login`, { username, password });
}

    register(user: User,file:File): Observable<any> {

    const formData = new FormData();
    Object.keys(user).forEach(key=>{
      formData.append(key,(user as any)[key]);
    });

    formData.append('profileImage',file);

    return this.httpClient.post(`${this.apiUrl}/auth/register`, formData);
  }

  changePassword(oldPass: string, newPass: string): Observable<any> {
  const username = localStorage.getItem('key');
  return this.httpClient.post(`${this.apiUrl}/auth/change-password`, {
    username: username,
    oldPassword: oldPass,
    newPassword: newPass
  });
}
  getUser(username: string){
    return this.httpClient.get<User>(`http://localhost:4000/users/getUser/${username}`);
  }

   // update user: send multipart/form-data (only changed fields + optional profileImage)
  updateUser(user: User, file?: File | null): Observable<any> {
    const formData = new FormData();

    // Only send allowed fields that can be updated through profile
    const allowedFields = ['firstName', 'lastName', 'email', 'address', 'phone', 'creditCard'];
    
    allowedFields.forEach(key => {
      const value = (user as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });

    if (file) {
      formData.append('profileImage', file);
    }

    // Use PATCH method and include username in the URL
    return this.httpClient.patch(`${this.apiUrl}/users/update/${user.username}`, formData);
  }

  // helper to build full uploads URL
  getUploadUrl(filename: string | null | undefined): string | null {
    if (!filename) return null;
    return `${this.apiUrl}/uploads/profile_photos/${filename}`;
  }
}

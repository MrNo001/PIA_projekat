import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css'
})
export class AdminLoginComponent implements OnInit {

  userService = inject(UserService);
  router = inject(Router);

  username: string = "";
  password: string = "";
  message: string = "";

  ngOnInit(): void {
    if (this.userService.loggedIn) {
      const username = localStorage.getItem('key');
      if (username) {
        this.userService.getUser(username).subscribe({
          next: (user) => {
            if (user.role === 'administrator') {
              this.router.navigate(['/admin']);
            } else {
              this.userService.loggedIn = false;
              localStorage.removeItem('key');
            }
          },
          error: () => {
            this.userService.loggedIn = false;
            localStorage.removeItem('key');
          }
        });
      }
    }
  }

  login(): void {
    this.message = "";
    
    this.userService.login(this.username, this.password).subscribe({
      next: (data) => {
        if (data) {
          this.userService.getUser(this.username).subscribe({
            next: (user) => {
              if (user.role === 'administrator') {
                this.userService.loggedIn = true;
                this.userService.currentUser = user;
                localStorage.setItem("key", data);
                this.router.navigate(["/admin"]);
              } else {
                this.message = "Access denied. Administrator credentials required.";
              }
            },
            error: (err) => {
              console.error('Error fetching user details:', err);
              this.message = "Error verifying user role.";
            }
          });
        } else {
          this.message = "Invalid username or password";
        }
      },
      error: (err) => {
        if (err.status === 403 && err.error?.error) {
          this.message = err.error.error;
        } else {
          this.message = "Invalid username or password";
        }
      }
    });
  }
}


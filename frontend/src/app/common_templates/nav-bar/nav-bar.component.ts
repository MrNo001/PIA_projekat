import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user/user.service';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent implements OnInit {

  @Input() activePage: string = '';
  @Input() userRole: string = '';
  @Input() isLoggedIn: boolean = localStorage.getItem("key") != null;
  
  currentUser: any = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoggedIn = this.userService.isLoggedIn();
    if (!this.isLoggedIn) return;

    const username = this.userService.getAuthUsername();
    const role = this.userService.getAuthRole();
    if (role) this.userRole = role;

    if (username) {
      this.userService.getUser(username).subscribe({
        next: (user) => {
          this.currentUser = user;
          // prefer role from token, but fallback to user record if missing
          if (!this.userRole && user?.role) {
            this.userRole = user.role;
          }
        },
        error: (err) => {
          console.error('Failed to fetch user:', err);
        }
      });
    }
  }

  LogOut() {
    localStorage.removeItem("key");
    this.userService.loggedIn = false;
    this.userService.currentUser = null;
    this.router.navigate(['/login']);
    console.log("logged out");
  }

  isOwner(): boolean {
    return this.userRole === 'owner';
  }

  isTourist(): boolean {
    return this.userRole === 'tourist';
  }

  isAdmin(): boolean {
    return this.userRole === 'administrator';
  }
}

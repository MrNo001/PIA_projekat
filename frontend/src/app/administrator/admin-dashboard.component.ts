import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { AdminService, DashboardStats } from '../services/admin/admin.service';
import { NavBarComponent } from '../common_templates/nav-bar/nav-bar.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavBarComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  private userService = inject(UserService);
  private adminService = inject(AdminService);
  private router = inject(Router);

  currentUser: any = null;
  stats: DashboardStats = {
    totalUsers: 0,
    totalOwners: 0,
    totalTourists: 0,
    pendingRequests: 0,
    totalCottages: 0,
    blockedCottages: 0
  };
  loading: boolean = false;
  error: string = '';

  ngOnInit(): void {
    // Check if user is logged in and is an administrator
    const username = localStorage.getItem('key');
    if (!username) {
      this.router.navigate(['/login']);
      return;
    }

    // Get current user details
    this.userService.getUser(username).subscribe({
      next: (user) => {
        this.currentUser = user;
        if (user.role !== 'administrator') {
          this.router.navigate(['/profile']);
          return;
        }
        this.loadDashboardStats();
      },
      error: (err) => {
        console.error('Failed to fetch user:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  loadDashboardStats(): void {
    this.loading = true;
    this.error = '';
    
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard stats:', err);
        this.error = 'Failed to load dashboard statistics';
        this.loading = false;
      }
    });
  }
}

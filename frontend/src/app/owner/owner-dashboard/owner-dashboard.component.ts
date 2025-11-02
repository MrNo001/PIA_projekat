import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { CottageService } from '../../services/cottage/cottage.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { NavBarComponent } from '../../common_templates/nav-bar/nav-bar.component';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, NavBarComponent],
  templateUrl: './owner-dashboard.component.html',
  styleUrl: './owner-dashboard.component.css'
})
export class OwnerDashboardComponent implements OnInit {

  private userService = inject(UserService);
  private cottageService = inject(CottageService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  currentUser: any = null;
  totalCottages: number = 0;
  totalReservations: number = 0;
  pendingReservations: number = 0;
  totalRevenue: number = 0;
  loading: boolean = false;

  ngOnInit(): void {
    // Check if user is logged in and is an owner
    const username = localStorage.getItem('key');
    if (!username) {
      this.router.navigate(['/login']);
      return;
    }

    // Get current user details
    this.userService.getUser(username).subscribe({
      next: (user) => {
        this.currentUser = user;
        if (user.role !== 'owner') {
          this.router.navigate(['/profile']);
          return;
        }
        this.loadDashboardData();
      },
      error: (err) => {
        console.error('Failed to fetch user:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  loadDashboardData(): void {
    this.loading = true;
    
    // Load user's cottages
    this.cottageService.getCottagesByOwnerUsername(this.currentUser.username).subscribe({
      next: (cottages) => {
        this.totalCottages = cottages.length;
        this.loadReservationsData(cottages);
      },
      error: (err) => {
        console.error('Failed to load cottages:', err);
        this.loading = false;
      }
    });
  }

  loadReservationsData(cottages: any[]): void {
    const cottageIds = cottages.map(cottage => cottage._id);
    
    if (cottageIds.length === 0) {
      this.loading = false;
      return;
    }

    // Get all reservations for user's cottages
    Promise.all(
      cottageIds.map(cottageId => 
        this.reservationService.getCottageReservations(cottageId).toPromise()
      )
    ).then(results => {
      const allReservations = results.flat().filter(r => r !== undefined);
      
      this.totalReservations = allReservations.length;
      this.pendingReservations = allReservations.filter(r => r.status === 'pending').length;
      this.totalRevenue = allReservations
        .filter(r => r.status === 'confirmed' || r.status === 'completed')
        .reduce((total, r) => total + r.totalPrice, 0);
      
      this.loading = false;
    }).catch(err => {
      console.error('Failed to load reservations:', err);
      this.loading = false;
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

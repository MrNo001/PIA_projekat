import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../services/reservation/reservation.service';
import { UserService } from '../services/user/user.service';
import { VikendicaService } from '../services/vikendica/vikendica.service';
import { Reservation } from '../services/reservation/reservation.service';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

@Component({
  selector: 'app-owner-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent],
  templateUrl: './owner-reservations.component.html',
  styleUrl: './owner-reservations.component.css'
})
export class OwnerReservationsComponent implements OnInit {

  private reservationService = inject(ReservationService);
  private userService = inject(UserService);
  private vikendicaService = inject(VikendicaService);
  private router = inject(Router);

  reservations: Reservation[] = [];
  loading: boolean = false;
  error: string = '';
  currentUser: any = null;
  userCottages: any[] = [];
  selectedCottage: string = 'all';
  statusFilter: string = 'all';

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
        this.loadUserCottages();
      },
      error: (err) => {
        console.error('Failed to fetch user:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  loadUserCottages(): void {
    this.vikendicaService.getCottagesByOwner(this.currentUser._id).subscribe({
      next: (cottages) => {
        this.userCottages = cottages;
        this.loadReservations();
      },
      error: (err) => {
        console.error('Failed to load cottages:', err);
        this.error = 'Failed to load your cottages.';
      }
    });
  }

  loadReservations(): void {
    this.loading = true;
    this.error = '';

    // Get all reservations for all user's cottages
    const cottageIds = this.userCottages.map(cottage => cottage._id);
    
    if (cottageIds.length === 0) {
      this.loading = false;
      return;
    }

    // For now, we'll get all reservations and filter by cottage IDs
    // In a real app, you'd want a backend endpoint for this
    Promise.all(
      cottageIds.map(cottageId => 
        this.reservationService.getCottageReservations(cottageId).toPromise()
      )
    ).then(results => {
      this.reservations = results.flat().filter(r => r !== undefined) as Reservation[];
      this.loading = false;
    }).catch(err => {
      console.error('Failed to load reservations:', err);
      this.error = 'Failed to load reservations. Please try again.';
      this.loading = false;
    });
  }

  getFilteredReservations(): Reservation[] {
    let filtered = this.reservations;

    // Filter by cottage
    if (this.selectedCottage !== 'all') {
      filtered = filtered.filter(r => r.cottageId === this.selectedCottage);
    }

    // Filter by status
    if (this.statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === this.statusFilter);
    }

    return filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  getCottageName(cottageId: string): string {
    const cottage = this.userCottages.find(c => c._id === cottageId);
    return cottage ? cottage.Title : 'Unknown Cottage';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      case 'completed': return 'badge-info';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      default: return status;
    }
  }

  updateReservationStatus(reservationId: string, newStatus: string): void {
    this.reservationService.updateReservationStatus(reservationId, newStatus).subscribe({
      next: (response) => {
        console.log('Status updated successfully:', response);
        this.loadReservations(); // Reload reservations
      },
      error: (err) => {
        console.error('Failed to update status:', err);
        this.error = 'Failed to update reservation status.';
      }
    });
  }

  confirmReservation(reservationId: string): void {
    if (confirm('Are you sure you want to confirm this reservation?')) {
      this.updateReservationStatus(reservationId, 'confirmed');
    }
  }

  cancelReservation(reservationId: string): void {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.updateReservationStatus(reservationId, 'cancelled');
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return this.reservationService.formatDate(new Date(date));
  }

  getTotalRevenue(): number {
    return this.getFilteredReservations()
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((total, r) => total + r.totalPrice, 0);
  }

  getTotalReservations(): number {
    return this.getFilteredReservations().length;
  }

  getPendingReservations(): number {
    return this.getFilteredReservations().filter(r => r.status === 'pending').length;
  }
}

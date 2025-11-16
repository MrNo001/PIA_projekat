import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation/reservation.service';
import { UserService } from '../../services/user/user.service';
import { CottageService } from '../../services/cottage/cottage.service';
import { Reservation } from '../../services/reservation/reservation.service';
import { NavBarComponent } from '../../common_templates/nav-bar/nav-bar.component';
import { Cottage } from '../../_models/cottage';
import { ReservationCalendarComponent } from './reservation-calendar.component';
import { ReservationModalComponent } from './reservation-modal.component';

@Component({
  selector: 'app-owner-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent, ReservationCalendarComponent, ReservationModalComponent],
  templateUrl: './owner-reservations.component.html',
  styleUrl: './owner-reservations.component.css'
})
export class OwnerReservationsComponent implements OnInit {

  private reservationService = inject(ReservationService);
  private userService = inject(UserService);
  private cottageService = inject(CottageService);
  private router = inject(Router);

  reservations: Reservation[] = [];
  loading: boolean = false;
  error: string = '';
  currentUser: any = null;
  userCottages: any[] = [];
  selectedCottage: string = 'all';
  statusFilter: string = 'all';
  
  selectedReservation: Reservation | null = null;
  selectedReservationId: string | null = null;
  showModal: boolean = false;

  ngOnInit(): void {
    const username = this.userService.getAuthUsername();
    const role = this.userService.getAuthRole();
    if (!username) {
      this.router.navigate(['/login']);
      return;
    }

    if (role !== 'owner') {
      this.router.navigate(['/profile']);
      return;
    }

    this.userService.getUser(username).subscribe({
      next: (user) => {
        this.currentUser = user || { username };
        this.loadUserCottages();
      },
      error: () => {
        this.currentUser = { username };
        this.loadUserCottages();
      }
    });
  }

  loadUserCottages(): void {
    this.cottageService.getCottagesByOwnerUsername(this.currentUser.username).subscribe({
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

    const cottageIds = this.userCottages.map(cottage => cottage._id);
    
    if (cottageIds.length === 0) {
      this.loading = false;
      return;
    }

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

    if (this.selectedCottage !== 'all') {
      filtered = filtered.filter(r => r.cottageId === this.selectedCottage);
    }

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
      case 'expired': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      case 'completed': return 'Completed';
      case 'expired': return 'Expired';
      default: return status;
    }
  }

  updateReservationStatus(reservationId: string, newStatus: string): void {
    this.reservationService.updateReservationStatus(reservationId, newStatus).subscribe({
      next: (response) => {
        console.log('Status updated successfully:', response);
        this.loadReservations(); 
        this.closeModal();
        if (this.selectedReservationId === reservationId) {
          this.selectedReservationId = null;
          this.selectedReservation = null;
        }
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

  rejectReservation(reservationId: string): void {
    if (confirm('Are you sure you want to reject this reservation?')) {
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

  onReservationClick(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.selectedReservationId = reservation._id || null;
    this.showModal = true;
  }

  selectReservationFromList(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.selectedReservationId = reservation._id || null;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedReservation = null;
    this.selectedReservationId = null;
  }

  onConfirmReservation(reservationId: string): void {
    this.updateReservationStatus(reservationId, 'confirmed');
  }

  onCancelReservation(reservationId: string): void {
    this.updateReservationStatus(reservationId, 'cancelled');
  }

  getSelectedCottage(): Cottage | null {
    if (!this.selectedReservation) return null;
    return this.userCottages.find(c => c._id === this.selectedReservation?.cottageId) || null;
  }
}

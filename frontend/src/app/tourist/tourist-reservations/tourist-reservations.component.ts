import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation/reservation.service';
import { RatingService } from '../../services/rating/rating.service';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';
import { StarRatingComponent } from '../../common_templates/star-rating/star-rating.component';
import { NavBarComponent } from '../../common_templates/nav-bar/nav-bar.component';
import { Reservation } from '../../services/reservation/reservation.service';
import { Rating } from '../../_models/rating';
import { ReservationDetailModalComponent } from './reservation-detail-modal.component';

@Component({
  selector: 'app-tourist-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, StarRatingComponent, NavBarComponent, ReservationDetailModalComponent],
  templateUrl: './tourist-reservations.component.html',
  styleUrl: './tourist-reservations.component.css'
})
export class TouristReservationsComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private ratingService = inject(RatingService);
  private userService = inject(UserService);
  private router = inject(Router);

  currentReservations: Reservation[] = [];
  archivedReservations: Reservation[] = [];
  
  loading: boolean = false;
  error: string = '';
  currentUser: any = null;

  // Rating form
  showRatingForm: boolean = false;
  selectedReservation: Reservation | null = null;
  ratingForm = {
    rating: 0,
    comment: ''
  };

  // Detail modal
  showDetailModal: boolean = false;
  selectedDetailReservation: Reservation | null = null;

  ngOnInit(): void {
    // Check if user is logged in and is a tourist
    const username = this.userService.getAuthUsername();
    const role = this.userService.getAuthRole();
    if (!username) {
      this.router.navigate(['/login']);
      return;
    }

    // Use role from token first to avoid null access
    if (role !== 'tourist') {
      this.router.navigate(['/profile']);
      return;
    }

    // Optionally fetch full user object (not strictly needed for reservations)
    this.userService.getUser(username).subscribe({
      next: (user) => {
        this.currentUser = user || { username };
        this.loadReservations();
      },
      error: () => {
        // Proceed with username from token even if fetching user fails
        this.currentUser = { username };
        this.loadReservations();
      }
    });
  }

  loadReservations(): void {
    this.loading = true;
    this.error = '';

    // Load current reservations
    this.reservationService.getCurrentReservations(this.currentUser.username).subscribe({
      next: (reservations) => {
        this.currentReservations = reservations;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load current reservations:', err);
        this.error = 'Failed to load current reservations. Please try again.';
        this.loading = false;
      }
    });

    // Load archived reservations
    this.reservationService.getArchivedReservations(this.currentUser.username).subscribe({
      next: (reservations) => {
        this.archivedReservations = reservations;
      },
      error: (err) => {
        console.error('Failed to load archived reservations:', err);
        this.error = 'Failed to load archived reservations. Please try again.';
      }
    });
  }


  canCancelReservation(reservation: Reservation): boolean {
    const now = new Date();
    const startDate = new Date(reservation.startDate);
    const daysUntilStart = Math.ceil((startDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
    return daysUntilStart >= 1;
  }

  cancelReservation(reservation: Reservation): void {
    if (confirm(`Are you sure you want to cancel your reservation for "${(reservation.cottageId as any).Title}"?`)) {
      if (!reservation._id) {
        this.error = 'Invalid reservation ID';
        return;
      }

      this.reservationService.cancelReservation(reservation._id, this.currentUser.username).subscribe({
        next: (response) => {
          console.log('Reservation cancelled successfully:', response);
          this.loadReservations(); // Reload reservations to reflect changes
        },
        error: (err) => {
          console.error('Failed to cancel reservation:', err);
          this.error = err.error?.message || 'Failed to cancel reservation. Please try again.';
        }
      });
    }
  }

  canRateReservation(reservation: Reservation): boolean {
    return reservation.status === 'completed' && !reservation.rating;
  }

  hasRating(reservation: Reservation): boolean {
    return !!reservation.rating;
  }

  getRating(reservation: Reservation): Rating | null {
    return reservation.rating || null;
  }

  openRatingForm(reservation: Reservation): void {
    this.selectedReservation = reservation;
    this.showRatingForm = true;
    this.ratingForm = {
      rating: 0,
      comment: ''
    };
  }

  closeRatingForm(): void {
    this.showRatingForm = false;
    this.selectedReservation = null;
    this.ratingForm = {
      rating: 0,
      comment: ''
    };
  }

  submitRating(): void {
    if (!this.selectedReservation || this.ratingForm.rating === 0) {
      return;
    }

    const ratingData = {
      reservationId: this.selectedReservation._id!,
      rating: this.ratingForm.rating,
      comment: this.ratingForm.comment
    };

    this.ratingService.createOrUpdateRating(ratingData).subscribe({
      next: (response) => {
        console.log('Rating saved successfully:', response);
        this.closeRatingForm();
        this.loadReservations(); // Reload reservations to get updated ratings
      },
      error: (err) => {
        console.error('Failed to save rating:', err);
        this.error = 'Failed to save rating. Please try again.';
      }
    });
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('sr-RS');
  }

  getCottageImageUrl(photoPath: string): string {
    if (!photoPath) return '/media/default-house.png';
    return `http://localhost:4000/uploads/cottage_photos/${photoPath}`;
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    // Use a data URL to prevent infinite loops
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    // Remove the error handler to prevent infinite loops
    target.onerror = null;
  }

  getCottageTitle(reservation: Reservation): string {
    return (reservation.cottageId as any)?.Title || 'Unknown Cottage';
  }

  getCottagePhotos(reservation: Reservation): string[] {
    return (reservation.cottageId as any)?.Photos || [];
  }

  getCottageLocation(reservation: Reservation): { lat: number, lng: number } {
    return (reservation.cottageId as any)?.Location || { lat: 0, lng: 0 };
  }

  openDetailModal(reservation: Reservation): void {
    this.selectedDetailReservation = reservation;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedDetailReservation = null;
  }
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reservation } from '../../services/reservation/reservation.service';

@Component({
  selector: 'app-reservation-detail-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-detail-modal.component.html',
  styleUrl: './reservation-detail-modal.component.css'
})
export class ReservationDetailModalComponent {
  @Input() reservation: Reservation | null = null;
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('sr-RS', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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

  getCottageTitle(reservation: Reservation): string {
    return (reservation.cottageId as any)?.Title || 'Unknown Cottage';
  }

  getCottageImageUrl(photoPath: string): string {
    if (!photoPath) return '/media/default-house.png';
    return `http://localhost:4000/uploads/cottage_photos/${photoPath}`;
  }

  getCottagePhotos(reservation: Reservation): string[] {
    return (reservation.cottageId as any)?.Photos || [];
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    target.onerror = null;
  }
}


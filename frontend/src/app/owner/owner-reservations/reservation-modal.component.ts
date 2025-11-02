import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reservation } from '../../services/reservation/reservation.service';
import { Cottage } from '../../_models/cottage';

@Component({
  selector: 'app-reservation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-modal.component.html',
  styleUrl: './reservation-modal.component.css'
})
export class ReservationModalComponent {
  @Input() reservation: Reservation | null = null;
  @Input() cottage: Cottage | null = null;
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<string>();

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  confirmReservation(): void {
    if (this.reservation?._id) {
      this.confirm.emit(this.reservation._id);
    }
  }

  cancelReservation(): void {
    if (this.reservation?._id) {
      this.cancel.emit(this.reservation._id);
    }
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
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
}

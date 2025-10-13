import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReservationData } from '../../_models/reservation';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation/reservation.service';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-confirm-reservation',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './confirm-reservation.component.html',
  styleUrl: './confirm-reservation.component.css'
})
export class ConfirmReservationComponent implements OnInit {
  @Input() reservationData!: ReservationData;
  @Output() reservationComplete = new EventEmitter<boolean>();

  cardNumber: string = '**** **** **** 1234';
  specialRequests: string = '';
  termsAccepted: boolean = false;
  isSubmitting: boolean = false;
  submitError: string = '';

  constructor(
    private reservationService: ReservationService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    // Initialize with user's credit card if available
    if (this.userService.currentUser?.creditCard) {
      this.cardNumber = this.userService.currentUser.creditCard;
    }
  }

  get nights(): number {
    return this.reservationService.calculateNights(this.reservationData.startDate, this.reservationData.endDate);
  }

  get totalPrice(): number {
    return this.reservationService.calculateTotalPrice(this.nights, 85); // 85€ per night - you might want to get this from cottage data
  }

  get formattedPeriod(): string {
    return `${this.reservationService.formatDate(this.reservationData.startDate)} - ${this.reservationService.formatDate(this.reservationData.endDate)}`;
  }

  get formattedGuests(): string {
    return `${this.reservationData.adults} odraslih, ${this.reservationData.children} dece`;
  }

  validateCard(): boolean {
    // Simple validation - in a real app, use a proper validation library
    return this.cardNumber.replace(/\s+/g, '').length === 16;
  }

  completeReservation(): void {
    if (!this.termsAccepted) {
      this.submitError = 'Morate prihvatiti uslove rezervacije';
      return;
    }

    if (!this.validateCard()) {
      this.submitError = 'Neispravan broj kreditne kartice';
      return;
    }

    if (!this.userService.loggedIn || !this.userService.currentUser) {
      this.submitError = 'Morate biti prijavljeni da biste napravili rezervaciju';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const reservationRequest = {
      cottageId: this.reservationData.cottageId,
      userId: this.userService.currentUser._id,
      startDate: this.reservationData.startDate,
      endDate: this.reservationData.endDate,
      adults: this.reservationData.adults,
      children: this.reservationData.children,
      specialRequests: this.specialRequests
    };

    this.reservationService.createReservation(reservationRequest).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.reservationComplete.emit(true);
        // Navigate to success page or back to home
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.submitError = error.error?.message || 'Greška pri kreiranju rezervacije';
        console.error('Reservation error:', error);
      }
    });
  }
}

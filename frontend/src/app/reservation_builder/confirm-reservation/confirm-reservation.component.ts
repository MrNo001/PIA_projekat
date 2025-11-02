import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ReservationData } from '../../_models/reservation';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../services/reservation/reservation.service';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Cottage } from '../../_models/cottage';
import { CottageService } from '../../services/cottage/cottage.service';


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

  cardNumber: string = '';
  specialRequests: string = '';
  isSubmitting: boolean = false;
  submitError: string = '';
  currentUser: any = null;
  cottage: Cottage | null = null;

  constructor(
    private reservationService: ReservationService,
    private userService: UserService,
    private cottageService: CottageService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user is logged in
    const username = localStorage.getItem('key');
    if (!username) {
      this.router.navigate(['/login']);
      return;
    }

    // Load cottage data if not provided
    if (this.reservationData.cottage) {
      this.cottage = this.reservationData.cottage;
    } else if (this.reservationData.cottageId) {
      this.cottageService.getById(this.reservationData.cottageId).subscribe({
        next: (cottage) => {
          this.cottage = cottage;
        },
        error: (err) => {
          console.error('Failed to fetch cottage:', err);
        }
      });
    }

    // Fetch user details to get credit card
    this.userService.getUser(username).subscribe({
      next: (user) => {
        this.currentUser = user;
        if (user.creditCard) {
          this.cardNumber = user.creditCard;
        } else {
          this.cardNumber = '**** **** **** 1234';
        }
      },
      error: (err) => {
        console.error('Failed to fetch user:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  get nights(): number {
    return this.reservationService.calculateNights(this.reservationData.startDate, this.reservationData.endDate);
  }

  getPricePerNight(): number {
    if (!this.cottage) return 85;
    const startMonth = new Date(this.reservationData.startDate).getMonth() + 1; // 1-12
    // Months 5,6,7,8 are summer (May, June, July, August)
    const isSummer = startMonth >= 5 && startMonth <= 8;
    return isSummer ? (this.cottage.PriceSummer || 85) : (this.cottage.PriceWinter || 100);
  }

  get totalPrice(): number {
    const pricePerNight = this.getPricePerNight();
    const basePrice = pricePerNight * this.nights;
    // Price is proportional to number of adults (e.g., 1 adult = 100%, 2 adults = 150%, 3+ adults = 200%)
    let multiplier = 1;
    if (this.reservationData.adults === 1) {
      multiplier = 1;
    } else if (this.reservationData.adults === 2) {
      multiplier = 1.5;
    } else {
      multiplier = 2;
    }
    return Math.round(basePrice * multiplier);
  }

  get formattedPeriod(): string {
    return `${this.reservationService.formatDate(this.reservationData.startDate)} - ${this.reservationService.formatDate(this.reservationData.endDate)}`;
  }

  get formattedGuests(): string {
    return `${this.reservationData.adults} odraslih, ${this.reservationData.children} dece`;
  }

  validateCard(): boolean {
    // Simple validation - in a real app, use a proper validation library
    // return this.cardNumber.replace(/\s+/g, '').length === 16;
    return true;
  }

  completeReservation(): void {
    if (!this.validateCard()) {
      this.submitError = 'Neispravan broj kreditne kartice';
      return;
    }

    if (!this.currentUser) {
      this.submitError = 'Morate biti prijavljeni da biste napravili rezervaciju';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    const reservationRequest = {
      cottageId: this.reservationData.cottageId,
      userUsername: this.currentUser.username,
      startDate: new Date(this.reservationData.startDate),
      endDate: new Date(this.reservationData.endDate),
      adults: this.reservationData.adults,
      children: this.reservationData.children,
      specialRequests: this.specialRequests
    };
    
    console.log('Sending reservation request:', reservationRequest);

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

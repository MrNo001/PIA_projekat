import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ReservationData } from '../../_models/reservation';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CottageService } from '../../services/cottage/cottage.service';
import { Cottage } from '../../_models/cottage';
import { ReservationService } from '../../services/reservation/reservation.service';

@Component({
  selector: 'app-build-reservation',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './build-reservation.component.html',
  styleUrl: './build-reservation.component.css'
})
export class BuildReservationComponent implements OnInit {

  @Output() reservationData = new EventEmitter<ReservationData>();
  @Output() validationStatus = new EventEmitter<boolean>();

  cottageId: string = '';
  cottage: Cottage = new Cottage();
  startDate: Date = new Date();
  endDate: Date = new Date();

  minStartDate: Date = new Date();
  minEndDate: Date = new Date();

  adults: number = 2;
  children: number = 0;
  isValid: boolean = false;
  validationError: string = '';

  constructor(
    private route: ActivatedRoute,
    private cottageService: CottageService,
    private reservationService: ReservationService
  ) {
    this.startDate.setDate(this.startDate.getDate() + 3);
    this.endDate.setDate(this.startDate.getDate() + 2);
  }

  ngOnInit() {
    this.cottageId = this.route.snapshot.paramMap.get('CottageId') || '';
    if (this.cottageId) {
      this.loadCottageDetails();
    }
  }

  loadCottageDetails() {
    this.cottageService.getById(this.cottageId).subscribe((data: Cottage) => {
      this.cottage = data;
    });
  }

  validateDates(): boolean {
    const validation = this.reservationService.validateReservationDates(this.startDate, this.endDate);
    if (!validation.isValid) {
      this.validationError = validation.error || '';
      return false;
    }
    return true;
  }

  validateGuests(): boolean {
    const validation = this.reservationService.validateGuestCount(this.adults, this.children);
    if (!validation.isValid) {
      this.validationError = validation.error || '';
      return false;
    }
    return true;
  }

  validateForm(): boolean {
    this.validationError = '';
    const datesValid = this.validateDates();
    const guestsValid = this.validateGuests();
    this.isValid = datesValid && guestsValid;
    this.validationStatus.emit(this.isValid);
    return this.isValid;
  }

  updateReservationData() {
    this.validateForm();
  }

  continueToConfirmation() {
    if (this.validateForm()) {
      const reservationData: ReservationData = {
        cottageId: this.cottageId,
        cottage: this.cottage, 
        startDate: this.startDate,
        endDate: this.endDate,
        adults: this.adults,
        children: this.children
      };
      this.reservationData.emit(reservationData);
    }
  }

  get nights(): number {
    return this.reservationService.calculateNights(this.startDate, this.endDate);
  }

  getPricePerNight(): number {
    const startMonth = new Date(this.startDate).getMonth() + 1; // 1-12
    const isSummer = startMonth >= 5 && startMonth <= 8;
    return isSummer ? (this.cottage.PriceSummer || 85) : (this.cottage.PriceWinter || 100);
  }

  get totalPrice(): number {
    const pricePerNight = this.getPricePerNight();
    const basePrice = pricePerNight * this.nights;
    let multiplier = 1;
    if (this.adults === 1) {
      multiplier = 1;
    } else if (this.adults === 2) {
      multiplier = 1.5;
    } else {
      multiplier = 2;
    }
    return Math.round(basePrice * multiplier);
  }

  get formattedPeriod(): string {
    return `${this.reservationService.formatDate(this.startDate)} - ${this.reservationService.formatDate(this.endDate)}`;
  }

}

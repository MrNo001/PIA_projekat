import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ReservationData } from '../../_models/reservation';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { VikendicaService } from '../../services/vikendica/vikendica.service';
import { Vikendica } from '../../_models/vikendica';
import { ReservationService } from '../../services/reservation/reservation.service';

@Component({
  selector: 'app-build-reservation',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './build-reservation.component.html',
  styleUrls: ['./build-reservation.component.css']
})
export class BuildReservationComponent implements OnInit {

  @Output() reservationData = new EventEmitter<ReservationData>();
  @Output() validationStatus = new EventEmitter<boolean>();

  cottageId: string = '';
  cottage: Vikendica = new Vikendica();
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
    private vikendicaService: VikendicaService,
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
    this.vikendicaService.getById(this.cottageId).subscribe((data: Vikendica) => {
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
    if (this.validateForm()) {
      const reservationData: ReservationData = {
        cottageId: this.cottageId,
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

  get totalPrice(): number {
    return this.reservationService.calculateTotalPrice(this.nights, this.cottage.PriceSummer || 85);
  }

  get formattedPeriod(): string {
    return `${this.reservationService.formatDate(this.startDate)} - ${this.reservationService.formatDate(this.endDate)}`;
  }

}

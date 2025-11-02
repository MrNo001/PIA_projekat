import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Reservation } from '../../services/reservation/reservation.service';
import { Cottage } from '../../_models/cottage';

@Component({
  selector: 'app-reservation-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservation-calendar.component.html',
  styleUrl: './reservation-calendar.component.css'
})
export class ReservationCalendarComponent implements OnInit {
  @Input() reservations: Reservation[] = [];
  @Input() cottages: Cottage[] = [];
  @Input() selectedReservationId: string | null = null;
  @Output() reservationClick = new EventEmitter<Reservation>();

  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  
  calendarDays: Date[] = [];
  weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  ngOnInit(): void {
    this.generateCalendar();
  }

  ngOnChanges(): void {
    this.generateCalendar();
  }

  generateCalendar(): void {
    this.calendarDays = [];
    
    // Get first day of month and calculate starting date
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const startDate = new Date(firstDay);
    
    // Adjust to start from Monday
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - daysToSubtract);
    
    // Generate 35 days (5 weeks)
    for (let i = 0; i < 35; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      this.calendarDays.push(date);
    }
  }

  getReservationsForDate(date: Date): Reservation[] {
    return this.reservations.filter(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      
      return date >= startDate && date <= endDate;
    });
  }

  isReservationStart(reservation: Reservation, date: Date): boolean {
    const startDate = new Date(reservation.startDate);
    return startDate.toDateString() === date.toDateString();
  }

  isReservationEnd(reservation: Reservation, date: Date): boolean {
    const endDate = new Date(reservation.endDate);
    return endDate.toDateString() === date.toDateString();
  }

  getCottageName(cottageId: string): string {
    const cottage = this.cottages.find(c => c._id === cottageId);
    return cottage ? cottage.Title : 'Unknown Cottage';
  }

  getReservationColor(reservation: Reservation): string {
    // Generate consistent colors based on cottage ID
    const colors = ['#ffc107', '#28a745', '#dc3545', '#17a2b8', '#6f42c1', '#fd7e14'];
    const cottageIndex = this.cottages.findIndex(c => c._id === reservation.cottageId);
    return colors[cottageIndex % colors.length];
  }

  isReservationSelected(reservation: Reservation): boolean {
    return this.selectedReservationId === reservation._id;
  }

  getReservationClasses(reservation: Reservation, date: Date): string {
    const classes = ['reservation-bar'];
    if (this.isReservationSelected(reservation)) {
      classes.push('selected');
    }
    // Add status-based classes
    classes.push(`status-${reservation.status}`);
    // Add start/end classes for proper rounding
    if (this.isReservationStart(reservation, date)) {
      classes.push('reservation-start');
    }
    if (this.isReservationEnd(reservation, date)) {
      classes.push('reservation-end');
    }
    return classes.join(' ');
  }

  onReservationClick(reservation: Reservation, event: Event): void {
    event.stopPropagation();
    this.reservationClick.emit(reservation);
  }

  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth;
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
  }

  getMonthYearString(): string {
    return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }

  getDateString(date: Date | string | undefined): string {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return `${dayNames[dateObj.getDay()]} ${monthNames[dateObj.getMonth()]} ${dateObj.getDate()}`;
  }
}

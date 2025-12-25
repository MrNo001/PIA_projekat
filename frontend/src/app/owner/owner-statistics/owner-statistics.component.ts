import { Component, OnInit, OnDestroy, inject, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { CottageService } from '../../services/cottage/cottage.service';
import { ReservationService } from '../../services/reservation/reservation.service';
import { NavBarComponent } from '../../common_templates/nav-bar/nav-bar.component';

// Chart.js imports
import {
  Chart,
  ChartConfiguration,
  ChartData,
  ChartType,
  registerables
} from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-owner-statistics',
  standalone: true,
  imports: [CommonModule, NavBarComponent],
  templateUrl: './owner-statistics.component.html',
  styleUrl: './owner-statistics.component.css'
})
export class OwnerStatisticsComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('monthlyBookingsChart') monthlyBookingsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('weekendWeekdayChart') weekendWeekdayChartRef!: ElementRef<HTMLCanvasElement>;

  private userService = inject(UserService);
  private cottageService = inject(CottageService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  currentUser: any = null;
  userCottages: any[] = [];
  allReservations: any[] = [];
  loading: boolean = false;
  error: string = '';

  monthlyBookingsChart: Chart | null = null;
  weekendWeekdayChart: Chart | null = null;

  private dataLoaded: boolean = false;
  private viewInitialized: boolean = false;

  ngOnInit(): void {
    const username = this.userService.getAuthUsername();
    const role = this.userService.getAuthRole();
    const token = localStorage.getItem('key');
    
    if (!username || !token) {
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
        // Ensure username is set
        if (!this.currentUser.username) {
          this.currentUser.username = username;
        }
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        // Still try to load data with username from token
        this.currentUser = { username };
        this.loadData();
      }
    });
  }

  ngAfterViewInit(): void {
    console.log('ngAfterViewInit called');
    this.viewInitialized = true;
    this.checkAndCreateCharts();
  }

  loadData(): void {
    // Check if token exists before making request
    const token = localStorage.getItem('key');
    if (!token) {
      console.error('No authentication token found');
      this.error = 'Authentication required. Please log in again.';
      this.loading = false;
      this.router.navigate(['/login']);
      return;
    }

    // Prevent multiple simultaneous requests
    if (this.loading) {
      return;
    }

    this.loading = true;
    this.error = '';

    if (!this.currentUser || !this.currentUser.username) {
      console.error('No username available');
      this.error = 'User information not available.';
      this.loading = false;
      return;
    }

    this.cottageService.getCottagesByOwnerUsername(this.currentUser.username).subscribe({
      next: (cottages) => {
        this.userCottages = cottages;
        this.loadReservations();
      },
      error: (err) => {
        console.error('Failed to load cottages:', err);
        if (err.status === 401) {
          this.error = 'Authentication failed. Please log in again.';
          localStorage.removeItem('key');
          this.userService.loggedIn = false;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.error = 'Failed to load cottage data.';
        }
        this.loading = false;
      }
    });
  }

  loadReservations(): void {
    const cottageIds = this.userCottages.map(cottage => cottage._id);
    
    console.log('Number of cottages:', this.userCottages.length);
    console.log('Cottage IDs:', cottageIds);
    
    if (cottageIds.length === 0) {
      console.log('No cottages found, skipping reservations');
      this.loading = false;
      return;
    }

    Promise.all(
      cottageIds.map(cottageId => 
        this.reservationService.getCottageReservations(cottageId).toPromise()
      )
    ).then(results => {
      this.allReservations = results.flat().filter(r => r !== undefined);
      console.log('Loaded reservations:', this.allReservations.length);
      console.log('Reservations data:', this.allReservations);
      this.loading = false;
      this.dataLoaded = true;
      this.checkAndCreateCharts();
    }).catch(err => {
      console.error('Failed to load reservations:', err);
      this.error = 'Failed to load reservation data.';
      this.loading = false;
    });
  }

  checkAndCreateCharts(): void {
    console.log('checkAndCreateCharts called - dataLoaded:', this.dataLoaded, 'viewInitialized:', this.viewInitialized);
    if (this.dataLoaded && this.viewInitialized) {
      console.log('Both conditions met, triggering change detection and creating charts');
      this.cdr.detectChanges();
      setTimeout(() => {
        this.createCharts();
      }, 0);
    } else {
      console.log('Waiting for conditions to be met');
    }
  }

  createCharts(): void {
    console.log('Creating charts...');
    console.log('Monthly chart ref:', this.monthlyBookingsChartRef);
    console.log('Weekend chart ref:', this.weekendWeekdayChartRef);
    this.createMonthlyBookingsChart();
    this.createWeekendWeekdayChart();
  }

  createMonthlyBookingsChart(): void {
    console.log('createMonthlyBookingsChart called');
    if (!this.monthlyBookingsChartRef) {
      console.log('Monthly chart ref not available');
      return;
    }

    const ctx = this.monthlyBookingsChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.log('Could not get 2d context');
      return;
    }

    if (this.monthlyBookingsChart) {
      this.monthlyBookingsChart.destroy();
    }

    const monthlyData = this.prepareMonthlyBookingsData();
    console.log('Monthly chart data:', monthlyData);
    
    const config: ChartConfiguration = {
      type: 'bar',
      data: monthlyData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Reservations by Month'
          },
          legend: {
            display: false
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Reservations'
            },
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    console.log('Creating monthly chart with config:', config);
    this.monthlyBookingsChart = new Chart(ctx, config);
    console.log('Monthly chart created:', this.monthlyBookingsChart);
  }

  createWeekendWeekdayChart(): void {
    console.log('createWeekendWeekdayChart called');
    if (!this.weekendWeekdayChartRef) {
      console.log('Weekend chart ref not available');
      return;
    }

    const ctx = this.weekendWeekdayChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      console.log('Could not get 2d context for weekend chart');
      return;
    }

    if (this.weekendWeekdayChart) {
      this.weekendWeekdayChart.destroy();
    }

    const weekendData = this.prepareWeekendWeekdayData();
    console.log('Weekend/Weekday chart data:', weekendData);
    
    const config: ChartConfiguration = {
      type: 'pie',
      data: weekendData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Weekend vs Weekday Reservations'
          },
          legend: {
            position: 'bottom',
          }
        }
      }
    };

    console.log('Creating weekend chart with config:', config);
    this.weekendWeekdayChart = new Chart(ctx, config);
    console.log('Weekend chart created:', this.weekendWeekdayChart);
  }

  prepareMonthlyBookingsData(): ChartData {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const monthlyCounts = new Array(12).fill(0);
    
    console.log('Preparing monthly data from', this.allReservations.length, 'reservations');
    
    this.allReservations.forEach(reservation => {
      const startDate = new Date(reservation.startDate);
      const monthIndex = startDate.getMonth();
      monthlyCounts[monthIndex]++;
    });

    console.log('Monthly counts:', monthlyCounts);

    return {
      labels: months,
      datasets: [{
        label: 'Reservations',
        data: monthlyCounts,
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2
      }]
    };
  }

  prepareWeekendWeekdayData(): ChartData {
    let weekendBookings = 0;
    let weekdayBookings = 0;

    console.log('Preparing weekend/weekday data from', this.allReservations.length, 'reservations');

    this.allReservations.forEach(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      
      let includesWeekend = false;
      let includesWeekday = false;
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) { // Fri, Sat, Sun
          includesWeekend = true;
        } else {
          includesWeekday = true;
        }
      }

      if (includesWeekend && includesWeekday) {
          weekendBookings++;
        weekdayBookings++;
      } else if (includesWeekend) {
        weekendBookings++;
      } else {
        weekdayBookings++;
      }
    });

    console.log('Weekend bookings:', weekendBookings, 'Weekday bookings:', weekdayBookings);

    return {
      labels: ['Weekend', 'Weekday'],
      datasets: [{
        data: [weekendBookings, weekdayBookings],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)'
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };
  }

  getColorForCottage(index: number, alpha: number = 1): string {
    const colors = [
      `rgba(54, 162, 235, ${alpha})`,   // Blue
      `rgba(255, 99, 132, ${alpha})`,   // Red
      `rgba(255, 205, 86, ${alpha})`,   // Yellow
      `rgba(75, 192, 192, ${alpha})`,   // Teal
      `rgba(153, 102, 255, ${alpha})`,  // Purple
      `rgba(255, 159, 64, ${alpha})`,   // Orange
      `rgba(199, 199, 199, ${alpha})`,  // Grey
      `rgba(83, 102, 255, ${alpha})`,   // Indigo
      `rgba(255, 99, 255, ${alpha})`,   // Pink
      `rgba(99, 255, 132, ${alpha})`    // Green
    ];
    return colors[index % colors.length];
  }

  getTotalBookings(): number {
    return this.allReservations.length;
  }

  getTotalRevenue(): number {
    return this.allReservations
      .filter(r => r.status === 'confirmed' || r.status === 'completed')
      .reduce((total, r) => total + r.totalPrice, 0);
  }

  getAverageBookingValue(): number {
    const confirmedReservations = this.allReservations.filter(
      r => r.status === 'confirmed' || r.status === 'completed'
    );
    if (confirmedReservations.length === 0) return 0;
    return this.getTotalRevenue() / confirmedReservations.length;
  }

  getTopPerformingCottage(): string {
    if (this.userCottages.length === 0) return 'No cottages';
    
    const cottageBookings = this.userCottages.map(cottage => ({
      name: cottage.Title,
      bookings: this.allReservations.filter(r => r.cottageId === cottage._id).length
    }));
    
    const topCottage = cottageBookings.reduce((prev, current) => 
      (prev.bookings > current.bookings) ? prev : current
    );
    
    return topCottage.name;
  }

  getPeakBookingMonth(): string {
    if (this.allReservations.length === 0) return 'No bookings';
    
    const monthCounts = new Array(12).fill(0);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    this.allReservations.forEach(reservation => {
      const startDate = new Date(reservation.startDate);
      const monthIndex = startDate.getMonth();
      monthCounts[monthIndex]++;
    });
    
    const maxIndex = monthCounts.indexOf(Math.max(...monthCounts));
    return monthNames[maxIndex];
  }

  getWeekendPreference(): number {
    if (this.allReservations.length === 0) return 0;
    
    let weekendBookings = 0;
    
    this.allReservations.forEach(reservation => {
      const startDate = new Date(reservation.startDate);
      const endDate = new Date(reservation.endDate);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) { // Fri, Sat, Sun
          weekendBookings++;
          break; // Count this reservation as weekend booking
        }
      }
    });
    
    return Math.round((weekendBookings / this.allReservations.length) * 100);
  }


  ngOnDestroy(): void {
    if (this.monthlyBookingsChart) {
      this.monthlyBookingsChart.destroy();
    }
    if (this.weekendWeekdayChart) {
      this.weekendWeekdayChart.destroy();
    }
  }
}

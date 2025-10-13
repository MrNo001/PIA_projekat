import { Component, OnInit, OnDestroy, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { VikendicaService } from '../services/vikendica/vikendica.service';
import { ReservationService } from '../services/reservation/reservation.service';
import { NavBarComponent } from '../nav-bar/nav-bar.component';

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
  private vikendicaService = inject(VikendicaService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  currentUser: any = null;
  userCottages: any[] = [];
  allReservations: any[] = [];
  loading: boolean = false;
  error: string = '';

  monthlyBookingsChart: Chart | null = null;
  weekendWeekdayChart: Chart | null = null;

  ngOnInit(): void {
    // Check if user is logged in and is an owner
    const username = localStorage.getItem('key');
    if (!username) {
      this.router.navigate(['/login']);
      return;
    }

    // Get current user details
    this.userService.getUser(username).subscribe({
      next: (user) => {
        this.currentUser = user;
        if (user.role !== 'owner') {
          this.router.navigate(['/profile']);
          return;
        }
        this.loadData();
      },
      error: (err) => {
        console.error('Failed to fetch user:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  ngAfterViewInit(): void {
    // Charts will be created after data is loaded
  }

  loadData(): void {
    this.loading = true;
    this.error = '';

    // Load user's cottages
    this.vikendicaService.getCottagesByOwner(this.currentUser._id).subscribe({
      next: (cottages) => {
        this.userCottages = cottages;
        this.loadReservations();
      },
      error: (err) => {
        console.error('Failed to load cottages:', err);
        this.error = 'Failed to load cottage data.';
        this.loading = false;
      }
    });
  }

  loadReservations(): void {
    const cottageIds = this.userCottages.map(cottage => cottage._id);
    
    if (cottageIds.length === 0) {
      this.loading = false;
      return;
    }

    // Get all reservations for user's cottages
    Promise.all(
      cottageIds.map(cottageId => 
        this.reservationService.getCottageReservations(cottageId).toPromise()
      )
    ).then(results => {
      this.allReservations = results.flat().filter(r => r !== undefined);
      this.loading = false;
      this.createCharts();
    }).catch(err => {
      console.error('Failed to load reservations:', err);
      this.error = 'Failed to load reservation data.';
      this.loading = false;
    });
  }

  createCharts(): void {
    this.createMonthlyBookingsChart();
    this.createWeekendWeekdayChart();
  }

  createMonthlyBookingsChart(): void {
    if (!this.monthlyBookingsChartRef) return;

    const ctx = this.monthlyBookingsChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.monthlyBookingsChart) {
      this.monthlyBookingsChart.destroy();
    }

    // Prepare data for monthly bookings
    const monthlyData = this.prepareMonthlyBookingsData();
    
    const config: ChartConfiguration = {
      type: 'bar',
      data: monthlyData,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Bookings by Cottage'
          },
          legend: {
            position: 'top',
          }
        },
        scales: {
          x: {
            stacked: false,
            title: {
              display: true,
              text: 'Month'
            }
          },
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Bookings'
            }
          }
        }
      }
    };

    this.monthlyBookingsChart = new Chart(ctx, config);
  }

  createWeekendWeekdayChart(): void {
    if (!this.weekendWeekdayChartRef) return;

    const ctx = this.weekendWeekdayChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (this.weekendWeekdayChart) {
      this.weekendWeekdayChart.destroy();
    }

    // Prepare data for weekend vs weekday bookings
    const weekendData = this.prepareWeekendWeekdayData();
    
    const config: ChartConfiguration = {
      type: 'pie',
      data: weekendData,
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Weekend vs Weekday Bookings by Cottage'
          },
          legend: {
            position: 'bottom',
          }
        }
      }
    };

    this.weekendWeekdayChart = new Chart(ctx, config);
  }

  prepareMonthlyBookingsData(): ChartData {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const datasets = this.userCottages.map((cottage, index) => {
      const monthlyCounts = new Array(12).fill(0);
      
      this.allReservations
        .filter(reservation => reservation.cottageId === cottage._id)
        .forEach(reservation => {
          const startDate = new Date(reservation.startDate);
          const monthIndex = startDate.getMonth();
          monthlyCounts[monthIndex]++;
        });

      return {
        label: cottage.Title,
        data: monthlyCounts,
        backgroundColor: this.getColorForCottage(index),
        borderColor: this.getColorForCottage(index, 0.8),
        borderWidth: 1
      };
    });

    return {
      labels: months,
      datasets: datasets
    };
  }

  prepareWeekendWeekdayData(): ChartData {
    const labels: string[] = [];
    const data: number[] = [];
    const backgroundColors: string[] = [];

    this.userCottages.forEach((cottage, cottageIndex) => {
      const cottageReservations = this.allReservations.filter(
        reservation => reservation.cottageId === cottage._id
      );

      let weekendBookings = 0;
      let weekdayBookings = 0;

      cottageReservations.forEach(reservation => {
        const startDate = new Date(reservation.startDate);
        const endDate = new Date(reservation.endDate);
        
        // Check if reservation includes weekend (Friday, Saturday, Sunday)
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
          // If reservation spans both weekend and weekday, count as both
          weekendBookings++;
          weekdayBookings++;
        } else if (includesWeekend) {
          weekendBookings++;
        } else {
          weekdayBookings++;
        }
      });

      if (weekendBookings > 0 || weekdayBookings > 0) {
        labels.push(`${cottage.Title} - Weekend`);
        labels.push(`${cottage.Title} - Weekday`);
        data.push(weekendBookings);
        data.push(weekdayBookings);
        backgroundColors.push(this.getColorForCottage(cottageIndex));
        backgroundColors.push(this.getColorForCottage(cottageIndex, 0.6));
      }
    });

    return {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: backgroundColors,
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

  getGrowthTrend(): string {
    if (this.allReservations.length === 0) return 'No data available';
    
    // Simple trend calculation based on recent vs older bookings
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    
    const recentBookings = this.allReservations.filter(r => 
      new Date(r.startDate) >= threeMonthsAgo
    ).length;
    
    const olderBookings = this.allReservations.filter(r => {
      const date = new Date(r.startDate);
      return date >= sixMonthsAgo && date < threeMonthsAgo;
    }).length;
    
    if (olderBookings === 0) return 'Growing';
    if (recentBookings > olderBookings) return 'Growing';
    if (recentBookings < olderBookings) return 'Declining';
    return 'Stable';
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

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CottageService } from '../services/cottage/cottage.service';
import { NavBarComponent } from '../common_templates/nav-bar/nav-bar.component';

interface Cottage {
  _id: string;
  Title: string;
  Description: string;
  OwnerUsername: string;
  Location: {
    lat: number;
    lng: number;
  };
  PriceSummer: number;
  PriceWinter: number;
  Photos: string[];
  Amenities?: {
    WiFi: boolean;
    Kitchen: boolean;
    Laundry: boolean;
    Parking: boolean;
    PetFriendly: boolean;
  };
  isBlocked: boolean;
  blockedUntil?: Date;
  lastThreeRatings: number[];
  averageRating: number;
  createdAt: Date;
}

@Component({
  selector: 'app-admin-cottages',
  standalone: true,
  imports: [CommonModule, FormsModule, NavBarComponent],
  templateUrl: './admin-cottages.component.html',
  styleUrl: './admin-cottages.component.css'
})
export class AdminCottagesComponent implements OnInit {

  private cottageService = inject(CottageService);
  private router = inject(Router);

  cottages: Cottage[] = [];
  filteredCottages: Cottage[] = [];
  loading: boolean = false;
  error: string = '';
  
  ratingFilter: string = 'all';
  statusFilter: string = 'all';
  searchTerm: string = '';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;

  ngOnInit(): void {
    this.loadCottages();
  }

  loadCottages(): void {
    this.loading = true;
    this.error = '';
    
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      ratingFilter: this.ratingFilter,
      statusFilter: this.statusFilter,
      search: this.searchTerm
    };

    this.cottageService.getAllCottagesAdmin(params).subscribe({
      next: (response) => {
        this.cottages = response.cottages.map((cottage: any) => ({
          ...cottage,
          createdAt: new Date(cottage.createdAt),
          blockedUntil: cottage.blockedUntil ? new Date(cottage.blockedUntil) : undefined
        }));
        this.filteredCottages = this.cottages;
        this.totalPages = response.pages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading cottages:', err);
        this.error = 'Failed to load cottages. Please try again.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadCottages();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  hasLowRatings(cottage: Cottage): boolean {
    if (!cottage.lastThreeRatings || cottage.lastThreeRatings.length === 0) {
      return false;
    }
    return cottage.lastThreeRatings.every(rating => rating < 3);
  }

  getRatingBadgeClass(cottage: Cottage): string {
    if (cottage.averageRating === -1) {
      return 'badge-secondary';
    } else if (this.hasLowRatings(cottage)) {
      return 'badge-danger';
    } else if (cottage.averageRating >= 4) {
      return 'badge-success';
    } else if (cottage.averageRating >= 3) {
      return 'badge-warning';
    } else {
      return 'badge-secondary';
    }
  }

  getRatingText(cottage: Cottage): string {
    if (cottage.averageRating === -1) {
      return 'No ratings yet';
    } else if (this.hasLowRatings(cottage)) {
      return 'Low Ratings';
    } else {
      return `${cottage.averageRating.toFixed(1)}/5`;
    }
  }

  getRowClass(cottage: Cottage): string {
    if (this.hasLowRatings(cottage)) {
      return 'table-danger';
    } else if (cottage.isBlocked) {
      return 'table-warning';
    }
    return '';
  }

  blockCottage(cottage: Cottage): void {
    const message = `Are you sure you want to temporarily block "${cottage.Title}" for 48 hours?`;
    
    if (confirm(message)) {
      this.cottageService.blockCottageAdmin(cottage._id, 48).subscribe({
        next: (response) => {
          console.log('Cottage blocked:', response);
          this.loadCottages();
        },
        error: (err) => {
          console.error('Error blocking cottage:', err);
          alert('Failed to block cottage. Please try again.');
        }
      });
    }
  }

  unblockCottage(cottage: Cottage): void {
    const message = `Are you sure you want to unblock "${cottage.Title}"?`;
    
    if (confirm(message)) {
      this.cottageService.unblockCottageAdmin(cottage._id).subscribe({
        next: (response) => {
          console.log('Cottage unblocked:', response);
          this.loadCottages();
        },
        error: (err) => {
          console.error('Error unblocking cottage:', err);
          alert('Failed to unblock cottage. Please try again.');
        }
      });
    }
  }

  viewCottage(cottage: Cottage): void {
    this.router.navigate(['/cottage', cottage._id]);
  }

  getCottageImageUrl(photoPath: string): string {
    if (!photoPath) return '/media/default-house.png';
    return `http://localhost:4000/uploads/cottage_photos/${photoPath}`;
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    target.onerror = null;
  }

  get paginatedCottages(): Cottage[] {
    return this.filteredCottages;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
          this.loadCottages(); 
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    const start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    const end = Math.min(this.totalPages, start + maxVisible - 1);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }

  getBlockedTimeRemaining(cottage: Cottage): string {
    if (!cottage.isBlocked || !cottage.blockedUntil) return '';
    
    const now = new Date();
    const blockedUntil = new Date(cottage.blockedUntil);
    const diffMs = blockedUntil.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  }
}

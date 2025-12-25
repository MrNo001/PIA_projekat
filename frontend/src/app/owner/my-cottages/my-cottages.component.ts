import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CottageService } from '../../services/cottage/cottage.service';
import { UserService } from '../../services/user/user.service';
import { Cottage } from '../../_models/cottage';
import { NavBarComponent } from '../../common_templates/nav-bar/nav-bar.component';

@Component({
  selector: 'app-my-cottages',
  standalone: true,
  imports: [CommonModule, RouterLink, NavBarComponent],
  templateUrl: './my-cottages.component.html',
  styleUrl: './my-cottages.component.css'
})
export class MyCottagesComponent implements OnInit {

  private cottageService = inject(CottageService);
  private userService = inject(UserService);
  private router = inject(Router);

  cottages: Cottage[] = [];
  loading: boolean = false;
  error: string = '';
  currentUser: any = null;

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
        this.loadCottages();
      },
      error: (err) => {
        console.error('Failed to load user:', err);
        // Still try to load data with username from token
        this.currentUser = { username };
        this.loadCottages();
      }
    });
  }

  loadCottages(): void {
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
        this.cottages = cottages;
        this.loading = false;
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
          this.error = 'Failed to load your cottages. Please try again.';
        }
        this.loading = false;
      }
    });
  }

  editCottage(cottageId: string): void {
    this.router.navigate(['/edit-cottage', cottageId]);
  }

  deleteCottage(cottageId: string, cottageTitle: string): void {
    if (confirm(`Are you sure you want to delete "${cottageTitle}"? This action cannot be undone.`)) {
      this.cottageService.deleteCottage(cottageId).subscribe({
        next: (response) => {
          console.log('Cottage deleted successfully:', response);
          this.loadCottages(); 
        },
        error: (err) => {
          console.error('Failed to delete cottage:', err);
          this.error = 'Failed to delete cottage. Please try again.';
        }
      });
    }
  }

  addNewCottage(): void {
    this.router.navigate(['/addCottage']);
  }

  viewCottage(cottageId: string): void {
    this.router.navigate(['/cottage', cottageId]);
  }

  getCottageImageUrl(photoPath: string): string {
    if (!photoPath) return '/media/default-house.png';
    // return `http://localhost:4000/uploads/cottage_photos/${photoPath}`;
    return `https://pia-projekat-backend.onrender.com/uploads/cottage_photos/${photoPath}`;
  }

  getStatusBadgeClass(cottage: Cottage): string {
    return 'badge-success';
  }

  getStatusText(cottage: Cottage): string {
    return 'Active';
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    target.onerror = null;
  }
}

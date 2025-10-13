import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VikendicaService } from '../services/vikendica/vikendica.service';
import { UserService } from '../services/user/user.service';
import { Vikendica } from '../_models/vikendica';

@Component({
  selector: 'app-my-cottages',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-cottages.component.html',
  styleUrl: './my-cottages.component.css'
})
export class MyCottagesComponent implements OnInit {

  private vikendicaService = inject(VikendicaService);
  private userService = inject(UserService);
  private router = inject(Router);

  cottages: Vikendica[] = [];
  loading: boolean = false;
  error: string = '';
  currentUser: any = null;

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
        this.loadCottages();
      },
      error: (err) => {
        console.error('Failed to fetch user:', err);
        this.router.navigate(['/login']);
      }
    });
  }

  loadCottages(): void {
    this.loading = true;
    this.error = '';

    this.vikendicaService.getCottagesByOwner(this.currentUser._id).subscribe({
      next: (cottages) => {
        this.cottages = cottages;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load cottages:', err);
        this.error = 'Failed to load your cottages. Please try again.';
        this.loading = false;
      }
    });
  }

  editCottage(cottageId: string): void {
    this.router.navigate(['/edit-cottage', cottageId]);
  }

  deleteCottage(cottageId: string, cottageTitle: string): void {
    if (confirm(`Are you sure you want to delete "${cottageTitle}"? This action cannot be undone.`)) {
      this.vikendicaService.deleteCottage(cottageId).subscribe({
        next: (response) => {
          console.log('Cottage deleted successfully:', response);
          this.loadCottages(); // Reload the list
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
    this.router.navigate(['/vikendica', cottageId]);
  }

  getCottageImageUrl(photoPath: string): string {
    if (!photoPath) return '/assets/default-house.png';
    return `http://localhost:4000${photoPath}`;
  }

  getStatusBadgeClass(cottage: Vikendica): string {
    // You can add status logic here based on cottage properties
    return 'badge-success';
  }

  getStatusText(cottage: Vikendica): string {
    // You can add status logic here
    return 'Active';
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/default-house.png';
  }
}

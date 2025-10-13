import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VikendicaService } from '../services/vikendica/vikendica.service';
import { UserService } from '../services/user/user.service';
import { Vikendica } from '../_models/vikendica';
import * as L from 'leaflet';

@Component({
  selector: 'app-edit-cottage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-cottage.component.html',
  styleUrl: './edit-cottage.component.css'
})
export class EditCottageComponent implements OnInit, AfterViewInit {
  
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;
  
  private vikendicaService = inject(VikendicaService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  cottage: Vikendica = new Vikendica();
  cottageId: string = '';
  
  // Form fields
  title: string = '';
  description: string = '';
  priceSummer: number = 0;
  priceWinter: number = 0;
  location = { lat: 44.7866, lng: 20.4489 }; // Default to Belgrade
  
  // File handling
  photos: File[] = [];
  existingPhotos: string[] = [];
  photosToDelete: string[] = [];
  
  // Map
  map: any;
  marker: any;
  
  // UI state
  loading: boolean = false;
  saving: boolean = false;
  error: string = '';
  success: string = '';

  ngOnInit(): void {
    this.cottageId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.cottageId) {
      this.router.navigate(['/my-cottages']);
      return;
    }
    
    this.loadCottage();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  loadCottage(): void {
    this.loading = true;
    this.vikendicaService.getById(this.cottageId).subscribe({
      next: (cottage) => {
        this.cottage = cottage;
        this.populateForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load cottage:', err);
        this.error = 'Failed to load cottage details.';
        this.loading = false;
      }
    });
  }

  populateForm(): void {
    this.title = this.cottage.Title || '';
    this.description = this.cottage.Description || '';
    this.priceSummer = this.cottage.PriceSummer || 0;
    this.priceWinter = this.cottage.PriceWinter || 0;
    this.location = {
      lat: this.cottage.Location?.lat || 44.7866,
      lng: this.cottage.Location?.lng || 20.4489
    };
    this.existingPhotos = this.cottage.Photos || [];
    
    // Update map if it exists
    if (this.map) {
      this.updateMapLocation();
    }
  }

  initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView([this.location.lat, this.location.lng], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marker = L.marker([this.location.lat, this.location.lng], { draggable: true })
      .addTo(this.map)
      .bindPopup('Cottage Location')
      .openPopup();

    this.marker.on('dragend', (e: any) => {
      const position = e.target.getLatLng();
      this.location.lat = position.lat;
      this.location.lng = position.lng;
    });

    this.map.on('click', (e: any) => {
      this.location.lat = e.latlng.lat;
      this.location.lng = e.latlng.lng;
      this.marker.setLatLng([this.location.lat, this.location.lng]);
    });
  }

  updateMapLocation(): void {
    if (this.map && this.marker) {
      this.map.setView([this.location.lat, this.location.lng], 10);
      this.marker.setLatLng([this.location.lat, this.location.lng]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    const files = Array.from(input.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== files.length) {
      this.error = 'Please select only image files.';
      return;
    }

    this.photos = [...this.photos, ...validFiles];
    this.error = '';
  }

  removeNewPhoto(index: number): void {
    this.photos.splice(index, 1);
  }

  removeExistingPhoto(photoPath: string): void {
    this.existingPhotos = this.existingPhotos.filter(p => p !== photoPath);
    this.photosToDelete.push(photoPath);
  }

  validateForm(): boolean {
    if (!this.title.trim()) {
      this.error = 'Title is required.';
      return false;
    }
    if (!this.description.trim()) {
      this.error = 'Description is required.';
      return false;
    }
    if (this.priceSummer <= 0) {
      this.error = 'Summer price must be greater than 0.';
      return false;
    }
    if (this.priceWinter <= 0) {
      this.error = 'Winter price must be greater than 0.';
      return false;
    }
    if (this.existingPhotos.length + this.photos.length === 0) {
      this.error = 'At least one photo is required.';
      return false;
    }
    return true;
  }

  saveCottage(): void {
    if (!this.validateForm()) {
      return;
    }

    this.saving = true;
    this.error = '';
    this.success = '';

    const username = localStorage.getItem('key');
    if (!username) {
      this.error = 'User not authenticated.';
      this.saving = false;
      return;
    }

    const formData = new FormData();
    formData.append('Title', this.title);
    formData.append('Description', this.description);
    formData.append('PriceSummer', this.priceSummer.toString());
    formData.append('PriceWinter', this.priceWinter.toString());
    formData.append('lat', this.location.lat.toString());
    formData.append('lng', this.location.lng.toString());
    formData.append('OwnerUsername', username);
    formData.append('cottageId', this.cottageId);

    // Add new photos
    this.photos.forEach(photo => {
      formData.append('photos', photo);
    });

    // Add photos to delete
    this.photosToDelete.forEach(photoPath => {
      formData.append('photosToDelete', photoPath);
    });

    // Add existing photos to keep
    this.existingPhotos.forEach(photoPath => {
      formData.append('existingPhotos', photoPath);
    });

    this.vikendicaService.updateCottage(formData).subscribe({
      next: (response) => {
        this.success = 'Cottage updated successfully!';
        this.saving = false;
        setTimeout(() => {
          this.router.navigate(['/my-cottages']);
        }, 2000);
      },
      error: (err) => {
        console.error('Update error:', err);
        this.error = 'Failed to update cottage. Please try again.';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/my-cottages']);
  }

  getPhotoUrl(photoPath: string): string {
    return `http://localhost:4000${photoPath}`;
  }

  getPhotoPreview(file: File): string {
    return URL.createObjectURL(file);
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/default-house.png';
  }
}

import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CottageService } from '../../services/cottage/cottage.service';
import { UserService } from '../../services/user/user.service';
import * as L from 'leaflet';
import { Cottage } from '../../_models/cottage';

@Component({
  selector: 'app-edit-cottage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-cottage.component.html',
  styleUrl: './edit-cottage.component.css'
})
export class EditCottageComponent implements OnInit, AfterViewInit {
  
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;
  
  private cottageService = inject(CottageService);
  private userService = inject(UserService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  cottage: Cottage = new Cottage();
  cottageId: string = '';
  
  title: string = '';
  description: string = '';
  priceSummer: number = 0;
  priceWinter: number = 0;  
  location = { lat: 44.7866, lng: 20.4489 }; 
  
  photos: File[] = [];
  existingPhotos: string[] = []; 
  originalPhotos: string[] = []; 
  photosToDelete: string[] = [];
  photoBlobUrls: Map<File, string> = new Map(); 
      
  map: any;
  marker: any;
  
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
  }

  loadCottage(): void {
    this.loading = true;
    this.cottageService.getById(this.cottageId).subscribe({
      next: (cottage:Cottage) => {
        this.cottage = cottage;
        this.populateForm();
        this.loading = false;
        
        setTimeout(() => {
          if (!this.map && this.mapContainer) {
            this.initMap();
          } else if (this.map) {
            this.updateMapLocation();
          }
        }, 100);
      },
      error: (err:Error) => {
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
    this.originalPhotos = [...this.cottage.Photos || []]; 
    
    if (this.map) {
      this.updateMapLocation();
    }
  }

  initMap(): void {
    if (!this.mapContainer || !this.mapContainer.nativeElement) {
      console.error('Map container not found');
      return;
    }

    try {
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
    } catch (error) {
      console.error('Error initializing map:', error);
    }
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
    const file = this.photos[index];
    const blobUrl = this.photoBlobUrls.get(file);
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      this.photoBlobUrls.delete(file);
    }
    this.photos.splice(index, 1);
  }

  removeExistingPhoto(photoPath: string): void {
    this.existingPhotos = this.existingPhotos.filter(p => p !== photoPath);
    if (!this.photosToDelete.includes(photoPath)) {
      this.photosToDelete.push(photoPath);
    }
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

    const username = this.userService.getAuthUsername();
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

    this.photos.forEach(photo => {
      formData.append('photos', photo);
    });

    this.photosToDelete.forEach(photoPath => {
      formData.append('photosToDelete', photoPath);
    });

    this.originalPhotos.forEach(photoPath => {
      formData.append('existingPhotos', photoPath);
    });

    this.cottageService.updateCottage(formData).subscribe({
      next: (response) => {
        this.success = 'Cottage updated successfully!';
        this.saving = false;
        setTimeout(() => {
          this.router.navigate(['/my-cottages']);
        }, 2000);
      },
      error: (err) => {
        console.error('Failed to update cottage:', err);
        this.error = 'Failed to update cottage. Please try again.';
        this.saving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/my-cottages']);
  }

  getPhotoUrl(photoPath: string): string {
    if (!photoPath) return '/media/default-house.png';
    const filename = photoPath.includes('/') ? photoPath.split('/').pop() : photoPath;
    return `http://localhost:4000/uploads/cottage_photos/${filename}`;
  }

  getPhotoPreview(file: File): string {
    if (this.photoBlobUrls.has(file)) {
      return this.photoBlobUrls.get(file)!;
    }
    const blobUrl = URL.createObjectURL(file);
    this.photoBlobUrls.set(file, blobUrl);
    return blobUrl;
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;    
    target.onerror = null;
  }
}

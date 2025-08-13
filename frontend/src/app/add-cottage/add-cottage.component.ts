// add-cottage.component.ts
import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';
import { VikendicaService } from '../services/vikendica/vikendica.service';

@Component({
  selector: 'app-add-cottage',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-cottage.component.html',
  styleUrls: ['./add-cottage.component.css']
})
export class AddCottageComponent implements AfterViewInit {
  title: string = '';
  description: string = '';
  priceSummer: number | null = null;
  priceWinter: number | null = null;
  photos: File[] = [];
  location: { lat: number, lng: number } = { lat: 0, lng: 0 };
  mapInitialized: boolean = false;
  formSubmitted: boolean = false;

  private map!: L.Map;
  private marker!: L.Marker;

  @ViewChild('map') mapContainer!: ElementRef;

  vikendicaService = inject(VikendicaService);

  ngAfterViewInit() {
    // Initialize the map with a slight delay to ensure DOM is ready
    setTimeout(() => this.initializeMap(), 100);
  }

  initializeMap() {


    // Default to Belgrade coordinates
    const defaultLat = 44.8176;
    const defaultLng = 20.4569;

    this.map = L.map('map').setView([defaultLat, defaultLng], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Add initial marker
    this.marker = L.marker([defaultLat, defaultLng]).addTo(this.map)
      .bindPopup('Cottage location')
      .openPopup();

    // Handle map clicks
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.location = { lat, lng };

      // Update marker position
      this.marker.setLatLng([lat, lng])
        .bindPopup(`Selected location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        .openPopup();
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      this.map.invalidateSize();
    });

    this.mapInitialized = true;
  }

  onFilesSelected(event: Event) {
    console.log(this.photos);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      // Clear existing photos if needed
      this.photos = [];

      // Add new photos (limit to 5)
      const filesToAdd = Math.min(input.files.length, 5);
      for (let i = 0; i < filesToAdd; i++) {
        this.photos.push(input.files[i]);
      }
    }
  }

  removePhoto(index: number) {
    this.photos.splice(index, 1);
    // Refresh the map after DOM update
    setTimeout(() => this.map.invalidateSize(), 0);
  }

  submitCottage() {
    this.formSubmitted = true;

    // Basic validation
    if (!this.title || !this.description || this.priceSummer === null ||
        this.priceSummer < 1 || this.priceWinter === null || this.priceWinter === null || this.photos.length === 0 ||
        this.location.lat === 0 || this.location.lng === 0) {
      return;
    }

    let Owner = localStorage.getItem("key");
    if(!Owner){console.log("Error cant find user");return;}

    const formData = new FormData();
    formData.append('Title', this.title);
    formData.append('Description', this.description);
    formData.append('PriceSummer', this.priceSummer.toString());
    formData.append('PriceWinter',this.priceWinter.toString())
    formData.append('lat', this.location.lat.toString());
    formData.append('lng', this.location.lng.toString());
    formData.append('OwnerUsername',Owner);

    this.photos.forEach(photo => {
      formData.append('photos', photo);
    });


    this.vikendicaService.insertCottage(formData).subscribe({
      next: (response: any) => {
      console.log(response);
    },
    error: (error) => {
      console.error('Registration error:', error);
    }
    });
    // In a real app, you would send formData to your backend
    console.log('Submitting cottage:', {
      title: this.title,
      description: this.description,
      priceSummer: this.priceSummer,
      priceWinter: this.priceWinter,
      location: this.location,
      photos: this.photos.map(p => p.name)
    });

    // Show success message
    alert('Cottage submitted successfully!');

    // Reset form after successful submission
    this.resetForm();
  }

  resetForm() {
    this.title = '';
    this.description = '';
    this.priceSummer = null;
    this.priceWinter = null;
    this.photos = [];
    this.location = { lat: 0, lng: 0 };

    this.formSubmitted = false;

    // Reset map to default position
    const defaultLat = 44.8176;
    const defaultLng = 20.4569;
    this.map.setView([defaultLat, defaultLng], 8);
    this.marker.setLatLng([defaultLat, defaultLng])
      .bindPopup('Cottage location')
      .openPopup();
  }
}

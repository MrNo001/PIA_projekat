
import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';
import { CottageService } from '../services/cottage/cottage.service';

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
  amenities: {
    WiFi: boolean;
    Kitchen: boolean;
    Laundry: boolean;
    Parking: boolean;
    PetFriendly: boolean;
  } = {
    WiFi: false,
    Kitchen: false,
    Laundry: false,
    Parking: false,
    PetFriendly: false
  };

  private map!: L.Map;
  private marker!: L.Marker;

  @ViewChild('map') mapContainer!: ElementRef;

  cottageService = inject(CottageService);
  private router = inject(Router);

  ngAfterViewInit() {
    setTimeout(() => this.initializeMap(), 100);
  }

  initializeMap() {


    const defaultLat = 44.8176;
    const defaultLng = 20.4569;

    this.map = L.map('map').setView([defaultLat, defaultLng], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.marker = L.marker([defaultLat, defaultLng]).addTo(this.map)
      .bindPopup('Cottage location')
      .openPopup();

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.location = { lat, lng };

      this.marker.setLatLng([lat, lng])
        .bindPopup(`Selected location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        .openPopup();
    });

    window.addEventListener('resize', () => {
      this.map.invalidateSize();
    });

    this.mapInitialized = true;
  }

  onFilesSelected(event: Event) {
    console.log(this.photos);
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.photos = [];

      const filesToAdd = Math.min(input.files.length, 5);
      for (let i = 0; i < filesToAdd; i++) {
        this.photos.push(input.files[i]);
      }
    }
  }

  onJsonFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const jsonContent = JSON.parse(e.target.result);
          this.importCottageData(jsonContent);
          
          input.value = '';
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          alert('Error parsing JSON file. Please check the file format.');
        }
      };

      reader.readAsText(file);
    }
  }

  importCottageData(data: any) {
    if (data.title) {
      this.title = data.title;
    }

    if (data.description) {
      this.description = data.description;
    }

    if (data.priceSummer !== undefined && data.priceSummer !== null) {
      this.priceSummer = data.priceSummer;
    }
    if (data.priceWinter !== undefined && data.priceWinter !== null) {
      this.priceWinter = data.priceWinter;
    }

    if (data.location && data.location.lat && data.location.lng) {
      this.location = {
        lat: data.location.lat,
        lng: data.location.lng
      };

      if (this.map && this.marker) {
        this.map.setView([data.location.lat, data.location.lng], 13);
        this.marker.setLatLng([data.location.lat, data.location.lng])
          .bindPopup(`Imported location: ${data.location.lat.toFixed(4)}, ${data.location.lng.toFixed(4)}`)
          .openPopup();
        
        setTimeout(() => this.map.invalidateSize(), 100);
      }
    }

    if (data.amenities) {
      if (data.amenities.WiFi !== undefined) this.amenities.WiFi = data.amenities.WiFi;
      if (data.amenities.Kitchen !== undefined) this.amenities.Kitchen = data.amenities.Kitchen;
      if (data.amenities.Laundry !== undefined) this.amenities.Laundry = data.amenities.Laundry;
      if (data.amenities.Parking !== undefined) this.amenities.Parking = data.amenities.Parking;
      if (data.amenities.PetFriendly !== undefined) this.amenities.PetFriendly = data.amenities.PetFriendly;
    }

    alert('Cottage data imported successfully! Please add photos before submitting.');
  }

  removePhoto(index: number) {
    this.photos.splice(index, 1);
    setTimeout(() => this.map.invalidateSize(), 0);
  }

  submitCottage() {
    this.formSubmitted = true;

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
    formData.append('Amenities', JSON.stringify(this.amenities));

    this.photos.forEach(photo => {
      formData.append('photos', photo);
    });


    this.cottageService.insertCottage(formData).subscribe({
      next: (response: any) => {
        console.log(response);
        alert('Cottage submitted successfully!');
        this.router.navigate(['/my-cottages']);
      },
      error: (error) => {
        console.error('Inserting error:', error);
        alert('Failed to submit cottage. Please try again.');
      }
    });
  }

  resetForm() {
    this.title = '';
    this.description = '';
    this.priceSummer = null;
    this.priceWinter = null;
    this.photos = [];
    this.location = { lat: 0, lng: 0 };
    this.amenities = {
      WiFi: false,
      Kitchen: false,
      Laundry: false,
      Parking: false,
      PetFriendly: false
    };

    this.formSubmitted = false;

    const defaultLat = 44.8176;
    const defaultLng = 20.4569;
    this.map.setView([defaultLat, defaultLng], 8);
    this.marker.setLatLng([defaultLat, defaultLng])
      .bindPopup('Cottage location')
      .openPopup();
  }
}

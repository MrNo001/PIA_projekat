import { AfterViewInit, Component, inject, Input,ViewChild,ElementRef, OnInit } from '@angular/core';
import { Cottage } from '../_models/cottage';
import { CottageService } from '../services/cottage/cottage.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { UserService } from '../services/user/user.service';
import { User } from '../_models/user';
import { CommonModule } from '@angular/common';
import { RatingService } from '../services/rating/rating.service';
import { StarRatingComponent } from '../common_templates/star-rating/star-rating.component';

@Component({
  selector: 'app-cottage-details',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './cottage-details.component.html',
  styleUrl: './cottage-details.component.css'
})
export class CottageDetailsComponent implements OnInit, AfterViewInit {

  cottage:Cottage=new Cottage();
  owner: User | null = null;
  ratings: any[] = [];
  ratingUsers: Map<string, User> = new Map();
  currentUser: User | null = null;
  private map: L.Map | null = null;

  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  cottageService = inject(CottageService);
  route = inject(ActivatedRoute);
  userService= inject(UserService) ;
  router = inject(Router)
  ratingService = inject(RatingService)

  initMap() {
    if (!this.mapContainer || !this.cottage.Location) {
      return;
    }

    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(this.mapContainer.nativeElement, {
      preferCanvas: false
    }).setView(
      [this.cottage.Location.lat, this.cottage.Location.lng],
      14
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    L.marker([this.cottage.Location.lat, this.cottage.Location.lng])
      .addTo(this.map)
      .bindPopup(this.cottage.Title);

    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
    
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 500);

    window.addEventListener('resize', () => {
      if (this.map) {
        setTimeout(() => {
          this.map?.invalidateSize();
        }, 100);
      }
    });
  }

  ngOnInit(){
    const username = this.userService.getAuthUsername();
    if (username) {
      this.userService.getUser(username).subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: (err) => {
          console.error('Error fetching current user:', err);
        }
      });
    }

    const id = this.route.snapshot.paramMap.get('id');
    this.cottageService.getById(id || undefined).subscribe((data:Cottage) => {
      this.cottage = data; 
      console.log('Cottage data received:', data);
      console.log('Amenities:', this.cottage.Amenities);
      
      if (!this.cottage.Amenities && (data as any).amenities) {
        this.cottage.Amenities = (data as any).amenities;
      }
      
      setTimeout(() => {
        this.initMap();
      }, 300);
      
      if (this.cottage.OwnerUsername) {
        this.userService.getUser(this.cottage.OwnerUsername).subscribe({
          next: (owner) => {
            this.owner = owner;
          },
          error: (err) => {
            console.error('Error fetching owner details:', err);
          }
        });
      }

      if (this.cottage._id) {
        this.ratingService.getCottageRatings(this.cottage._id).subscribe({
          next: (ratings) => {
            this.ratings = ratings;
            console.log(this.ratings);
            ratings.forEach((rating: any) => {
              if (rating.userUsername) {
                this.userService.getUser(rating.userUsername).subscribe({
                  next: (user) => {
                    this.ratingUsers.set(rating.userUsername, user);
                  },
                  error: (err) => {
                    console.error('Error fetching user details:', err);
                  }
                });
              }
            });
          },
          error: (err) => {
            console.error('Error fetching ratings:', err);
          }
        });
      }
    });
  }

  BookCottage(){
    if(!this.userService.loggedIn){
      console.log(this.userService.loggedIn);
      this.router.navigate(["/login"])
    }
    this.router.navigate(["/makeReservation/",this.cottage._id]);
  }

  handleImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    target.onerror = null;
  }

  getUserForRating(username: string): User | null {
    return this.ratingUsers.get(username) || null;
  }

  formatDate(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  getCurrentSeasonPrice(): number {
    const currentMonth = new Date().getMonth() + 1; 
    const isSummer = currentMonth >= 5 && currentMonth <= 8;
    return isSummer ? this.cottage.PriceSummer : this.cottage.PriceWinter;
  }

  getCurrentSeason(): string {
    const currentMonth = new Date().getMonth() + 1;
    const isSummer = currentMonth >= 5 && currentMonth <= 8;
    return isSummer ? 'Summer' : 'Winter';
  }

  isTourist(): boolean {
    return this.currentUser?.role === 'tourist';
  }

  ngAfterViewInit() {
    if (this.cottage && this.cottage.Location && this.mapContainer) {
      setTimeout(() => {
        this.initMap();
      }, 100);
    }
  }

  hasAmenities(): boolean {
    return this.cottage.Amenities !== undefined && this.cottage.Amenities !== null;
  }
}


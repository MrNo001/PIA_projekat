import { Component,inject,Input, OnInit } from '@angular/core';
import { Cottage } from '../_models/cottage';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user/user.service';
import { StarRatingComponent } from '../common_templates/star-rating/star-rating.component';


@Component({
  selector: 'app-cottage_card',
  standalone: true,
  imports: [CommonModule, StarRatingComponent],
  templateUrl: './cottage_card.component.html',
  styleUrl: './cottage_card.component.css'
})
export class CottageCardComponent implements OnInit {

   @Input() cottage: Cottage = new Cottage();
   @Input() compact: boolean = false; 
   @Input() minimal: boolean = false;
   @Input() selected: boolean = false;
   private router = inject(Router);
   private userService = inject(UserService);

    photo:string = "";
    isLoggedIn: boolean = false;


   ngOnInit(): void {
       this.photo = this.cottage.Photos[0];
       this.isLoggedIn = this.userService.isLoggedIn();
   }

   getStarRatingDisplay(): string {
     if (this.cottage.Ocena === -1) {
       return 'No ratings';
     }
     const roundedRating = Math.round(this.cottage.Ocena);
     return `${roundedRating}-⭐`;
   }

   showDetails(event?: Event){
      if (event) {
        event.stopPropagation();
      }
      this.router.navigate(["cottage/",this.cottage._id]);
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

}

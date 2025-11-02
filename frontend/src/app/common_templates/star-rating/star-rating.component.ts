import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrl: './star-rating.component.css'
})
export class StarRatingComponent implements OnInit {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() readonly: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  @Output() ratingChange = new EventEmitter<number>();

  stars: number[] = [];

  ngOnInit() {
    this.stars = Array(this.maxRating).fill(0).map((_, i) => i + 1);
  }

  onStarClick(star: number) {
    if (!this.readonly) {
      this.rating = star;
      this.ratingChange.emit(this.rating);
    }
  }

  onStarHover(star: number) {
    if (!this.readonly) {
      // Optional: Add hover effect
    }
  }

  getStarClass(star: number): string {
    const baseClass = 'star';
    const sizeClass = `star-${this.size}`;
    const filledClass = star <= this.rating ? 'star-filled' : 'star-empty';
    return `${baseClass} ${sizeClass} ${filledClass}`;
  }
}

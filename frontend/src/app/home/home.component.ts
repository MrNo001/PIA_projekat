import { Component, inject, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Cottage } from '../_models/cottage';
import { CottageService } from '../services/cottage/cottage.service';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CottageCardComponent } from '../cottage_card/cottage_card.component';
import { NavBarComponent } from '../common_templates/nav-bar/nav-bar.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NavBarComponent,CottageCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  @ViewChild('cottagesScrollContainer', { static: false }) cottagesScrollContainer!: ElementRef<HTMLDivElement>;

  Cottages:Cottage[] = [];
  all_cottages:Cottage[] = [];
  cottageService = inject(CottageService);

  searchField = 'title';
  searchTerm = '';
  filtersApplied = false;

  sortField = 'title';
  sortDirection: 'asc' | 'desc' = 'asc';

  @Output() search = new EventEmitter<{ field: string, term: string }>();

  onSearch() {
    this.search.emit({ field: this.searchField, term: this.searchTerm });
    this.applySearchFilter();
  }

  applySearchFilter() {
    if (!this.searchTerm.trim()) {
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    
    if (!this.filtersApplied) {
      // First search - filter from all cottages
      this.Cottages = this.all_cottages.filter(cottage => {
        const fieldValue = this.getFieldValue(cottage, this.searchField);
        return fieldValue.toLowerCase().includes(searchTermLower);
      });
    } else {
      // Subsequent search - filter from already filtered cottages
      this.Cottages = this.Cottages.filter(cottage => {
        const fieldValue = this.getFieldValue(cottage, this.searchField);
        return fieldValue.toLowerCase().includes(searchTermLower);
      });
    }
    
    this.filtersApplied = true;
    this.sortCottages();
  }

  getFieldValue(cottage: Cottage, field: string): string {
    switch (field) {
      case 'title':
        return cottage.Title || '';
      case 'description':
        return cottage.Description || '';
      case 'location':
        return cottage.Location.lat.toString() + ', ' + cottage.Location.lng.toString();
      default:
        return '';
    }
  }

  clearFilters() {
    this.Cottages = [...this.all_cottages];
    this.searchTerm = '';
    this.filtersApplied = false;
    this.sortCottages();
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    this.sortCottages();
  }

  sortCottages() {
    this.Cottages.sort((a, b) => {
      let comparison = 0;
      
      switch (this.sortField) {
        case 'title':
          comparison = a.Title.localeCompare(b.Title);
          break;
        case 'price':
          comparison = (a.PriceSummer || 0) - (b.PriceSummer || 0);
          break;
        case 'rating':
          comparison = (a.Ocena || 0) - (b.Ocena || 0);
          break;
        case 'location':
          const aLoc = `${a.Location.lat},${a.Location.lng}`;
          const bLoc = `${b.Location.lat},${b.Location.lng}`;
          comparison = aLoc.localeCompare(bLoc);
          break;
        default:
          comparison = 0;
      }
      
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  onSortFieldChange() {
    this.sortCottages();
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    const scrollContainer = this.cottagesScrollContainer?.nativeElement;
    if (scrollContainer) {
      event.preventDefault();
      event.stopPropagation();
      scrollContainer.scrollLeft += event.deltaY*4;
    }
  }

  ngOnInit(){
    this.cottageService.GetAllV_().subscribe(data => {
      this.all_cottages = data;
      this.Cottages = [...this.all_cottages];
      this.sortCottages();
      console.log(this.Cottages);
    });
  }


}

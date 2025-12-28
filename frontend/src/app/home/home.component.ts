import { Component, inject, OnInit, ViewChild, ElementRef, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { Cottage } from '../_models/cottage';
import { CottageService } from '../services/cottage/cottage.service';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CottageCardComponent } from '../cottage_card/cottage_card.component';
import { NavBarComponent } from '../common_templates/nav-bar/nav-bar.component';
import * as L from 'leaflet';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NavBarComponent,CottageCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('cottagesScrollContainer', { static: false }) cottagesScrollContainer!: ElementRef<HTMLDivElement>;

  Cottages:Cottage[] = [];
  all_cottages:Cottage[] = [];
  cottageService = inject(CottageService);

  searchField = 'title';
  searchTerm = '';
  filtersApplied = false;

  sortOption: 'title_asc' | 'title_desc' | 'price_asc' | 'price_desc' | 'rating_asc' | 'rating_desc' = 'title_asc';

  scrollMode: 'vertical' | 'horizontal' = 'vertical';

  mapExpanded = false;
  selectedCottageId: string | undefined;
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

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
      this.Cottages = this.all_cottages.filter(cottage => {
        const fieldValue = this.getFieldValue(cottage, this.searchField);
        return fieldValue.toLowerCase().includes(searchTermLower);
      });
    } else {
      this.Cottages = this.Cottages.filter(cottage => {
        const fieldValue = this.getFieldValue(cottage, this.searchField);
        return fieldValue.toLowerCase().includes(searchTermLower);
      });
    }
    
    this.filtersApplied = true;
    this.sortCottages();
    this.updateMapIfVisible();
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
    this.updateMapIfVisible();
  }

  sortCottages() {
    const [fieldRaw, dirRaw] = this.sortOption.split('_');
    const field = fieldRaw as 'title' | 'price' | 'rating';
    const isAsc = dirRaw === 'asc';

    this.Cottages.sort((a, b) => {
      let comparison = 0;
      
      switch (field) {
        case 'title':
          comparison = a.Title.localeCompare(b.Title);
          break;
        case 'price':
          const currentPriceA = this.getCurrentSeasonPrice(a);
          const currentPriceB = this.getCurrentSeasonPrice(b);
          comparison = currentPriceA - currentPriceB;
          break;
        case 'rating':
          comparison = (a.Ocena || 0) - (b.Ocena || 0);
          break;
        default:
          comparison = 0;
      }
      
      return isAsc ? comparison : -comparison;
    });
  }

  getCurrentSeasonPrice(cottage: Cottage): number {
    const month = new Date().getMonth() + 1;
    return (month >= 6 && month <= 8) ? cottage.PriceSummer : cottage.PriceWinter;
  }

  onSortChange() {
    this.sortCottages();
    this.updateMapIfVisible();
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (this.scrollMode !== 'horizontal') return;

    const scrollContainer = this.cottagesScrollContainer?.nativeElement;
    if (scrollContainer) {
      if (!scrollContainer.contains(event.target as Node)) return;
      event.preventDefault();
      event.stopPropagation();
      scrollContainer.scrollLeft += event.deltaY*4;
    }
  }

  setScrollMode(mode: 'vertical' | 'horizontal') {
    this.scrollMode = mode;
  }

  toggleMap() {
    this.mapExpanded = !this.mapExpanded;
    if (this.mapExpanded) {
      setTimeout(() => this.initializeMap(), 100);
    } else {
      this.destroyMap();
      this.selectedCottageId = undefined;
    }
  }

  updateMapIfVisible() {
    if (this.mapExpanded && this.map) {
      this.destroyMap();
      setTimeout(() => this.initializeMap(), 100);
    }
  }

  initializeMap() {
    if (this.map) {
      this.destroyMap();
    }
    if (this.Cottages.length === 0) return;

    const firstCottage = this.Cottages[0];
    const defaultLat = firstCottage?.Location?.lat || 44.8176;
    const defaultLng = firstCottage?.Location?.lng || 20.4569;

    this.map = L.map('cottage-map').setView([defaultLat, defaultLng], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.markers = [];
    this.Cottages.forEach(cottage => {
      if (cottage.Location && cottage.Location.lat && cottage.Location.lng) {
        const price = this.getCurrentSeasonPrice(cottage);
        const marker = L.marker([cottage.Location.lat, cottage.Location.lng])
          .addTo(this.map!)
          .bindPopup(`<b>${cottage.Title}</b><br>€${price}/night`);
        
        marker.on('click', () => {
          this.selectCottage(cottage._id);
          this.scrollToCottage(cottage._id);
        });
        
        this.markers.push(marker);
      }
    });

    if (this.Cottages.length > 0) {
      const bounds = L.latLngBounds(this.Cottages
        .filter(c => c.Location && c.Location.lat && c.Location.lng)
        .map(c => [c.Location.lat, c.Location.lng] as [number, number]));
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  destroyMap() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markers = [];
    }
  }

  selectCottage(cottageId: string | undefined) {
    this.selectedCottageId = cottageId;
    if (cottageId && this.map) {
      const cottage = this.Cottages.find(c => c._id === cottageId);
      if (cottage && cottage.Location && cottage.Location.lat && cottage.Location.lng) {
        this.map.setView([cottage.Location.lat, cottage.Location.lng], 12);
        const marker = this.markers.find((m, idx) => this.Cottages[idx]._id === cottageId);
        if (marker) {
          marker.openPopup();
        }
      }
    }
  }

  scrollToCottage(cottageId: string | undefined) {
    if (!cottageId) return;
    
    const scrollContainer = this.cottagesScrollContainer?.nativeElement;
    if (!scrollContainer) return;

    const cardEl = scrollContainer.querySelector(`[data-cottage-id="${cottageId}"]`) as HTMLElement | null;
    if (!cardEl) return;

    cardEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
  }

  ngOnInit(){
    this.cottageService.GetAllV_().subscribe(data => {
      this.all_cottages = data;
      this.Cottages = [...this.all_cottages];
      this.sortCottages();
      console.log(this.Cottages);
    });
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.destroyMap();
  }

}

import { Component, OnInit } from '@angular/core';
import { Cottage } from '../../_models/cottage';
import { CottageService } from '../../services/cottage/cottage.service';

@Component({
  selector: 'app-explore-tourist',
  standalone: true,
  imports: [],
  templateUrl: './explore-tourist.component.html',
  styleUrl: './explore-tourist.component.css'
})
export class ExploreTouristComponent implements OnInit{

  searchText:string = "" ;

  allCottages:Cottage[] = [];

  visibleCottages:Cottage[] = [];

  constructor(private cottageService:CottageService){

  }

  ngOnInit(): void {
      this.getCottages();
  }

  Search():void{
    const text = this.searchText.trim().toLowerCase();
    this.visibleCottages = this.allCottages.filter(cottage => {
      return cottage.Title.toLowerCase().includes(text);
    })
  }

  getCottages():void{
    this.cottageService.GetAllV_().subscribe({
      next: (cottages) => {
        this.allCottages = cottages;
        this.visibleCottages = cottages;
      }
    });
  }

}

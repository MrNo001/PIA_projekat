import { Component, inject, OnInit } from '@angular/core';
import { Vikendica } from '../_models/vikendica';
import { VikendicaService } from '../services/vikendica/vikendica.service';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { VikendicaComponent } from "../vikendica_card/vikendica_card.component";
import { NavBarComponent } from '../nav-bar/nav-bar.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, VikendicaComponent, NavBarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  numOfCottages:number = 0;
  numOfOwners:number = 0;
  numOfTourists:number = 0;
  numOfReservationsLastDay:number = 0;
  numOfReservationsLastWeek:number = 0;
  numOfReservationsLastMonth:number = 0;

  Vikendice:Vikendica[] = [];
  vikendiceService = inject(VikendicaService);

  searchField = 'title';
  searchTerm = '';

  @Output() search = new EventEmitter<{ field: string, term: string }>();

  onSearch() {
    this.search.emit({ field: this.searchField, term: this.searchTerm });
  }

  ngOnInit(){
       this.vikendiceService.GetAllV_().subscribe(data=>{
      this.Vikendice = data;
      console.log(this.Vikendice);
    })
  }


}

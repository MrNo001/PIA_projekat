import { Component, OnInit } from '@angular/core';
import { Vikendica } from '../../_models/vikendica';
import { VikendicaService } from '../../services/vikendica/vikendica.service';

@Component({
  selector: 'app-explore-tourist',
  standalone: true,
  imports: [],
  templateUrl: './explore-tourist.component.html',
  styleUrl: './explore-tourist.component.css'
})
export class ExploreTouristComponent implements OnInit{

  searchText:string = "" ;

  SveVikendice:Vikendica[] = [];

  VidljiveVikendice:Vikendica[] = [];

  constructor(private vikendicaService:VikendicaService){

  }

  ngOnInit(): void {
      this.GetVikendice();
  }

  Search():void{
    const text = this.searchText.trim().toLowerCase();
    this.VidljiveVikendice = this.SveVikendice.filter(vikendica => {
      vikendica.Title.toLowerCase().includes(text);
    })
  }

  GetVikendice():void{
    this.vikendicaService.GetAllV_().subscribe({
      next: (vikendice) => {
        this.SveVikendice = vikendice;
        this.VidljiveVikendice = vikendice;
      }
    });
  }

}

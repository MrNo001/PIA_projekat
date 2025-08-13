import { Component, Inject, Input, OnInit } from '@angular/core';
import { Vikendica } from '../_models/vikendica';
import { VikendicaService } from '../services/vikendica/vikendica.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vikendica-details',
  standalone: true,
  imports: [],
  templateUrl: './vikendica-details.component.html',
  styleUrl: './vikendica-details.component.css'
})
export class VikendicaDetailsComponent implements OnInit {

  vikendica:Vikendica=new Vikendica();

  vikendicaService = Inject(VikendicaService);
  route = Inject(ActivatedRoute);

  ngOnInit(){
    const id = this.route.snapshot.paramMap.get('id');
    this.vikendicaService.getId().subscribe((data:Vikendica) => {this.vikendica = data;});
  }

}

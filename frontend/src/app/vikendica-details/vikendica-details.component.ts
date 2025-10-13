import { AfterViewInit, Component, inject, Input,ViewChild,ElementRef, OnInit } from '@angular/core';
import { Vikendica } from '../_models/vikendica';
import { VikendicaService } from '../services/vikendica/vikendica.service';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';
import { UserService } from '../services/user/user.service';
@Component({
  selector: 'app-vikendica-details',
  standalone: true,
  imports: [],
  templateUrl: './vikendica-details.component.html',
  styleUrl: './vikendica-details.component.css'
})
export class VikendicaDetailsComponent implements OnInit {

  vikendica:Vikendica=new Vikendica();

    @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  vikendicaService = inject(VikendicaService);
  route = inject(ActivatedRoute);
  userService= inject(UserService) ;
  router = inject(Router)

  initMap() {

    console.log(this.vikendica.Location.lat);
  const map = L.map(this.mapContainer.nativeElement).setView(
    [this.vikendica.Location.lat, this.vikendica.Location.lng],
    14
  );

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);

  L.marker([this.vikendica.Location.lat, this.vikendica.Location.lng])
    .addTo(map)
    .bindPopup(this.vikendica.Title);
}

  ngOnInit(){
    const id = this.route.snapshot.paramMap.get('id');
    this.vikendicaService.getById().subscribe((data:Vikendica) => {this.vikendica = data; console.log(this.vikendica); this.initMap()});
  }

  BookCottage(){
    if(!this.userService.loggedIn){
      this.router.navigate(["/login"])
    }
    this.router.navigate(["/makeReservation/",this.vikendica._id]);
  }

}

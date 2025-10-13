import { Component,inject,Input, OnInit } from '@angular/core';
import { Vikendica } from '../_models/vikendica';
import { Router } from '@angular/router';


@Component({
  selector: 'app-vikendica_card',
  standalone: true,
  imports: [],
  templateUrl: './vikendica_card.component.html',
  styleUrl: './vikendica_card.component.css'
})
export class VikendicaComponent implements OnInit {

   @Input() vikendica: Vikendica = new Vikendica();
  //constructor(private router: Router) {} // ✅ inject Router here
   private router = inject(Router);

    photo:string = "";


   ngOnInit(): void {
       console.log("hejjjjj");
       console.log(this.vikendica);
       this.photo = this.vikendica.Photos[0];
   }

   showDetails(){
      //this.router.navigate(["/vikendica"],{ queryParams: { id: this.vikendica._id } });
      this.router.navigate(["vikendica/",this.vikendica._id]);
   }

}

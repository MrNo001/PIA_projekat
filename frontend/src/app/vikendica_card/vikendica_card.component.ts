import { Component,inject,Input } from '@angular/core';
import { Vikendica } from '../_models/vikendica';
import { Router } from '@angular/router';


@Component({
  selector: 'app-vikendica_card',
  standalone: true,
  imports: [],
  templateUrl: './vikendica_card.component.html',
  styleUrl: './vikendica_card.component.css'
})
export class VikendicaComponent {

   @Input() vikendica: Vikendica = new Vikendica();
  //constructor(private router: Router) {} // ✅ inject Router here
   private router = inject(Router);

   showDetails(){
      this.router.navigate(["/vikendica",this.vikendica._id]);
   }

}

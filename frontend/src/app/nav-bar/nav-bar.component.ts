import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [],
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {

  @Input() activePage: string = '';
  @Input() userRole: string = '';
  @Input() isLoggedIn: boolean = localStorage.getItem("key")!=null;


  LogOut(){
    localStorage.removeItem("key");
    console.log("loged out");
  }
}

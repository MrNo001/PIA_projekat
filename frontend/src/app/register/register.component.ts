import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../_models/user';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  message:String = "";

  user:User = new User();
  selectedFile: File | null = null;


  register(){
    console.log("register");
  }

   onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

}

import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../_models/user';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../services/user/user.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule,RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  message:String = "";

  http = inject(HttpClient);

  userService = inject(UserService)

  user:User = new User();
  selectedFile: File | null = null;


   onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  register(){
    if(!this.selectedFile){
      this.message = "Please select an image";
      return;
    }


      this.userService.register(this.user,this.selectedFile).subscribe({
    next: (response: any) => {
      this.message = "Registration successful!";
      console.log(response);
    },
    error: (error) => {
      console.error('Registration error:', error);
      this.message = "Error during registration.";
    }
  });

  }

}

import { Component,inject } from '@angular/core';
import { routes } from '../app.routes';
import { RouterLink } from '@angular/router';
import { UserService } from '../services/user/user.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink,FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  userService= inject(UserService) ;

  username:string = "";
  password:string = "";

  message:string = "";

  Login(){
     this.userService.login(this.username,this.password).subscribe(
      {
        next: data => {
        if(data){
          localStorage.setItem("key",data);
          console.log("Login with "+data);
        }
        else{
          this.message = "Error";
        }
      },
      error: err => {
        this.message = "Error";
      }
      });
  }
}

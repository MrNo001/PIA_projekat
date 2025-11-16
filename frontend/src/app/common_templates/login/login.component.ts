import { Component,inject } from '@angular/core';
import { routes } from '../../app.routes';
import { RouterLink,Router } from '@angular/router';
import { UserService } from '../../services/user/user.service';
import { FormsModule } from '@angular/forms';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink,FormsModule,NavBarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {

  userService= inject(UserService) ;

  router = inject(Router);

  username:string = "";
  password:string = "";

  message:string = "";

  ngOnInit(): void {
    if(this.userService.loggedIn){
      this.router.navigate(["/profile"]);
    }
  }

  Login(){
     this.userService.login(this.username,this.password).subscribe(
      {
        next: data => {
        if(data){
          this.userService.loggedIn=true;
          localStorage.setItem("key",data);
          console.log("Login with "+data);
          
          this.userService.getUser(this.username).subscribe({
            next: (user) => {
              this.userService.currentUser = user;
              this.router.navigate(["/profile"]);
            },
            error: (err) => {
              console.error('Error fetching user details:', err);
              this.router.navigate(["/profile"]);
            }
          });
        }
        else{
          this.message = "Error";
        }
      },
      error: err => {
        if(err.status === 403 && err.error?.error){
          this.message = err.error.error;
        } else {
          this.message = "Invalid username or password";
        }
      }
      });
  }
}

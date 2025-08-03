import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';


export const routes: Routes = [
    {path: "register", component: RegisterComponent},
    {path: "",component:HomeComponent},
    {path: "login", component:LoginComponent}
];

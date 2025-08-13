import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { VikendicaDetailsComponent } from './vikendica-details/vikendica-details.component';
import { ProfileComponent } from './profile/profile.component';
import { AddCottageComponent } from './add-cottage/add-cottage.component';

export const routes: Routes = [
    {path: "register", component: RegisterComponent},
    {path: "",component:HomeComponent},
    {path: "login", component:LoginComponent},
    {path: "vikendica/:id",component:VikendicaDetailsComponent},
    {path:"profile",component:ProfileComponent},
    {path:"addCottage",component:AddCottageComponent}
]

import { Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { VikendicaDetailsComponent } from './vikendica-details/vikendica-details.component';
import { ProfileComponent } from './profile/profile.component';
import { AddCottageComponent } from './add-cottage/add-cottage.component';
import { MakeReservationComponent } from './make-reservation/make-reservation.component';
import { MyCottagesComponent } from './my-cottages/my-cottages.component';
import { EditCottageComponent } from './edit-cottage/edit-cottage.component';
import { OwnerDashboardComponent } from './owner-dashboard/owner-dashboard.component';
import { OwnerReservationsComponent } from './owner-reservations/owner-reservations.component';
import { OwnerStatisticsComponent } from './owner-statistics/owner-statistics.component';

export const routes: Routes = [
    {path: "register", component: RegisterComponent},
    {path: "",component:HomeComponent},
    {path: "login", component:LoginComponent},
    {path: "vikendica/:id",component:VikendicaDetailsComponent},
    {path:"profile",component:ProfileComponent},
    {path:"addCottage",component:AddCottageComponent},
    {path:"makeReservation/:CottageId",component:MakeReservationComponent},
    {path:"my-cottages",component:MyCottagesComponent},
    {path:"edit-cottage/:id",component:EditCottageComponent},
    {path:"owner-dashboard",component:OwnerDashboardComponent},
    {path:"owner-reservations",component:OwnerReservationsComponent},
    {path:"owner-statistics",component:OwnerStatisticsComponent}
]

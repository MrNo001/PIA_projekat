import { Routes } from '@angular/router';
import { RegisterComponent } from './common_templates/register/register.component';
import { LoginComponent } from './common_templates/login/login.component';
import { HomeComponent } from './home/home.component';
import { CottageDetailsComponent } from './cottage-details/cottage-details.component';
import { ProfileComponent } from './common_templates/profile/profile.component';
import { AddCottageComponent } from './add-cottage/add-cottage.component';
import { MakeReservationComponent } from './reservation_builder/make-reservation/make-reservation.component';
import { MyCottagesComponent } from './owner/my-cottages/my-cottages.component';
import { EditCottageComponent } from './owner/edit-cottage/edit-cottage.component';
import { OwnerDashboardComponent } from './owner/owner-dashboard/owner-dashboard.component';
import { OwnerReservationsComponent } from './owner/owner-reservations/owner-reservations.component';
import { OwnerStatisticsComponent } from './owner/owner-statistics/owner-statistics.component';
import { TouristReservationsComponent } from './tourist/tourist-reservations/tourist-reservations.component';
import { AdminDashboardComponent } from './administrator/admin-dashboard.component';
import { AdminUsersComponent } from './administrator/admin-users.component';
import { AdminEditUserComponent } from './administrator/admin-edit-user.component';
import { AdminRequestsComponent } from './administrator/admin-requests.component';
import { AdminCottagesComponent } from './administrator/admin-cottages.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

export const routes: Routes = [
    {path: "register", component: RegisterComponent},
    {path: "",component:HomeComponent},
    {path: "login", component:LoginComponent},
    {path: "cottage/:id",component:CottageDetailsComponent},
    {path:"profile",component:ProfileComponent},
    {path:"change-password",component:ChangePasswordComponent},
    {path:"addCottage",component:AddCottageComponent},
    {path:"makeReservation/:CottageId",component:MakeReservationComponent},
    {path:"my-cottages",component:MyCottagesComponent},
    {path:"edit-cottage/:id",component:EditCottageComponent},
    {path:"owner-dashboard",component:OwnerDashboardComponent},
    {path:"owner-reservations",component:OwnerReservationsComponent},
    {path:"owner-statistics",component:OwnerStatisticsComponent},
    {path:"reservations",component:TouristReservationsComponent},
    {path:"admin",component:AdminDashboardComponent},
    {path:"admin/users",component:AdminUsersComponent},
    {path:"admin/users/edit/:username",component:AdminEditUserComponent},
    {path:"admin/requests",component:AdminRequestsComponent},
    {path:"admin/cottages",component:AdminCottagesComponent}
]

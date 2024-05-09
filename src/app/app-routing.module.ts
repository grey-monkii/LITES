import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './admin/admin.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AuthenticationGuard } from '../assets/service/authentication.guard';
import { AnalyticsComponent } from './analytics/analytics.component';

import { HttpClientModule } from '@angular/common/http';
import { CardValComponent } from './card-val/card-val.component';

import { AddStudentComponent } from './add-student/add-student.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Assuming AppComponent is your main component
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthenticationGuard] },
  { path: 'home/cardValue', component: CardValComponent }, // Assuming AppComponent is your main component
  {path: 'analytics', component: AnalyticsComponent},
  { path: 'addStudent', component: AddStudentComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes),
            HttpClientModule],
  exports: [RouterModule]
  
})
export class AppRoutingModule { }

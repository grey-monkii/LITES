import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminComponent } from './admin/admin.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { AddResourceDialogComponent } from './add-resource-dialog/add-resource-dialog.component';

const routes: Routes = [
  { path: '', component: HomeComponent }, // Assuming AppComponent is your main component
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'add-resource', component: AddResourceDialogComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

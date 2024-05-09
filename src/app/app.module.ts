import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularFireModule } from "@angular/fire/compat";
import { AngularFireAuthModule } from "@angular/fire/compat/auth";
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';


import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { HomeComponent } from './home/home.component';
import { AddResourceDialogComponent } from './add-resource-dialog/add-resource-dialog.component';
import { UpdateDeleteComponent } from './update-delete/update-delete.component';
import { RecoveryDialogComponent } from './recovery-dialog/recovery-dialog.component';
import { CardValComponent } from './card-val/card-val.component';
import { BookInfoComponent } from './book-info/book-info.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DatePipe } from '@angular/common';
import { TagSelectionDialogComponent } from './tag-selection-dialog/tag-selection-dialog.component';
import { BookOverviewDialogComponent } from './book-overview-dialog/book-overview-dialog.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { AddStudentComponent } from './add-student/add-student.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent,
    HomeComponent,
    AddResourceDialogComponent,
    UpdateDeleteComponent,
    RecoveryDialogComponent,
    CardValComponent,
    BookInfoComponent,
    TagSelectionDialogComponent,
    BookOverviewDialogComponent,
    AnalyticsComponent,
    AddStudentComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDialogModule,
    FormsModule,
    CommonModule,
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
  ],
  exports: [
    AddResourceDialogComponent,
  ],
  providers: [
    DatePipe,
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

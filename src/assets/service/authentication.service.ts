// authentication.service.ts
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private auth: AngularFireAuth, private router: Router) { }

  async isLoggedIn(): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.auth.onAuthStateChanged(user => {
        if (user) {
          resolve(true); // User is logged in
        } else {
          resolve(false); // User is not logged in
        }
      });
    });
  }
}

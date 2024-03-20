import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { RecoveryDialogComponent } from '../recovery-dialog/recovery-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private auth: AngularFireAuth, private router: Router, private dialog: MatDialog) { }

  openRecoveryDialog() {
    this.dialog.open(RecoveryDialogComponent, {
      width: '400px',
      autoFocus: false // Prevent auto-focusing on input fields in the dialog
    });
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      // Redirect to dashboard or desired route upon successful login
      this.router.navigate(['/admin']);
    } catch (error: any) { // Specify error type as 'any'
      if (error instanceof Error) {
        console.error('Login error:', error);
        // Display error message to the user
        window.alert(error.message);
      } else {
        console.error('Firebase error:', error);
        // Handle Firebase error codes
        switch (error.code) {
          case 'auth/user-not-found':
            window.alert('User not found. Please check your email.');
            break;
          case 'auth/wrong-password':
            window.alert('Incorrect password. Please try again.');
            break;
          default:
            window.alert('An error occurred. Please try again later.');
            break;
        }
      }
    }
  }
}

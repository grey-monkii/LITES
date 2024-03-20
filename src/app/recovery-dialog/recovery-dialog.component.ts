import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-recovery-dialog',
  templateUrl: './recovery-dialog.component.html',
  styleUrls: ['./recovery-dialog.component.css']
})
export class RecoveryDialogComponent {
  email: string = '';
  errorMessage: string = '';

  constructor(
    private auth: AngularFireAuth,
    private dialogRef: MatDialogRef<RecoveryDialogComponent>
  ) {}

  async sendPasswordResetEmail() {
    try {
      await this.auth.sendPasswordResetEmail(this.email);
      this.errorMessage = ''; // Reset error message
      this.dialogRef.close(); // Close the dialog after sending the password reset email
    } catch (error: any) {
      console.error('Error sending password reset email:', error);
      if (error.code === 'auth/user-not-found') {
        this.errorMessage = 'Error: User not found.';
      } else {
        this.errorMessage = 'Error: Unable to send password reset email.';
      }
    }
  }
}

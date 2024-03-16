import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog for displaying pop-up window
import { AddResourceDialogComponent } from '../add-resource-dialog/add-resource-dialog.component'; // Import AddResourceDialogComponent

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  activeTab: string = 'book-inventory'; // Default active tab
  bookInventory: any;

  constructor(public dialog: MatDialog) {} // Inject MatDialog

  isLoggedIn(): boolean {
    // Implement your logic to check if the user is logged in
    return true; // Placeholder value, replace with actual logic
  }

  addResource(): void {
    // Open pop-up window for adding resource
    const dialogRef = this.dialog.open(AddResourceDialogComponent, {
      width: '400px' // Adjust width as needed
    });
  }
}

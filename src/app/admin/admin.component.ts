import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; 
import { AddResourceDialogComponent } from '../add-resource-dialog/add-resource-dialog.component';
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Import AngularFirestore

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit { // Implement OnInit interface
  activeTab: string = 'book-inventory';
  bookInventory: any[] = []; // Initialize as empty array

  constructor(
    public dialog: MatDialog,
    private firestore: AngularFirestore // Inject AngularFirestore
  ) {}

  ngOnInit(): void { // Fetch data on component initialization
    this.fetchBookInventory();
  }

  fetchBookInventory(): void {
    // Example: Fetch book inventory data from Firestore collection
    this.firestore.collection('books').valueChanges().subscribe((books: any[]) => {
      this.bookInventory = books; // Assign fetched data to bookInventory
    });
  }

  isLoggedIn(): boolean {
    // Implement your logic to check if the user is logged in
    return true; // Placeholder value, replace with actual logic
  }

  addResource(): void {
    // Open pop-up window for adding resource
    const dialogRef = this.dialog.open(AddResourceDialogComponent, {
      width: '400px'
    });
  }

  // Logout function
  logout(): void {
    // Implement logout functionality here
  }
}

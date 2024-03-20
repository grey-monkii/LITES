import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; 
import { AddResourceDialogComponent } from '../add-resource-dialog/add-resource-dialog.component';
import { UpdateDeleteComponent } from '../update-delete/update-delete.component';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Resource } from '../../assets/resource.model';
import { map } from 'rxjs/operators'; // Import the map operator
import { AngularFireStorage } from '@angular/fire/compat/storage'; 
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  resourceInventory: Resource[] = [];
  filteredResources: Resource[] = [];
  selectedSection: string = 'All';
  searchQuery: string = '';

  constructor(
    public dialog: MatDialog,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private auth: AngularFireAuth
  ) {}

  ngOnInit(): void {
    this.fetchResourceInventory();
  }

  fetchResourceInventory(): void {
    const collections = ['General Reference', 'Fiction', 'Subject Reference', 'Periodicals'];
  
    collections.forEach(collection => {
      this.firestore.collection(collection).valueChanges().pipe(
        map((resources: any[]) => resources as Resource[])
      ).subscribe((resources: Resource[]) => {
        this.resourceInventory = [...this.resourceInventory, ...resources];
        this.filterResources();
      });
    });
  }

  filterResources(): void {
    let filtered: Resource[] = this.resourceInventory;

    // Apply section filter
    if (this.selectedSection !== 'All') {
      filtered = filtered.filter(resource => resource.section === this.selectedSection);
    }

    // Apply search filter
    if (this.searchQuery.trim() !== '') {
      const query = this.searchQuery.trim().toLowerCase();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(query) ||
        resource.author.toLowerCase().includes(query) ||
        resource.isbn.toLowerCase().includes(query) ||
        resource.publication.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query)
      );
    }

    this.filteredResources = filtered;
  }

  onSearchChange(event: any): void {
    this.searchQuery = event.target.value;
    this.filterResources();
  }

  isLoggedIn(): boolean {
    // Implement your logic to check if the user is logged in
    return true; // Placeholder value, replace with actual logic
  }

  addResource(): void {
    const dialogRef = this.dialog.open(AddResourceDialogComponent, {
      width: '400px'
    });
  }

  onRowClick(resource: Resource): void {
    const dialogRef = this.dialog.open(UpdateDeleteComponent, {
      width: '500px',
      data: resource
    });
  
    dialogRef.afterClosed().subscribe(result => {
      window.location.reload();
    });
  }
  
async logout() {
  try {
    await this.auth.signOut();
    window.location.reload();
    // Redirect to login page after logout
  } catch (error) {
    console.error('Logout error:', error);
    // Display error message to the user
    window.alert('An error occurred while logging out. Please try again.');
  }
}
}

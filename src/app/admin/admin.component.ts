import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog'; 
import { AddResourceDialogComponent } from '../add-resource-dialog/add-resource-dialog.component';
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
  const confirmDelete = window.confirm('Are you sure you want to delete this resource?');
  if (confirmDelete) {
    // Delete cover image from storage if it exists
    if (resource.cover) {
      // Upload cover image to Firebase Storage
      const filePath = `covers/${new Date().getTime()}_${resource.cover.name}`;
      const storageRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, resource.cover);

      // Track upload progress
      uploadTask.snapshotChanges().toPromise().then(() => {
        // Get the URL of the uploaded image
        storageRef.getDownloadURL().toPromise().then((url: string) => {
          // Delete the cover image
          storageRef.delete().toPromise().then(() => {
            console.log('Cover image deleted successfully');
            // Delete resource from Firestore
            this.firestore.collection(resource.section).doc(resource.title).delete().then(() => {
              console.log('Resource deleted successfully');
            }).catch(error => {
              console.error('Error deleting resource:', error);
            });
          }).catch(error => {
            console.error('Error deleting cover image:', error);
          });
        }).catch(error => {
          console.error('Error getting download URL:', error);
        });
      }).catch(error => {
        console.error('Error uploading cover image:', error);
      });
    } else {
      // Delete resource from Firestore if cover image doesn't exist
      this.firestore.collection(resource.section).doc(resource.title).delete().then(() => {
        console.log('Resource deleted successfully');
      }).catch(error => {
        console.error('Error deleting resource:', error);
      });
    }
  }
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

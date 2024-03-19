import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Resource } from '../../assets/resource.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-add-resource-dialog',
  templateUrl: './add-resource-dialog.component.html',
  styleUrls: ['./add-resource-dialog.component.css']
})
export class AddResourceDialogComponent {
  resource: Resource = {
    section: '',
    cover: null,
    title: '',
    author: '',
    isbn: '',
    year: null,
    publication: '',
    description: '',
    searched: 0,
    shelf: '',
    level: '',
    editable: false,
  };

  constructor(
    private dialogRef: MatDialogRef<AddResourceDialogComponent>,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage
  ) {}

  // Function to handle cover image selection
  onCoverSelected(event: any) {
    const file = event.target.files[0];
    this.resource.cover = file;
  }

  async addResource() {
       // Check if shelf and level are filled
    if (!this.resource.shelf || !this.resource.level || !this.resource.section || !this.resource.title || !this.resource.author || !this.resource.isbn || !this.resource.year || !this.resource.publication || !this.resource.description) {
        window.alert('Please provide all the required information.');
        return; // Stop execution if shelf or level is not filled
      }
   else {
      // All fields are filled, proceed with adding the resource
      this.addResourceToFirestore();
    }
  }

  private async addResourceToFirestore() {
    // Upload cover image to Firebase Storage
    const coverFile = this.resource.cover;
    let coverUrl = '';
    if (coverFile) {
      const filePath = `covers/${new Date().getTime()}_${coverFile.name}`;
      const storageRef = this.storage.ref(filePath);
      await storageRef.put(coverFile);
      coverUrl = await storageRef.getDownloadURL().toPromise();
    }

    // Prepare resource data
    const resourceId = this.resource.title; // Use title as document ID
    const resourceData = { ...this.resource, cover: coverUrl }; // Include cover URL in data

    // Add resource data to Firestore database
    await this.firestore.collection(this.resource.section).doc(resourceId).set(resourceData);

    // Close the dialog
    this.dialogRef.close();
    window.location.reload();
  }
}

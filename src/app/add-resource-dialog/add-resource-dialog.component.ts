import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog'
import { Resource } from '../../assets/resource.model';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { TagSelectionDialogComponent } from '../tag-selection-dialog/tag-selection-dialog.component';

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
    tags: [],
   
  };

  maxSizeError = false;

  constructor(
    private dialogRef: MatDialogRef<AddResourceDialogComponent>,
    private firestore: AngularFirestore,
    private storage: AngularFireStorage,
    private dialog: MatDialog
  ) {}

  // Function to handle cover image selection
  onCoverSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check if file size exceeds 5MB
      if (file.size > 5 * 1024 * 1024) {
        window.alert('File size exceeds 5MB. Please select a smaller file.');
        this.maxSizeError = true;
        this.resource.cover = null;
        event.target.value = null; // Clear the selected file input
      } else {
        // Check if the file type is an image
        const fileType = file.type.split('/')[0];
        if (fileType !== 'image') {
          window.alert('Only image files are allowed.');
          this.resource.cover = null;
          event.target.value = null; // Clear the selected file input
        } else {
          this.resource.cover = file;
          this.maxSizeError = false;
        }
      }
    }
  }
  
  openTagSelectionDialog(): void {
    const dialogRef = this.dialog.open(TagSelectionDialogComponent, {
      width: '1200px', // Adjust width as needed
      data: { selectedTags: this.resource.tags } // Pass current selected tags as data to the dialog
    });

    // Subscribe to dialog close event to get selected tags
    dialogRef.afterClosed().subscribe((selectedTags: string[]) => {
      if (selectedTags) {
        this.resource.tags = selectedTags; // Update the resource tags with the selected tags
      }
    });
  }


  async addResource() {
       // Check if shelf and level are filled
    if (!this.resource.shelf || !this.resource.level || !this.resource.section || !this.resource.title || !this.resource.author || !this.resource.isbn || !this.resource.year || !this.resource.publication || !this.resource.description ||!this.resource.cover||this.resource.tags.length == 0) {
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
      const filePath = `covers/${this.resource.title}`;
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

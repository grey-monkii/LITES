import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Resource } from '../../assets/resource.model';

@Component({
  selector: 'app-add-resource-dialog',
  templateUrl: './add-resource-dialog.component.html',
  styleUrls: ['./add-resource-dialog.component.css']
})
export class AddResourceDialogComponent {
  resource: Resource = {
    cover: '',
    title: '',
    author: '',
    isbn: '',
    year: null,
    publication: '',
    description: ''
  };

  constructor(private dialogRef: MatDialogRef<AddResourceDialogComponent>) {}

  // Function to handle cover image selection
  onCoverSelected(event: any) {
    const file = event.target.files[0];
    this.resource.cover = file;
  }

  // Function to add the resource
  addResource() {
    // Perform validation here if needed

    // Upload cover image to Firebase Storage
    const coverFile = this.resource.cover;
    if (coverFile) {
      // Implement logic to upload cover image
    }

    // Add resource data to Firestore database
    console.log('Resource data:', this.resource);

    // Close the dialog
    this.dialogRef.close();
  }
}

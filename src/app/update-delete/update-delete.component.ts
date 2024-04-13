import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Resource } from './../../assets/resource.model'; // Replace 'Resource' with your resource model
import { AngularFireStorage } from '@angular/fire/compat/storage'; // Import AngularFireStorage if you're using Firebase Storage
import { AngularFirestore } from '@angular/fire/compat/firestore'; // Import AngularFirestore if you're using Firestore
import { TagSelectionDialogComponent } from '../tag-selection-dialog/tag-selection-dialog.component';

@Component({
  selector: 'app-update-delete',
  templateUrl: './update-delete.component.html',
  styleUrls: ['./update-delete.component.css']
})
export class UpdateDeleteComponent implements OnInit {
  coverFile: File | null = null; // Track the selected cover file
  constructor(
    public dialogRef: MatDialogRef<UpdateDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Resource,
    private storage: AngularFireStorage, // Inject AngularFireStorage
    private firestore: AngularFirestore, // Inject AngularFirestore
    private dialog : MatDialog
  ) {}

  maxSizeError = false;

  ngOnInit(): void {}

  onCoverSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Check if file size exceeds 5MB
      if (file.size > 5 * 1024 * 1024) {
        window.alert('File size exceeds 5MB. Please select a smaller file.');
        this.maxSizeError = true;
        this.data.cover = null;
        event.target.value = null; // Clear the selected file input
      } else {
        // Check if the file type is an image
        const fileType = file.type.split('/')[0];
        if (fileType !== 'image') {
          window.alert('Only image files are allowed.');
          this.data.cover = null;
          event.target.value = null; // Clear the selected file input
        } else {
          this.data.cover = file;
          this.maxSizeError = false;
        }
      }
    }
  }

  updateResource(): void {
    // Check if shelf and level are filled
    if (!this.data.shelf || !this.data.level || !this.data.section || !this.data.title || !this.data.author || !this.data.isbn || !this.data.year || !this.data.publication || !this.data.description || this.data.tags.length == 0) {
      window.alert('Please provide all the required information.');
      return; // Stop execution if any required information is missing
    }
  
    // All fields are filled, proceed with updating the resource
    this.updateResourceInFirestore();
  }
  
  private async updateResourceInFirestore() {
    // Upload cover image to Firebase Storage if a new cover file is selected
    const coverFile = this.coverFile;
    let coverUrl = this.data.cover; // Initialize with existing cover URL
    
    if (coverFile) {
      const filePath = `covers/${this.data.title}`;
      const storageRef = this.storage.ref(filePath);
      await storageRef.put(coverFile);
      coverUrl = await storageRef.getDownloadURL().toPromise();
    }
  
    // Prepare resource data with updated cover URL
    const resourceData = { ...this.data, cover: coverUrl };
  
    // Update resource data in Firestore
    await this.firestore.collection(this.data.section).doc(this.data.title).update(resourceData);
  
    // Close the dialog
    this.dialogRef.close();
  }
  openTagSelectionDialog(): void {
    const dialogRef = this.dialog.open(TagSelectionDialogComponent, {
      width: '1200px', // Adjust width as needed
      data: { selectedTags: this.data.tags } // Pass current selected tags as data to the dialog
    });

    // Subscribe to dialog close event to get selected tags
    dialogRef.afterClosed().subscribe((selectedTags: string[]) => {
      if (selectedTags) {
        this.data.tags = selectedTags; // Update the resource tags with the selected tags
      }
    });
  }
  

  deleteResource(): void {
    // Delete cover image from storage if it exists
    if (this.data.cover) {
      // Construct file path using book title
      const filePath = `covers/${this.data.title}`;

      // Delete cover image from storage
      const storageRef = this.storage.ref(filePath);
      storageRef.delete().toPromise().then(() => {
        console.log('Cover image deleted successfully');

        // Delete resource from Firestore
        this.firestore.collection(this.data.section).doc(this.data.title).delete().then(() => {
          console.log('Resource deleted successfully');
          window.location.reload();
        }).catch(error => {
          console.error('Error deleting resource:', error);
        });
      }).catch(error => {
        console.error('Error deleting cover image:', error);
      });
    } else {
      // Delete resource from Firestore if cover image doesn't exist
      this.firestore.collection(this.data.section).doc(this.data.title).delete().then(() => {
        console.log('Resource deleted successfully');
        window.location.reload();
      }).catch(error => {
        console.error('Error deleting resource:', error);
      });
    }
  }
}

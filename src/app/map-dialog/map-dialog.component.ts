import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularFireStorage } from '@angular/fire/compat/storage';

@Component({
  selector: 'app-map-dialog',
  templateUrl: './map-dialog.component.html',
  styleUrls: ['./map-dialog.component.css'],
  
})
export class MapDialogComponent {
  imageUrl: string = '';
  zoomLevel: number = 100; // Initial zoom level
  showMapImage: boolean = true; // Flag to indicate whether to show the map image or the 'iso' image
  countdown: number = 30; // Timer countdown in seconds
  countdownInterval: any; // Interval reference

  constructor(
    @Inject(MAT_DIALOG_DATA) public bookData: any,
    private storage: AngularFireStorage,
    private dialogRef: MatDialogRef<MapDialogComponent>
  ) {
    this.loadMapImage();
    this.startCountdown();
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed
    clearInterval(this.countdownInterval);
  }

  loadMapImage(): void {
    const imagePath = `map/${this.bookData.section}/${this.bookData.shelf}/${this.bookData.level}.jpg`;
    this.storage.ref(imagePath).getDownloadURL().subscribe(url => {
      this.imageUrl = url;
    });
  }

  loadIsoImage(): void {
    const isoImagePath = `map/${this.bookData.section}/${this.bookData.shelf}/${this.bookData.level}_iso.jpg`;
    this.storage.ref(isoImagePath).getDownloadURL().subscribe(url => {
      if (url) {
        this.imageUrl = url;
      } else {
        // If 'iso' image doesn't exist, load the map image
        this.loadMapImage();
      }
    });
  }

  // Function to toggle between map image and 'iso' image
  toggleImage(): void {
    if (this.showMapImage) {
      this.loadIsoImage();
    } else {
      this.loadMapImage();
    }
    this.showMapImage = !this.showMapImage;
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  // Function to start the countdown timer
  startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.countdownInterval); // Stop the countdown when it reaches 0
        this.closeDialog(); // Close the dialog automatically
      }
    }, 1000); // Update the countdown every second
  }
}

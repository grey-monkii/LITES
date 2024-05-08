import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { DatePipe } from '@angular/common';
import { take } from 'rxjs/operators';
import { MapDialogComponent } from '../map-dialog/map-dialog.component';
import { AnalyticsService } from '../../assets/service/analytics.service';

@Component({
  selector: 'app-book-info',
  templateUrl: './book-info.component.html',
  styleUrls: ['./book-info.component.css']
})
export class BookInfoComponent implements OnInit {
  readingId: string = "Tap ID to locate book";
  selectedColor: string = ""; 
  readCardRef: AngularFireList<any>;
  processingData: boolean = false;
  bookFound: boolean = false;
  selectedColorPath: string = "";

  constructor(
    @Inject(MAT_DIALOG_DATA) public book: any,
    private dialogRef: MatDialogRef<BookInfoComponent>,
    private db: AngularFireDatabase,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private analyticsService: AnalyticsService
  ) {
    this.readCardRef = this.db.list('LITES/readCard');
    this.selectedColor = book.selectedColor; // Access selectedColor from book data
  }

  ngOnInit() {
    // Call moveData method to select color
    this.moveData();
    
    // Add listener to readCard node
    this.readCardRef.snapshotChanges().subscribe((changes) => {
      changes.forEach((change) => {
        if (!this.processingData) {
          this.processingData = true;
          const cardValueObject = change.payload.val();
          if (cardValueObject) {
            this.readingId = "Reading Card";
            const cardValue = cardValueObject.cardvalue;
            console.log('Card Value was read successfully.');
            this.moveData(cardValue);
          } else {
            this.readingId = "Tap ID to locate book";
          }
        }
      });
    });
  }

  async moveData(cardValue: string = "") {
    try {
        const { section, shelf, level, author, title } = this.book;
        const targetPath = `LITES/${section}/${shelf}/${level}`;
        const colorCategories = ['red', 'blue', 'green'];

        let selectedColor = null;

        if (!cardValue) {
            // Logic to select color when cardValue is not provided
            selectedColor = colorCategories[Math.floor(Math.random() * colorCategories.length)];
        } else {
            for (const color of colorCategories) {
                const colorCategoryPath = `${targetPath}/${color}`;
                const colorData = await this.db.object(colorCategoryPath).valueChanges().pipe(take(1)).toPromise() as { state: boolean, author?: string, title?: string };

                if (colorData && !colorData.state) {
                    selectedColor = color;
                    break;
                }

                if (colorData && colorData.state && colorData.author === author && colorData.title === title) {
                    console.log('Data exists in', colorCategoryPath, 'with matching author and title.');
                    window.alert('This book has already been searched. Please try searching for other books.');
                    this.dialogRef.close('duplicate');
                    await this.db.object(`LITES/readCard`).remove(); // Remove contents of readCard node
                    return;
                }
            }

            if (!selectedColor) {
                console.log('All color categories are in use. Unable to move card value.');
                return;
            }
        }

        // Store the selected color globally
        this.selectedColor = selectedColor;

        if (cardValue) {
            const colorCategoryPath = `${targetPath}/${selectedColor}`;
            console.log('It is saved in', colorCategoryPath);

            // await this.db.database.ref('LITES/savedColorPath').set(colorCategoryPath.toString());
            // console.log(`Color path saved to /LITES/savedColorPath: ${colorCategoryPath}`);

            const currentTimeStamp = new Date();
            const formattedTimeStamp = this.datePipe.transform(currentTimeStamp, 'medium', 'GMT+8');

            const newData = {
                cardvalue: cardValue,
                timecode: currentTimeStamp.getTime(),
                state: true,
                title: title,
                author: author,
                timestamp: formattedTimeStamp
            };

            await this.db.object(colorCategoryPath).update(newData);

            await this.db.object(`LITES/readCard`).remove();
            console.log('Card value removed from readCard successfully.');

            // Set bookFound to true
            this.bookFound = true;

            // Record Tap Out (if state is false)
            const colorData = await this.db.object(colorCategoryPath).valueChanges().pipe(take(1)).toPromise() as { state: boolean };
            if (!colorData.state) {
                const tapOutEvent = {
                    eventType: 'tapOut',
                    cardValue: cardValue,
                    timestamp: Date.now(),
                    timestampPH: this.datePipe.transform(new Date(), 'medium', 'GMT+8') // Convert to Philippine time
                };
                await this.recordEvent(tapOutEvent);
                console.log('Book tapped out and recorded as tap out.');
                return;
            }

            // Record Tap In
            const tapInTimestamp = Date.now();
            const tapInEvent = {
                eventType: 'tapIn',
                cardValue: cardValue,
                timestamp: tapInTimestamp,
                timestampPH: this.datePipe.transform(new Date(), 'medium', 'GMT+8') // Convert to Philippine time
            };
            await this.recordEvent(tapInEvent);

            // Set automatic turn-off after 1 minute
            setTimeout(async () => {
                console.log('Book turned off automatically after 1 minute.');
                // Record automatic turn-off
                const turnOffEvent = {
                    eventType: 'automaticTurnOff',
                    cardValue: cardValue,
                    timestamp: Date.now(),
                    timestampPH: this.datePipe.transform(new Date(), 'medium', 'GMT+8') // Convert to Philippine time
                };
                await this.recordEvent(turnOffEvent);
                // Update database to turn off book
                await this.db.object(colorCategoryPath).update({ state: false });
            }, 60000); // 60000 milliseconds = 1 minute

            const confirmSearch = window.confirm(`Book Found! Look for ${selectedColor} LITES \nin ${section} ${shelf} ${level} and click okay to proceed...`);
            if (confirmSearch) {
                this.dialogRef.close('success');
                this.openMapDialog(this.book);
                return;
            } else {
                this.dialogRef.close('error');
            }
        }
    } catch (error) {
        console.error('Error moving data:', error);
    }
}

async recordEvent(eventData: any) {
    try {
        // Generate a unique key combining card value and timestamp
        const logKey = `${eventData.cardValue}_${eventData.timestampPH}`;

        // Save event data under 'LITES/logs' collection in Firebase with the combined key
        await this.db.object(`LITES/logs/${logKey}`).set(eventData);

        console.log('Event recorded successfully:', eventData);
    } catch (error) {
        console.error('Error recording event:', error);
    }
}


  openMapDialog(bookData: any): void {
    this.dialog.open(MapDialogComponent, {
      data: { bookData, selectedColor: this.selectedColor } // Pass both bookData and selectedColor
    });
  }

  onClose(): void {
    // Reset data
    this.resetData();
    // Close the dialog
    this.dialogRef.close();
  }
  
  resetData(): void {
    // Reset all relevant properties to their initial values
    this.readingId = "Tap ID to locate book";
    this.selectedColor = "";
    this.bookFound = false;
  }
}

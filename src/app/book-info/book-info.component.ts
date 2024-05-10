import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { DatePipe } from '@angular/common';
import { delay, take } from 'rxjs/operators';
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
  tapOutPerformed: boolean = false;
  turnOffPerformed: boolean = false;

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
    let cardRead = false; // Flag to track if card has been read
    
    // Fetch cardValue from Firebase Realtime Database
    this.db.list('LITES/readCard').valueChanges().subscribe((data: any[]) => {
      const cardValueObject = data.find(item => item.cardvalue);
      if (cardValueObject && !cardRead) { // Check if card exists and hasn't been read yet
        cardRead = true; // Set flag to true to indicate card has been read
        
        this.readingId = "Reading Card";
        const cardValue = cardValueObject.cardvalue;
        console.log('Card Value was read successfully.');
  
        setTimeout(() => {
          this.moveData(cardValue);
        }, 1000);
        
      } else {
        this.readingId = "Tap ID to locate book";
      }
    });
  }


  async moveData(cardValue: string = "") {
    try {
        const { section, shelf, level, author, title } = this.book;
        const targetPath = `LITES/${section}/${shelf}/${level}`;
        const colorCategories = ['red', 'blue', 'green'];

        let selectedColor = null;
        let colorCategoryPath = '';

        if (!cardValue) {
            // Logic to select color when cardValue is not provided
            selectedColor = colorCategories[Math.floor(Math.random() * colorCategories.length)];
        } else {
            for (const color of colorCategories) {
                const currentColorCategoryPath = `${targetPath}/${color}`;
                const colorData = await this.db.object(currentColorCategoryPath).valueChanges().pipe(take(1)).toPromise() as { state: boolean, author?: string, title?: string };

                if (colorData && !colorData.state) {
                    selectedColor = color;
                    colorCategoryPath = currentColorCategoryPath;
                    break;
                }

                if (colorData && colorData.state && colorData.author === author && colorData.title === title) {
                    console.log('Data exists in', currentColorCategoryPath, 'with matching author and title.');
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
        this.selectedColor = "Tap ID to know your color";
        // this.selectedColor = selectedColor;

        if (cardValue && colorCategoryPath) {
            console.log('It is saved in', colorCategoryPath);
            this.selectedColor = selectedColor;

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


            // Record Tap In
            const tapInTimestamp = Date.now();
            const tapInEvent = {
                eventType: 'tapIn',
                cardValue: cardValue,
                timestamp: tapInTimestamp,
                timestampPH: this.datePipe.transform(new Date(), 'medium', 'GMT+8') // Convert to Philippine time
            };
            await this.recordEvent(tapInEvent);

            // Set automatic turn-off after 1 minute only if tap-out hasn't been performed and the state is still true
            if (!this.tapOutPerformed) {

                setTimeout(async () => {
                    // Check if the state is still true before executing automatic turn-off
                    const currentState = await this.db.object(colorCategoryPath).valueChanges().pipe(take(1)).toPromise() as { state: boolean };
                    if (currentState && currentState.state) {
                        console.log('Book turned off automatically after 1 minute.');
                        const turnOffEvent = {
                          eventType: 'automaticTurnOff',
                          cardValue: cardValue,
                          timestamp: Date.now(),
                          timestampPH: this.datePipe.transform(new Date(), 'medium', 'GMT+8') // Convert to Philippine time
                        };
                        await this.recordEvent(turnOffEvent);
                        
                    }
                    // Remove colorCategoryPath from the database
                    await this.db.object(colorCategoryPath).remove();
                    // Generate colorCategoryPath again with state set to false
                    const newData = { state: false };
                    await this.db.object(colorCategoryPath).update(newData);
                    // Record automatic turn-off
                    this.turnOffPerformed = true;
                    return;
                }, 60000); // 60000 milliseconds = 1 minute

                if(this.turnOffPerformed){
                  this.turnOffPerformed = false;
                  return;
                } else {
                  const stateSubscription = this.db.object(colorCategoryPath).valueChanges().subscribe(async (colorData: any) => {
                    if (colorData && typeof colorData.state === 'boolean') {
                        if (!colorData.state) {
                            if (!this.tapOutPerformed) {
                                const tapOutEvent = {
                                    eventType: 'tapOut',
                                    cardValue: cardValue,
                                    timestamp: Date.now(),
                                    timestampPH: this.datePipe.transform(new Date(), 'medium', 'GMT+8') // Convert to Philippine time
                                };
        
                                await this.recordEvent(tapOutEvent);
                                await this.db.object(colorCategoryPath).remove();
                                // Generate colorCategoryPath again with state set to false
                                const newData = { state: false };
                                await this.db.object(colorCategoryPath).update(newData);
                                this.tapOutPerformed = true;
                                stateSubscription.unsubscribe(); // Unsubscribe from state changes after tap-out
                                return; // Exit the function if tap-out is executed
                            }
                        }
                    }
                  });
                }
                
            }

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
  
  refreshDialog(): void {
    const dialogRef = this.dialog.open(BookInfoComponent, {
      // Pass updated data or options to the dialog if needed
    });

    // After dialog is closed, you can subscribe to the afterClosed event
    dialogRef.afterClosed().subscribe(result => {
      // Handle dialog close event if needed
    });
  }  
}



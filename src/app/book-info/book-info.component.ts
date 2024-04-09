import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { DatePipe } from '@angular/common';
import { take, delay } from 'rxjs/operators';

@Component({
  selector: 'app-book-info',
  templateUrl: './book-info.component.html',
  styleUrls: ['./book-info.component.css']
})
export class BookInfoComponent implements OnInit {
  readingId: string = "Tap ID to locate book";

  constructor(
    @Inject(MAT_DIALOG_DATA) public book: any,
    private dialogRef: MatDialogRef<BookInfoComponent>,
    private db: AngularFireDatabase,
    private datePipe: DatePipe
  ) {} // Access passed book data

  ngOnInit() {
    // Fetch cardValue from Firebase Realtime Database
    this.db.list('LITES/readCard').valueChanges().subscribe((data: any[]) => {
      const cardValueObject = data.find(item => item.cardvalue);
      if (cardValueObject) {
        
        this.readingId = "Reading Card";
        const cardValue = cardValueObject.cardvalue;
        console.log('Card Value was read successfully.');

        setTimeout(() => {
          this.moveData(cardValue);
        }, 3000);
      } else {
        this.readingId = "Tap ID to locate book";
      }
    });
  }

  async moveData(cardValue: string) {
    const { section, shelf, level, author, title } = this.book;
    const targetPath = `LITES/${section}/${shelf}/${level}`;
  
    const colorCategories = ['red', 'blue', 'green'];
  
    for (const color of colorCategories) {
      const colorCategoryPath = `${targetPath}/${color}`;
      console.log('It is saved in' + colorCategoryPath);
      const colorData = await this.db.object(colorCategoryPath).valueChanges().pipe(take(1)).toPromise() as { state: boolean, timestamp: number };
  
      if (colorData && !colorData.state) {
        const currentTime = new Date().getTime();
        const currentTimeStamp = new Date();
        const formattedTimeStamp = this.datePipe.transform(currentTimeStamp, 'medium', 'GMT+8');
  
        const newData = { cardvalue: cardValue, timecode: currentTime, state: true, title: title, author: author, timestamp: formattedTimeStamp};
  
        await this.db.object(colorCategoryPath).update(newData);
        
        // After updating the state and saving the card value, remove the cardValue from readCard
        this.db.object(`LITES/readCard`).remove().then(() => {
          console.log('Card value removed from readCard successfully.');
        }).catch(error => {
          console.error('Error removing card value from readCard:', error);
        });

        setTimeout(async () => {
          const updatedColorData = await this.db.object(colorCategoryPath).valueChanges().pipe(take(1)).toPromise() as { state: boolean, timecode: number };
  
          if (updatedColorData && updatedColorData.state) {
            const elapsedTime = new Date().getTime() - updatedColorData.timecode;
            if (elapsedTime >= 60000) { // 1 minute in milliseconds
              await this.db.object(colorCategoryPath).remove().then(() => {
                console.log('Fields deleted.');
              }).catch(error => {
                console.error('Can\'t delete fields', error);
              });
      
              await this.db.object(colorCategoryPath).update({ state: false });
              console.log('Data moved and reset successfully after 1 minute.');
            }
          }
        }, 60000); // Check after 1 minute
  
        return;
      }
    }
  
    console.log('All color categories are in use. Unable to move card value.');
  }
  
  
  onClose(): void {
    this.dialogRef.close();
  }
}
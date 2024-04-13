import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-book-overview-dialog',
  templateUrl: './book-overview-dialog.component.html',
  styleUrls: ['./book-overview-dialog.component.css']
})
export class BookOverviewDialogComponent {
book: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: { book: any }) {
    this.book = data.book;
   }
}

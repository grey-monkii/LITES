import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  selectedTab: string = 'All Books';
  searchInput: string = '';
  books$: Observable<any[]> | undefined;

  constructor(private firestore: AngularFirestore) { }

  ngOnInit(): void {
    this.fetchBooks();
  }

  fetchBooks(): void {
    const collections = ['General Reference', 'Fiction', 'Subject Reference', 'Periodicals'];
    const collectionObservables = collections.map(collection =>
      this.firestore.collection(collection).valueChanges()
    );

    this.books$ = combineLatest(collectionObservables).pipe(
      map(booksArrays => booksArrays.reduce((acc, curr) => acc.concat(curr), []))
    );
  }

  filterBooksByTab(tab: string): void {
    this.selectedTab = tab;
  }

  filteredBooks(books: any[]): any[] {
    return books.filter(book =>
      (this.selectedTab === 'All Books' || book.section === this.selectedTab) &&
      (book.title.toLowerCase().includes(this.searchInput.toLowerCase()) ||
      book.author.toLowerCase().includes(this.searchInput.toLowerCase()))
    );
  }

  onSearch(): void {
    // Perform search operation here
    // You can update the filtered books based on the search input
  }

  onCardClick(book: any): void {
    // Display confirmation dialog
    const confirmSearch = window.confirm('Do you want to find this book using LITES?');
  
    // Check user's response
    if (confirmSearch) {
      // Implement action when user confirms
      console.log('Finding book using LITES:', book);
      // You can navigate to a different page or perform any other action here
    } else {
      // Implement action when user cancels
      console.log('User cancelled search.');
      // You can perform any other action here, such as closing the dialog or doing nothing
    }
  }
  
  
}

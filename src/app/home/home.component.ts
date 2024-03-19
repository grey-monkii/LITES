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
      book.author.toLowerCase().includes(this.searchInput.toLowerCase()))||
      book.description.toLowerCase().includes(this.searchInput.toLowerCase()) ||
      book.year.toLowerCase().includes(this.searchInput.toLowerCase()) ||
      book.isbn.toLowerCase().includes(this.searchInput.toLowerCase()) ||
      book.level.toLowerCase().includes(this.searchInput.toLowerCase()) ||
      book.shelf.toLowerCase().includes(this.searchInput.toLowerCase()) ||
      book.publication.toLowerCase().includes(this.searchInput.toLowerCase()) ||
      book.section.toLowerCase().includes(this.searchInput.toLowerCase()) 
    );
  }

  onCardClick(book: any): void {
    // Display confirmation dialog
    this.updateSearchCount(book); //increment searched field
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

  
  updateSearchCount(book: any): void {
    // Update the "searched" field in Firestore based on the book's location
    const bookRef = this.firestore.collection(book.section).doc(book.title); // Assuming "location" is the collection name and "id" is the document ID
    bookRef.update({ searched: (book.searched || 0) + 1 })
      .then(() => console.log('Search count updated successfully'))
      .catch(error => console.error('Error updating search count:', error));
  }
  
  
}

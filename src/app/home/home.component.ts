import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { CardValService } from '../../assets/service/card-val.service';
import { MatDialog } from '@angular/material/dialog';
import { BookInfoComponent } from '../book-info/book-info.component';
import { BookOverviewDialogComponent } from '../book-overview-dialog/book-overview-dialog.component';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { take, delay } from 'rxjs/operators';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  selectedTab: string = 'All Books';
  searchInput: string = '';
  books$: Observable<any[]> | undefined;
  filteredBooksList: any[] = [];
  

  constructor(private firestore: AngularFirestore,
              private db: AngularFireDatabase,
              private cardVal: CardValService,
              private dialog: MatDialog) { }

  ngOnInit(): void {
    this.fetchBooks();
    this.cardVal.fetchData().subscribe(data => {
      console.log(data);
    });

    this.filterBooksByTab('All Books');
  }

  fetchBooks(): void {
    const collections = ['General Reference', 'Fiction', 'Subject Reference', 'Graduate School'];
    const collectionObservables = collections.map(collection =>
      this.firestore.collection(collection).valueChanges()
    );

    this.books$ = combineLatest(collectionObservables).pipe(
      map(booksArrays => booksArrays.reduce((acc, curr) => acc.concat(curr), []))
    );
  }

  filterBooksByTab(tab: string): void {
    this.selectedTab = tab;
    
    // Check if search input is empty
    if (this.searchInput.trim() === '') {
      // If search input is empty, display all books from the active tab
      this.filterBooks();
    } else {
      // If search input is not empty, filter books based on the active tab and search input
      this.searchBooks();
    }
  }

  filterBooks(): void {
    if (this.books$) {
      this.books$.subscribe(books => {
        this.filteredBooksList = this.filteredBooks(books);
      });
    }
  }

  filteredBooks(books: any[]): any[] {
    if (this.selectedTab === 'All Books') {
      return books;
    } else {
      return books.filter(book => book.section === this.selectedTab);
    }
  }

  searchBooks(): void {
    // Define a list of stop words
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as'];
    if (this.books$) {
      this.books$.subscribe(books => {
        if (this.searchInput.trim() === '') {
          // If search input is empty, display all books from the active tab
          this.filteredBooksList = this.filteredBooks(books);
        } else {
          // Tokenize search input and remove stop words
          const searchTokens = this.searchInput.toLowerCase().split(' ').filter(token => !stopWords.includes(token));
  
          // Filter books based on the active tab
          const filteredBooksByTab = this.filteredBooks(books);
  
          // Filter books based on search input and the active tab
          const scoredBooks = filteredBooksByTab.map(book => ({
            ...book,
            score: this.calculateScore(book, searchTokens)
          }));
  
          // Sort books by score in descending order
          const sortedBooks = scoredBooks.sort((a, b) => b.score - a.score);
  
          // Separate main filtered books and related books
          const mainFilteredBooks = sortedBooks.filter(book => book.score >= 50);
          const otherRelatedBooks = sortedBooks.filter(book => book.score < 50);
  
          // Concatenate main filtered books with related books
          this.filteredBooksList = [...mainFilteredBooks, ...otherRelatedBooks];
        }
      });
    }
  }
  

calculateScore(book: any, searchTokens: string[]): number {
  let score = 0;

  // Increment score based on the presence of search tokens in different fields
  searchTokens.forEach(token => {
    if (book.title.toLowerCase().includes(token)) {
      score += 20;
    }
    if (book.author.toLowerCase().includes(token)) {
      score += 15;
    }
    if (book.description.toLowerCase().includes(token)) {
      score += 10;
    }
    if (Array.isArray(book.tags) && book.tags.some((tag: string) => tag.toLowerCase().includes(token))) {
      score += 5;
    }
    if (book.year.toLowerCase().includes(token)) {
      score += 3;
    }
    if (book.isbn.toLowerCase().includes(token)) {
      score += 2;
    }
    if (book.level.toLowerCase().includes(token)) {
      score += 2;
    }
    if (book.shelf.toLowerCase().includes(token)) {
      score += 2;
    }
    if (book.publication.toLowerCase().includes(token)) {
      score += 2;
    }
    if (book.section.toLowerCase().includes(token)) {
      score += 2;
    }
  });

  return score;
}

  
  

  openBookOverviewDialog(bookData: any): void {
    const bookDetails = {
      
      title: bookData.title,
      author: bookData.author,
      description: bookData.description,
      tags: bookData.tags,
      year: bookData.year,
      isbn: bookData.isbn,
      level: bookData.level,
      shelf: bookData.shelf,
      publication: bookData.publication,
      section: bookData.section,
      cover: bookData.cover
    };
  
    const dialogRef = this.dialog.open(BookOverviewDialogComponent, {
      data: { book: bookDetails } // Pass the book details to the dialog
    });
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

      // Open modal
      const dialogRef = this.dialog.open(BookInfoComponent, {
        data: book
      });

      // // Handle modal close
      // dialogRef.afterClosed().subscribe(result => {
      //   console.log('Modal closed:', result);
      //   // Implement any action based on modal result
      // });
      
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

  noSearchResults(books: any[] | null): boolean {
    return this.searchInput.trim() !== '' && (books === null || this.filteredBooksList.length === 0);
  }
}


  
  // async checkAndDeleteData() {
  //   const sections = ['Fiction', 'General Reference', 'Graduate School', 'Subject Reference']; // Example section names
  //   const shelves = ['Shelf A', 'Shelf B', 'Shelf C', 'Shelf D']; // Example shelf names
  //   const levels = ['Level 1', 'Level 2', 'Level 3']; // Example level names
  //   const colors = ['red', 'blue', 'green']; // Example color categories
  
  //   for (const section of sections) {
  //     for (const shelf of shelves) {
  //       for (const level of levels) {
  //         for (const color of colors) {
  //           const colorCategoryPath = `LITES/${section}/${shelf}/${level}/${color}`;
  //           const colorData = await this.db.object(colorCategoryPath).valueChanges().pipe(take(1)).toPromise() as { state: boolean, timestamp: number, author: string, title: string, cardvalue: string };
  
  //           if (colorData && colorData.state) {
  //             const currentTime = new Date().getTime();
  //             const timestamp = colorData.timestamp;
  
  //             if (currentTime - timestamp >= 60000) { // 1 minute in milliseconds
  //               // Reset state to false
  //               await this.db.object(colorCategoryPath).update({ state: false });
  
  //               // Delete author, title, timestamp, and card value
  //               await this.db.object(colorCategoryPath).update({ author: null, title: null, timestamp: null, cardvalue: null });
  //             }
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
  


// Service to handle analytics
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private firestore: AngularFirestore) {}

  // Function to update analytics for searched books
  updateSearchedBooksAnalytics(bookTitle: string): void {
    const analyticsRef = this.firestore.collection('Analytics').doc('books');

    // Check if the book exists in the analytics collection
    analyticsRef.get().subscribe(doc => {
      if (doc.exists) {
        // Book exists, update its data
        const bookData = doc.data() as any;
        const searchedDates = bookData[bookTitle]?.datesSearched || [];
        const numTimesSearched = (bookData[bookTitle]?.numTimesSearched || 0) + 1;

        searchedDates.push(new Date());

        // Update book data in Firestore
        analyticsRef.update({
          [bookTitle]: {
            title: bookTitle,
            numTimesSearched: numTimesSearched,
            datesSearched: searchedDates
          }
        });
      } else {
        // Book does not exist, create new entry
        analyticsRef.update({
          [bookTitle]: {
            title: bookTitle,
            numTimesSearched: 1,
            datesSearched: [new Date()]
          }
        });
      }
    });
  }

  // Function to update analytics for search terms
  updateSearchTermsAnalytics(searchInput: string): void {
    const analyticsRef = this.firestore.collection('Analytics').doc('terms');

    // Split search input into major words (excluding stop words)
    const stopWords = ['a', 'an', 'the', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'about', 'as'];
    const searchTerms = searchInput.toLowerCase().split(' ').filter(term => !stopWords.includes(term));

    searchTerms.forEach(term => {
      // Check if the term exists in the analytics collection
      analyticsRef.get().subscribe(doc => {
        if (doc.exists) {
          // Term exists, update its data
          const termData = doc.data() as any;
          const searchedDates = termData[term]?.datesSearched || [];
          const numTimesSearched = (termData[term]?.numTimesSearched || 0) + 1;

          searchedDates.push(new Date());

          // Update term data in Firestore
          analyticsRef.update({
            [term]: {
              term: term,
              numTimesSearched: numTimesSearched,
              datesSearched: searchedDates
            }
          });
        } else {
          // Term does not exist, create new entry
          analyticsRef.update({
            [term]: {
              term: term,
              numTimesSearched: 1,
              datesSearched: [new Date()]
            }
          });
        }
      });
    });
  }

  getSearchedBooksAnalytics(dateRange: string): Observable<any> {
    const analyticsRef = this.firestore.collection('Analytics').doc('books');

    // Convert Firestore dates to JavaScript Date objects
    const convertFirestoreDate = (timestamp: any) => {
      return timestamp ? timestamp.toDate() : null;
    };

    // Query based on date range
    let dateFilter: Date;
    switch (dateRange) {
      case 'Today':
        dateFilter = new Date();
        dateFilter.setHours(0, 0, 0, 0);
        break;
      case 'Past Week':
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case 'Past Month':
        dateFilter = new Date();
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      case 'Past 6 Months':
        dateFilter = new Date();
        dateFilter.setMonth(dateFilter.getMonth() - 6);
        break;
      default:
        dateFilter = new Date(0); // Start of Unix epoch
    }

    return analyticsRef.valueChanges().pipe(
      map((data: any) => {
        const filteredData = Object.values(data).filter((item: any) => {
          // Compare converted Firestore dates with the date filter
          return item.datesSearched.some((date: any) => convertFirestoreDate(date) >= dateFilter);
        });
        return filteredData;
      })
    );
  }

  // Function to update analytics for search terms
  // Update the date comparison logic here
  getSearchTermsAnalytics(dateRange: string): Observable<any> {
    const analyticsRef = this.firestore.collection('Analytics').doc('terms');

    // Convert Firestore dates to JavaScript Date objects
    const convertFirestoreDate = (timestamp: any) => {
      return timestamp ? timestamp.toDate() : null;
    };

    // Query based on date range
    let dateFilter: Date;
    switch (dateRange) {
      case 'Today':
        dateFilter = new Date();
        dateFilter.setHours(0, 0, 0, 0);
        break;
      case 'Past Week':
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - 7);
        break;
      case 'Past Month':
        dateFilter = new Date();
        dateFilter.setMonth(dateFilter.getMonth() - 1);
        break;
      case 'Past 6 Months':
        dateFilter = new Date();
        dateFilter.setMonth(dateFilter.getMonth() - 6);
        break;
      default:
        dateFilter = new Date(0); // Start of Unix epoch
    }

    return analyticsRef.valueChanges().pipe(
      map((data: any) => {
        const filteredData = Object.values(data).filter((item: any) => {
          // Compare converted Firestore dates with the date filter
          return item.datesSearched.some((date: any) => convertFirestoreDate(date) >= dateFilter);
        });
        return filteredData;
      })
    );
  }
}

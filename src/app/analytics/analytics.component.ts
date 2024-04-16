// analytics.component.ts
import { Component, ElementRef, Renderer2 } from '@angular/core';
import { AnalyticsService } from '../../assets/service/analytics.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';;

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent {
  analyticsData: any[] = [];
  selectedDataType: string = 'terms';
  selectedDateRange: string = 'Today';
  sortOrder: string = 'ascending';
  generatedAnalysis: string = '';
  colors: string[][] = [
    ['#800000', '#DAA520', '#808080'],
  ];

totalSearches: number = 0;
uniqueTermsOrBooks: number = 0;
mostSearchedItem: any = null;
mostSearchedPercentage: number = 0;
mostSearchedItems: any[] = [];


  constructor(
    private analyticsService: AnalyticsService,
    private auth: AngularFireAuth
  ) { }

  ngOnInit(): void {
    this.fetchAnalyticsData();
  }

  fetchAnalyticsData(): void {
    if (this.selectedDataType === 'terms') {
      this.analyticsService.getSearchTermsAnalytics(this.selectedDateRange).subscribe(data => {
        console.log('Search terms analytics data:', data);
        this.analyticsData = data;
  
        // Compute analytics metrics
        this.totalSearches = this.analyticsData.reduce((acc, item) => acc + item.numTimesSearched, 0);
        this.uniqueTermsOrBooks = this.analyticsData.length;
  
        // Sort analytics data in descending order based on numTimesSearched
        this.analyticsData.sort((a, b) => b.numTimesSearched - a.numTimesSearched);
  
        // Select the top 10 searched items
        this.mostSearchedItems = this.analyticsData;
        this.mostSearchedItems.forEach(item => {
          item.percentage = (item.numTimesSearched / this.totalSearches) * 100;
        });
  
        console.log('Total Number of Searches:', this.totalSearches);
        console.log('Number of Unique Terms:', this.uniqueTermsOrBooks);
        console.log('Most Searched Terms:', this.mostSearchedItems);
      });
    } else {
      this.analyticsService.getSearchedBooksAnalytics(this.selectedDateRange).subscribe(data => {
        console.log('Searched books analytics data:', data);
        this.analyticsData = data;
  
        // Compute analytics metrics
        this.totalSearches = this.analyticsData.reduce((acc, item) => acc + item.numTimesSearched, 0);
        this.uniqueTermsOrBooks = this.analyticsData.length;
  
        // Sort analytics data in descending order based on numTimesSearched
        this.analyticsData.sort((a, b) => b.numTimesSearched - a.numTimesSearched);
  
        // Select the top 10 searched items
        this.mostSearchedItems = this.analyticsData;
        this.mostSearchedItems.forEach(item => {
          item.percentage = (item.numTimesSearched / this.totalSearches) * 100;
        });
  
        console.log('Total Number of Searches:', this.totalSearches);
        console.log('Number of Unique Books:', this.uniqueTermsOrBooks);
        console.log('Most Searched Books:', this.mostSearchedItems);
      });
    }
  }
  
  
  findMostSearchedItems(data: any[]): any[] {
    const maxSearched = Math.max(...data.map(item => item.numTimesSearched));
    return data.filter(item => item.numTimesSearched === maxSearched);
  }
  

  filterByDateRange(event: any): void {
    const dateRange = event?.target?.value;
    if (dateRange) {
      this.selectedDateRange = dateRange;
      this.fetchAnalyticsData();
    }
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'ascending' ? 'descending' : 'ascending';
    // Sort analyticsData based on the numTimesSearched property
    this.analyticsData.sort((a, b) => {
      if (this.sortOrder === 'ascending') {
        return a.numTimesSearched - b.numTimesSearched;
      } else {
        return b.numTimesSearched - a.numTimesSearched;
      }
    });
  }
  
  
  // Helper method to check if a date is within the selected date range
  isWithinDateRange(date: Date): boolean {
    const today = new Date(); // Current date
    let startDate = new Date(); // Start date based on selected range
  
    // Determine the start date based on the selected date range
    switch (this.selectedDateRange) {
      case 'Today':
        startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        break;
      case 'Past Week':
        startDate.setDate(today.getDate() - 7);
        break;
      case 'Past Month':
        startDate.setMonth(today.getMonth() - 1);
        break;
      case 'Past 6 Months':
        startDate.setMonth(today.getMonth() - 6);
        break;
      default:
        startDate = new Date(0); // Start of Unix epoch
        break;
    }
  
    // Check if the date falls within the selected range
    return date >= startDate && date <= today;
  }
  
  calculateBarWidth(value: number): number {
    if (value === 0) {
      return 0; // Avoid division by zero
    }
    
    // Adjust this method to fit your desired scaling for bar widths
    // Example: Return a percentage based on the maximum value in the data
    const maxValue = Math.max(...this.analyticsData.map(item => item.numTimesSearched));
    return (value / maxValue) * 100;
  }
  

  async logout() {
    try {
      await this.auth.signOut();
      window.location.reload();
      // Redirect to login page after logout
    } catch (error) {
      console.error('Logout error:', error);
      // Display error message to the user
      window.alert('An error occurred while logging out. Please try again.');
    }
  }

  getBarColor(index: number): string {
    const colorSetIndex = index % this.colors.length; // Cycle through color sets
    return this.colors[colorSetIndex][index % this.colors[colorSetIndex].length];
  }

// Method to expand the bar graph on hover
expandBar(event: MouseEvent): void {
  const bar = event.currentTarget as HTMLElement;
  bar.style.width = 'auto';
}

// Method to restore the original size of the bar graph when hover ends
 // Method to restore the original size of the bar graph when hover ends
 restoreBar(event: MouseEvent, item: any): void {
  // Restore the bar's width to its initial value
  const initialWidth = this.calculateBarWidth(item.numTimesSearched);
  const bar = event.currentTarget as HTMLElement;
  bar.style.width = initialWidth + '%';
}

  
}

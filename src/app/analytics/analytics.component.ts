// analytics.component.ts
import { Component } from '@angular/core';
import { AnalyticsService } from '../../assets/service/analytics.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

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
      });
    } else {
      this.analyticsService.getSearchedBooksAnalytics(this.selectedDateRange).subscribe(data => {
        console.log('Searched books analytics data:', data);
        this.analyticsData = data;
      });
    }
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
}

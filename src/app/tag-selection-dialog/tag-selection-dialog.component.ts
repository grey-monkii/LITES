import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-tag-selection-dialog',
  templateUrl: './tag-selection-dialog.component.html',
  styleUrls: ['./tag-selection-dialog.component.css']
})
export class TagSelectionDialogComponent {
  selectedTags: string[] = [];
  tags: string[] = [
    "Accounting", "Acting", "Advertising", "Aerospace Engineering", "Agriculture", "Algorithm Design", "Anatomy", "Animal Science", "Anthropology", "Applied Mathematics", 
    "Architecture", "Art History", "Astronomy", "Astrophysics", "Athletic Training", "Atmospheric Science", "Automotive Engineering", "Aviation", "Ballet", "Banking", 
    "Biochemistry", "Bioengineering", "Biology", "Biomechanics", "Biomedical Engineering", "Biotechnology", "Botany", "Broadcast Journalism", "Business Administration", 
    "Chemical Engineering", "Chemistry", "Child Development", "Chiropractic", "Civil Engineering", "Classical Studies", "Clinical Psychology", "Cognitive Science", 
    "Communication", "Computer Engineering", "Computer Science", "Construction Management", "Counseling Psychology", "Creative Writing", "Criminal Justice", "Criminology", 
    "Culinary Arts", "Dance", "Dentistry", "Digital Media", "Early Childhood Education", "Ecology", "Economics", "Education", "Electrical Engineering", "Electronics", 
    "Emergency Management", "Energy Engineering", "Engineering", "English Literature", "Environmental Engineering", "Environmental Science", "Ethnic Studies", 
    "Exercise Science", "Fashion Design", "Film Studies", "Finance", "Fine Arts", "Fire Science", "Food Science", "Foreign Languages", "Forensic Science", "French", 
    "Game Design", "Gender Studies", "Genetics", "Geography", "Geology", "German", "Government", "Graphic Design", "Health Administration", "Health Education", "Health Science", 
    "History", "Horticulture", "Hospitality Management", "Human Resources", "Human Services", "Illustration", "Industrial Design", "Industrial Engineering", 
    "Information Technology", "Interior Design", "International Business", "International Relations", "Italian", "Japanese", "Journalism", "Kinesiology", 
    "Landscape Architecture", "Law", "Liberal Arts", "Library Science", "Linguistics", "Management Information Systems", "Marine Biology", "Marketing", "Mass Communication", 
    "Materials Science", "Mathematics", "Mechanical Engineering", "Media Studies", "Medical Technology", "Medicine", "Meteorology", "Microbiology", "Middle Eastern Studies", 
    "Military Science", "Music", "Music Education", "Music Performance", "Music Production", "Nanotechnology", "Neuroscience", "Nursing", "Nutrition", "Occupational Therapy", 
    "Oceanography", "Operations Management", "Optometry", "Organizational Psychology", "Pharmacy", "Philosophy", "Photography", "Physical Education", "Physical Therapy", 
    "Physics", "Political Science", "Pre-Law", "Pre-Med", "Psychology", "Public Administration", "Public Health", "Public Relations", "Radiology", "Real Estate", 
    "Religious Studies", "Respiratory Therapy", "Risk Management", "Robotics", "Russian", "Sales", "Sociology", "Software Engineering", "Spanish", "Special Education", 
    "Speech Therapy", "Sports Management", "Statistics", "Sustainable Design", "Tax Accounting", "Teaching", "Technical Writing", "Theater", "Tourism Management", 
    "Urban Planning", "Veterinary Medicine", "Video Production", "Web Design", "Wildlife Management", "Women's Studies", "Zoology"
  ];
  

  filteredTags: string[] = [];
  searchInput: string = '';
  alphabet: string[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  tagSections: { section: string, tags: string[] }[] = [];
  selectedLetter: string = ''; 

  constructor(
    private dialogRef: MatDialogRef<TagSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) private data: { selectedTags: string[] }
  ) {
    // Initialize selected tags with the existing selected tags
    this.selectedTags = [...data.selectedTags];
    this.filteredTags = [...this.tags];
    this.groupTagsIntoSections(this.filteredTags);
  }

  toggleTag(tag: string): void {
    if (this.isSelected(tag)) {
      // Remove tag if already selected
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    } else {
      // Add tag if not selected
      this.selectedTags.push(tag);
    }
  }

  isSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  groupTagsIntoSections(tags: string[]) {
    // Clear existing tag sections
    this.tagSections = [];

    this.alphabet.forEach(letter => {
      const tagsInLetter = tags.filter(tag => tag.toUpperCase().startsWith(letter));
      if (tagsInLetter.length > 0) {
        this.tagSections.push({ section: letter, tags: tagsInLetter });
      }
    });
  }

  scrollToSection(letter: string) {
    const element = document.getElementById(letter);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  applyTags(): void {
    this.dialogRef.close(this.selectedTags);
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  // Method to filter tags dynamically based on search input
  filterTags() {
    // Clear existing tag sections
    this.tagSections = [];

    // Filter tags based on search input
    this.filteredTags = this.tags.filter(tag =>
      tag.toLowerCase().includes(this.searchInput.toLowerCase())
    );

    // Group filtered tags into sections
    this.groupTagsIntoSections(this.filteredTags);
  }
}

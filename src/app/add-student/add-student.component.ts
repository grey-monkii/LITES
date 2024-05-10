import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs'; // Add this import

@Component({
  selector: 'app-add-student',
  templateUrl: './add-student.component.html',
  styleUrl: './add-student.component.css'
})
export class AddStudentComponent implements OnInit{
  student: any = {};
  readingId: string = "Tap ID to locate book";
  uniqueId: string = "default"; // Provide a default unique ID
  readCardRef: any; 

  constructor(private firestore: AngularFirestore, private db: AngularFireDatabase, private datePipe: DatePipe) {
    this.readCardRef = this.db.object(`LITES/readCard/cardvalue`).valueChanges(); // Fetch cardvalue based on uniqueId
  }

  saveStudent() {
    // Save student data to Firestore
    this.firestore.collection('students').doc(this.student.idNumber).set({
      name: this.student.name,
      idNumber: this.student.idNumber,
      course: this.student.course,
      year: this.student.year,
      cardValue: this.readingId // Autopopulate cardValue with readingId
    })
    .then(() => {
      console.log('Student data saved to Firestore');
      // Clear the form after successful submission
      this.student = {};
    })
    .catch(error => console.error('Error saving student data: ', error));
  }

  ngOnInit() {
    // Add listener to readCard node
    this.readCardRef.subscribe((cardValue: any) => {
      if (cardValue) {
        this.readingId = cardValue;
        console.log('Card Value was read successfully.');
      } else {
        this.readingId = "Tap ID to locate book";
      }
    });
  }
}

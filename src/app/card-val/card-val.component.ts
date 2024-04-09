import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CardValService } from '../../assets/service/card-val.service';

@Component({
  selector: 'app-card-val',
  templateUrl: './card-val.component.html',
  styleUrl: './card-val.component.css'
})
export class CardValComponent implements OnInit{
  jsonData: any;

  constructor(private cardValService: CardValService) {}

  ngOnInit(): void {
    this.cardValService.fetchData().subscribe(data => {
      this.jsonData = JSON.stringify(data);
    });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class CardValService {

  constructor(private http: HttpClient) {}

  fetchData(): Observable<any> {
    return this.http.get<any>('https://localhost:5000/data');
  }

  postData(data: any): Observable<any> {
    return this.http.post<any>('https://localhost:4200/post', data);
  }
}

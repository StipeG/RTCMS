import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { HttpApi } from '../../core/http/http-api';


export class Users
{
  Id: number;
  FirstName: string;
  LastName: string;
  Username: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http: HttpClient) { }
  list(): Observable<Users[]> {
    return this.http.get(HttpApi.usersList)
        .pipe(
        map(response => {  

          return <Users[]>response;
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
}

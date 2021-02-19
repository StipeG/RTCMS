import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { HttpApi } from '../../core/http/http-api';


export interface Users
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
    return this.http.get<Users[]>(HttpApi.usersList)
        .pipe(
        map((response: Users[])  => {  
          return response as Users[];
      }),
      catchError( error => {
          return throwError(error); 
      })
      );
  }
}

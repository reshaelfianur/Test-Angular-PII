import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map } from "rxjs/operators";
import { retry, catchError } from 'rxjs/operators';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  public api: string = 'https://reqres.in/api/users';

  constructor(private http: HttpClient) { }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  }

  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An error occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    return throwError(
      'Something bad happened; please try again later.');
  };

  createItem(item: object): Observable<User> {
    return this.http
      .post<User>(this.api, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  getItem(id: number): Observable<User> {
    return this.http
      .get<User>(this.api + '/' + id)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  getList(): Observable<User> {
    return this.http
      .get<User>(`${this.api}?per_page=12`)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  updateItem(id: number, item: object): Observable<User> {
    return this.http
      .put<User>(this.api + '/' + id, JSON.stringify(item), this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  deleteItem(id: number) {
    return this.http
      .delete<User>(this.api + '/' + id, this.httpOptions)
      .pipe(
        retry(2),
        catchError(this.handleError)
      )
  }

  findUser(
    sortOrder: string = 'asc',
    pageNumber: number = 0,
    pageSize: number = 5,
    sortColumn: string = 'id',
    filter: any = null): Observable<User[]> {

    let params = new HttpParams()
      .set('sort', sortOrder)
      .set('page', pageNumber + 1)
      .set('per_page', pageSize.toString())
      .set('column', sortColumn)

    if (filter != null && filter != "") {
      params = params.set('email', filter);
    }

    return this.http.get(this.api, {
      params: params
    }).pipe(
      map((res: any) => res)
    );
  }
}

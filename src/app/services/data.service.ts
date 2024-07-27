import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams  } from '@angular/common/http'
import { Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators'
import { catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { IIntake } from '../interfaces/intake.interface';
import { IUserLogin } from '../interfaces/userlogin.interface'
import { ILoginResponse } from '../interfaces/loginresponse.interface'
import { IGroup } from '../interfaces/group.interface';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  apiurl: string = 'http://localhost:8001'
  tokenKey: string = 'auth_token';
  token: string = ''; 

  constructor(private http: HttpClient) { }

  decodeToken(): any {
    const token = this.getToken();
    if (token) {
      try {
        // console.log(jwtDecode(token));
        return jwtDecode(token);
      } catch (Error) {
        return null;
      }
    }
    return null;
  }

  getUserRole(): string | null {
    const decodedToken = this.decodeToken();
    return decodedToken ? decodedToken.role : null;
  }

  setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  getHeaders(): HttpHeaders {
    // const token = this.getToken();
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBtYWlsLmFwdS5lZHUubXkiLCJyb2xlIjoiYWRtaW4iLCJleHAiOjE3MjIxMTA4ODN9.GixcKhLEOnxM4CtkSg3UkTzZWNo81Z30Hu5KdLbdXBA"
    console.log(this.decodeToken());
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Get all INTAKES.
  getAllIntakes(): Observable<IIntake[]> {
    return this.http.get<IIntake[]>(`${this.apiurl}/scheduler/intake/all`, { headers: this.getHeaders() });
  }

  // Create an INTAKE.
  createIntake(intakeData: any): Observable<IIntake> {
    return this.http.post<IIntake>(`${this.apiurl}/scheduler/intake/`, intakeData, { headers: this.getHeaders() });
  }

  // Create Semesters in Bulk
  createBulkSemesters(data: any, intakeId: Number): Observable<any> {
    return this.http.post<any>(`${this.apiurl}/scheduler/semester/create?intake_id=${intakeId}`, data, {headers: this.getHeaders() });
  }

  // Create a Group.
  createGroup(groupData: any): Observable<IGroup> {
    return this.http.post<IGroup>(`${this.apiurl}/group`, groupData, { headers: this.getHeaders() })
  }

  // Get all Group
  getGroups(id: any, type: any): Observable<IGroup[]> {
    return this.http.get<IGroup[]>(`${this.apiurl}/group/all?parentid=${id}&parenttype=${type}`, { headers: this.getHeaders() })
  }

  // Get all Parents
  getParents() {
    return this.http.get<any>(`${this.apiurl}/parent/all`, {headers: this.getHeaders() })
  }

  // Get Intakes by list of Group IDs.
  getIntakesByGroupIdList(list: Number[]) {
    return this.http.get<any>(`${this.apiurl}/scheduler/intake/all?group_ids=${list}`, { headers: this.getHeaders() });
  }

  getIntakesByYear(year: Number):  Observable<IIntake[]> {
    console.log(year);
    return this.http.get<IIntake[]>(`${this.apiurl}/scheduler/intake/all?year=${year}`, { headers: this.getHeaders() });
  }

  // Get all the semesters of a certain IntakeID
  getSemestersByIntakeId(id: any): Observable<any> {
    const params = { intakeid: id.toString() };
    return this.http.get<any>(`${this.apiurl}/scheduler/semester/all`, { params, headers: this.getHeaders() })
  }

  // Get all the semesters from a list of intakeid.
  getSemestersByIntakeIdList(list: Number []) {
    return this.http.get<any>(`${this.apiurl}/scheduler/semester/all?intake_ids=${list}`, {headers: this.getHeaders() })
  }

  // Edit semesters by intake id.
  editSemestersByIntakeId(id: string, semesters: any) {
    const url = `${this.apiurl}/scheduler/semester/update`;
    const params = { intake_id: id.toString() };
    return this.http.post<any[]>(url, semesters, { params, headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  editProgramme(id: number, data: any) {
    return this.http.patch<any[]>(`${this.apiurl}/admin/programmes/${id}`,  data, { headers: this.getHeaders() })
  }

  editCourse(id: number, data: any) {
    return this.http.patch<any[]>(`${this.apiurl}/admin/course/${id}`, data, { headers: this.getHeaders() })
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Backend returned an unsuccessful response code
      if (error.status === 422) {
        // Unprocessable Entity error
        errorMessage = `Validation Error: ${JSON.stringify(error.error.detail)}`;
      } 
      else if (error.status === 400) {
        errorMessage = `Email has been taken`
      }
      else {
        errorMessage = `Backend returned code ${error.status}, body was: ${JSON.stringify(error.error)}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  login(email: string, password: string): Observable<ILoginResponse> {
    const loginData: IUserLogin = { email, password };
    // console.log(loginData);
    return this.http.post<ILoginResponse>(`${this.apiurl}/auth/login`, loginData)
      .pipe(
        tap(response => {
          // Store the token in localStorage
          console.log(response);
          localStorage.setItem(this.tokenKey, response.access_token);
        })
      );
  }

  register(email: string, password: string, role: string): any {
    const userData = { email, password, role };
    return this.http.post<any>(`${this.apiurl}/auth/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

}

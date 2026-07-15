import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VerificationResponse } from './verificationservice.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.dev';
@Injectable({
  providedIn: 'root'
})
export class HttpserviceService {

  private readonly ApiUrl = environment.ApiUrl;

  constructor(private http: HttpClient,) {}

  postData(url: string, body: any = {}): Observable<VerificationResponse> {

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'text/plain',
      'X-API-KEY': environment.ApiKey
    });

    return this.http.post<VerificationResponse>(
      `${this.ApiUrl}${url}`,
      body,
      { headers }
    );
  }
  
  createdemoinstance(payload:any) {
    return this.postData('Employeedata/new-user',payload);
  }

}

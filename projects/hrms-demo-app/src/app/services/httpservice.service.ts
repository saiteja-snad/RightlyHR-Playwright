import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { VerificationResponse } from './verificationservice.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpserviceService {

  private readonly ApiUrl = 'https://localhost:44374/api/Employeedata';

  constructor(private http: HttpClient) {}

  postData(url: string, body: any = {}): Observable<VerificationResponse> {
    return this.http.post<VerificationResponse>(`${this.ApiUrl}${url}`, body);
  }
  
  createdemoinstance(payload:any) {
    return this.postData('/verify-email-code', { payload });
  }

}

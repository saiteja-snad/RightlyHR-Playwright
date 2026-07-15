import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface VerificationResponse {
  statusCode: number;
  message: string;
  isVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VerificationserviceService {

  private readonly ApiUrl = 'https://localhost:44374/api/Employeedata';

  constructor(private http: HttpClient) {}

  postData(url: string, body: any = {}): Observable<VerificationResponse> {
    return this.http.post<VerificationResponse>(`${this.ApiUrl}${url}`, body);
  }

  sendVerificationCode(email: string) {
    return this.postData(`/send-verification-code?email=${encodeURIComponent(email)}`);
  }

  verifyEmailCode(email: string, code: string) {
    return this.postData('/verify-email-code', { email, code });
  }
}

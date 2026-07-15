import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface VerificationResponse {
  statusCode: number;
  message: string;
  isVerified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VerificationserviceService {

  private readonly ApiUrl = environment.ApiUrl;

  constructor(private http: HttpClient) {}

  postData(url: string, body: any = {}): Observable<VerificationResponse> {
    return this.http.post<VerificationResponse>(`${this.ApiUrl}${url}`, body);
  }

  sendVerificationCode(email: string) {
    return this.postData(`Employeedata/send-verification-code?email=${encodeURIComponent(email)}`);
  }

  verifyEmailCode(email: string, code: string) {
    return this.postData('Employeedata/verify-email-code', { email, code });
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


export interface VerificationResponse {
  statusCode: number;
  message: string;
  verified: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class VerificationserviceService {

  private readonly ApiUrl = environment.ApiUrl;

  constructor(private http: HttpClient) {}

  postData(url: string, body: any = {}): Observable<VerificationResponse> {
    const headers = new HttpHeaders({
      'X-API-KEY': environment.ApiKey
    });

    return this.http.post<VerificationResponse>(
      `${this.ApiUrl}${url}`,
      body,
      { headers }
    );
  }

  sendVerificationCode(email: string,firstName:any) {
    return this.postData(`email-verification/send`,{email,firstName});
  }

  verifyEmailCode(email: string, code: string) {
    return this.postData('email-verification/verify', { email, code });
  }
}

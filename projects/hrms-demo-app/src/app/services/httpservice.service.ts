import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class HttpserviceService {

  private readonly ApiUrl = environment.ApiUrl;

  constructor(private http: HttpClient,) {}

  postData(url: string, body: any = {}) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'X-API-KEY': environment.ApiKey
    });

    return this.http.post(
      `${this.ApiUrl}${url}`,
      body,
      { headers }
    );
  }
  
  createdemoinstance(payload:any) {
    return this.postData('clients',payload);
  }
}
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TenantService } from '../common-services/tenant.service';
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  token!: any;
  get ApiUrl(): string { return this.tenantService.currentApiUrl; }

  constructor(private http: HttpClient, private tenantService: TenantService) { }

  login(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);
  }

  //function to call the get url
  getData(url: string) {
    return this.http.get(`${this.ApiUrl}${url}`);
  }

  putData(url: string, data: any): Observable<any> {
    return this.http.put(`${this.ApiUrl}/${url}`, data);
  }

  //function to call the post the url
  postData(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);

  }

  //function to store the login token
  prospectiveStoreToten(tokenValue: any) {
    localStorage.setItem('prospectiveusertoken', tokenValue)
  }

  // function to get the prospective emp token 
  isProspectiveLogIn(): boolean {
    return !!localStorage.getItem('prospectiveusertoken')
  }
}
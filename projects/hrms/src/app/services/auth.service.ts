import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.dev';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }
  ApiUrl = environment.ApiUrl;
  login(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);
  }
  getlogin(url:string){
    return this.http.get(`${this.ApiUrl}${url}`);
  }
  getData(url:string){
    return this.http.get(`${this.ApiUrl}${url}`);
  }
  deleteData(url:string){
    return this.http.delete(`${this.ApiUrl}${url}`);
  }
  postData(url:string,data:any){
    return this.http.post(`${this.ApiUrl}${url}`,data);

  }
  storeToken(tokenValue:any){
   localStorage.setItem('fusionuser',JSON.stringify(tokenValue) )

  }
  removeToken(){
    localStorage.removeItem('fusionuser')

   }
  getToken(){
    return JSON.parse(localStorage.getItem('fusionuser')||'{}')
  }
  isLoggedIn():boolean{
    return!!localStorage.getItem('fusionuser')
  }
  getRoles(){
    return JSON.parse(localStorage.getItem('fusionuserRoles')||'[]')
  }
}

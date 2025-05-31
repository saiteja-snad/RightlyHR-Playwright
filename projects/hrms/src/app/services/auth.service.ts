import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';


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
    localStorage.removeItem('rightlyHrUser')

   }
  getToken(){
    return JSON.parse(localStorage.getItem('rightlyHrUser')||'{}')
  }
  isLoggedIn():boolean{
    return!!localStorage.getItem('rightlyHrUser')
  }
  getRoles(){
    return JSON.parse(localStorage.getItem('rightlyHrUserRoles')||'[]')
  }
  convertAngularDateFormatToJs(angularFormat: string): string {
  const map: Record<string, string> = {
    // Angular : JavaScript (Moment.js-like)
    'y': 'YYYY',
    'yy': 'YY',
    'yyy': 'YYY', // rarely used
    'yyyy': 'YYYY',
    'M': 'M',
    'MM': 'MM',
    'MMM': 'MMM',
    'MMMM': 'MMMM',
    'd': 'D',
    'dd': 'DD',
    'E': 'd',      // Day of week (short)
    'EEE': 'ddd',  // e.g., Mon
    'EEEE': 'dddd', // e.g., Monday
    'h': 'h',
    'hh': 'hh',
    'H': 'H',
    'HH': 'HH',
    'm': 'm',
    'mm': 'mm',
    's': 's',
    'ss': 'ss',
    'a': 'A',
    'z': 'Z'
  };

  // Replace Angular format tokens with JS (Moment) tokens
  const pattern = /y{1,4}|M{1,4}|d{1,2}|E{1,4}|H{1,2}|h{1,2}|m{1,2}|s{1,2}|a|z/g;
  return angularFormat.replace(pattern, match => map[match] || match);
}
}

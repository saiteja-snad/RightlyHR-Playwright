import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthServiceService {

  constructor() { }
  getToken(){
    return JSON.parse(localStorage.getItem('fusionuser')||'{}')
  }
}

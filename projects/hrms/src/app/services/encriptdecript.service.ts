import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EncriptdecriptService {
private secretKey = environment.secretKey; // Change to environment variable

  encrypt(data: any): string {
    const dataStr = JSON.stringify(data);
    return CryptoJS.AES.encrypt(dataStr, this.secretKey).toString();
  }

  decrypt(cipherText: string): any {
    const bytes = CryptoJS.AES.decrypt(cipherText, this.secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  }
}

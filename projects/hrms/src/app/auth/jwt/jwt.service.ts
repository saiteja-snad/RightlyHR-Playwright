import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtService {

   getTokenExpirationDate(token: string): Date | null {
    const decodedToken = this.decodeToken(token);
    if (!decodedToken?.exp) return null;

    return new Date(decodedToken.exp * 1000);
  }

  isTokenExpired(token: string | null, offsetSeconds = 0): boolean {
    if (!token) return true; // ✅ No token → expired

    const expirationDate = this.getTokenExpirationDate(token);
    if (!expirationDate) return true; // ✅ Invalid token → expired

    return expirationDate.valueOf() < (Date.now() + offsetSeconds * 1000);
  }

  isTokenValid(token: string | null, offsetSeconds = 0): boolean {
    return !this.isTokenExpired(token, offsetSeconds);
  }

  private decodeToken(token: string): any {
    if (!token) return null;

    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    // ✅ Fix: add padding for base64 decoding
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    try {
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error("JWT decoding failed:", error);
      return null;
    }
  }
}

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

  isTokenExpired(token: string, offsetSeconds = 0): boolean {
    const expirationDate = this.getTokenExpirationDate(token);
    return expirationDate ? expirationDate.valueOf() <= (Date.now() + offsetSeconds * 1000) : false;
  }

  isTokenValid(token: string, offsetSeconds = 0): boolean {
    return !this.isTokenExpired(token, offsetSeconds);
  }

  private decodeToken(token: string): any {
    const base64Url = token?.split('.')[1];
    const base64 = base64Url?.replace(/-/g, '+').replace(/_/g, '/');

    try {
      return JSON.parse(window.atob(base64));
    } catch (error) {
      return null;
    }
  }
}

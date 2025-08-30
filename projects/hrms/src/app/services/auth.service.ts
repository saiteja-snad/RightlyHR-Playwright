import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { OAuthService, TokenResponse } from 'angular-oauth2-oidc';
import { googleAuthConfig, microsoftAuthConfig } from '../auth/auth.config';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private oauthService: OAuthService,
    private router: Router
  ) { }

  ApiUrl = environment.ApiUrl;
  login(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);
  }
  getlogin(url: string) {
    return this.http.get(`${this.ApiUrl}${url}`);
  }
  getData(url: string) {
    return this.http.get(`${this.ApiUrl}${url}`);
  }
  deleteData(url: string) {
    return this.http.delete(`${this.ApiUrl}${url}`);
  }
  postData(url: string, data: any) {
    return this.http.post(`${this.ApiUrl}${url}`, data);

  }

  storeToken(tokenValue: any) {
    localStorage.setItem('fusionuser', JSON.stringify(tokenValue))
  }

  removeToken() {
    localStorage.removeItem('rightlyHrUser')
  }

  getToken() {
    return JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  getRoles() {
    return JSON.parse(localStorage.getItem('rightlyHrUserRoles') || '[]')
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

  loginWithMicrosoft(): Promise<{ accessToken: string; idToken: string }> {
    this.oauthService.configure(microsoftAuthConfig);
    return this.oauthService.loadDiscoveryDocumentAndLogin().then((loggedIn) => {
      if (loggedIn) {
        const accessToken = this.oauthService.getAccessToken();
        const idToken = this.oauthService.getIdToken();
        console.log(accessToken);
        console.log(idToken)
        this.router.navigate(['/uservalidation']);
        return { accessToken, idToken };
      } else {
        throw new Error('Microsoft login failed');
      }
    });
  }

  loginWithGoogle() {
    this.oauthService.configure(googleAuthConfig);
    this.oauthService.loadDiscoveryDocumentAndLogin();
  }

  logout() {
    this.oauthService.logOut();
  }

  get identityClaims() {
    return this.oauthService.getIdentityClaims();
  }

  get accessToken() {
    return this.oauthService.getAccessToken();
  }

  get idToken() {
    return this.oauthService.getIdToken();
  }

  async getTokenResponse(): Promise<TokenResponse> {
    // If token is expired or about to expire, refresh it
    if (this.oauthService.hasValidAccessToken()) {
      return {
        access_token: this.oauthService.getAccessToken(),
        id_token: this.oauthService.getIdToken(),
        refresh_token: this.oauthService.getRefreshToken(),
        scope: this.oauthService.scope,
        token_type: 'Bearer',
        expires_in: this.oauthService.getAccessTokenExpiration() - Date.now(),
      } as TokenResponse;
    }

    // If expired → refresh
    return (await this.oauthService.refreshToken()) as TokenResponse;
  }

  storeAuthResponse(authResponse: any): void {
    if (authResponse) {
      // Store whole object
      localStorage.setItem('authResponse', JSON.stringify(authResponse));

      // Optionally store important parts separately for quick access
      if (authResponse.accessToken) {
        localStorage.setItem('accessToken', authResponse.accessToken);
      }
      if (authResponse.refreshToken) {
        localStorage.setItem('refreshToken', authResponse.refreshToken);
      }
      if (authResponse.email) {
        localStorage.setItem('email', authResponse.email);
      }
      if (authResponse.name) {
        localStorage.setItem('name', authResponse.name);
      }
    }
  }


  getDeviceName(): string {
    const ua = navigator.userAgent;
    if (/windows/i.test(ua)) return 'Windows Device';
    if (/macintosh|mac os x/i.test(ua)) return 'Mac Device';
    if (/android/i.test(ua)) return 'Android Device';
    if (/iphone|ipad|ipod/i.test(ua)) return 'iOS Device';
    return 'Unknown Device';
  }

  async getIpAddress(): Promise<string> {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      return data.ip;
    } catch (err) {
      console.error('Failed to fetch IP address', err);
      return 'Unknown IP';
    }
  }

  onLogout(){
    const refreshToken = localStorage.getItem("refreshToken");

    const payload ={
      refreshToken : refreshToken
    }

    this.postData(`v2/Auth/logout`, payload).subscribe({
      next: (res) => {
        localStorage.clear();
      }
    });
  }

}
function next(value: Object): void {
  throw new Error('Function not implemented.');
}


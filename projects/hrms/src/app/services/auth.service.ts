import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { OAuthService, TokenResponse } from 'angular-oauth2-oidc';
import { googleAuthConfig, microsoftAuthConfig } from '../auth/auth.config';
import { Router } from '@angular/router';
import { catchError, map, throwError } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private oauthService: OAuthService,
    private router: Router,
    private modalService: NgbModal
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
    this.oauthService.configure({
      ...microsoftAuthConfig,
      customQueryParams: {
        prompt: 'select_account'  // 🔑 Force Microsoft to always show the account picker
      }
    });
    return this.oauthService.loadDiscoveryDocumentAndLogin().then((loggedIn) => {
      if (loggedIn) {
        const accessToken = this.oauthService.getAccessToken();
        const idToken = this.oauthService.getIdToken();
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

  logout(): void {
    const tokenString = localStorage.getItem('currentUser');
    const token = tokenString ? JSON.parse(tokenString) : null;

    const completeLogout = () => {
      sessionStorage.clear();
      localStorage.clear();
      this.router.navigate(['/login']);
    };

    if (!token?.refreshToken) {
      completeLogout();
      return;
    }

    this.onLogout();
  }

  get accessToken() {
    return this.oauthService.getAccessToken();
  }

  async getTokenResponse(): Promise<TokenResponse | null> {
    try {
      // Case 1: If token is valid → return it
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

      // Case 2: If token expired → refresh only if refresh_token is present
      const refreshToken = this.oauthService.getRefreshToken();
      if (refreshToken) {
        const refreshed = await this.oauthService.refreshToken();
        if (refreshed) {
          return refreshed as TokenResponse;
        }
      }

      // Case 3: No access_token and no refresh_token → user not logged in
      return null;
    } catch (error) {
      console.error('Token fetch/refresh failed:', error);
      return null;
    }
  }

  storeAuthResponse(authResponse: any): void {
    if (authResponse) {

      // Store whole object
      localStorage.setItem('currentUser', JSON.stringify(authResponse));

      // Optionally store important parts separately for quick access
      if (authResponse.accessToken) {
        localStorage.setItem('accessToken', authResponse.accessToken);
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

  onLogout() {
    const tokenString = localStorage.getItem("currentUser");
    const token = tokenString ? JSON.parse(tokenString) : null;

    if (!token || !token.refreshToken) {
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }

    const payload = {
      refreshToken: token.refreshToken
    }

    this.postData(`v2/Auth/logout`, payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        sessionStorage.clear();
        localStorage.clear();
        this.router.navigate(['/login']);
      },
      error: (err) => {
        localStorage.clear();
        sessionStorage.clear();
        this.router.navigate(['/login']);
      }
    });
  }

  refreshToken() {
    const tokenString = localStorage.getItem("currentUser");
    const token = tokenString ? JSON.parse(tokenString) : null;

    if (!token || !token.refreshToken) {
      localStorage.clear();
      sessionStorage.clear();
      this.logout();
      this.router.navigate(['/login']);
    }

    const payload = {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      deviceName: this.getDeviceName(),
      loginType: token.loginType
    };

    return this.http.post<any>(`${this.ApiUrl}v2/Auth/refresh`, payload).pipe(
      map((res) => {
        if (res) {
          this.storeAuthResponse(res);
        }
        return res;
      }),
      catchError((error) => {
        this.logout();
        this.router.navigate(['/login']);
        return throwError(() => error);
      })
    );
  }


}
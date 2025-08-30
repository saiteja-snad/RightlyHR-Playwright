import { HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, switchMap, throwError } from 'rxjs';
import { JwtService } from '../jwt/jwt.service';
import { AuthService } from '../../services/auth.service';

@Injectable()
export class TokeninterceptorsInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  
  constructor(
    private router:Router, 
    private jwtService:JwtService,
    private http: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
   const token =localStorage.getItem("accessToken")
   if (!token || !this.jwtService.isTokenValid(token)) {
    localStorage.clear();
    this.router.navigate(['/']);
   // return EMPTY
  }
   const authRequest = req.clone({
     setHeaders: {
       Authorization: `Bearer ${token}`
     }
   });

   return next.handle(authRequest);
 }

  //  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //   const token = localStorage.getItem("accessToken");

  //   // 1️⃣ If token doesn’t exist → force logout
  //   if (!token) {
  //     this.handleLogout();
  //     return throwError(() => new Error('No access token found'));
  //   }

  //   // 2️⃣ If token is expired → try refreshing
  //   if (this.jwtService.isTokenExpired(token)) {
  //     if (!this.isRefreshing) {
  //       this.isRefreshing = true;
  //       return this.refreshToken().pipe(
  //         switchMap(newToken => {
  //           this.isRefreshing = false;
  //           const cloned = this.addToken(req, newToken);
  //           return next.handle(cloned);
  //         }),
  //         catchError(err => {
  //           this.isRefreshing = false;
  //           this.handleLogout();
  //           return throwError(() => err);
  //         })
  //       );
  //     } else {
  //       // If another refresh is in progress → block this request
  //       return throwError(() => new Error('Refresh already in progress'));
  //     }
  //   }

  //   // 3️⃣ If token is valid → attach it and continue
  //   const cloned = this.addToken(req, token);
  //   return next.handle(cloned);
  // }

  // private addToken(req: HttpRequest<any>, token: string) {
  //   return req.clone({
  //     setHeaders: {
  //       Authorization: `Bearer ${token}`
  //     }
  //   });
  // }

  // private refreshToken(): Observable<string> {
  //   const refreshToken = localStorage.getItem("refreshToken");
  //   if (!refreshToken) {
  //     this.handleLogout();
  //     return throwError(() => new Error('No refresh token found'));
  //   }

  //   // 🔑 Call your refresh API
  //   return this.http.postData('v2/Auth/social', {
  //     accessToken: localStorage.getItem("accessToken"),
  //     refreshToken: refreshToken,
  //     deviceName: this.http.getDeviceName()
  //   }).pipe(
  //     switchMap((response: any) => {
  //       const newAccessToken = response.accessToken;
  //       const newRefreshToken = response.refreshToken;

  //       // Update in localStorage
  //       localStorage.setItem("accessToken", newAccessToken);
  //       localStorage.setItem("refreshToken", newRefreshToken);

  //       return new Observable<string>(observer => {
  //         observer.next(newAccessToken);
  //         observer.complete();
  //       });
  //     })
  //   );
  // }

  // private handleLogout() {
  //   localStorage.clear();
  //   this.router.navigate(['/login']);
  // }
  
}

import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';
import { JwtService } from '../jwt/jwt.service';
import { AuthService } from '../../services/auth.service';
import { TenantService } from '../../services/tenant.service';

@Injectable()
export class TokeninterceptorsInterceptor implements HttpInterceptor {
  // private isRefreshing = false;
  private isRefreshing = false;

  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor(
    private router: Router,
    private jwtService: JwtService,
    private http: AuthService,
    private tenantService: TenantService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem("accessToken");
    const domain = this.tenantService.currentDomain;
    const tenantId = this.tenantService.currentTenantId;

    // Attach domain and tenantId headers to all API requests
    const headers: Record<string, string> = {};
    if (domain) headers['X-Tenant-Domain'] = domain;
    if (tenantId) headers['X-Tenant-Id'] = tenantId;
    if (Object.keys(headers).length) {
      request = request.clone({ setHeaders: headers });
    }

    //  Skip token handling for login, refresh, social, or domain verification endpoints
    const url = request.url.toLowerCase();
    if (
      url.includes('/api/v2/auth/login') ||
      url.includes('/api/v2/auth/refresh') ||
      url.includes('v2/auth/social') ||
      url.includes('v2/auth/register') ||
      url.includes('/api/auth/') ||
      url.includes('tenant/verify-domain')
    ) {
      return next.handle(request);
    }
    
    //  Check if token exists and is expired
    // if (token && this.jwtService.isTokenExpired(token)) {
    //   if (!this.isRefreshing) {
    //     this.isRefreshing = true;
    //     this.refreshTokenSubject.next(null);

    //     return this.http.refreshToken().pipe(
    //       switchMap((res: any) => {
    //         this.isRefreshing = false;

    //         // ✅ Update localStorage (storeAuthResponse already handles all keys)
    //         this.http.storeAuthResponse(res);

    //         const newAccessToken = res.accessToken;
    //         this.refreshTokenSubject.next(newAccessToken);

    //         return next.handle(this.addToken(request, newAccessToken));
    //       }),
    //       catchError(err => {
    //         this.isRefreshing = false;
    //         // this.http.logout();
    //         return throwError(() => err);
    //       })
    //     );
    //   } else {
    //     // Wait until token refresh is completed
    //     return this.refreshTokenSubject.pipe(
    //       filter(token => token != null),
    //       take(1),
    //       switchMap((token) => next.handle(this.addToken(request, token)))
    //     );
    //   }
    // }

    //  If token is valid, just attach and continue
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(request, next);
        } else {
          return throwError(() => error);
        }
      })
    );
  }


  private addToken(request: HttpRequest<any>, token: string) {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.http.refreshToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;

          //  Update localStorage (storeAuthResponse already handles all keys)
          this.http.storeAuthResponse(res);

          const newAccessToken = res.accessToken;
          this.refreshTokenSubject.next(newAccessToken);

          return next.handle(this.addToken(request, newAccessToken));
        }),
        catchError(err => {
          this.isRefreshing = false;
          // this.http.logout();
          // this.http.onLogout();
          // this.router.navigate(['/login']);
          return throwError(() => err);
        })
      );
    } else {
      // Wait until token refresh is completed
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap((token) => next.handle(this.addToken(request, token)))
      );
    }
  }
}

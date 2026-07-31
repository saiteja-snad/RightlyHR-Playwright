import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DomainVerificationResponse {
  isValid: boolean;
  tenantId?: string;
  tenantName?: string;
  logo?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private apiUrl = environment.ApiUrl;
  private domainSubject = new BehaviorSubject<string>('');
  private verificationStatusSubject = new BehaviorSubject<'idle' | 'verifying' | 'verified' | 'invalid'>('idle');
  private verificationResponseSubject = new BehaviorSubject<DomainVerificationResponse | null>(null);
  private logoSubject = new BehaviorSubject<string>('');
  private apiUrlSubject = new BehaviorSubject<string>(environment.ApiUrl);

  domain$ = this.domainSubject.asObservable();
  verificationStatus$ = this.verificationStatusSubject.asObservable();
  logo$ = this.logoSubject.asObservable();

  private defaultLogo = '/logos/rightlyhr-full-logo.png';

  constructor(private http: HttpClient) {
    const domain = this.getDomainFromHostname();
    if (domain) {
      this.domainSubject.next(domain);
    }
  }

  reset(): void {
    this.verificationStatusSubject.next('idle');
    this.verificationResponseSubject.next(null);
  }

  get currentLogo(): string {
    return this.logoSubject.value || this.defaultLogo;
  }

  get isLogoLoaded(): boolean {
    return !!this.logoSubject.value;
  }

  get currentDomain(): string {
    return this.domainSubject.value || this.getDomainFromHostname();
  }

  get currentTenantId(): string {
    return this.verificationResponseSubject.value?.tenantId || '';
  }

  get currentApiUrl(): string {
    return this.apiUrlSubject.value;
  }

  get verificationStatus(): 'idle' | 'verifying' | 'verified' | 'invalid' {
    return this.verificationStatusSubject.value;
  }

  /**
   * Resolves tenant domain from:
   * 1. ?domain= query param (works on both localhost and deployed)
   * 2. Subdomain from hostname (e.g. snad.rightlyhr.com)
   * 3. localStorage fallback (localhost only, for page refresh)
   */
  getDomainFromHostname(): string {
    const urlParam = new URLSearchParams(window.location.search).get('domain') || '';
    if (urlParam) {
      localStorage.setItem('tenantDomain', urlParam);
      return urlParam;
    }

    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const parts = hostname.split('.');
      if (parts.length > 2) return parts[0];
    }

    return localStorage.getItem('tenantDomain') || '';
  }

  verifyDomain(domain: string): Observable<DomainVerificationResponse> {
    if (!domain || domain.trim() === '') {
      this.verificationStatusSubject.next('idle');
      return of({ isValid: false });
    }

    this.verificationStatusSubject.next('verifying');
    this.domainSubject.next(domain);

    return this.http.get<DomainVerificationResponse>(
      `${this.apiUrl}Tenant/verify-domain?domain=${encodeURIComponent(domain)}`
    ).pipe(
      tap((response) => {
        this.verificationResponseSubject.next(response);
        this.verificationStatusSubject.next('verified');
        if (response?.tenantId) {
          localStorage.setItem('tenantId', response.tenantId);
        }
        const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname);
        if (!isLocalhost) {
          this.apiUrlSubject.next(`http://api-${domain}.rightlyhr.com/api/`);
        }
        const logo = response?.logo || '';
        const fullLogoUrl = logo
          ? (logo.startsWith('http') ? logo : `${environment.viewUrl}${logo}`)
          : this.defaultLogo;
        this.logoSubject.next(fullLogoUrl);
      }),
      catchError((error) => {
        console.error('Domain verification failed:', error);
        this.verificationStatusSubject.next('invalid');
        this.verificationResponseSubject.next(null);
        this.logoSubject.next(this.defaultLogo);
        return of({ isValid: false });
      })
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

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

  domain$ = this.domainSubject.asObservable();
  verificationStatus$ = this.verificationStatusSubject.asObservable();
  verificationResponse$ = this.verificationResponseSubject.asObservable();
  logo$ = this.logoSubject.asObservable();

  private defaultLogo = '/logos/rightlyhr-full-logo.png';

  constructor(private http: HttpClient) {
    // Auto-init domain from subdomain on service creation
    const domain = this.getDomainFromHostname();
    if (domain) {
      this.domainSubject.next(domain);
    }
  }

  /**
   * Resets tenant state back to defaults (call on logout).
   */
  reset(): void {
    this.verificationStatusSubject.next('idle');
    this.verificationResponseSubject.next(null);
  }

  /**
   * Returns the current logo URL. Falls back to default if none set.
   */
  get currentLogo(): string {
    return this.logoSubject.value || this.defaultLogo;
  }

  get isLogoLoaded(): boolean {
    return !!this.logoSubject.value;
  }

  /**
   * Resolves tenant domain from:
   * 1. ?domain= query param (works on both localhost and deployed)
   * 2. Subdomain from hostname (e.g. snad.rightlyhr.com)
   * 3. localStorage fallback (localhost only, for page refresh)
   */
  getDomainFromHostname(): string {
    // 1. ?domain= query param (reliable via raw URL)
    const urlParam = new URLSearchParams(window.location.search).get('domain') || '';
    if (urlParam) {
      localStorage.setItem('tenantDomain', urlParam);
      return urlParam;
    }

    // 2. Subdomain from hostname on deployed environments
    const hostname = window.location.hostname;
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      const parts = hostname.split('.');
      if (parts.length > 2) return parts[0];
    }

    // 3. localStorage fallback (set by login component via ActivatedRoute)
    return localStorage.getItem('tenantDomain') || '';
  }

  /**
   * Sets the domain value.
   */
  setDomain(domain: string): void {
    this.domainSubject.next(domain);
  }

  /**
   * Returns the current domain value.
   */
  get currentDomain(): string {
    return this.domainSubject.value || this.getDomainFromHostname();
  }

  /**
   * Returns the current verification status.
   */
  get verificationStatus(): 'idle' | 'verifying' | 'verified' | 'invalid' {
    return this.verificationStatusSubject.value;
  }

  get currentTenantId(): string {
    return this.verificationResponseSubject.value?.tenantId || '';
  }

  get currentApiUrl(): string {
    return this.apiUrl;
  }

  /**
   * Calls the verify-domain API with the given domain.
   */
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

  /**
   * Initializes the service by reading domain from URL and verifying it.
   */
  initFromHostname(): Observable<DomainVerificationResponse> {
    const domain = this.getDomainFromHostname();
    if (domain) {
      this.domainSubject.next(domain);
      return this.verifyDomain(domain);
    }
    return of({ isValid: false });
  }
}

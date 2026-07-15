import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { environment } from '../../environments/environment.dev';

const API_KEY = environment.ApiKey;
export const interceptorsInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const apiKey = isPlatformBrowser(platformId) ? (localStorage.getItem('apiKey') ?? API_KEY) : API_KEY;

  return next(req.clone({
    setHeaders: { 'X-API-KEY': apiKey }
  }));
};

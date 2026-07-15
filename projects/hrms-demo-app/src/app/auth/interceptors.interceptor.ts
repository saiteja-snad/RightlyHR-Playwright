import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

const API_KEY = 'rhr_B8E2F9A46C1D7E3F5A9C2B6D8F1A4E7C9D3B5F8A1E6C2D7B4F9A3C8E5D1B6A2';
export const interceptorsInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);
  const apiKey = isPlatformBrowser(platformId) ? (localStorage.getItem('apiKey') ?? API_KEY) : API_KEY;

  return next(req.clone({
    setHeaders: { 'X-API-KEY': apiKey }
  }));
};

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantService } from '../common-services/tenant.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('prospectiveusertoken');
  const tenantService = inject(TenantService);
  const domain = tenantService.currentDomain;
  const tenantId = tenantService.currentTenantId;

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (domain) headers['X-Tenant-Domain'] = domain;
  if (tenantId) headers['X-Tenant-Id'] = tenantId;

  const authRequest = Object.keys(headers).length ? req.clone({ setHeaders: headers }) : req;
  return next(authRequest);
};

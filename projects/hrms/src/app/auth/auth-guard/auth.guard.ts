import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TenantService } from '../../services/tenant.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const tenantService = inject(TenantService);

  const token = localStorage.getItem('accessToken');
  const domain = tenantService.currentDomain;

  if ((auth.accessToken || token) && domain) {
    return true;
  }

  localStorage.clear();
  sessionStorage.clear();
  router.navigate(['/login'], domain ? { queryParams: { domain } } : {});
  return false;
};

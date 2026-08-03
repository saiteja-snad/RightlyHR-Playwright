import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../http-services/auth.service';
import { TenantService } from '../common-services/tenant.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const tenantService = inject(TenantService);

  if (auth.isProspectiveLogIn() && tenantService.currentDomain) {
    return true;
  }

  localStorage.removeItem('prospectiveusertoken');
  localStorage.removeItem('prospectiveemppersonaldata');
  router.navigate(['']);
  return false;
};


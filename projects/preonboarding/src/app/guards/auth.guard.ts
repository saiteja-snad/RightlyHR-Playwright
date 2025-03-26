import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../http-services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isProspectiveLogIn()) {
    return true;
  } else {
    router.navigate(['']);
    console.log('session expired');
    return false;
  }
};


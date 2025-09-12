import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem("accessToken")

  if (auth.accessToken || token) {
    return true;
  }
  
  localStorage.clear();
  sessionStorage.clear();
  router.navigate(['/login']);
  return false;
};

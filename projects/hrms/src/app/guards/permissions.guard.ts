import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AccessNavigationService } from '../services/access-navigation.service';
import { RbacService } from '../services/rbac.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionsGuard implements CanActivate {

  constructor(private readonly rbac: RbacService, private readonly router: Router) {}

  canActivate(next: ActivatedRouteSnapshot): boolean {
    const requiredPermission = next.data['permission'];

    if (this.rbac.allowedToAccess(requiredPermission)) {
      return true;
    } else {
      this.router.navigate(['/uservalidate']);
      return false; 
    }
  }
}

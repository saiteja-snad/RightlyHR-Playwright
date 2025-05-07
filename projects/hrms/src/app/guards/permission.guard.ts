import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of, map, catchError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RbacService } from '../services/rbac.service';

const PERSONAL_TABS = [
  { path: 'basic-info', permission: 'My Info Basic Information.view' },
  { path: 'address-info', permission: 'My Info Address.view' },
  { path: 'family-details', permission: 'My Info Family.view' },
  { path: 'identity-details', permission: 'My Info Identity.view' }
  // add others as needed
];


@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {

  constructor(private rbac: RbacService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const permission = route.data['permission'] as string;  

    if (!permission) return of(true);

    return this.rbac.allowedToAccessNew(permission).pipe(
      map(isAllowed => {
        if (isAllowed) return true;

        // Detect the current section from the route (e.g., 'myinfo/personal')
        const url = state.url;
        const parentPath = this.getParentPath(url);

        // Redirect to next accessible tab
        const fallback = this.getNextAllowedTab(parentPath);
        if (fallback) {
          this.router.navigateByUrl(fallback);
          break;
        } else {
          this.router.navigateByUrl('/unauthorized');
        }

        return false;
      }),
      catchError(() => {
        this.router.navigateByUrl('/unauthorized');
        return of(false);
      })
    );
  }

  private getParentPath(url: string): string {
    // e.g., /myinfo/personal/basic-info → /myinfo/personal
    const parts = url.split('/');
    return parts.slice(0, 3).join('/');
  }

  private getNextAllowedTab(parentPath: string): string | null {
    let sectionTabs: { path: string; permission: string; }[] = [];

    if (parentPath === '/myinfo/personal') sectionTabs = PERSONAL_TABS;

    for (const tab of sectionTabs) {
      if (this.rbac.allowedToAccessNew(tab.permission)) {
        return `${parentPath}/${tab.path}`;
      }
    }

    return null;
  }
}

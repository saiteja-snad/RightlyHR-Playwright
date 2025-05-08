import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateFn, GuardResult, MaybeAsync, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of, map, catchError, combineLatest, switchMap } from 'rxjs';
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
  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): MaybeAsync<GuardResult> {
    throw new Error('Method not implemented.');
  }

  // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
  //   const permission = route.data['permission'] as string;  

  //   if (!permission) return of(true);

  //   return this.rbac.allowedToAccessNew(permission).pipe(
  //     switchMap(isAllowed => {
  //       if (isAllowed) return of(true);
    
  //       const url = state.url;
  //       const parentPath = this.getParentPath(url);
    
  //       return this.getNextAllowedTab(parentPath).pipe(
  //         map(fallback => {
  //           if (fallback && fallback !== url) {
  //             console.log(`Redirecting to ${fallback}`);
              
  //             this.router.navigateByUrl(fallback);
  //           } else {
  //             this.router.navigateByUrl('/unauthorized');
  //           }
  //           return false;
  //         })
  //       );
  //     }),
  //     catchError(() => {
  //       this.router.navigateByUrl('/unauthorized');
  //       return of(false);
  //     })
  //   );
  // }

  // private getParentPath(url: string): string {
  //   // e.g., /myinfo/personal/basic-info → /myinfo/personal
  //   const parts = url.split('/');
  //   return parts.slice(0, 3).join('/');
  // }

  // private getNextAllowedTab(parentPath: string): Observable<string | null> {
  //   let sectionTabs: { path: string; permission: string }[] = [];
  
  //   if (parentPath === '/myinfo/personal') sectionTabs = PERSONAL_TABS;
  
  //   const checks = sectionTabs.map(tab =>
  //     this.rbac.allowedToAccessNew(tab.permission).pipe(
  //       map(isAllowed => (isAllowed ? `${parentPath}/${tab.path}` : null))
  //     )
  //   );
  
  //   return combineLatest(checks).pipe(
  //     map(results => results.find(path => path !== null) || null)
  //   );
  // }
  
}

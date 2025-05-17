import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {
  EMPLOYEE_INFO_PERSONAL_ROUTES,
  MY_INFO_PERSONAL_ROUTES,
} from '../permission-route.constants';
@Injectable({
  providedIn: 'root'
})
export class AccessForEmployeeinfoService {

constructor(public router: Router) {}

getPermissionForCurrentRouteAction(action: 'view' | 'create' | 'update' | 'delete', url?: string): string | undefined {
  const currentUrl = url ?? this.router.url;

  // Check EMPLOYEE_INFO_PERSONAL_ROUTES first (more specific)
  const empInfo = EMPLOYEE_INFO_PERSONAL_ROUTES.find((r: any) => currentUrl.startsWith(r.route));
  if (empInfo) return empInfo.permission.replace('.view', `.${action}`);

  // Then check MY_INFO_PERSONAL_ROUTES
  const myInfo = MY_INFO_PERSONAL_ROUTES.find((r: any) => currentUrl.startsWith(r.route));
  if (myInfo) return myInfo.permission.replace('.view', `.${action}`);

  return undefined;
}
}

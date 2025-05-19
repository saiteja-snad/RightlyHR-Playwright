import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { BehaviorSubject } from 'rxjs';
import { RbacService } from './rbac.service';
import { EMPLOYEE_INFO_CLAIMS, MY_INFO_CLAIMS } from '../shared/fields-premission';
@Injectable({
  providedIn: 'root'
})
export class AccessForEmployeeinfoService {


  constructor(private router: Router, private rbacService: RbacService) { }

  checkrouters = new BehaviorSubject('')

  canAccessField(
    action: 'view' | 'create' | 'update' | 'delete',
    permission: string
  ): boolean {
    const currentUrl = this.checkrouters.value.toLowerCase();
    console.log("Current Route:", currentUrl);

    let claim: string | undefined;

    switch (currentUrl) {
      case 'personalinfo':
        claim = EMPLOYEE_INFO_CLAIMS.find(r => r.permission === permission)?.claim;
        break;
      case 'myinfo':
        claim = MY_INFO_CLAIMS.find(r => r.permission === permission)?.claim;
        break;
    }

    const fullPermission = `${claim}.${action}`;
    const allowed = this.rbacService.allowedToAccess(fullPermission);
  
    return allowed;


}


  // getPermissionForCurrentRouteAction(action: 'view' | 'create' | 'update' | 'delete', url?: string): string | undefined {
  //   const currentUrl = url ?? this.router.url;

  //   // Check EMPLOYEE_INFO_PERSONAL_ROUTES first (more specific)
  //   const empInfo = EMPLOYEE_INFO_PERSONAL_ROUTES.find((r: any) => currentUrl.startsWith(r.route));
  //   if (empInfo) return empInfo.permission.replace('.view', `.${action}`);

  //   // Then check MY_INFO_PERSONAL_ROUTES
  //   const myInfo = MY_INFO_PERSONAL_ROUTES.find((r: any) => currentUrl.startsWith(r.route));
  //   if (myInfo) return myInfo.permission.replace('.view', `.${action}`);

  //   return undefined;
  // }

  // getPermissionForCurrentJobRouteAction(
  //   action: 'view' | 'create' | 'update' | 'delete',
  //   url?: string
  // ): string | undefined {
  //   const currentUrl = url ?? this.router.url;

  //   // Check EMPLOYEE_INFO_JOB_ROUTES first
  //   const empJob = EMPLOYEE_INFO_JOB_ROUTES.find((r: any) => currentUrl.startsWith(r.route));
  //   if (empJob) return empJob.permission.replace('.view', `.${action}`);


  //   // Then check MY_INFO_JOB_ROUTES
  //   const myJob = MY_INFO_JOB_ROUTES.find((r: any) => currentUrl.startsWith(r.route));
  //   if (myJob) return myJob.permission.replace('.view', `.${action}`);


  //   return undefined;
  // }


  // getPermissionForCurrentDocumentsRouteAction(
  //   action: 'view' | 'create' | 'update' | 'delete',
  //   url?: string ): string | undefined {
  //   const currentUrl = url ?? this.router.url;

  //   // Check EMPLOYEE_INFO_DOCUMENTS_ROUTES first
  //   const empDoc = EMPLOYEE_INFO_DOCUMENTS_ROUTES.find((r: any) => currentUrl.startsWith(r.route));
  //   if (empDoc) return empDoc.permission.replace('.view', `.${action}`);

  //   // Then check MY_INFO_DOCUMENTS_ROUTES
  //   const myDoc = MY_INFO_DOCUMENTS_ROUTES.find((r: any) => currentUrl.startsWith(r.route));
  //   if (myDoc) return myDoc.permission.replace('.view', `.${action}`);

  //   return undefined;
  // }

  // getPermissionForCurrentteamRouteAction(
  //   action: 'view' | 'create' | 'update' | 'delete',
  //   url?: string ): string | undefined {
  //   const currentUrl = url ?? this.router.url;

  //   // Check EMPLOYEE_INFO_DOCUMENTS_ROUTES first
  //   const empDoc = EMPLOYEE_INFO_TEAM_MEMBERS_ROUTES.find((r: any) => currentUrl.startsWith(r.route));
  //   if (empDoc) return empDoc.permission.replace('.view', `.${action}`);

  //   // Then check MY_INFO_DOCUMENTS_ROUTES
  //   const myDoc = MY_INFO_TEAM_MEMBERS.find((r: any) => currentUrl.startsWith(r.route));
  //   if (myDoc) return myDoc.permission.replace('.view', `.${action}`);

  //   return undefined;
  // }



}

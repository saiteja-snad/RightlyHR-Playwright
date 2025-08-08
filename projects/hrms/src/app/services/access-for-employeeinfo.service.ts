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





}

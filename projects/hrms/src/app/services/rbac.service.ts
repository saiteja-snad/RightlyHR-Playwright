import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class RbacService {

  constructor() { }

  allowedToAccess(permission: string): boolean {
    const claimsString = localStorage.getItem('rightlyHrRoleClaims');
    if (!claimsString || claimsString === 'undefined') {
      return false;
    }
    try {
      const permissions = JSON.parse(claimsString);
      if (Array.isArray(permissions)) {
        const lowerCasePermissions = permissions.filter((perm: any) => typeof perm === 'string').map((perm: string) => perm.toLowerCase());

        return lowerCasePermissions.includes(permission.toLowerCase());
      } else {
        console.warn("Claims in local storage is not an array:", permissions);
        return false;
      }
    } catch (error) {
      console.error("Error parsing claims from local storage:", error);
      return false;
    }
  }


  allowedToAccessNew(permission: string): Observable<boolean> {
    const claimsString = localStorage.getItem('rightlyHrRoleClaims');
    if (!claimsString || claimsString === 'undefined') {
      return of(false);
    }
    try {
      const permissions = JSON.parse(claimsString);
      if (Array.isArray(permissions)) {
        const lowerCasePermissions = permissions.filter((perm: any) => typeof perm === 'string').map((perm: string) => perm.toLowerCase());

        return of(lowerCasePermissions.includes(permission));
      } else {
        console.warn("Claims in local storage is not an array:", permissions);
        return of(false);
      }
    } catch (error) {
      console.error("Error parsing claims from local storage:", error);
      return of(false);
    }
  }
  


  allowedToAccessSync(permission: string): boolean {
    const userPermissions = ['My Info Address.view', 'My Info Family.view']; // Example
    return userPermissions.includes(permission);
  }
  
}
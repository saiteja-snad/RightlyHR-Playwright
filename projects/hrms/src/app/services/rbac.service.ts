import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class RbacService {
  

  constructor() {}
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
  
}
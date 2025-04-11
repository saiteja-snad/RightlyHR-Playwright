import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RbacService {

  constructor() { }

  allowedToAccess(section: string, permission: string, action: 'view' | 'create' | 'update' | 'delete'): boolean {
    const claimsString = localStorage.getItem('rightlyHrRoleClaims');

    if (!claimsString || claimsString === 'undefined') {
      return false;
    }

    try {
      const claims = JSON.parse(claimsString);

      if (!Array.isArray(claims)) {
        console.warn("user-claims is not an array:", claims);
        return false;
      }

      const matchedPermission = claims.find((claim: any) =>
        claim.section?.toLowerCase() === section.toLowerCase() &&
        claim.permission?.toLowerCase() === permission.toLowerCase()
      );

      if (matchedPermission && typeof matchedPermission[action] === 'boolean') {
        return matchedPermission[action];
      }

    } catch (error) {
      console.error("Error parsing user-claims:", error);
      return false;
    }

    return false;
  }
}

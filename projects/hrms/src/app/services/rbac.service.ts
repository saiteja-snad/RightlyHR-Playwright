import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class RbacService {
  private cachedPermissions: string[] | null = null;

  constructor() {}

  allowedToAccess(permission: string | string[]): boolean {
    if (!this.cachedPermissions) {
      const claimsString = localStorage.getItem('rightlyHrRoleClaims');
      if (!claimsString || claimsString === 'undefined') {
        return false;
      }
      try {
        const permissions = JSON.parse(claimsString);
        if (Array.isArray(permissions)) {
          this.cachedPermissions = permissions
            .filter((perm: any) => typeof perm === 'string')
            .map((perm: string) => perm.toLowerCase());
        } else {
          console.warn('Claims in local storage is not an array:', permissions);
          return false;
        }
      } catch (error) {
        console.error('Error parsing claims from local storage:', error);
        return false;
      }
    }
  
    // ✅ NEW: Support array of permissions
    if (Array.isArray(permission)) {
      return permission.some(p => this.cachedPermissions?.includes(p.toLowerCase()));
    }
  
    // default behavior for string
    return this.cachedPermissions.includes(permission.toLowerCase());
  }
  
}
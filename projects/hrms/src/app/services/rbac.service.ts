import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RbacService {

  constructor() { }

  allowedToAccess(permission: string): boolean {
    const claimsString = localStorage.getItem('valam-user-claims');
  
    // Handle cases where 'valam-user-claims' is null, undefined, or the string "undefined"
    if (!claimsString || claimsString === 'undefined') {
      return false; // Deny access if no claims or claims are explicitly "undefined"
    }
  
    try {
      const permissions = JSON.parse(claimsString);
  
      if (Array.isArray(permissions)) { // Crucially, check if permissions is actually an array
        const lowerCasePermissions = permissions.map((perm: string) => perm.toLowerCase());
        if (lowerCasePermissions.indexOf(permission.toLowerCase()) !== -1) {
          return true;
        }
      } else {
        console.warn("valam-user-claims in local storage is not an array:", permissions);
        return false; // If not an array, deny access
      }
  
    } catch (error) {
      console.error("Error parsing valam-user-claims from local storage:", error);
      return false; // Deny access if parsing fails
    }
  
    return false;
  }
}

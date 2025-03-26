import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  
  roles: string[] = [];

  constructor(private router: Router, private auth: AuthService) {
    this.roles = this.auth.getRoles();
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

      if(this.roles.includes('ADMIN')){
        return true;

      }
      else{
        return this.router.navigate(['/admin']);
      }
  }

}

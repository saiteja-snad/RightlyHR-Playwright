import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-roles-permissions-layout',
  imports: [CommonModule, RouterModule,],
  templateUrl: './roles-permissions-layout.component.html',
  styleUrl: './roles-permissions-layout.component.scss'
})
export class RolesPermissionsLayoutComponent {
  
  constructor(public readonly router: Router) { }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }
}

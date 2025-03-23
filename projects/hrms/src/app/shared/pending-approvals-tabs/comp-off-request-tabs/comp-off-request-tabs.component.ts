import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-comp-off-request-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './comp-off-request-tabs.component.html',
  styleUrl: './comp-off-request-tabs.component.scss'
})
export class CompOffRequestTabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}

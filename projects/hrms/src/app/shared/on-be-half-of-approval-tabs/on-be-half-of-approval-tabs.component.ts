import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-on-be-half-of-approval-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './on-be-half-of-approval-tabs.component.html',
  styleUrl: './on-be-half-of-approval-tabs.component.scss'
})
export class OnBeHalfOfApprovalTabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}

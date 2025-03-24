import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-time-off-request-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './time-off-request-tabs.component.html',
  styleUrl: './time-off-request-tabs.component.scss'
})
export class TimeOffRequestTabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}

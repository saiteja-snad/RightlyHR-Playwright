import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-attendance-regularization-request-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './attendance-regularization-request-tabs.component.html',
  styleUrl: './attendance-regularization-request-tabs.component.scss'
})
export class AttendanceRegularizationRequestTabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}

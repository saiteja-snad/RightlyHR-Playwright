import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-time-off-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './time-off-tabs.component.html',
  styleUrl: './time-off-tabs.component.scss'
})
export class TimeOffTabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

}

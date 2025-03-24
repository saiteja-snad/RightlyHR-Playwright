import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-premissions-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './premissions-tabs.component.html',
  styleUrl: './premissions-tabs.component.scss'
})
export class PremissionsTabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}

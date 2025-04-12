import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-separation-request-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './separation-request-tabs.component.html',
  styleUrl: './separation-request-tabs.component.scss'
})
export class SeparationRequestTabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}

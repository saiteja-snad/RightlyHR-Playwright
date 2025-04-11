import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-recall-request-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './recall-request-tabs.component.html',
  styleUrl: './recall-request-tabs.component.scss'
})
export class RecallRequestTabsComponent {
  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}

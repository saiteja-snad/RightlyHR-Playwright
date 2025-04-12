import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-trainee-approvals-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './trainee-approvals-tabs.component.html',
  styleUrl: './trainee-approvals-tabs.component.scss'
})
export class TraineeApprovalsTabsComponent {

  constructor(public readonly router: Router) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
}

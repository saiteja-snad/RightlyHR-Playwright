import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-settings-manage-shits-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './settings-manage-shits-tabs.component.html',
  styleUrl: './settings-manage-shits-tabs.component.scss',
})

export class SettingsManageShitsTabsComponent {
  publishedshifts: any = [];
  publishedCount = 0;
  pendingsubmittedshifts: any = [];
  pendingCount = 0;
  subscription: any;
  navLinks: { label: string; route: string }[] | undefined;

  constructor(public router: Router, private http: HttpService, public rbac: RbacService) {}

  ngOnInit(): void {
    this.getShifts();
  }

  getShifts(): void {
    this.subscription = this.http.getData(`orgShifts`).subscribe({
      next: (data: any) => {
        this.publishedshifts = data.filter(
          (item: any) => item.status === 'Published'
        );
        this.publishedCount = this.publishedshifts.length;
        this.pendingsubmittedshifts = data.filter(
          (item: any) => item.status === 'Pending for Submission'
        );
        this.pendingCount = this.pendingsubmittedshifts.length;
        const allLinks = [
          {
            label: `Pending For Submit [${this.pendingCount}]`,
            route: '/settings/employee-fields/manage-shifts/pending-for-submit',
            permission: { feature: 'Pending For Submit', action: 'view' }
          },
          {
            label: `Published Shifts [${this.publishedCount}]`,
            route: '/settings/employee-fields/manage-shifts/published-shifts',
            permission: { feature: 'Published Shifts', action: 'view' }
          }
        ];

        this.navLinks = allLinks.filter(link =>
          link.permission &&
          this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
        );
      },
      error(err) {
        console.log('expensesheadererror', err);
      },
    });
  }
}

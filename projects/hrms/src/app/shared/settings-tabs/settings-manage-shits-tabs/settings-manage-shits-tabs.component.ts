import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-settings-manage-shits-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './settings-manage-shits-tabs.component.html',
  styleUrl: './settings-manage-shits-tabs.component.scss',
})

export class SettingsManageShitsTabsComponent {
  subscription!:Subscription
  publishedshifts=[] as any;
  public navLinks: any[] = [];
  publishedCount:any;
  pendingsubmittedshifts=[] as any;
  pendingCount:any;
  allLinks = [
    { label: 'Pending for Submission',route: '/settings/employee-fields/manage-shifts/pending-for-submit',permission: { feature: 'Manage Shifts Tab', action: 'view' }},
    { label: 'Published',route: '/settings/employee-fields/manage-shifts/published-shifts',permission: { feature: 'Manage Shifts Tab', action: 'view' }}
  ];
  constructor(public router: Router, private http: HttpService, public rbac: RbacService) {
    this.navLinks = this.allLinks.filter(link =>
      link.permission &&
      link.permission.feature &&
      link.permission.action &&
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );
  }

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
      },
      error(err) {
        console.log('expensesheadererror', err);
      },
    });
  }
}

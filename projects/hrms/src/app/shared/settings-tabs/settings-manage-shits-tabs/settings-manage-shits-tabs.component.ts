import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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

export class SettingsManageShitsTabsComponent implements OnInit, OnDestroy {
  subscription!:Subscription
  publishedshifts=[] as any;
  public navLinks: any[] = [];
  publishedCount:any;
  pendingsubmittedshifts=[] as any;
  pendingCount:any;
  allLinks = [
    { label: 'Pending for Submission',route: '/settings/employee-fields/manage-shifts/pending-for-submit',permission: { feature: 'Shifts Pending Tab', action: 'view' }},
    { label: 'Published',route: '/settings/employee-fields/manage-shifts/published-shifts',permission: { feature: 'Shifts Published Tab', action: 'view' }}
  ];
  constructor(public router: Router, private http: HttpService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.getShifts();
    this.filterbyRbac();
  }

  filterbyRbac() : void{
    this.navLinks = this.allLinks.filter(link =>
      link.permission &&
      link.permission.feature &&
      link.permission.action &&
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );

    const currentUrl = this.router.url;
    const baseUrl = '/settings/employee-fields/manage-shifts';

    if (currentUrl === baseUrl && this.navLinks.length > 0) {
      this.router.navigateByUrl(this.navLinks[0].route);
      return;
    }

    const isAllowed = this.navLinks.some(link => currentUrl.startsWith(link.route));
    if (!isAllowed && this.navLinks.length > 0) {
      this.router.navigateByUrl(this.navLinks[0].route);
    }
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

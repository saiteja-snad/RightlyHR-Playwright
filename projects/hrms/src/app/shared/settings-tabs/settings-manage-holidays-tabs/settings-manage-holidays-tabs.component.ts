import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { count, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-settings-manage-holidays-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './settings-manage-holidays-tabs.component.html',
  styleUrl: './settings-manage-holidays-tabs.component.scss'
})
export class SettingsManageHolidaysTabsComponent implements OnInit, OnDestroy {

  subscription!: Subscription;
  allHolidaysPending: any[] = [];
  allHolidaysPublished: any[] = [];
  pendingcount = 0;
  publishedcount = 0;

  public navLinks: any[] = [];

  // All possible tabs with permissions
  allLinks = [
    {
      label: 'Pending For Submission',
      route: '/settings/employee-fields/manage-holidays/pending-for-submit',
      permission: { feature: 'Holidays Pending Tab', action: 'view' }
    },
    {
      label: 'Published',
      route: '/settings/employee-fields/manage-holidays/published-holidays',
      permission: { feature: 'Holidays Published Tab', action: 'view' }
    }
  ];

  constructor(
    public router: Router,
    private http: HttpService,
    public rbac: RbacService
  ) {
    // Filter links based on permission
    this.navLinks = this.allLinks.filter(link =>
      link.permission &&
      link.permission.feature &&
      link.permission.action &&
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );
  }

  ngOnInit() {
    this.getAllHolidays();

    // const currentUrl = this.router.url;
    // const baseUrl = '/settings/employee-fields/manage-holidays';

    // if (currentUrl === baseUrl && this.navLinks.length > 0) {
    //   this.router.navigateByUrl(this.navLinks[0].route);
    //   return;
    // }

    // const isAllowed = this.navLinks.some(link => link.route === currentUrl);
    // if (!isAllowed && this.navLinks.length > 0) {
    //   this.router.navigateByUrl(this.navLinks[0].route);
    // }
  }

  getAllHolidays() {
    this.subscription = this.http.getData('orgHolidays').subscribe({
      next: (data: any) => {
        this.allHolidaysPending = data.filter(
          (status: { status: string }) => status.status === 'Pending for submission'
        ).reverse();
        this.pendingcount = this.allHolidaysPending.length;

        this.allHolidaysPublished = data.filter(
          (status: { status: string }) => status.status === 'Published'
        ).reverse();
        this.publishedcount = this.allHolidaysPublished.length;

        // Update count dynamically based on label
        this.navLinks = this.navLinks.map(link => {
          if (link.label === 'Pending For Submission') {
            return { ...link, count: this.pendingcount };
          } else if (link.label === 'Published') {
            return { ...link, count: this.publishedcount };
          }
          return link;
        });
      },
      error: (err: any) => {
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}



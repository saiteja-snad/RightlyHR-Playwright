import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { count, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
@Component({
  selector: 'app-settings-attendance-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './settings-attendance-tabs.component.html',
  styleUrl: './settings-attendance-tabs.component.scss'
})
export class SettingsAttendanceTabsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  allHolidaysPending: any[] = [];
  allHolidaysPublished: any[] = [];
  pendingcount = 0;
  publishedcount = 0;
  page = 1;
  pageSize = 10;
  public navLinks: any[] = [];
  allLinks = [
    {
      label: 'Pending For Submission',
      route: '/settings/attendance-configuration/pending-for-submission',
      permission: { feature: 'Attendance Pending Tab', action: 'view' },count:0
    },
    {
      label: 'Published',
      route: '/settings/attendance-configuration/published',
      permission: { feature: 'Attendance Published Tab', action: 'view' },count:0
    }
  ];
  constructor(
    public router: Router,
    private http: HttpService,
    public rbac: RbacService
  ) { }

  ngOnInit() {
    this.http.refresh$.subscribe(() => {
      this.getAttendanceLocks(this.page, this.pageSize);
    });

    this.filterbyRbac();
  }

  filterbyRbac(): void {
    // Filter links based on permission
    this.navLinks = this.allLinks.filter(
      (link) =>
        link.permission &&
        link.permission.feature &&
        link.permission.action &&
        this.rbac.allowedToAccess(
          `${link.permission.feature}.${link.permission.action}`
        )
    );
    // Redirect to first allowed tab if at base or unauthorized route
    const currentUrl = this.router.url;
    const baseUrl = '/settings/employee-fields/manage-holidays';

    if (currentUrl === baseUrl && this.navLinks.length > 0) {
      this.router.navigateByUrl(this.navLinks[0].route);
      return;
    }
    // Check if current URL is allowed
    const isAllowed = this.navLinks.some((link) =>
      currentUrl.startsWith(link.route)
    );
    // If not allowed, redirect to first allowed tab
    if (!isAllowed && this.navLinks.length > 0) {
      this.router.navigateByUrl(this.navLinks[0].route);
    }
  }
  searchText = '';
  dataLoad: any;
  getAttendanceLocks(pagenum: number, pagesize: number, year?: number) {
    const params: { pageNumber: number; pageSize: number; search?: string; year?: number } = {
      pageNumber: pagenum,
      pageSize: pagesize,
    };

    if (this.searchText) {
      params.search = this.searchText;
    }

    if (year) {
      params.year = year;
    }

    this.dataLoad = true;

    this.http.getpagentiontData(`AttendanceLockConfigurations/getall`, params).subscribe({
      next: (data: any) => {
        this.pendingcount = data.statusCounts?.PendingforSubmission || 0;
        this.publishedcount = data.statusCounts?.Published || 0;

        this.navLinks = this.navLinks.map(link => {
          if (link.label === 'Pending For Submission') {
            return { ...link, count: this.pendingcount  || 0 };
          } else if (link.label === 'Published') {
            return { ...link, count: this.publishedcount || 0 };
          }
          return link;
        });
      },
      error: () => {
        this.dataLoad = false;
      },
      complete: () => {
        this.dataLoad = false;
      }
    });
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}


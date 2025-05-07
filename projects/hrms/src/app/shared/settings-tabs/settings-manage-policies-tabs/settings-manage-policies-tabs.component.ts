import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { count, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-settings-manage-policies-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './settings-manage-policies-tabs.component.html',
  styleUrl: './settings-manage-policies-tabs.component.scss',
})
export class SettingsManagePoliciesTabsComponent implements OnInit, OnDestroy {
  navLinks: any[] = [];
  subscription!: Subscription;
  allPoliciesPending: any[] = [];
  allPoliciesPublished: any[] = [];
  pendingcount = 0;
  publishedcount = 0;

  allLinks = [
    { label: 'Pending For Submission', route: '/settings/employee-fields/manage-policies/pending-for-submit', permission: { feature: 'Policies Pending Tab', action: 'view' }, count: 0},
    { label: 'Published', route: '/settings/employee-fields/manage-policies/published-policies', permission: { feature: 'Policies Published Tab', action: 'view' }, count: 0},
  ];

  constructor(
    public router: Router,
    private http: HttpService,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    this.getAllPolicies();
    this.fiterbyRbac();
  }

  fiterbyRbac(): void {
    // Filter based on permission
    this.navLinks = this.allLinks.filter(
      (link) =>
        link.permission &&
        link.permission.feature &&
        link.permission.action &&
        this.rbac.allowedToAccess(
          `${link.permission.feature}.${link.permission.action}`
        )
    );
    const currentUrl = this.router.url;
    const baseUrl = '/settings/employee-fields/manage-policies';

    if (currentUrl === baseUrl && this.navLinks.length > 0) {
      this.router.navigateByUrl(this.navLinks[0].route);
      return;
    }

    const isAllowed = this.navLinks.some((link) => link.route === currentUrl);
    if (!isAllowed && this.navLinks.length > 0) {
      this.router.navigateByUrl(this.navLinks[0].route);
    }
  }

  getAllPolicies() {
    this.subscription = this.http.getData('orgPolicies').subscribe({
      next: (data: any) => {
        this.allPoliciesPending = data
          .filter(
            (status: { status: string }) =>
              status.status === 'Pending for submission'
          )
          .reverse();
        this.pendingcount = this.allPoliciesPending.length;

        this.allPoliciesPublished = data
          .filter((status: { status: string }) => status.status === 'Published')
          .reverse();
        this.publishedcount = this.allPoliciesPublished.length;

        // Update counts inside navLinks
        this.navLinks = this.navLinks.map((link) => {
          if (link.route.includes('pending-for-submit')) {
            return { ...link, count: this.pendingcount };
          } else if (link.route.includes('published-policies')) {
            return { ...link, count: this.publishedcount };
          }
          return link;
        });
      },
      error: (err: any) => {
        console.error(err);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

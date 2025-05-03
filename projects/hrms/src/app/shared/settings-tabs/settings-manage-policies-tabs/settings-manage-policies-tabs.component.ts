import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { count, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-settings-manage-policies-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './settings-manage-policies-tabs.component.html',
  styleUrl: './settings-manage-policies-tabs.component.scss'
})

export class SettingsManagePoliciesTabsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  allPoliciesPending: any[] = [];
  allPoliciesPublished: any[] = [];
  pendingcount = 0;
  publishedcount = 0;

  public navLinks: any[] = [];

  allLinks = [
    { label: 'Pending For Submission', route: '/settings/employee-fields/manage-policies/pending-for-submit', permission: { feature: 'Policies Pending Tab', action: 'view' }
    },
    { label: 'Published', route: '/settings/employee-fields/manage-policies/published-policies', permission: { feature: 'Policies Published Tab', action: 'view' }
    }
  ];

  constructor(
    public router: Router,
    private http: HttpService,
    public rbac: RbacService
  ) {
  }

  ngOnInit(): void {
    this.getAllPolicies();

    this.navLinks = this.allLinks.filter(link =>
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );
  }

  getAllPolicies() {
    this.subscription = this.http.getData('orgPolicies').subscribe({
      next: (data: any) => {
        this.allPoliciesPending = data.filter(
          (status: { status: string }) => status.status === 'Pending for submission'
        ).reverse();
        this.pendingcount = this.allPoliciesPending.length;

        this.allPoliciesPublished = data.filter(
          (status: { status: string }) => status.status === 'Published'
        ).reverse();
        this.publishedcount = this.allPoliciesPublished.length;

        // Update counts in already filtered navLinks
        this.navLinks = this.navLinks.map(link => {
          if (link.label === 'Pending For Submission') {
            return { ...link, count: this.pendingcount };
          } else if (link.label === 'Published') {
            return { ...link, count: this.publishedcount };
          }
          return link;
        });
        this.navLinks = this.allLinks.filter(link =>
          this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
        );
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
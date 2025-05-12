import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { Subject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-leave-category-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './leave-category-tabs.component.html',
  styleUrl: './leave-category-tabs.component.scss'
})

export class LeaveCategoryTabsComponent implements OnInit, OnDestroy {
  public navLinks: any[] = [];
  allLCPending: any[] = [];
  allLCPublished: any[] = [];
  pendingcount = 0;
  publishedcount = 0;
  subscription!: Subscription;
  destroy$ = new Subject<boolean>();

  // Tabs with permissions
  allLinks = [
    { label: 'Pending For Submission', route: '/settings/timeoff-configurations/leave-categoery/pendingleavecategory', permission: { feature: 'Leave Category Pending Tab', action: 'view' } },
    { label: 'Published', route: '/settings/timeoff-configurations/leave-categoery/publishedleavecategory', permission: { feature: 'Leave Category Published Tab', action: 'view' } }
  ];

  constructor(
    public rbac: RbacService,
    private readonly http: HttpService
  ) {}

  ngOnInit(): void {
    // Filter tabs based on user permissions
    this.navLinks = this.allLinks.filter(link =>
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );

    this.getAllLeaveCategory();
  }

  getAllLeaveCategory(): void {
    this.subscription = this.http.getData('OrgLeavesCategories').subscribe({
      next: (data: any) => {
        this.allLCPending = data.filter(
          (status: { status: string }) => status.status === 'Pending for submission'
        ).reverse();
        this.pendingcount = this.allLCPending.length;

        this.allLCPublished = data.filter(
          (status: { status: string }) => status.status === 'Published'
        ).reverse();
        this.publishedcount = this.allLCPublished.length;

        // Update count only on tabs the user has access to
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
    this.destroy$.next(true);
    this.destroy$.complete();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

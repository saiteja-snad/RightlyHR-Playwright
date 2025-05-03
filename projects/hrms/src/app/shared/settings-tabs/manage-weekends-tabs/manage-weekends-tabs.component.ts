import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-manage-weekends-tabs',
  imports: [RouterModule, CommonModule],
  templateUrl: './manage-weekends-tabs.component.html',
  styleUrl: './manage-weekends-tabs.component.scss'
})
export class ManageWeekendsTabsComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  public navLinks: any[] = [];

  // Tabs with permission definitions
  allLinks = [
    { label: 'Pending For Submission', route: '/settings/employee-fields/manage-weekends/pending-for-submission', permission: { feature: 'Weekends Pending Tab', action: 'view' } },
    { label: 'Published', route: '/settings/employee-fields/manage-weekends/published-weekends', permission: { feature: 'Weekends Published Tab', action: 'view' } }
  ];

  constructor(
    private http: HttpService,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    // Filter links based on permission
    this.navLinks = this.allLinks.filter(link =>
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );

    this.getAllWeekend();
  }

  getAllWeekend() {
    this.http.getData(`OrgWeekendHeader/getAll`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        const pendingCount = data.filter((item: any) => item.status === 'Pending for submission').length;
        const publishedCount = data.filter((item: any) => item.status === 'Published').length;

        // Update counts in permission-filtered navLinks
        this.navLinks = this.navLinks.map(link => {
          if (link.label === 'Pending For Submission') {
            return { ...link, count: pendingCount };
          } else if (link.label === 'Published') {
            return { ...link, count: publishedCount };
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
    this.destroy$.unsubscribe();
  }
}


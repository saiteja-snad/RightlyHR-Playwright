import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ManageDST } from '../../../settings/employee-fields/manage-dsts/dsts.modal';
import { Subject } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-manage-dst-tabs',
  imports: [RouterModule, CommonModule],
  templateUrl: './manage-dst-tabs.component.html',
  styleUrl: './manage-dst-tabs.component.scss',
})
export class ManageDstTabsComponent implements OnInit, OnDestroy {
  allDSTs: ManageDST[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  public navLinks: any[] = [];

  // Tabs with permissions defined
  allLinks = [
    {
      label: 'Pending for submission',
      route: '/settings/employee-fields/manage-dsts/pending-for-submission',
      permission: { feature: 'DST Pending Tab', action: 'view' }
    },
    {
      label: 'Published',
      route: '/settings/employee-fields/manage-dsts/published-dsts',
      permission: { feature: 'DST Published Tab', action: 'view' }
    }
  ];

  constructor(private http: HttpService, public rbac: RbacService) {}

  ngOnInit(): void {
    // Filter tabs by permission
    this.navLinks = this.allLinks.filter(link =>
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );

    this.getAllDayLight();
  }

  getAllDayLight() {
    this.http.getData('OrgDayLight/getAll').subscribe({
      next: (data: any) => {
        this.allDSTs = data;
        const pendingCount = this.allDSTs.filter(dst => dst.status === 'Pending for submission').length;
        const publishedCount = this.allDSTs.filter(dst => dst.status === 'Published').length;

        // Update count in the permission-filtered links
        this.navLinks = this.navLinks.map(link => {
          if (link.label === 'Pending for submission') {
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

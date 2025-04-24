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

  constructor(
    private http: HttpService, 
    public rbac: RbacService
  ) {}

  allNavLinks = [
    {
      label: 'Pending for submission',
      route: '/settings/employee-fields/manage-weekends/pending-for-submission',
      count: 0,
      permission: { feature: 'Pending For Submission', action: 'view' }
    },
    {
      label: 'Published',
      route: '/settings/employee-fields/manage-weekends/published-weekends',
      count: 0,
      permission: { feature: 'Published', action: 'view' }
    }
  ];

  ngOnInit(): void {
    this.getAllWeekend();
  }

  getAllWeekend() {
    this.http.getData(`OrgWeekendHeader/getAll`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        const pendingCount = data.filter((item: any) => item.status === 'Pending for submission').length;
        const publishedCount = data.filter((item: any) => item.status === 'Published').length;

        this.navLinks = this.allNavLinks
          .map(link => {
            if (link.label === 'Pending for submission') {
              return { ...link, count: pendingCount };
            } else if (link.label === 'Published') {
              return { ...link, count: publishedCount };
            }
            return link;
          })
          .filter(link =>
            link.permission &&
            link.permission.feature &&
            link.permission.action &&
            this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
          );
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

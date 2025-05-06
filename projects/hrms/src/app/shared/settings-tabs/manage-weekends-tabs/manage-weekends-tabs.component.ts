import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
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

  allLinks = [
    {
      label: 'Pending For Submission',
      route: '/settings/employee-fields/manage-weekends/pending-for-submission',
      permission: { feature: 'Weekends Pending Tab', action: 'view' }
    },
    {
      label: 'Published',
      route: '/settings/employee-fields/manage-weekends/published-weekends',
      permission: { feature: 'Weekends Published Tab', action: 'view' }
    }
  ];

  constructor(
    private http: HttpService,
    public rbac: RbacService,
    public router: Router
  ) {
    // Filter based on RBAC permissions
    this.navLinks = this.allLinks.filter(link =>
      link.permission &&
      link.permission.feature &&
      link.permission.action &&
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );
  }

  ngOnInit(): void {
    this.getAllWeekend();

    // const currentUrl = this.router.url;
    // const baseUrl = '/settings/employee-fields/manage-weekends';

    // // Redirect to first allowed tab if at base or unauthorized route
    // if (currentUrl === baseUrl && this.navLinks.length > 0) {
    //   this.router.navigateByUrl(this.navLinks[0].route);
    //   return;
    // }

    // const isAllowed = this.navLinks.some(link => link.route === currentUrl);
    // if (!isAllowed && this.navLinks.length > 0) {
    //   this.router.navigateByUrl(this.navLinks[0].route);
    // }
  }

  getAllWeekend() {
    this.http.getData(`OrgWeekendHeader/getAll`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          const pendingCount = data.filter((item: any) => item.status === 'Pending for submission').length;
          const publishedCount = data.filter((item: any) => item.status === 'Published').length;

          // Update counts in filtered navLinks
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
    this.destroy$.complete();
  }
}


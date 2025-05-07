import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ManageDST } from '../../../settings/employee-fields/manage-dsts/dsts.modal';
import { Subject, takeUntil } from 'rxjs';
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

  allLinks = [
    { label: 'Pending for submission', route: '/settings/employee-fields/manage-dsts/pending-for-submission', permission: { feature: 'DST Pending Tab', action: 'view' } },
    { label: 'Published', route: '/settings/employee-fields/manage-dsts/published-dsts', permission: { feature: 'DST Published Tab', action: 'view' } }
  ];

  constructor(
    private http: HttpService,
    public rbac: RbacService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getAllDayLight();
    this.filterbyRbac();
  }

  filterbyRbac(): void{
    this.navLinks = this.allLinks.filter(link =>
      link.permission &&
      link.permission.feature &&
      link.permission.action &&
      this.rbac.allowedToAccess(`${link.permission.feature}.${link.permission.action}`)
    );
    const currentUrl = this.router.url;
    const baseUrl = '/settings/employee-fields/manage-dsts';

    if (currentUrl === baseUrl && this.navLinks.length > 0) {
      this.router.navigateByUrl(this.navLinks[0].route);
      return;
    }

    const isAllowed = this.navLinks.some(link => link.route === currentUrl);
    if (!isAllowed && this.navLinks.length > 0) {
      this.router.navigateByUrl(this.navLinks[0].route);
    }
  }

  getAllDayLight(): void {
    this.http.getData('OrgDayLight/getAll')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.allDSTs = data;

          const pendingCount = this.allDSTs.filter(dst => dst.status === 'Pending for submission').length;
          const publishedCount = this.allDSTs.filter(dst => dst.status === 'Published').length;

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
          console.error('DST fetch error:', err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}


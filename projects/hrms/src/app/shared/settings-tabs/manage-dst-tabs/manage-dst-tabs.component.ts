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
  allDSTs = [] as ManageDST[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  public navLinks: any[] = [];

  allNavLinks = [
    { label: 'Pending for submission',route: '/settings/employee-fields/manage-dsts/pending-for-submission',count: 0},
    { label: 'Published',route: '/settings/employee-fields/manage-dsts/published-dsts',count: 0 }
  ];

  constructor(private http: HttpService, public rbac: RbacService) { }

  ngOnInit(): void {
    this.getAllDayLight();
  }

  getAllDayLight() {
    this.http.getData('OrgDayLight/getAll').subscribe({
      next: (data: any) => {
        console.log(data);
        this.allDSTs = data;
        const pendingCount = this.allDSTs.filter(dst => dst.status === 'Pending for submission').length;
        const publishedCount = this.allDSTs.filter(dst => dst.status === 'Published').length;
        this.navLinks = this.allNavLinks
          .map(link => {
            if (link.label === 'Pending for submission') {
              return { ...link, count: pendingCount };
            } else if (link.label === 'Published') {
              return { ...link, count: publishedCount };
            }
            return link;
          });
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

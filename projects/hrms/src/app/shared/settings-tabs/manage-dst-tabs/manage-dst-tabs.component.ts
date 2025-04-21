import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ManageDST } from '../../../settings/employee-fields/manage-dsts/dsts.modal';
import { Subject } from 'rxjs';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-manage-dst-tabs',
  imports: [RouterModule, CommonModule],
  templateUrl: './manage-dst-tabs.component.html',
  styleUrl: './manage-dst-tabs.component.scss',
})
export class ManageDstTabsComponent implements OnInit, OnDestroy {
  allDSTs = [] as ManageDST[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  navLinks = [
    {
      label: 'Pending for submission',
      route: '/settings/employee-fields/manage-dsts/pending-for-submission',
      count: 0
    },
    {
      label: 'Published',
      route: '/settings/employee-fields/manage-dsts/published-dsts',
      count: 0
    },
  ];

  constructor(private http: HttpService) { }

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
        this.navLinks = [
          {
            label: 'Pending for submission',
            route: '/settings/employee-fields/manage-dsts/pending-for-submission',
            count: pendingCount
          },
          {
            label: 'Published',
            route: '/settings/employee-fields/manage-dsts/published-dsts',
            count: publishedCount
          }
        ];
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

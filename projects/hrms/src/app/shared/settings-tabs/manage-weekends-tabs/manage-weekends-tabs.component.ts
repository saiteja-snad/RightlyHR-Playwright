import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-manage-weekends-tabs',
  imports: [RouterModule, CommonModule],
  templateUrl: './manage-weekends-tabs.component.html',
  styleUrl: './manage-weekends-tabs.component.scss'
})
export class ManageWeekendsTabsComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private http: HttpService
  ) { }

  ngOnInit(): void {
    this.getAllWeekend();
  }

  navLinks = [
    {
      label: 'Pending for submission',
      route: '/settings/employee-fields/manage-weekends/pending-for-submission',
      count: 0
    },
    {
      label: 'Published',
      route: '/settings/employee-fields/manage-weekends/published-weekends',
      count: 0
    },
  ];

  getAllWeekend() {
    this.http.getData(`OrgWeekendHeader/getAll`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        console.log(data);
        const pendingCount = data.filter((item: any) => item.status === 'Pending for submission').length;
        const publishedCount = data.filter((item: any) => item.status === 'Published').length;

        this.navLinks = [
          {
            label: 'Pending for submission',
            route: '/settings/employee-fields/manage-weekends/pending-for-submission',
            count: pendingCount
          },
          {
            label: 'Published',
            route: '/settings/employee-fields/manage-weekends/published-weekends',
            count: publishedCount
          }
        ];

      }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

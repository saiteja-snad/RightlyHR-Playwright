import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { count, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-settings-manage-holidays-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './settings-manage-holidays-tabs.component.html',
  styleUrl: './settings-manage-holidays-tabs.component.scss'
})
export class SettingsManageHolidaysTabsComponent {

  navLinks = [
    { label: 'Pending For Submission',route: '/settings/employee-fields/manage-holidays/pending-for-submit', count: 0 },
    { label: 'Published',route: '/settings/employee-fields/manage-holidays/published-holidays', count: 0 },
  ];

  subscription!: Subscription
  allHolidaysPending = [] as any;
  allHolidaysPublished = [] as any;
  pendingcount = 0;
  publishedcount = 0;


  constructor(public router: Router, private http: HttpService, public rbac: RbacService) { }

  ngOnInit() {
    this.getAllHolidays();
  }

  getAllHolidays() {
    this.subscription = this.http.getData('orgHolidays').subscribe({
      next: (data: any) => {
        console.log(data);
        this.allHolidaysPending = data.filter(
          (status: { status: string; }) => status.status === 'Pending for submission'
        ).reverse();
        this.pendingcount = this.allHolidaysPending.length;
        this.allHolidaysPublished = data.filter(
          (status: { status: string; }) => status.status === 'Published'
        ).reverse();
        this.publishedcount = this.allHolidaysPublished.length;
        this.navLinks = [
          { label: 'Pending For Submission',route: '/settings/employee-fields/manage-holidays/pending-for-submit', count: this.pendingcount},
          { label: 'Published',route: '/settings/employee-fields/manage-holidays/published-holidays', count: this.publishedcount },
        ];
      }, error: (err: any) => {
        console.error(err);
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

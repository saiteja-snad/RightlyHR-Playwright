import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-leave-category-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './leave-category-tabs.component.html',
  styleUrl: './leave-category-tabs.component.scss'
})

export class LeaveCategoryTabsComponent {
  public navLinks: any[] = [];
  subscription!:Subscription;
  allLCPending = [] as any;
  allLCPublished = [] as any;
  pendingcount = 0;
  publishedcount = 0

  constructor(public rbac: RbacService,private readonly http: HttpService) { }

  allNavLinks = [
    { label: 'Pending For Submission', route: '/settings/timeoff-configurations/leave-categoery/pendingleavecategory', count:0},
    { label: 'Published', route: '/settings/timeoff-configurations/leave-categoery/publishedleavecategory', count:0},
  ];

  ngOnInit(){
    this.getAllLeaveCategory();
  }

  getAllLeaveCategory(){
    this.subscription = this.http.getData('OrgLeavesCategories').subscribe({
      next: (data: any) => {
        console.log(data);
        this.allLCPending = data.filter(
          (status: { status: string; }) => status.status === 'Pending for submission'
        ).reverse();
        this.pendingcount = this.allLCPending.length;
        this.allLCPublished = data.filter(
          (status: { status: string; }) => status.status === 'Published'
        ).reverse();
        this.publishedcount = this.allLCPublished.length;
        this.allNavLinks = [
          { label: 'Pending For Submission',route: '/settings/timeoff-configurations/leave-categoery/pendingleavecategory', count: this.pendingcount},
          { label: 'Published',route: '/settings/timeoff-configurations/leave-categoery/publishedleavecategory', count: this.publishedcount },
        ];
      }, error: (err: any) => {
        console.error(err);
      }
    })
  }
}

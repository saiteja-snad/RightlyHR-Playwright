import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { count, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-settings-manage-policies-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './settings-manage-policies-tabs.component.html',
  styleUrl: './settings-manage-policies-tabs.component.scss'
})

export class SettingsManagePoliciesTabsComponent {

  navLinks = [
    { label: 'Pending For Submission',route: '/settings/employee-fields/manage-policies/pending-for-submit', count: 0},
    { label: 'Published',route: '/settings/employee-fields/manage-policies/published-policies', count: 0}
  ];
  subscription!: Subscription
  allPoliciesPending = [] as any;
  allPoliciesPublished = [] as any;
  pendingcount = 0;
  publishedcount = 0;

  constructor(public router: Router, private http: HttpService,) { }
  
  ngOnInit(): void {
    this.getAllPolicies();
  }

  getAllPolicies() {
    this.subscription = this.http.getData('orgPolicies').subscribe({
      next: (data: any) => {
        console.log(data);
        this.allPoliciesPending = data.filter(
          (status: { status: string; }) => status.status === 'Pending for submission'
        ).reverse();
        this.pendingcount = this.allPoliciesPending.length;
        this.allPoliciesPublished = data.filter(
          (status: { status: string; }) => status.status === 'Published'
        ).reverse();
        this.publishedcount = this.allPoliciesPublished.length;
       this.navLinks = [
          { label: 'Pending For Submission',route: '/settings/employee-fields/manage-policies/pending-for-submit', count: this.pendingcount},
          { label: 'Published',route: '/settings/employee-fields/manage-policies/published-policies', count: this.publishedcount },
        ];
      }, error: (err: any) => {
        console.error(err);
      }
    })

  }

}

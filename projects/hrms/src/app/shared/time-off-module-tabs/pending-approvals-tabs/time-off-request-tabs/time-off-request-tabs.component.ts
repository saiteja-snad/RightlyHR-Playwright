import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { LeaveApproval } from '../../../../Interfaces/pendingapprovalsmodel';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-time-off-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './time-off-request-tabs.component.html',
  styleUrl: './time-off-request-tabs.component.scss'
})

export class TimeOffRequestTabsComponent {
  LOGIN: any;
  subscription!: Subscription;
  leavesEmp = [] as LeaveApproval[];
  leavesRole = [] as LeaveApproval[];
  countEmp: any = 0;
  countRole: any = 0;
  navTabs: any[] = [
    { label: 'For You', link: 'for-you', count: this.countEmp ?? 0,permission: { feature: 'For You (Time Off)', action: 'view' } },
    { label: 'For Your Role', link: 'for-your-role', count:this.countRole ?? 0,permission: { feature: 'For Role (Time Off)', action: 'view' }  },
  ];

  constructor(public readonly router: Router, private http: HttpService,private rbac: RbacService,) { }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovalsEMP();
    this.getAllPendingApprovalsROLE();
     this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(
          `${tab.permission.feature}.${tab.permission.action}`
        )
    );
  }

  getAllPendingApprovalsEMP() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=1&approvedType=EMP`).subscribe({
      next: (response: any) => {
        this.leavesEmp = response.data as LeaveApproval[];
        this.countEmp = this.leavesEmp.length ?? 0;
        this.navTabs = [
           { label: 'For You', link: 'for-you', count: this.countEmp ?? 0,permission: { feature: 'For You (Time Off)', action: 'view' } },
    { label: 'For Your Role', link: 'for-your-role', count:this.countRole ?? 0,permission: { feature: 'For Role (Time Off)', action: 'view' }  },
        ];
        this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(
          `${tab.permission.feature}.${tab.permission.action}`
        )
    );
      },
      error: (reason) => console.log(reason),
    });
  }

  getAllPendingApprovalsROLE() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=1&approvedType=ROLE`).subscribe({
      next: (response: any) => {
        this.leavesRole = response.data as LeaveApproval[];
        this.countRole = this.leavesRole.length ?? 0;
        this.navTabs = [
           { label: 'For You', link: 'for-you', count: this.countEmp ?? 0,permission: { feature: 'For You (Time Off)', action: 'view' } },
    { label: 'For Your Role', link: 'for-your-role', count:this.countRole ?? 0,permission: { feature: 'For Role (Time Off)', action: 'view' }  },
        ];
        this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(
          `${tab.permission.feature}.${tab.permission.action}`
        )
    );
      },
      error: (reason) => console.log(reason),
    });
  }
}
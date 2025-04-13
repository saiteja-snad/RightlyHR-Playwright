import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LeaveApproval } from '../../../interfaces/pendingapprovalsmodel';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TabsModule } from 'primeng/tabs';

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
  countEmp: any;
  countRole: any;
  navTabs: any[] = [
    { label: 'For You ', link: 'for-you', count: 9 },
    { label: 'For Your Role', link: 'for-your-role', count: 9 },
   
  ];
  constructor(public readonly router: Router, private http: HttpService, private modalService: NgbModal) { }


  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovalsEMP();
    this.getAllPendingApprovalsROLE();
  }
  getAllPendingApprovalsEMP() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    console.log(EmployeeId);
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=1&approvedType=EMP`).subscribe({
      next: (response: any) => {
        console.log(response);
        this.leavesEmp = response.data as LeaveApproval[];
        this.countEmp = this.leavesEmp.length ?? 0;
        console.log(this.leavesEmp);
      },
      error: (reason) => console.log(reason),
    });
  }

  getAllPendingApprovalsROLE() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    console.log(EmployeeId);
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=1&approvedType=ROLE`).subscribe({
      next: (response: any) => {
        console.log(response);
        this.leavesRole = response.data as LeaveApproval[];
        this.countRole = this.leavesRole.length ?? 0;
        console.log(this.leavesRole);
      },
      error: (reason) => console.log(reason),
    });
  }
}

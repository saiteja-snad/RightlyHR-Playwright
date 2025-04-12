import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IJob } from '../../../Interfaces/letters-model';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { IPendingApprovals } from '../../../Interfaces/pendingapprovalsmodel';
import { AttendanceRequest } from '../../../Interfaces/timoff-model';
import { Subject } from 'rxjs';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-wfh-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './wfh-request-tabs.component.html',
  styleUrl: './wfh-request-tabs.component.scss'
})
export class WfhRequestTabsComponent implements OnInit,OnDestroy{
  empinfo = {} as IJob;
  workFromHome = [] as AttendanceRequest[];
  roleWfh: AttendanceRequest[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [
    { label: 'For You ', link: 'for-you', count: 9 },
    { label: 'For Your Role', link: 'for-your-role', count: 9 },
   
  ];


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
  }
  

  constructor(public readonly router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService
  ) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }


  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
     this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=2&approvedType=EMP`).subscribe({
      next: (data: any) => {
        console.log(data.data);
        this.workFromHome = data.data.filter((item:any)=>item.approvalHeader.status!='Processed' && item.approvalHeader.status!='Rejected')
      },
      error: (reason) => console.log(reason),
    });
  }
  getAllPendingApprovalsRole() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
   this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=2&approvedType=ROLE`).subscribe({
      next: (data: any) => {
        console.log(data.data);
        this.roleWfh = data.data.filter((item:any)=>item.approvalHeader.status!='Processed' && item.approvalHeader.status!='Rejected')
      },
      error: (reason) => console.log(reason),
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

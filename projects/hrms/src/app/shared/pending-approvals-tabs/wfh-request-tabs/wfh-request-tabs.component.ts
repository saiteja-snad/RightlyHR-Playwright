import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IJob } from '../../../Interfaces/letters-model';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { IPendingApprovals } from '../../../Interfaces/pendingapprovalsmodel';
import { AttendanceRequest } from '../../../Interfaces/timoff-model';

@Component({
  selector: 'app-wfh-request-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './wfh-request-tabs.component.html',
  styleUrl: './wfh-request-tabs.component.scss'
})
export class WfhRequestTabsComponent implements OnInit,OnDestroy{
  empinfo = {} as IJob;
  workFromHome = [] as AttendanceRequest[];
  roleWfh: AttendanceRequest[] = [];



  ngOnInit(): void {
    throw new Error('Method not implemented.');
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
    throw new Error('Method not implemented.');
  }
}

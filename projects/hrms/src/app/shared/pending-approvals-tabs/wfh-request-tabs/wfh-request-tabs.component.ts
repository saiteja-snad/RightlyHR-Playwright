import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IJob } from '../../../Interfaces/letters-model';
import { FormBuilder } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { ApprovalStatusCount, AttendanceRequest } from '../../../Interfaces/timoff-model';
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
  pendingApprovalCount: ApprovalStatusCount[] = [];
  roleWfh: AttendanceRequest[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [
    { label: 'For You ', link: 'for-you', count: 9 },
    { label: 'For Your Role', link: 'for-your-role', count: 9 },
   
  ];


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllWFHPendingApprovalsCount();
  }
  

  constructor(public readonly router: Router,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService
  ) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }


  getAllWFHPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = 2;
  
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        console.log(data);

        this.pendingApprovalCount = data.filter(item => item.moduleId === moduleId);
        console.log(this.pendingApprovalCount);
        
      },
      error: (err) => console.error('Error fetching approvals:', err),
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

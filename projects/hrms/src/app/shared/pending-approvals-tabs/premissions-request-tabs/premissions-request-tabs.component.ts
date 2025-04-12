import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { ApprovalStatusCount, AttendanceRequest } from '../../../Interfaces/timoff-model';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-premissions-request-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './premissions-request-tabs.component.html',
  styleUrl: './premissions-request-tabs.component.scss'
})
export class PremissionsRequestTabsComponent implements OnInit,OnDestroy{
  empinfo = {} as IJob;
  pendingApprovalCount = {} as ApprovalStatusCount[];
  roleWfh: AttendanceRequest[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();



  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPermissionPendingApprovalsCount();
  }
  

  constructor(public readonly router: Router,
    private http: HttpService,
  ) {}

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getAllPermissionPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = 18;
  
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        console.log(data);

        this.pendingApprovalCount = data.find(item => item.moduleId === moduleId) ? [data.find(item => item.moduleId === moduleId)!] : [];
        console.log(this.pendingApprovalCount);
        
      },
      error: (err) => {
        this.pendingApprovalCount = [] as ApprovalStatusCount[];
        console.error('Error fetching approvals:', err)},
    });
  }
  
  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

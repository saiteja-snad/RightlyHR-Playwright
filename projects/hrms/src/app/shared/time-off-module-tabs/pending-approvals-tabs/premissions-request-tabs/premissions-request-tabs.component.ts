import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { IJob } from '../../../../Interfaces/letters-model';
import { ApprovalStatusCount, AttendanceRequest } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';

@Component({
  selector: 'app-premissions-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './premissions-request-tabs.component.html',
  styleUrl: './premissions-request-tabs.component.scss'
})

export class PremissionsRequestTabsComponent implements OnInit,OnDestroy{
  empinfo = {} as IJob;
  pendingApprovalCount = {} as ApprovalStatusCount[];
  roleWfh: AttendanceRequest[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [];

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPermissionPendingApprovalsCount();
  }
  
  constructor(public readonly router: Router, private http: HttpService,) {
    effect(() => {
      if (this.http.tirggerPendingApprovalCountSignal().permission) {
        this.getAllPermissionPendingApprovalsCount();
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({ ...status, permission: false }));
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getAllPermissionPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = 18;
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        this.pendingApprovalCount = data.find(item => item.moduleId === moduleId) ? [data.find(item => item.moduleId === moduleId)!] : [];
        this.navTabs = [
          { label: 'For You ', link: 'for-you', count: this.pendingApprovalCount.at(0)?.forYou ?? 0 },
          { label: 'For Your Role', link: 'for-your-role', count: this.pendingApprovalCount.at(0)?.forYourRole ?? 0 },
        ];
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
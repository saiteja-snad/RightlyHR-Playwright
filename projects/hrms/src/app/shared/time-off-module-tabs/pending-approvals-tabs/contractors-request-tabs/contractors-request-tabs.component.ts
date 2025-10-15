import { CommonModule } from '@angular/common';
import { Component, computed, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IJob } from '../../../../Interfaces/letters-model';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';

@Component({
  selector: 'app-contractors-request-tabs',
  imports: [TabsModule, RouterModule, CommonModule],
  templateUrl: './contractors-request-tabs.component.html',
  styleUrl: './contractors-request-tabs.component.scss'
})
export class ContractorsRequestTabsComponent implements OnInit,OnDestroy {
empinfo = {} as IJob;
  // pendingApprovalCount: ApprovalStatusCount[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  navTabs = computed(() => {
    const moduleId = environment.contractorModuleId;
    const data = this.pendingApprovalCount().find(item => item.moduleId === moduleId);
   const allTabs =  [
      { label: 'For You ', link: 'for-you', count: data?.forYou ?? 0,permission: { feature: 'For You (Contractors)', action: 'view' } },
      { label: 'For Your Role', link: 'for-your-role', count: data?.forYourRole ?? 0,permission: { feature: 'For Role (Contractors)', action: 'view' } }
    ];

     return allTabs.filter(
    tab =>
      tab.permission &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
  );
  });

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllcontractPendingApprovalsCount();
  }

  constructor(public readonly router: Router,private signalService:SignalsService, private http: HttpService,private rbac: RbacService) {
    effect(() => {
      if (this.signalService.contractForyouTriggerSignal() || this.signalService.contractForyouTriggerSignal()) {
        // Call the function to fetch the pending approvals count
        this.getAllcontractPendingApprovalsCount();
      
        // Conditionally reset the signals based on their current state
        if (this.signalService.contractForyouTriggerSignal()) {
          this.signalService.contractForyouTriggerSignal.set(false);
        }
        
        if (this.signalService.contractForyouTriggerSignal()) {
          this.signalService.contractForyouTriggerSignal.set(false);
        }
      }
      
    });    
  }

  getAllcontractPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = environment.contractorModuleId;
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        const filtered = data.filter(item => item.moduleId === moduleId);
        this.pendingApprovalCount.set(filtered);
      },
      error: (err) => console.error('Error fetching approvals:', err),
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

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
  selector: 'app-contract-conversion-request-tabs',
  imports: [TabsModule, RouterModule, CommonModule],
  templateUrl: './contract-conversion-request-tabs.component.html',
  styleUrl: './contract-conversion-request-tabs.component.scss'
})
export class ContractConversionRequestTabsComponent implements OnInit,OnDestroy{

  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  navTabs = computed(() => {
    const moduleId = environment.contractEmployeeConversionModuleId;
    const data = this.pendingApprovalCount().find(item => item.moduleId === moduleId);
    const allTabs = [
      { label: 'For You', link: 'for-you', count: data?.forYou ?? 0, permission: { feature: 'For You (Contract-Conversion)', action: 'view' } },
      { label: 'For Your Role', link: 'for-your-role', count: data?.forYourRole ?? 0, permission: { feature: 'For Role (Contract-Conversion)', action: 'view' } }
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
      if (this.signalService.contractConversionForYouTriggerSignal() || this.signalService.contractConversionForYouRoleTriggerSignal()) {
        this.getAllcontractPendingApprovalsCount();
        if (this.signalService.contractConversionForYouTriggerSignal()) {
          this.signalService.contractConversionForYouTriggerSignal.set(false);
        }
        if (this.signalService.contractConversionForYouRoleTriggerSignal()) {
          this.signalService.contractConversionForYouRoleTriggerSignal.set(false);
        }
      }
      
    });    
  }

  getAllcontractPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = environment.contractEmployeeConversionModuleId;
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

import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IJob } from '../../../../Interfaces/letters-model';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { SignalsService } from '../../../../services/signals.service';
import { RbacService } from '../../../../services/rbac.service';
@Component({
  selector: 'app-recall-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './recall-request-tabs.component.html',
  styleUrl: './recall-request-tabs.component.scss'
})

export class RecallRequestTabsComponent {
  empinfo = {} as IJob;
  // pendingApprovalCount: ApprovalStatusCount[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  navTabs = computed(() => {
    const moduleId = environment.RecallrequestmoduleId;
    const data = this.pendingApprovalCount().find(item => item.moduleId === moduleId);
    const allTabs = [
      { label: 'For You ', link: 'recall-for-you', count: data?.forYou ?? 0,permission: { feature: 'For You (Recall Requests)', action: 'view' } },
      { label: 'For Your Role', link: 'recall-for-role', count: data?.forYourRole ?? 0,permission: { feature: 'For Role (Recall Requests)', action: 'view' } }
    ];

     return allTabs.filter(
    tab =>
      tab.permission &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
  );
  });

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllSeparationPendingApprovalsCount();
  }

  constructor(public readonly router: Router, private http: HttpService,private signalService:SignalsService,private rbac: RbacService) {
    effect(() => {
      if (this.signalService.recallSeparationForYouTriggerSignal() || this.signalService.recallSeparationForRoleTriggerSignal()) {
        // Call the function to fetch the pending approvals count
        this.getAllSeparationPendingApprovalsCount();

        // Conditionally reset the signals based on their current state
        if (this.signalService.recallSeparationForYouTriggerSignal()) {
          this.signalService.recallSeparationForYouTriggerSignal.set(false);
        }

        if (this.signalService.recallSeparationForRoleTriggerSignal()) {
          this.signalService.recallSeparationForRoleTriggerSignal.set(false);
        }
      }
    });
    // effect(() => {
    //   if (this.http.tirggerPendingApprovalCountSignal().recall) {
    //     this.getAllSeparationPendingApprovalsCount();
    //   this.http.tirggerPendingApprovalCountSignal.update((status) => ({ ...status, recall: false }));
    //   }
    // });
  }

  getAllSeparationPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = environment.RecallrequestmoduleId;
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

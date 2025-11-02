import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IJob } from '../../../../Interfaces/letters-model';
import { ApprovalStatusCount, AttendanceRequest } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';

@Component({
  selector: 'app-extra-hours-approvals-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './extra-hours-approvals-tabs.component.html',
  styleUrl: './extra-hours-approvals-tabs.component.scss'
})
export class ExtraHoursApprovalsTabsComponent {
  empinfo = {} as IJob;
  pendingApprovalCount = {} as ApprovalStatusCount[];
  roleWfh: AttendanceRequest[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [];

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllRegularizationPendingApprovalsCount();
  }

  constructor(public readonly router: Router, private http: HttpService, private signalService: SignalsService, private rbac: RbacService) {
    effect(() => {
      if (this.signalService.regularizationForYouTriggerSignal() ||
        this.signalService.regularizationForRoleTriggerSignal()) {
        // Call the function to fetch the pending approvals count
        this.getAllRegularizationPendingApprovalsCount();
        if (this.signalService.regularizationForRoleTriggerSignal()) {
          this.signalService.regularizationForRoleTriggerSignal.set(false);
        }
        if (this.signalService.regularizationForYouTriggerSignal()) {
          this.signalService.regularizationForYouTriggerSignal.set(false);
        }
      }
    });
  }

  //function to get the regularization details
  getAllRegularizationPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = environment.extraHoursModuleId;
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        this.pendingApprovalCount = data.find(item => item.moduleId === moduleId) ? [data.find(item => item.moduleId === moduleId)!] : [];
        this.navTabs = [
          { label: 'For You ', link: 'for-you', count: this.pendingApprovalCount.at(0)?.forYou ?? 0, permission: { feature: 'For You (Extra Hours)', action: 'view' } },
          { label: 'For Your Role', link: 'for-your-role', count: this.pendingApprovalCount.at(0)?.forYourRole ?? 0, permission: { feature: 'For Role (Extra Hours)', action: 'view' } },
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
      error: (err) => {
        this.pendingApprovalCount = [] as ApprovalStatusCount[];
        console.error('Error fetching approvals:', err)
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

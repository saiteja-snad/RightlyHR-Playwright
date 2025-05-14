import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { LeaveApproval } from '../../../../Interfaces/pendingapprovalsmodel';
import { HttpService } from '../../../../services/http.service';
import { environment } from '../../../../../environments/environment';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { SignalsService } from '../../../../services/signals.service';
import { IJob } from '../../../../Interfaces/letters-model';

@Component({
  selector: 'app-time-off-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './time-off-request-tabs.component.html',
  styleUrl: './time-off-request-tabs.component.scss'
})

export class TimeOffRequestTabsComponent {
 empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  navTabs = computed(() => {
    const moduleId=environment.leavesModuleId
    const data = this.pendingApprovalCount().find(item => item.moduleId === moduleId);
    return [
      { label: 'For You ', link: 'for-you', count:data?.forYou ?? 0 },
      { label: 'For Your Role', link: 'for-your-role', count:data?.forYourRole ?? 0}
    ];
  });

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllLeavesPendingApprovalsCount();
  }

  constructor(public readonly router: Router, private http: HttpService,private signalService:SignalsService) {
    effect(() => {
      if (this.signalService.timeoffForYouTriggerSignal() || this.signalService.timeoffForRoleTriggerSignal()) {
        // Call the function to fetch the pending approvals count
        this.getAllLeavesPendingApprovalsCount();

        // Conditionally reset the signals based on their current state
        if (this.signalService.timeoffForRoleTriggerSignal()) {
          this.signalService.timeoffForRoleTriggerSignal.set(false);
        }

        if (this.signalService.timeoffForYouTriggerSignal()) {
          this.signalService.timeoffForYouTriggerSignal.set(false);
        }
      }
    });
    // effect(() => {
    //   if (this.http.tirggerPendingApprovalCountSignal().separation) {
    //     this.getAllSeparationPendingApprovalsCount();
    //     this.http.tirggerPendingApprovalCountSignal.update((status) => ({ ...status, separation: false }));
    //   }
    // });
  }

  getAllLeavesPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = environment.leavesModuleId;
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
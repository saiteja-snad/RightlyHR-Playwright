import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { IJob } from '../../../../Interfaces/letters-model';
import { ApprovalStatusCount, AttendanceRequest } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { SignalsService } from '../../../../services/signals.service';

@Component({
  selector: 'app-comp-off-request-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './comp-off-request-tabs.component.html',
  styleUrl: './comp-off-request-tabs.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class CompOffRequestTabsComponent implements OnInit, OnDestroy {
  empinfo = {} as IJob;
  pendingApprovalCount: ApprovalStatusCount[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  navTabs: any[] = [];

  constructor(
    public readonly router: Router,
    private http: HttpService,
    private signalService: SignalsService
  ) {
    effect(() => {
      if (this.signalService.compOffForRoleTriggerSignal() || this.signalService.compOffForYouTriggerSignal()) {
        // Call the function to fetch the pending approvals count
        this.getAllCompOffPendingApprovalsCount();

        // Conditionally reset the signals based on their current state
        if (this.signalService.compOffForRoleTriggerSignal()) {
          this.signalService.compOffForRoleTriggerSignal.set(false);
        }

        if (this.signalService.compOffForYouTriggerSignal()) {
          this.signalService.compOffForYouTriggerSignal.set(false);
        }
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllCompOffPendingApprovalsCount();
  }

  getAllCompOffPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = 3;
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        const filteredData = data.find(item => item.moduleId === moduleId);
        if (filteredData) {
          this.pendingApprovalCount = [filteredData];
        } else {
          this.pendingApprovalCount = [];
        }

        // Update the navTabs after fetching the data
        this.updateNavTabs();
      },
      error: (err) => {
        this.pendingApprovalCount = [];
        console.error('Error fetching approvals:', err);
        this.updateNavTabs();  // Update the navTabs with empty counts if there was an error
      },
    });
  }

  // Update navTabs based on the fetched approval counts
  updateNavTabs() {
    // Check if pendingApprovalCount is not empty before accessing the first element
    const data = this.pendingApprovalCount.length > 0 ? this.pendingApprovalCount[0] : null;
  
    // Update navTabs with safe access to data
    this.navTabs = [
      { label: 'For You', link: 'for-you', count: data?.forYou ?? 0 ,permission: { feature: 'For You (Comp Off)', action: 'view' }},
      { label: 'For Your Role', link: 'for-your-role', count: data?.forYourRole ?? 0 ,permission: { feature: 'For Role (Comp Off)', action: 'view' }},
    ];
  }
  

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

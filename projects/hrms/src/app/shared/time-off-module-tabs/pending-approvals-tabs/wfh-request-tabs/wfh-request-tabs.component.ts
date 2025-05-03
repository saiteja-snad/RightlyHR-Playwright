import { CommonModule } from '@angular/common';
import { Component, computed, effect, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { IJob } from '../../../../Interfaces/letters-model';
import { AttendanceRequest, ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { SignalsService } from '../../../../services/signals.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-wfh-request-tabs',
  imports: [CommonModule,RouterModule,TabsModule],
  templateUrl: './wfh-request-tabs.component.html',
  styleUrl: './wfh-request-tabs.component.scss'
})

export class WfhRequestTabsComponent implements OnInit,OnDestroy{
  empinfo = {} as IJob;
  roleWfh: AttendanceRequest[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  readonly navTabs = computed(() => {
    const data = this.pendingApprovalCount().find(item => item.moduleId === 2);
    return [
      { label: 'For You', link: 'for-you', count: data?.forYou ?? 0 ,permission: { feature: 'For You (WFH)', action: 'view' }},
      { label: 'For Your Role', link: 'for-your-role', count: data?.forYourRole ?? 0 ,permission: { feature: 'For Role (WFH)', action: 'view' }}
    ];
  });
  filteredTabs: any[] = [];
  
 
  
  constructor(public readonly router: Router, private http: HttpService,private signalService:SignalsService, private rbac: RbacService) {
    effect(() => {
      if (this.signalService.wfhForYouTriggerSignal() || this.signalService.wfhForRoleTriggerSignal()) {
        // Call the function to fetch the pending approvals count
        this.getAllWFHPendingApprovalsCount();
      
        // Conditionally reset the signals based on their current state
        if (this.signalService.wfhForYouTriggerSignal()) {
          this.signalService.wfhForYouTriggerSignal.set(false);
        }
        
        if (this.signalService.wfhForRoleTriggerSignal()) {
          this.signalService.wfhForRoleTriggerSignal.set(false);
        }
      }
      
    });    
  }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllWFHPendingApprovalsCount();
   
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getAllWFHPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = 2;
    
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        if (data && data.length > 0) {
          // Filter the data based on the moduleId
          const filtered = data.filter(item => item.moduleId === moduleId);
          this.pendingApprovalCount.set(filtered);
        } else {
          this.pendingApprovalCount.set([
            { moduleId: 2, moduleName: 'WFH', forYou: 0, forYourRole: 0, totalCount: 0 },
          ]);
        }
        this.filterTabsByRbac();
      },
      error: (err) => console.error('Error fetching approvals:', err),
    });
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs()?.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }
  

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

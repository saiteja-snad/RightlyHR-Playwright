import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { TabsModule } from 'primeng/tabs';
import { IJob } from '../../Interfaces/letters-model';
import { ApprovalStatusCount } from '../../Interfaces/timoff-model';
import { HttpService } from '../../services/http.service';
import { SignalsService } from '../../services/signals.service';
import { RbacService } from '../../services/rbac.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-employeeinfo-pending-approval-tabs',
  imports: [RouterModule, TabsModule, CommonModule],
  templateUrl: './employeeinfo-pending-approval-tabs.component.html',
  styleUrl: './employeeinfo-pending-approval-tabs.component.scss'
})
export class EmployeeinfoPendingApprovalTabsComponent implements OnInit, OnDestroy {
  empinfo = {} as IJob;
  // pendingApprovalCount: ApprovalStatusCount[] = [];

  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  navTabs = computed(() => {
  const data = this.pendingApprovalCount().find(item => item.moduleId === environment.pendingapprovalemployeid);
  const allTabs = [
    { label: 'For You', link: 'for-you', count: data?.forYou ?? 0, permission: { feature: 'For You (Employee Info)', action: 'view' } },
    { label: 'For Your Role', link: 'for-your-role', count: data?.forYourRole ?? 0, permission: { feature: 'For Role (Employee Info)', action: 'view' } }
  ];

  return allTabs.filter(
    tab =>
      tab.permission &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
  );
});

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllEmployeinfoPendingApprovalsCount();
  }

  constructor(
    public readonly router: Router,
    private http: HttpService,
    private signalService:SignalsService,
    private rbac: RbacService
  ) {
     effect(() => {
      if (this.signalService.employeinfoDetailsForRoleTriggerSignal() || this.signalService.employeinfoDetailsForYouTriggerSignal()) {
        // Call the function to fetch the pending approvals count
        this.getAllEmployeinfoPendingApprovalsCount();
      
        // Conditionally reset the signals based on their current state
        if (this.signalService.employeinfoDetailsForRoleTriggerSignal()) {
          this.signalService.employeinfoDetailsForRoleTriggerSignal.set(false);
        }
        
        if (this.signalService.employeinfoDetailsForYouTriggerSignal()) {
          this.signalService.employeinfoDetailsForYouTriggerSignal.set(false);
        }
      }
      
    }); 
  }

  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }

  getAllEmployeinfoPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = 32;

    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        console.log(data);
        const filtered = data.filter((item) => item.moduleId === moduleId);
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


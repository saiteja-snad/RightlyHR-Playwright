import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { Subject } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { IJob } from '../../../../Interfaces/letters-model';
import { ApprovalStatusCount } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';

@Component({
  selector: 'app-desk-request-tabs',
  imports: [TabsModule, RouterModule, CommonModule],
  templateUrl: './desk-request-tabs.component.html',
  styleUrl: './desk-request-tabs.component.scss'
})

export class DeskRequestTabsComponent {
  empinfo = {} as IJob;
  // pendingApprovalCount: ApprovalStatusCount[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  pendingApprovalCount = signal<ApprovalStatusCount[]>([]);
  filteredTabs: any[] = [];
  navTabs = computed(() => {
    const moduleId = environment.deskAllocationModuleId;
    const data = this.pendingApprovalCount().find(item => item.moduleId === moduleId);
    return [
      { label: 'For You ', link: 'for-you', count: data?.forYou ?? 0,permission: { feature: 'For You (Desk Requests)', action: 'view' }  },
      { label: 'For Your Role', link: 'for-your-role', count: data?.forYourRole ?? 0,permission: { feature: 'For Role (Desk Requests)', action: 'view' }  }
    ];
  });

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllDeskPendingApprovalsCount();
  }

  constructor(public readonly router: Router, private http: HttpService, private rbac: RbacService) {
    effect(() => {
      if (this.http.tirggerPendingApprovalCountSignal().separation) {
        this.getAllDeskPendingApprovalsCount();
        this.http.tirggerPendingApprovalCountSignal.update((status) => ({ ...status, separation: false }));
      }
    });
  }

  getAllDeskPendingApprovalsCount() {
    const employeeId = parseInt(this.empinfo.employeeId);
    const moduleId = environment.deskAllocationModuleId;
    this.http.getAllPendingApprovalsCount(moduleId, employeeId).subscribe({
      next: (data: ApprovalStatusCount[]) => {
        const filtered = data.filter(item => item.moduleId === moduleId);
        this.pendingApprovalCount.set(filtered);
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
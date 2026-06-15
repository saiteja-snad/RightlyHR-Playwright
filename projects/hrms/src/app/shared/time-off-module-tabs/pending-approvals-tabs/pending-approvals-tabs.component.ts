import { CommonModule } from '@angular/common';
import { Component, effect } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { HttpService } from '../../../services/http.service';
import { SignalsService } from '../../../services/signals.service';
@Component({
  selector: 'app-pending-approvals-tabs',
  imports: [CommonModule, RouterModule],
  templateUrl: './pending-approvals-tabs.component.html',
  styleUrl: './pending-approvals-tabs.component.scss',
})

export class PendingApprovalsTabsComponent {

  filteredTabs: any[] = [];
  isActive(route: string): boolean {
    return this.router.isActive(route, true);
  }
  empinfo: any;
  allowedWfh: boolean = false;
  allowRemoteLogin: boolean = false;
  navTabs: any[] = [];
  columnsPerRow = 3;
  destroy$: Subject<boolean> = new Subject<boolean>();
  approvalCounts: any[] = [];
  timeOffTotalCount: number = 0;

  kraKpiTotalCount = 0;

  constructor(public readonly router: Router, private http: HttpService, private rbac: RbacService, private accessNav: AccessNavigationService,private readonly signalService: SignalsService) { 

     effect(() => {
      if ((this.http.tirggerPendingApprovalCountSignal().wfh) || (this.http.tirggerPendingApprovalCountSignal().separation)
        || (this.http.tirggerPendingApprovalCountSignal().nodue)) {
        this.getAllPendingApprovalsCount();
        this.http.tirggerPendingApprovalCountSignal.update(status => ({
          ...status,
          wfh: status.wfh ? false : status.wfh,
          separation: status.separation ? false : status.separation,
          nodue: status.nodue ? false : status.nodue,
        }));
      }
      if (this.signalService.OfferLetterNavCountSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.OfferLetterNavCountSignal.set(false);
      }
      if (this.signalService.TraineeOfferLetterNavCountSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.TraineeOfferLetterNavCountSignal.set(false);
      }
      if (this.signalService.ContractOfferLetterNavCountSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.ContractOfferLetterNavCountSignal.set(false);
      }
      if (this.signalService.AppointmentLetterNavCountSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.AppointmentLetterNavCountSignal.set(false);
      }
      if (this.signalService.NDALetterNavCountSignal()) {
        this.getAllPendingApprovalsCount();
        this.signalService.NDALetterNavCountSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.allowedWfh = this.empinfo.allowWFH;
    this.allowRemoteLogin = this.empinfo.allowRemoteLogin;
    // Subscribe to live updates
    this.http.pendingApprovalCount$.pipe(takeUntil(this.destroy$)).subscribe(counts => {
      if (counts) {
        this.approvalCounts = counts;
        this.getApprovalStatusCounts();
      }
    });

    // Load initial data
    this.navTabs = [
      { label: 'Time-Off', link: '/pending-approvals/time-off', icon: '/main-menu-icons/Time-off-settings-icon.png', permission: { feature: 'Time Off main Tab', action: 'view' }, moduleIds: [1, 2, 3, 11, 18, 31, 17] },
      { label: 'Onboarding', link: '/pending-approvals/on-boarding', icon: '/images/onboarding.png', permission: { feature: 'Onboarding main Tab', action: 'view' }, moduleIds: [20, 15] },
      { label: 'Contractors', link: '/pending-approvals/contractors', icon: '/my-info-icons/contractor.png', permission: { feature: 'Contractors main Tab', action: 'view' }, moduleIds: [25, 26] },
      { label: 'Offboarding', link: '/pending-approvals/off-boarding', icon: '/images/sepration-request.png', permission: { feature: 'Offboarding main Tab', action: 'view' }, moduleIds: [13, 14] },
      { label: 'Desks', link: '/pending-approvals/desk-approval', icon: '/main-menu-icons/desk-icon.png', permission: { feature: 'Desk Requests Tab', action: 'view' }, moduleIds: [23] },
      { label: 'Expenses', link: '/pending-approvals/claimsandexpenses-request', icon: '/main-menu-icons/expenses-icon.png', permission: { feature: 'Claims and Expenses Tab', action: 'view' }, moduleIds: [19] },
      { label: 'Timesheets', link: '/pending-approvals/time-sheets', icon: '/time-off-icon/calender-activity.png', permission: { feature: 'Time Sheet approval Tab', action: 'view' }, moduleIds: [30] },
      { label: 'Employee Info', link: '/pending-approvals/employeeinfo-request', icon: '/time-off-icon/employee-info-approvals.png', permission: { feature: 'EmployeeInfo Tab', action: 'view' }, moduleIds: [32] },
      { label: "KRA/KPI's", link: '/pending-approvals/kra-kpi', icon: '/main-menu-icons/kra-kpi.png', permission: { feature: 'KRA KPI approval Tab', action: 'view' }, moduleIds: [], totalCount: 0 }
    ];
    this.getApprovalStatusCounts();
    this.loadKraKpiApprovalCount();
  }

  getApprovalStatusCounts() {
    this.http.get(`PendingApproval/getApprovalStatusCounts?EmployeeId=${this.empinfo.employeeId}`).subscribe((res: any) => {
      this.approvalCounts = res;
      this.updateTabCounts();
      this.refreshFilteredTabs();
      this.getAllPendingApprovalsCount();
    });
  }


  getAllPendingApprovalsCount() {
    const employeeId = Number.parseInt(this.empinfo.employeeId);
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    this.http.getData(`PendingApproval/onboard-requests-count?month=${month}&year=${year}&EmployeeId=${employeeId}  `).subscribe({
      next: (response: any) => {
        if (response.success) {
          const modules = response.data.modules;
          const allowedLabels = this.getOnboardingAllowedLabels();
          const totalCount = modules.filter((m: any) => allowedLabels.includes(m.name)).reduce((sum: number, m: any) => sum + m.count, 0);
          const onboardingTab = this.navTabs.find(
            tab => tab.label === 'Onboarding'
          );

          if (onboardingTab) {
            onboardingTab.totalCount = modules
              .filter((m: any) => allowedLabels.includes(m.name))
              .reduce((sum: number, m: any) => sum + Number(m.count || 0), 0);

            console.log('Updated onboarding count:', onboardingTab.totalCount);
          }

          this.refreshFilteredTabs();
        }
      },
      error: (err: any) => { },
    });
  }

  private getOnboardingAllowedLabels(): string[] {
    const onboardingLabels = [
      { label: 'Offer Letter', permission: 'Documents History Offer Letter.view' },
      { label: 'Contract Offer Letter', permission: 'Documents History Contract Offer Letter.view' },
      { label: 'Trainee Offer Letter', permission: 'Documents History Trainee Offer Letter.view' },
      { label: 'Appointment Letter', permission: 'Documents History Appointment Letter.view' },
      { label: 'Non-Disclosure Agreement Letter', permission: 'Documents History Non-Disclosure Agreement Letter.view' },
      { label: 'Probation', permission: 'Probation Details Tab.view' },
      { label: 'Trainees', permission: 'Trainee Details Tab.view' }
    ];
    return onboardingLabels.filter(item => this.rbac.allowedToAccess(item.permission)).map(item => item.label);
  }

  refreshFilteredTabs(): void {
    this.filteredTabs = this.navTabs
      .filter(tab => {
        if (!tab.permission) return true;
        const { feature, action } = tab.permission;
        const permissionString = `${feature}.${action}`;
        return this.rbac.allowedToAccess(permissionString);
      })
      .map(tab => ({ ...tab }));
  }

  updateTabCounts() {
    this.navTabs.forEach(tab => {
      if (tab.moduleIds && tab.moduleIds.length > 0) {
        let total = 0;
        tab.moduleIds.forEach((id: any) => {
          const result = this.approvalCounts.find(x => x.moduleId === id);
          if (result) {
            total += result.totalCount;
          }
        });
        tab.totalCount = total;
      }
    });
  }

  // getAllPendingApprovalsCount() {
  //   const employeeId = Number.parseInt(this.empinfo.employeeId);
  //   const currentDate = new Date();
  //   const month = currentDate.getMonth() + 1; // getMonth() is 0-based
  //   const year = currentDate.getFullYear();
  //   this.http.getData(`PendingApproval/onboard-requests-count?month=${month}&year=${year}&EmployeeId=${employeeId}  `).subscribe({
  //     next: (response: any) => {
  //       if (response.success) {
  //         const onboardingTab = this.navTabs.find(tab => tab.label === 'Onboarding');
  //         if (onboardingTab) {
  //           onboardingTab.totalCount = response.data.totalCount;
  //           console.log("Onboarding Total Count: ", onboardingTab.totalCount);  
  //         }
  //         this.refreshFilteredTabs();
  //       }
  //     },
  //     error: (err: any) => {

  //     },
  //   });
  // }




  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    // Exact match or starts with followed by `/` to avoid partial matches
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }

  // Check if item is in the first row
  isInTopRow(index: number): boolean {
    return Math.floor(index / this.columnsPerRow) === 0;
  }

  // Check if item is in the last row
  isInLastRow(index: number): boolean {
    const totalRows = Math.ceil(this.filteredTabs.length / this.columnsPerRow);
    const currentRow = Math.floor(index / this.columnsPerRow) + 1;
    return currentRow === totalRows;
  }

  // Check if item is in a middle row
  isInMiddleRow(index: number): boolean {
    return !this.isInTopRow(index) && !this.isInLastRow(index);
  }

  // Check if item is in the first column
  isFirstColumn(index: number): boolean {
    return index % this.columnsPerRow === 0;
  }

  // Check if item is in the last column
  isLastColumn(index: number): boolean {
    return (index + 1) % this.columnsPerRow === 0;
  }

  // Check if item is in a middle column
  isMiddleColumn(index: number): boolean {
    return !this.isFirstColumn(index) && !this.isLastColumn(index);
  }

  loadKraKpiApprovalCount(): void {
    const params: any = {
      pageNumber: 1,
      pageSize: 1000,
      managerEmployeeId: this.empinfo?.employeeId,
    };

    this.http.getDataIncludeParams('Kpi/getPendingApprovalsData', params).subscribe({
      next: (res: any) => {
        this.kraKpiTotalCount = res?.data?.length || 0;
        console.log("KRA Total Count: ", this.kraKpiTotalCount);

        const kraTab = this.navTabs.find(t => t.label === "KRA/KPI's");
        if (kraTab) {
          kraTab.totalCount = this.kraKpiTotalCount;
        }

        this.refreshFilteredTabs(); // <-- Critical: refresh UI after KRA update
      },
      error: () => {
        this.kraKpiTotalCount = 0;
        const kraTab = this.navTabs.find(t => t.label === "KRA/KPI's");
        if (kraTab) kraTab.totalCount = 0;
        this.refreshFilteredTabs();
      }
    });
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

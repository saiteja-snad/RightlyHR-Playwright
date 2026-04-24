import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-personal-job-tabs',
  imports: [RouterModule, TabsModule, CommonModule],
  templateUrl: './personal-job-tabs.component.html',
  styleUrl: './personal-job-tabs.component.scss'
})

export class PersonalJobTabsComponent implements OnInit {
  navTabs: any[] = [];
  filteredTabs: any[] = [];
  columnsPerRow = 3;
  empinfo: any;
  subscription!: Subscription;


  constructor(private http: HttpService,public rbac: RbacService, public readonly router: Router, private route: ActivatedRoute,private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    if (this.route.snapshot.routeConfig?.path === 'personalinfo') {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
    }
    else if (this.route.snapshot.routeConfig?.path === 'myinfo') {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    }
    this.filterTabs();
    this.filterTabsByRbac();
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;
      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }

filterTabs(): void {
  const allTabs = [
    { label: 'Pre Onboarding Info', link: '/personalinfo/job/pre-onboarding-details', icon: '/images/preonboarding.png', permission: { feature: 'Employee Info Pre-Onboarding Details', action: 'view' } },
    { label: 'Onboarding Info', link: '/personalinfo/job/onboarding-details', icon: '/images/onboarding.png', permission: { feature: 'Employee Info Onboarding Details', action: 'view' } },
    { label: 'Compensations', link: '/personalinfo/job/compensation-details', icon: '/images/compensation.png', permission: { feature: 'Employee Info Compensation Details', action: 'view' } },
    { label: 'Probation Info', link: '/personalinfo/job/probation-details', icon: '/images/probation.png', permission: { feature: 'Employee Info Probation Details', action: 'view' } },
    { label: 'Job Info', link: '/personalinfo/job/job-details', icon: '/images/jobdetailes.png', permission: { feature: 'Employee Info Job Details', action: 'view' } },
    { label: 'Team Members', link: '/personalinfo/job/team', icon: '/my-info-icons/Team-icon.png', permission: { feature: 'Employee Info Team Members Tab', action: 'view' } },
    { label: 'Assigned Assets ', link: '/personalinfo/job/assets-details', icon: '/images/assets-list.png', permission: { feature: 'Employee Info Asset Details', action: 'view' } },
    { label: 'Employment History', link: '/personalinfo/job/past-experiences', icon: '/images/experience.png', permission: { feature: 'Employee Info Previous Experience Details', action: 'view' } },
    { label: 'Certifications', link: '/personalinfo/job/certifications', icon: '/images/certificate.png', permission: { feature: 'Employee Info Certification Details', action: 'view' } },
    { label: 'Desk Info', link: '/personalinfo/job/desk-details', icon: '/images/desk.png', permission: { feature: 'Employee Info Desk Details', action: 'view' } },
    { label: 'Separation Request', link: '/personalinfo/job/separation-details/separation-requests', icon: '/images/sepration-request.png', permission: { feature: 'Employee Info Separation Request Details', action: 'view' } },
    { label: 'No Due Clearance Info', link: '/personalinfo/job/no-due-clearance-details', icon: '/images/nodue.png', permission: { feature: 'Employee Info No Due Clearance Details', action: 'view' } },
    { label: 'Onboarding Documents', link: '/personalinfo/job/onboarding-verification', icon: '/my-info-icons/onboarding-icon.png', permission: { feature: 'Employee Info Documents Verification', action: 'view' } },
    { label: 'Trainee Onboard Request', link: '/personalinfo/job/trainee-onboarding-requests', icon: '/images/onboarding.png', permission: { feature: 'Employee Info Onboarding Request Details', action: 'view' } },
    { label: 'Offboarding Info', link: '/personalinfo/job/employmentType/initate-offboarding-landingscreen', icon: '/images/offboarding.png', permission: { feature: 'Employee Info Offboarding Details', action: 'view' } },
    { label: 'Contract Info', link: '/personalinfo/job/contactor-info', icon: '/my-info-icons/contractor.png', permission: { feature: 'Employee Info Contract Details', action: 'view' } },
    { label: 'Cards', link: '/personalinfo/job/cards', icon: '/cards-icons/Allocated.png', permission: { feature: 'Employee Info Card Details', action: 'view' } },
    { label: 'Assigned Projects', link: '/personalinfo/job/project-info', icon: '/my-info-icons/project.png', permission: { feature: 'Employee Info Project Details', action: 'view' } },
  ];

  this.navTabs = allTabs;
   this.navTabs = ((this.empinfo?.empstatus === 'Active Contract' || this.empinfo?.empstatus === 'Inactive Contract') && this.empinfo.empType === 'Contract')
    ? allTabs
    : allTabs.filter(tab => tab.label !== 'Contract Info');
}

 navigateToAccessedRoute(link: string): void {
    if (link == '/personalinfo/job/team' || link == '/personalinfo/job/separation-details') {
      const actualRoute = this.accessNav.navigateToAccessedRoute(link);
      if (actualRoute) {
        this.router.navigate([actualRoute]);
      } else {
        this.router.navigate(['/unauthorized']);
      }
    }
    else if (link === '/personalinfo/job/employmentType/initate-offboarding-landingscreen') {
      this.checkOffboardingCondition(link);
    }
    else {
      this.router.navigateByUrl(link);
    }
  }

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;

    // Special handling for offboarding tab
    if (link === '/personalinfo/job/employmentType/initate-offboarding-landingscreen') {
      return currentUrl.includes('/employmentType') ||
             currentUrl.includes('/initate-offboarding');
    }

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

  // Add your condition logic here
  private checkOffboardingCondition(link: string): void {
    const inactiveStatuses = ['Inactive', 'Trainee Inactive', 'Inactive Contract'];
    this.subscription = this.http.getData(`OffboardingTracker/employee/${this.empinfo.employeeId}?stageType=Emp`).subscribe({
      next: (data: any) => {
        console.log('Offboarding data:', data);
        if (data?.data.length <= 0 && !inactiveStatuses.includes(this.empinfo?.empstatus)) {
          this.router.navigateByUrl(link);
        }
        else if(data?.data?.length >0){
          let employeedata = JSON.parse(localStorage.getItem("personaldata") || '{}');
          const inProgressItem = data?.data?.find((item: any) => item.status?.toLowerCase() === 'inprogress');
          console.log('In-progress item:', inProgressItem);
          if(!inactiveStatuses.includes(employeedata?.empstatus)) {
          if (inProgressItem) {
            const moduleId = inProgressItem?.moduleId;
            this.navigateToModuleRoute(moduleId);
            console.log('lastestmoduleId',moduleId);}
            else{
              this.router.navigateByUrl('/personalinfo/job/employmentType/initate-offboarding/no-approvals-screen');
            }
          }
            else{
              this.router.navigateByUrl('/personalinfo/job/employmentType/offboarding-details');
            }
          //this.router.navigateByUrl('/personalinfo/job/employmentType/initate-offboarding');
        }
         else {
          // Navigate to alternative route or show message
          this.router.navigateByUrl('/personalinfo/job/employmentType/offboarding-details');
        }
      },
      error: (err: any) => {
        console.log(err);
        // Handle error case - maybe navigate to error page or show message
        // this.router.navigateByUrl('/personalinfo/job/employmentType/initate-offboarding-landingscreen');
      }
    });
  }
   // Navigate to route based on moduleId
  private navigateToModuleRoute(moduleId: number): void {
    const moduleRoutes: { [key: number]: string } = {
      [environment.leavesModuleId]: '/personalinfo/job/employmentType/initate-offboarding/leave-approvals',
      [environment.wfhModuleId]: '/personalinfo/job/employmentType/initate-offboarding/wfh-approvals',
      [environment.remoteLoginModuleId]: '/personalinfo/job/employmentType/initate-offboarding/remote-login-approvals',
      [environment.compoffModuleId]: '/personalinfo/job/employmentType/initate-offboarding/compoff-approvals',
      [environment.permissionsModuleId]: '/personalinfo/job/employmentType/initate-offboarding/permissions-approvals',
      [environment.extraHoursModuleId]: '/personalinfo/job/employmentType/initate-offboarding/extrahours-approvals',
      [environment.attendanceRegularizationModuleId]: '/personalinfo/job/employmentType/initate-offboarding/regularization-approvals',
      [environment.expensesModuleId]: '/personalinfo/job/employmentType/initate-offboarding/expenses-approvals',
      [environment.timesheetModuleId]: '/personalinfo/job/employmentType/initate-offboarding/timesheet-approvals',
      [environment.pendingapprovalemployeid]: '/personalinfo/job/employmentType/initate-offboarding/employee-info-approvals',
    };

    const targetRoute = moduleRoutes[moduleId];
    if (targetRoute) {
      this.router.navigate([targetRoute]);
    }else{
      this.router.navigateByUrl('/personalinfo/job/employmentType/initate-offboarding/leave-approvals');
    }
  }
}

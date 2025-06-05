import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
import { Ipersonal } from '../../../Interfaces/personal-modal';
@Component({
  selector: 'app-myinfo-job-tabs',
  imports: [RouterModule, TabsModule, CommonModule],
  templateUrl: './myinfo-job-tabs.component.html',
  styleUrl: './myinfo-job-tabs.component.scss'
})
export class MyinfoJobTabsComponent implements OnInit {
  filteredTabs: any[] = [];
  columnsPerRow = 3;
  navTabs: any[] = [];
  empinfo = {} as Ipersonal;

  constructor(public rbac: RbacService, public readonly router: Router, private route: ActivatedRoute,) { }

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

  filterTabs(): void {
    const { empstatus } = this.empinfo;
    const allTabs = [
      { label: 'PreOnboarding', link: '/myinfo/job/pre-onboarding-details', icon: '/images/preonboarding.png', permission: { feature: 'My Info Pre-Onboarding Details', action: 'view' } },
      { label: 'Onboarding', link: '/myinfo/job/onboarding-details', icon: '/images/onboarding.png', permission: { feature: 'My Info Onboarding Details', action: 'view' } },
      { label: 'Compensations', link: '/myinfo/job/compensation-details', icon: '/images/compensation.png', permission: { feature: 'My Info Compensation Details', action: 'view' } },
      { label: 'Probation', link: '/myinfo/job/probation-details', icon: '/images/probation.png', permission: { feature: 'My Info Probation Details', action: 'view' } },
      { label: 'Job Info', link: '/myinfo/job/job-details', icon: '/images/jobdetailes.png', permission: { feature: 'My Info Job Details', action: 'view' } },
      { label: 'Team Members', link: '/myinfo/job/team-members', icon: '/my-info-icons/Team-icon.png', permission: { feature: 'My Info Team Members Tab', action: 'view' } },
      { label: 'Desk', link: '/myinfo/job/desk-details', icon: '/images/desk.png', permission: { feature: 'My Info Desk Details', action: 'view' } },
      { label: 'Separation', link: '/myinfo/job/separation-details', icon: '/images/sepration-request.png', permission: { feature: 'My Info Separation Request Details', action: 'view' } },
      { label: 'No Due Clearance', link: '/myinfo/job/no-due-clearance-details', icon: '/images/nodue.png', permission: { feature: 'My Info No Due Clearance Details', action: 'view' } },
      { label: 'Offboarding', link: '/myinfo/job/employmentType', icon: '/images/offboarding.png', permission: { feature: 'My Info Offboarding Details', action: 'view' } },
      { label: 'Assets', link: '/myinfo/job/assets-details', icon: '/images/assets-list.png', permission: { feature: 'My Info Asset Details', action: 'view' } },
      { label: 'Employment History', link: '/myinfo/job/past-experiences', icon: '/images/experience.png', permission: { feature: 'My Info Previous Experience Details', action: 'view' } },
      { label: 'Certifications', link: '/myinfo/job/certifications', icon: '/images/certificate.png', permission: { feature: 'My Info Certification Details', action: 'view' } },
    ];
    const statusesToRemoveOffboarding = ['Active', 'Trainee Active', 'Prospective', 'Trainee Prospective'];
    this.navTabs = allTabs.filter(tab => {
      // Remove "Offboarding Info" if empstatus is one of the above statuses
      if (statusesToRemoveOffboarding.includes(empstatus) && tab.label === 'Offboarding Info') {
        return false;
      }
      return true;
    });
  }

  filterTabsByRbac(): void {
    this.filteredTabs = this.navTabs.filter(tab => {
      if (!tab.permission) return true;

      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      const value = this.rbac.allowedToAccess(permissionString);
      console.log(value);
      return value;
    });
  }

  navigateToAccessedRoute(link: string): void {
    this.router.navigateByUrl(link);
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
}
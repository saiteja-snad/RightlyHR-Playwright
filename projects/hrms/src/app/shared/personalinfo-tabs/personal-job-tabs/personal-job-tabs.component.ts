import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-personal-job-tabs',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './personal-job-tabs.component.html',
  styleUrl: './personal-job-tabs.component.scss'
})
export class PersonalJobTabsComponent implements OnInit {
  navTabs: any[] = [];
  filteredTabs: any[] = [];
  columnsPerRow=3;
  constructor(public rbac: RbacService,public readonly router: Router) { }

  ngOnInit(): void {
    this.navTabs= [
       { label: ' Pre-Onboarding Details', link: '/personalinfo/job/pre-onboarding-details', icon:'/images/preonboarding.png', permission: { feature: 'Employee Info Pre-Onboarding Details', action: 'view' } },
     { label: 'Onboarding Details', link: '/personalinfo/job/onboarding-details',icon:'/images/onboarding.png',permission: { feature: 'Employee Info Onboarding Details', action: 'view' } },
     { label: 'Offboarding Details', link: '/personalinfo/job/employmentType' , icon:'/images/offboarding.png', permission: { feature: 'Employee Info Offboarding Details', action: 'view' }},
     { label: 'Job Details', link: '/personalinfo/job/job-details', icon:'/images/jobdetailes.png',permission: { feature: 'Employee Info Job Details', action: 'view' } },
     { label: 'Separation Request Details', link: '/personalinfo/job/separation-details', icon:'/images/sepration-request.png',permission: { feature: 'Employee Info Separation Request Details', action: 'view' } },
     { label: 'No Due Clearance Details', link: '/personalinfo/job/no-due-clearance-details',icon:'/images/nodue.png',permission: { feature: 'Employee Info No Due Clearance Details', action: 'view' } },
     { label: 'Probation Details', link: '/personalinfo/job/probation-details' , icon:'/images/probation.png',permission: { feature: 'Employee Info Probation Details', action: 'view' }},
     { label: 'Previous Experience Details', link: '/personalinfo/job/past-experiences', icon:'/images/experience.png',permission: { feature: 'Employee Info Previous Experience Details', action: 'view' } },
     { label: 'Certification Details', link: '/personalinfo/job/certifications' , icon:'/images/certificate.png',permission: { feature: 'Employee Info Certification Details', action: 'view' }},
     { label: 'Compensation Details', link: '/personalinfo/job/compensation-details', icon:'/images/compensation.png',permission: { feature: 'Employee Info Compensation Details', action: 'view' } },
     { label: 'Desk Details', link: '/personalinfo/job/desk-details', icon:'/images/desk.png', permission: { feature: 'Employee Info Desk Details', action: 'view' } },
     { label: 'Assets Details', link: '/personalinfo/job/assets-details', icon:'/images/assets-list.png', permission: { feature: 'Employee Info Asset Details', action: 'view' } },
   ];
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

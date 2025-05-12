import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-personal-job-tabs',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './personal-job-tabs.component.html',
  styleUrl: './personal-job-tabs.component.scss'
})
export class PersonalJobTabsComponent implements OnInit {
  filteredTabs: any[] = [];

  navTabs: any[] = [
    { label: 'Pre-Onboarding Details', link: '/personalinfo/job/pre-onboarding-details',permission: { feature: 'Employee Info Pre-Onboarding Details', action: 'view' } },
    { label: 'Onboarding Details', link: '/personalinfo/job/onboarding-details',permission: { feature: 'Employee Info Onboarding Details', action: 'view' } },
    { label: 'Offboarding Details', link: '/personalinfo/job/employmentType',permission: { feature: 'Employee Info Offboarding Details', action: 'view' } },
    { label: 'Job Details', link: '/personalinfo/job/job-details' ,permission: { feature: 'Employee Info Job Details', action: 'view' }},
    { label: 'Separation Request Details', link: '/personalinfo/job/separation-details',permission: { feature: 'Employee Info Separation Request Details', action: 'view' } },
    { label: ' No Due Clearance Details', link: '/personalinfo/job/no-due-clearance-details',permission: { feature: 'Employee Info No Due Clearance Details', action: 'view' } },
    { label: 'Previous  Experience Details', link: '/personalinfo/job/past-experiences' ,permission: { feature: 'Employee Info Previous Experience Details', action: 'view' }},
    { label: 'Certification Details', link: '/personalinfo/job/certifications',permission: { feature: 'Employee Info Certification Details', action: 'view' } },
    { label: 'Probation Details', link: '/personalinfo/job/probation-details',permission: { feature: 'Employee Info Probation Details', action: 'view' } },
    { label: 'Onboarding Request Details', link: '/personalinfo/job/onboarding-requests',permission: { feature: 'Employee Onboarding Request', action: 'view' } },
    { label: 'Compensation Details', link: '/personalinfo/job/compensation-details',permission: { feature: 'Employee Info Compensation Details', action: 'view' } },
    { label: 'Desk Details', link: '/personalinfo/job/desk-details',permission: { feature: 'Employee Info Desk Details', action: 'view' } },
    { label: 'Assets Details', link: '/personalinfo/job/assets-details',permission: { feature: 'Employee Info Assets Details', action: 'view' } },
  
  ];
  constructor(public rbac: RbacService) { }
  ngOnInit(): void {
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
}

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
    { label: 'Pre-Onboarding Details', link: '/personalinfo/job/pre-onboarding-details',permission: { feature: 'Employee Separation Request', action: 'view' } },
    { label: 'Onboarding Details', link: '/personalinfo/job/onboarding-details',permission: { feature: 'Employee Onboarding Documents', action: 'view' } },
    { label: 'Offboarding Details', link: '/personalinfo/job/employmentType',permission: { feature: 'Employee Separation Request', action: 'view' } },
    { label: 'Job Details', link: '/personalinfo/job/job-details' ,permission: { feature: 'Employee Job Details', action: 'view' }},
    { label: 'Separation Requests', link: '/personalinfo/job/separation-details',permission: { feature: 'Employee Separation Request', action: 'view' } },
    { label: ' No Due Clearance', link: '/personalinfo/job/no-due-clearance-details',permission: { feature: 'Employee No Due Request', action: 'view' } },
    { label: 'Past Experiences', link: '/personalinfo/job/past-experiences' ,permission: { feature: 'Employee Experience Details', action: 'view' }},
    { label: 'Certification Details', link: '/personalinfo/job/certifications',permission: { feature: 'Employee Certification Details', action: 'view' } },
    { label: 'Probation Details', link: '/personalinfo/job/probation-details',permission: { feature: 'Employee Probation Details', action: 'view' } },
    { label: 'Onboarding Request', link: '/personalinfo/job/onboarding-requests',permission: { feature: 'Employee Onboarding Request', action: 'view' } },
  
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

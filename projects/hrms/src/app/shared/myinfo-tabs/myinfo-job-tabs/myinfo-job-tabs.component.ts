import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {  RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-myinfo-job-tabs',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './myinfo-job-tabs.component.html',
  styleUrl: './myinfo-job-tabs.component.scss'
})
export class MyinfoJobTabsComponent implements OnInit {
  filteredTabs: any[] = [];
  constructor(public rbac: RbacService) { }
  navTabs: any[] = [
    { label: ' Pre-Onboarding', link: '/myinfo/job/pre-onboarding-details',permission: { feature: 'Pre Onboarding Details', action: 'view' } },
    { label: 'Onboarding', link: '/myinfo/job/onboarding-details',permission: { feature: 'Onboarding Details', action: 'view' } },
    { label: 'Offboarding', link: '/myinfo/job/employmentType' ,permission: { feature: 'Offboarding Details', action: 'view' }},
    { label: 'Job', link: '/myinfo/job/job-details',permission: { feature: 'Job Details', action: 'view' } },
    { label: 'Separation', link: '/myinfo/job/separation-details',permission: { feature: 'Separation Request', action: 'view' } },
    { label: 'No Due Clearance', link: '/myinfo/job/no-due-clearance-details',permission: { feature: 'No Due Clearance', action: 'view' } },
    { label: 'Probation', link: '/myinfo/job/probation-details' ,permission: { feature: 'Probation Details', action: 'view' }},
    { label: 'Past Experiences', link: '/myinfo/job/past-experiences',permission: { feature: 'Experience Details', action: 'view' } },
    { label: 'Certifications', link: '/myinfo/job/certifications' ,permission: { feature: 'Certification Details', action: 'view' }},
    { label: 'Compensation', link: '/myinfo/job/compensation-details',permission: { feature: 'Compensation Details', action: 'view' } },
    { label: 'Desk', link: '/myinfo/job/desk-details' },
    { label: 'Assets', link: '/myinfo/job/assets-details',permission: { feature: 'Assets', action: 'view' } },
  ];
  ngOnInit(): void {
    this.filterTabsByRbac();
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
}

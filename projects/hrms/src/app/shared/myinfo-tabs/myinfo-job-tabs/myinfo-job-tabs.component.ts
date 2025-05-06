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
    { label: ' Pre-Onboarding Details', link: '/myinfo/job/pre-onboarding-details',permission: { feature: 'My Info Pre-Onboarding Details', action: 'view' } },
    { label: 'Onboarding Details', link: '/myinfo/job/onboarding-details',permission: { feature: 'My Info Onboarding Details', action: 'view' } },
    { label: 'Offboarding Details', link: '/myinfo/job/employmentType' ,permission: { feature: 'My Info Offboarding Details', action: 'view' }},
    { label: 'Job Details', link: '/myinfo/job/job-details',permission: { feature: 'My Info Job Details', action: 'view' } },
    { label: 'Separation Request Details', link: '/myinfo/job/separation-details',permission: { feature: 'My Info Separation Request Details', action: 'view' } },
    { label: 'No Due Clearance Details', link: '/myinfo/job/no-due-clearance-details',permission: { feature: 'My Info No Due Clearance Details', action: 'view' } },
    { label: 'Probation Details', link: '/myinfo/job/probation-details' ,permission: { feature: 'My Info Probation Details', action: 'view' }},
    { label: 'Previous Experience Details', link: '/myinfo/job/past-experiences',permission: { feature: 'My Info Previous Experience Details', action: 'view' } },
    { label: 'Certification Details', link: '/myinfo/job/certifications' ,permission: { feature: 'My Info Certification Details', action: 'view' }},
    { label: 'Compensation Details', link: '/myinfo/job/compensation-details',permission: { feature: 'My Info Compensation Details', action: 'view' } },
    { label: 'Desk Details', link: '/myinfo/job/desk-details', permission: { feature: 'My Info Desk Details', action: 'view' } },
    { label: 'Assets Details', link: '/myinfo/job/assets-details',permission: { feature: 'My Info Asset Details', action: 'view' } },
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

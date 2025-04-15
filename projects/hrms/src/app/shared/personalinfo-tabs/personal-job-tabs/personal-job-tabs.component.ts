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
    { label: 'Pre-Onboarding', link: '/personalinfo/job/pre-onboarding-details' },
    { label: 'Onboarding', link: '/personalinfo/job/onboarding-details' },
    { label: 'Offboarding', link: '/personalinfo/job/employmentType' },
    { label: 'Job', link: '/personalinfo/job/job-details' },
    { label: 'Separation', link: '/personalinfo/job/separation-details',permission: { feature: 'Employee Separation Request', action: 'view' } },
    { label: ' No Due Clearance', link: '/personalinfo/job/no-due-clearance-details',permission: { feature: 'Employee No Due Request', action: 'view' } },
    { label: 'Past Experiences', link: '/personalinfo/job/past-experiences' },
    { label: 'Certifications', link: '/personalinfo/job/certifications' },
    { label: 'Probation Details', link: '/personalinfo/job/probation-details' },
    { label: 'Onboarding Request', link: '/personalinfo/job/onboarding-requests',permission: { feature: 'Employee Onboarding Request', action: 'view' }},
  
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

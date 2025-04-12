import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {  RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-myinfo-job-tabs',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './myinfo-job-tabs.component.html',
  styleUrl: './myinfo-job-tabs.component.scss'
})
export class MyinfoJobTabsComponent {
  navTabs: any[] = [
    { label: ' Pre-Onboarding', link: '/myinfo/job/pre-onboarding-details' },
    { label: 'Onboarding', link: '/myinfo/job/onboarding-details' },
    { label: 'Offboarding', link: '/myinfo/job/employmentType' },
    { label: 'Job', link: '/myinfo/job/job-details' },
    { label: 'Separation', link: '/myinfo/job/separation-details' },
    { label: ' No Due Clearance', link: '/myinfo/job/no-due-clearance-details' },
    { label: 'Probation', link: '/myinfo/job/probation-details' },
    { label: 'Past Experiences', link: '/myinfo/job/past-experiences' },
    { label: 'Certifications', link: '/myinfo/job/certifications' },
    { label: 'Compensation', link: '/myinfo/job/compensation-details' },
    { label: 'Desk', link: '/myinfo/job/compensation-details' },

    { label: 'Assets', link: '/myinfo/job/assets-details' },


  ];
}

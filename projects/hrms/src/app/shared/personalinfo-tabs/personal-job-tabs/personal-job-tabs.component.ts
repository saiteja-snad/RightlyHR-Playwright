import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-personal-job-tabs',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './personal-job-tabs.component.html',
  styleUrl: './personal-job-tabs.component.scss'
})
export class PersonalJobTabsComponent {
  navTabs: any[] = [
    { label: 'Pre-Onboarding', link: '/personalinfo/job/pre-onboarding-details' },
    { label: 'Onboarding', link: '/personalinfo/job/onboarding-details' },
    { label: 'Offboarding', link: '/personalinfo/job/employmentType' },
    { label: 'Job', link: '/personalinfo/job/job-details' },
    { label: 'Separation', link: '/personalinfo/job/separation-details' },
    { label: 'Past Experiences', link: '/personalinfo/job/past-experiences' },
    { label: 'Certifications', link: '/personalinfo/job/certifications' },
    { label: 'Probation Details', link: '/personalinfo/job/probation-details' },
    { label: 'Onboarding Request', link: '/personalinfo/job/onboarding-requests' }
  ];
  
}

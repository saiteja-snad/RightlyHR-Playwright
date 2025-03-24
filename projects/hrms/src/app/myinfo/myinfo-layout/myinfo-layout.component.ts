import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ProfileInfoDetailsComponent } from "../../shared/profile-info-details/profile-info-details.component";

@Component({
  selector: 'app-myinfo-layout',
  imports: [CommonModule, RouterOutlet, ProfileInfoDetailsComponent],
  templateUrl: './myinfo-layout.component.html',
  styleUrl: './myinfo-layout.component.scss'
})
export class MyinfoLayoutComponent {
  activeButton!: string;
  activeSideNav!: string;
  activeItem!: string;
  personalItems = [
    {
      name: 'Basic Information',
      route: '/myinfo/personal/basic-info',
    },
    {
      name: 'Address',
      route: 'personal/address-info',
    },
    {
      name: 'Contact',
      route: 'personal/emergency-contact-details',
    },
    {
      name: 'Emergency Contact',
      route: 'personal/emergency-contact-details',
    },
    {
      name: 'Education',
      route: 'personal/education-details',
    },
    {
      name: 'Identity',
      route: 'personal/identity-details',
    },
    {
      name: 'Family',
      route: 'personal/family-details',
    },
    {
      name: 'Bank',
      route: 'personal/bank-details',
    },
  ];

  jobItems = [
    {
      name: 'Pre Onboarding Details',
      route: 'job/pre-onboarding-details',
      icon: 'MyInfo/job/preonboardingdetails.png',
    },
    {
      name: 'OnBoarding Details',
      route: 'job/onboarding-details',
      icon: 'MyInfo/job/onboardingdetails.png',
    },
    {
      name: 'Employee Type',
      route: 'job/employmentType',
      icon: 'MyInfo/job/employmenttype.png',
    },
    {
      name: 'Job Details',
      route: 'job/job-details',
      icon: 'MyInfo/job/jobdetails.png',
    },
    {
      name: 'Assets',
      route: 'job/assets',
      icon: 'MyInfo/job/assets.png',
    },
    {
      name: 'Past Experiences',
      route: 'job/past-experiences',
      icon: 'MyInfo/job/pastexperience.png',
    },
    {
      name: 'Certifications',
      route: 'job/certifications',
      icon: 'MyInfo/job/certifications.png',
    },
  ];

  documentsItems = [
    {
      name: 'Employee Documents',
      route: 'documents/employee-documents',
      icon: 'MyInfo/documents/employeedocuments.png',
    },
    {
      name: 'Organization Policy',
      route: 'documents/organization-policy',
      icon: 'MyInfo/documents/organizationpolicy.png',
    },
  ];

  sidenavItems = this.personalItems;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.getSideNavItems();
    this.router.events.subscribe(() => {
      this.getSideNavItems();
    });
  }

  getSideNavItems() {
    if (this.router.url.includes('personal')) {
      this.sidenavItems = this.personalItems;
    } else if (this.router.url.includes('job')) {
      this.sidenavItems = this.jobItems;
    } else if (this.router.url.includes('documents')) {
      this.sidenavItems = this.documentsItems;
    }
  }
}

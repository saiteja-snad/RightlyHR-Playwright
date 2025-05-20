import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { AccessNavigationService } from '../../../services/access-navigation.service';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-letters-tab',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './letters-tab.component.html',
  styleUrl: './letters-tab.component.scss'
})

export class LettersTabComponent {
  navTabs = [
    { label: 'Offer Letter', link: '/admin/letters/offer-letter',permission: { feature: 'Dashboard Generate Documents Offer Letter', action: 'view' } },
    { label: 'Appointment Letter', link: '/admin/letters/appointment-letter',permission: { feature: 'Dashboard Generate Documents Appointment Letter', action: 'view' } },
    { label: 'Trainee Offer Letter', link: '/admin/letters/trainee-offer-letter',permission: { feature: 'Dashboard Generate Documents Trainee Offer Letter', action: 'view' } },
    { label: 'Trainee Appointment Letter', link: '/admin/letters/trainee-appointment-letter',permission: { feature: 'Dashboard Generate Documents Trainee Appointment Letter', action: 'view' } },
    { label: 'Welcome Letter', link: '/admin/letters/welcome-letter',permission: { feature: 'Dashboard Generate Documents Welcome Letter', action: 'view' } }
  ];

    constructor(
    private rbac: RbacService,
    private accessNav: AccessNavigationService
  ) {}


    ngOnInit(): void {
    this.navTabs = this.navTabs.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
        this.rbac.allowedToAccess(
          `${tab.permission.feature}.${tab.permission.action}`
        )
    );
  }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-letters-tab',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './letters-tab.component.html',
  styleUrl: './letters-tab.component.scss'
})

export class LettersTabComponent {

  filteredTabs: any[] = [];

  navTabs = [
    { label: 'Offer Letter', link: '/admin/letters/offer-letter', permission: { feature: 'Dashboard Generate Documents Offer Letter', action: 'view' } },
    { label: 'Appointment Letter', link: '/admin/letters/appointment-letter', permission: { feature: 'Dashboard Generate Documents Appointment Letter', action: 'view' } },
    { label: 'Trainee Offer Letter', link: '/admin/letters/trainee-offer-letter', permission: { feature: 'Dashboard Generate Documents Trainee Offer Letter', action: 'view' } },
    { label: 'Trainee Appointment Letter', link: '/admin/letters/trainee-appointment-letter', permission: { feature: 'Dashboard Generate Documents Trainee Appointment Letter', action: 'view' } },
    { label: 'Welcome Letter', link: '/admin/letters/welcome-letter', permission: { feature: 'Dashboard Generate Documents Welcome Letter', action: 'view' } }
  ];

  constructor(public rbac : RbacService) { }

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

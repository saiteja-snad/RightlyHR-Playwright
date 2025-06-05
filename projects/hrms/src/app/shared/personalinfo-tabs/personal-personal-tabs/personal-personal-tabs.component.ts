import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-personal-personal-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './personal-personal-tabs.component.html',
  styleUrl: './personal-personal-tabs.component.scss'
})

export class PersonalPersonalTabsComponent {
  filteredTabs: any[] = [];
  columnsPerRow = 3;
  navTabs: any[] = [];
  
  constructor(public rbac: RbacService, public readonly router: Router) { }

  ngOnInit(): void {
    this.navTabs = [
      { label: 'Basic Info', link: '/personalinfo/personal/basic-info', icon: '/my-info-icons/basic-info-icon.png', permission: { feature: 'Employee Info Basic Information', action: 'view' } },
      { label: 'Onboarding Documents', link: '/personalinfo/personal/onboarding-verification', icon: '/my-info-icons/onboarding-icon.png', permission: { feature: 'Employee Info Documents Verification', action: 'view' } },
      { label: 'Addresses', link: '/personalinfo/personal/address-info', icon: '/my-info-icons/address-info-icon.png', permission: { feature: 'Employee Info Address Details', action: 'view' } },
      { label: 'Contact Info', link: '/personalinfo/personal/contact-details', icon: '/my-info-icons/contact-icon.png', permission: { feature: 'Employee Info Contact Details', action: 'view' } },
      { label: 'Emergency Contacts', link: '/personalinfo/personal/emergency-contact-details', icon: '/my-info-icons/emergency-contact-icon.png', permission: { feature: 'Employee Info Emergency Contact Details', action: 'view' } },
      { label: 'Academics', link: '/personalinfo/personal/education-details', icon: '/my-info-icons/education-icon.png', permission: { feature: 'Employee Info Education Details', action: 'view' } },
      { label: 'Identity Info', link: '/personalinfo/personal/identity-details', icon: '/my-info-icons/identity-verification-icon.png', permission: { feature: 'Employee Info Identity Details', action: 'view' } },
      { label: 'Family Members', link: '/personalinfo/personal/family-details', icon: '/my-info-icons/family-icon.png', permission: { feature: 'Employee Info Family Details', action: 'view' } },
      { label: 'Bank Info', link: '/personalinfo/personal/bank-details', icon: '/my-info-icons/bank-details-icon.png', permission: { feature: 'Employee Info Bank Details', action: 'view' } },
      // { label: 'Visa Details', link: '/personalinfo/personal/visa-details', icon: '/my-info-icons/visa.png', permission: { feature: 'Employee Info Visa Details', action: 'view' } },
      // { label: 'Team Members', link: '/personalinfo/personal/team-members', icon: '/my-info-icons/Team-icon.png', permission: { feature: 'Employee Info Team Members Tab', action: 'view' } }
    ];
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

  navigateToAccessedRoute(link: string): void {
    this.router.navigateByUrl(link);
  }

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    // Exact match or starts with followed by `/` to avoid partial matches
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }

  // Check if item is in the first row
  isInTopRow(index: number): boolean {
    return Math.floor(index / this.columnsPerRow) === 0;
  }

  // Check if item is in the last row
  isInLastRow(index: number): boolean {
    const totalRows = Math.ceil(this.filteredTabs.length / this.columnsPerRow);
    const currentRow = Math.floor(index / this.columnsPerRow) + 1;
    return currentRow === totalRows;
  }

  // Check if item is in a middle row
  isInMiddleRow(index: number): boolean {
    return !this.isInTopRow(index) && !this.isInLastRow(index);
  }

  // Check if item is in the first column
  isFirstColumn(index: number): boolean {
    return index % this.columnsPerRow === 0;
  }

  // Check if item is in the last column
  isLastColumn(index: number): boolean {
    return (index + 1) % this.columnsPerRow === 0;
  }

  // Check if item is in a middle column
  isMiddleColumn(index: number): boolean {
    return !this.isFirstColumn(index) && !this.isLastColumn(index);
  }
}
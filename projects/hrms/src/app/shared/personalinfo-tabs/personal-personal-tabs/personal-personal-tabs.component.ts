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
      { label: 'Basic Information', link: '/personalinfo/personal/basic-info', icon: 'images/basicinfo.png', permission: { feature: 'My Info Basic Information', action: 'view' } },
        { label: 'Onboarding Documents', link: '/personalinfo/personal/onboarding-verification', icon: '/images/onboarding.png', permission: { feature: 'Employee Info Documents Verification', action: 'view' } },
      { label: 'Address Details', link: '/personalinfo/personal/address-info', icon: 'images/address.png', permission: { feature: 'My Info Address Details', action: 'view' } },
      { label: 'Contact Details', link: '/personalinfo/personal/contact-details', icon: '/images/contact-info 1.png', permission: { feature: 'My Info Contact Details', action: 'view' } },
      { label: 'Emergency Contact Details', link: '/personalinfo/personal/emergency-contact-details', icon: '/images/ambulance.png', permission: { feature: 'My Info Emergency Contact Details', action: 'view' } },
      { label: 'Education Details', link: '/personalinfo/personal/education-details', icon: '/images/education 1.png', permission: { feature: 'My Info Education Details', action: 'view' } },
      { label: 'Identity Details', link: '/personalinfo/personal/identity-details', icon: '/images/identity-verification.png', permission: { feature: 'My Info Identity Details', action: 'view' } },
      { label: 'Family Details', link: '/personalinfo/personal/family-details', icon: 'images/family.png', permission: { feature: 'My Info Family Details', action: 'view' } },
      { label: 'Bank Details', link: '/personalinfo/personal/bank-details', icon: '/images/atm-card.png', permission: { feature: 'My Info Bank Details', action: 'view' } },
      { label: 'Visa Details', link: '/personalinfo/personal/visa-details', icon: '/images/visa.png', permission: { feature: 'My Info Visa Details', action: 'view' } },
        
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
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-my-info-personal-tabs',
  imports: [RouterModule, CommonModule, TabsModule],
  templateUrl: './my-info-personal-tabs.component.html',
  styleUrl: './my-info-personal-tabs.component.scss'
})

export class MyInfoPersonalTabsComponent implements OnInit {
  filteredTabs: any[] = [];
  columnsPerRow = 3;
  navTabs: any[] = [];
 
  constructor(public rbac: RbacService,public readonly router: Router) { }

  ngOnInit(): void {
 
    this.navTabs=[
      { label: 'Basic Information', link: '/myinfo/personal/basic-info',icon:'images/basicinfo.png', permission: { feature: 'My Info Basic Information', action: 'view' } },
       { label: 'Address Details', link: '/myinfo/personal/address-info',icon:'images/address.png',permission: { feature: 'My Info Address Details', action: 'view' } },
       { label: 'Contact Details', link: '/myinfo/personal/contact-details',icon:'/images/contact-info 1.png',permission: { feature: 'My Info Contact Details', action: 'view' } },
       { label: 'Emergency Contact Details', link: '/myinfo/personal/emergency-contact-details', icon:'/images/ambulance.png', permission: { feature: 'My Info Emergency Contact Details', action: 'view' } },
       { label: 'Education Details', link: '/myinfo/personal/education-details',icon:'/images/education 1.png',permission: { feature: 'My Info Education Details', action: 'view' } },
       { label: 'Identity Details', link: '/myinfo/personal/identity-details',icon:'/images/identity-verification.png',permission: { feature: 'My Info Identity Details', action: 'view' } },
       { label: 'Family Details', link: '/myinfo/personal/family-details', icon:'images/family.png',permission: { feature: 'My Info Family Details', action: 'view' } },
       { label: 'Bank Details', link: '/myinfo/personal/bank-details',icon:'/images/atm-card.png',permission: { feature: 'My Info Bank Details', action: 'view' } },
       { label: 'Visa Details', link: '/myinfo/personal/visa-details',icon:'/images/visa.png', permission: { feature: 'My Info Visa Details', action: 'view' } },
        { label: 'Team Members', link: '/myinfo/personal/team-members', icon: '/images/team-members.png', permission: { feature: 'My Info Team Members Tab', action: 'view' } }
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
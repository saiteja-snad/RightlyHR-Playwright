import { Component } from '@angular/core';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-personal-documents-tabs',
  imports: [CommonModule, TranslateModule],
  templateUrl: './personal-documents-tabs.component.html',
  styleUrl: './personal-documents-tabs.component.scss'
})
export class PersonalDocumentsTabsComponent {
filteredTabs: any[] = [];
  columnsPerRow = 3;
  navTabs: any[] = [];

  constructor(public rbac: RbacService, public readonly router: Router) { }

  ngOnInit(): void {
    this.navTabs = [
      { label: 'Documents', link: '/personalinfo/documents/general-documents', icon: '/my-info-icons/basic-info-icon.png', permission: { feature: 'Employee Info Documents Tab', action: 'view' } },
      { label: 'Documents Acknowledgement', link: '/personalinfo/documents/letter-acknowledge-documents', icon: '/my-info-icons/contact-icon.png', permission: { feature: 'Employee Info Documents Tab', action: 'view' } },
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

import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RbacService } from '../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { TimeOffTabsComponent } from "../time-off-module-tabs/time-off-tabs/time-off-tabs.component";
@Component({
  selector: 'app-sidenav',
  imports: [CommonModule, RouterModule, TranslateModule, TimeOffTabsComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})

export class SidenavComponent implements OnInit {
  // Main Modules
  modules = [
    //expenses
    {
      label: 'Expenses', icon: '/main-menu-icons/expenses-icon.png', activeIcon: '/main-menu-icons/expenses.png',
      route: '/claimsandexpenses', permission: { feature: 'Expenses', action: 'view' }
    },
    //pms
    {
      label: 'PMS', icon: '/main-menu-icons/pms-icon.png', route: '/pms', activeIcon: '/main-menu-icons/pms.png',
      permission: { feature: 'PMS', action: 'view' }
    },
    //pms configuration
    {
      label: 'PMS Configuration', icon: '/main-menu-icons/pms-configuration-icon.png', activeIcon: '/main-menu-icons/pms-configuration.png',
      route: '/pmsconfiguration', permission: { feature: 'PMS Configurations', action: 'view' }
    },
    //Desk
    {
      label: 'Desk', icon: '/main-menu-icons/desk-icon.png', activeIcon: '/main-menu-icons/computer-desk.png',
      route: '/desk', permission: { feature: 'Desk Allocation', action: 'view' }
    },
    //Assets
    {
      label: 'Assets', icon: '/main-menu-icons/assets-icon.png', activeIcon: '/main-menu-icons/assets.png',
      route: '/assets-management', permission: { feature: 'Asset Management', action: 'view' }
    },
    //IT Supports
    {
      label: 'IT Support', icon: '/main-menu-icons/it-support-icon.png', activeIcon: '/main-menu-icons/it-support.png',
      route: '/it-support', permission: { feature: 'IT Support', action: 'view' }
    },
    //org Hierarcy
    {
      label: 'Org Hierarchy', icon: '/main-menu-icons/org.png', activeIcon: '/main-menu-icons/org-hierarchy-square.png',
      route: '/organization-chart', permission: { feature: 'Org Hierarchy', action: 'view' }
    },
    //Holidays
    {
      label: 'Holiday', icon: '/main-menu-icons/holiday-icon.png', activeIcon: '/main-menu-icons/holidays.png',
      route: '/holidays', permission: { feature: 'Holidays', action: 'view' }
    },
    {
      label: 'Contacts Directory', icon: '/main-menu-icons/contact-directory-color-icon.png', activeIcon: '/main-menu-icons/contact-directory-icon.png',
      route: '/contacts-directory', permission: { feature: 'Contacts Directory', action: 'view' }
    },
    {
      label: 'Blood Bank', icon: '/main-menu-icons/blood-bank-color-icon.png', activeIcon: '/main-menu-icons/blood-bank-icon.png',
      route: '/blood-bank', permission: { feature: 'Blood Bank', action: 'view' }
    },
    {
      label: 'Phone Book', icon: '/main-menu-icons/phonebook-color-icon.png', activeIcon: '/main-menu-icons/phonebook-icon.png',
      route: '/phonebook', permission: { feature: 'Phone Book', action: 'view' }
    },
  ];
  columnsPerRow = 3;
  dropdownOpen = false; // controls the icon
  selectedDropdownModule: any = null;
  filteredModules: any[] = [];
  spinnerLoader = false;
  @ViewChild('logoutpopup') logoutpopup: any;

  constructor(private authService: AuthService, private modalservie: NgbModal, public rbac: RbacService,
    private router: Router, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.modules = this.modules.filter((tab) => tab.permission && tab.permission.feature && tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
    this.setSelectedModuleFromRoute();
  }

  onLogout() {
    this.authService.removeToken();
    localStorage.clear();
    window.location.href = "https://login.microsoftonline.com/common/oauth2/v2.0/logout";
  }

  close() {
    this.modalservie.dismissAll();
  }

  openlogoutModal() {
    this.modalservie.open(this.logoutpopup, { centered: true });
  }

  goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) {
      this.router.navigate([route]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    return currentUrl === link || currentUrl.startsWith(link + '/');
  }

  isActiveRoutePms(): boolean {
    const currentUrl = this.router.url;
    return (
      currentUrl === '/pms/review-cycle' ||
      currentUrl === '/pms/apprisal' || currentUrl === '/pms/myPerformance/pending-review' ||
      currentUrl === '/pms/myPerformance/completed-review' || currentUrl === '/pms/team-performance/pending-review' ||
      currentUrl === '/pms/team-performance/completed-review' || currentUrl === '/pms/assessment-form'
    );
  }

  resetDropdown(): void {
    this.selectedDropdownModule = null;
    this.updateFilteredModules();
  }

  // Check if item is in the first row
  isInTopRow(index: number): boolean {
    return Math.floor(index / this.columnsPerRow) === 0;
  }

  // Check if item is in the last row
  isInLastRow(index: number): boolean {
    const totalRows = Math.ceil(this.modules.length / this.columnsPerRow);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const dropdown = document.querySelector('.custom-main-menu-dropdown');
    const selectedItem = document.querySelector('.selected-module-item');
    const menuItems = document.querySelectorAll('.menu-item-clear');
    const target = event.target as Node;
    const clickedInsideDropdown = dropdown?.contains(target);
    const clickedInsideSelected = selectedItem?.contains(target);
    const clickedInsideMenuItem = Array.from(menuItems).some(item => item.contains(target));
    const shouldIgnore = clickedInsideDropdown || clickedInsideSelected || clickedInsideMenuItem;
    // Don't clear here — let router do its job
    if (!shouldIgnore) {
      // Optional: Only clear if route doesn't match a known module
      setTimeout(() => this.setSelectedModuleFromRoute(), 100); // Let routing settle
    }
  }

  setSelectedModuleFromRoute(): void {
    const currentRoute = this.router.url;
    // Find all matches
    const matchedModules = this.modules.filter(mod =>
      currentRoute === mod.route || currentRoute.startsWith(mod.route + '/')
    );
    // Pick the one with the longest matching route (most specific)
    this.selectedDropdownModule = matchedModules.sort((a, b) => b.route.length - a.route.length)[0];
    this.updateFilteredModules();
  }

  selectDropdownModule(module: any): void {
    if (this.selectedDropdownModule?.route !== module.route) {
      this.selectedDropdownModule = module;
      this.updateFilteredModules();
      if (module.route === '/organization-chart') {
        this.router.navigate(['/organization-chart']);
      } else {
        this.goToAccessibleRoute(module.route);
      }
    }
  }

  updateFilteredModules(): void {
    this.filteredModules = this.modules.filter(m => m.route !== this.selectedDropdownModule?.route);
  }

  ActiveRoute(): boolean {
    const activeRoutes = ['/employee-management', '/letters', '/invite-user'];
    return activeRoutes.some(route => this.router.url.startsWith(route));
  }
}
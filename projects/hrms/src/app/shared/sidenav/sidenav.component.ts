import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RbacService } from '../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { AccessNavigationService } from '../../services/access-navigation.service';

@Component({
  selector: 'app-sidenav',
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})

export class SidenavComponent implements OnInit {
  modules = [
    {
      label: 'Expenses', icon: '/main-menu-icons/finance.png', activeIcon: '/main-menu-icons/dollar-square-color.png',
      route: '/claimsandexpenses', permission: { feature: 'Expenses', action: 'view' }
    },
    { label: 'Reports', icon: '/main-menu-icons/analysis.png', route: '/reports', permission: { feature: 'Reports', action: 'view' } },
    { label: 'PMS', icon: '/main-menu-icons/performance.png', route: '/pms', permission: { feature: 'PMS', action: 'view' } },
    { label: 'PMS Configuration', icon: '/main-menu-icons/productivity.png', route: '/pmsconfiguration', permission: { feature: 'PMS Configurations', action: 'view' } },
    { label: 'Desk', icon: '/main-menu-icons/desk.png', route: '/desk', permission: { feature: 'Desk Allocation', action: 'view' } },
    { label: 'Assets', icon: '/main-menu-icons/listening.png', route: '/assets-management', permission: { feature: 'Asset Management', action: 'view' } },
    { label: 'IT Support', icon: '/main-menu-icons/technical-support.png', route: '/it-support', permission: { feature: 'IT Support', action: 'view' } },
    { label: 'Org Hierarchy', icon: '/main-menu-icons/social-network.png', route: '/organization-chart', permission: { feature: 'Org Hierarchy', action: 'view' } }
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
    this.modules = this.modules.filter(
      (tab) =>
        tab.permission &&
        tab.permission.feature &&
        tab.permission.action &&
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
    return this.router.url.includes(link);
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
    this.selectedDropdownModule = this.modules.find(mod => currentRoute.startsWith(mod.route));
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
    this.filteredModules = this.modules.filter(
      m => m.route !== this.selectedDropdownModule?.route
    );
  }
}
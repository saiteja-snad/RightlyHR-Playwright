import { CommonModule } from '@angular/common';
import { Component, effect, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RbacService } from '../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { TimeOffTabsComponent } from "../time-off-module-tabs/time-off-tabs/time-off-tabs.component";
import { ProjectManagementMainTabsComponent } from "../project-management-tabs/project-management-main-tabs/project-management-main-tabs.component";
import { OnbehalfofMainTabsComponent } from "../time-off-module-tabs/onbehalfof-main-tabs/onbehalfof-main-tabs.component";
import { PendingApprovalsTabsComponent } from "../time-off-module-tabs/pending-approvals-tabs/pending-approvals-tabs.component";
import { PmsMainTabsComponent } from "../pms-module-tabs/pms-main-tabs/pms-main-tabs.component";
import { MenuOrderService } from '../../services/theme-service/menu-order.service';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MenuOrder } from '../../theme-customization/theme-action.service';

@Component({
  selector: 'app-sidenav',
  imports: [CommonModule, RouterModule, TranslateModule, DragDropModule,
    TimeOffTabsComponent, ProjectManagementMainTabsComponent,
    OnbehalfofMainTabsComponent, PendingApprovalsTabsComponent, PmsMainTabsComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent implements OnInit {

  // Three-dot modules
  modules = [
    { label: 'Holidays', icon: '/main-menu-icons/holiday-icon.png', activeIcon: '/main-menu-icons/holidays.png', route: '/holidays', permission: { feature: 'Holidays', action: 'view' } },
    { label: 'Policies', icon: '/main-menu-icons/policies-icon.png', activeIcon: '/main-menu-icons/policies.png', route: '/policies', permission: { feature: 'Policies', action: 'view' } },
    { label: 'Events', icon: '/main-menu-icons/events-colored-icon.png', activeIcon: '/main-menu-icons/calendar-favorite.png', route: '/events', permission: { feature: 'Events', action: 'view' } },
    { label: 'Expenses', icon: '/main-menu-icons/expenses-icon.png', activeIcon: '/main-menu-icons/expenses.png', route: '/claimsandexpenses', permission: { feature: 'Expenses', action: 'view' } },
    { label: 'Org Hierarchy', icon: '/main-menu-icons/org.png', activeIcon: '/main-menu-icons/org-hierarchy-square.png', route: '/organization-chart', permission: { feature: 'Org Hierarchy', action: 'view' } },
    { label: 'Personalization', icon: '/main-menu-icons/themes-color-icon.png', activeIcon: '/main-menu-icons/themes-icon.png', route: '/theme', permission: { feature: 'Themes', action: 'view' } },
    { label: 'Blood Bank', icon: '/main-menu-icons/blood-bank-color-icon.png', activeIcon: '/main-menu-icons/blood-bank-icon.png', route: '/blood-bank', permission: { feature: 'Blood Bank', action: 'view' } },
    { label: 'Contacts Directory', icon: '/main-menu-icons/contact-directory-color-icon.png', activeIcon: '/main-menu-icons/contact-directory-icon.png', route: '/contacts-directory', permission: { feature: 'Contacts Directory', action: 'view' } },
    { label: 'Phone Book', icon: '/main-menu-icons/phonebook-color-icon.png', activeIcon: '/main-menu-icons/phonebook-icon.png', route: '/phonebook', permission: { feature: 'Phone Book', action: 'view' } },
    { label: 'Assets', icon: '/main-menu-icons/assets-icon.png', activeIcon: '/main-menu-icons/assets.png', route: '/assets-management', permission: { feature: 'Asset Management', action: 'view' } },
    { label: 'Cards Management', icon: '/main-menu-icons/card-management-icon.png', activeIcon: '/main-menu-icons/card-management-active.png', route: '/card-management', permission: { feature: 'Desk Allocation', action: 'view' } },
  ];

  // Main menu items as a draggable array (Dashboard always first, excluded from drag)
  mainMenuItems: any[] = [
    { label: 'My Info', icon: '/main-menu-icons/my-Info-icon.png', route: '/myinfo', permission: { feature: 'My Info', action: 'view' }, type: 'direct' },
    { label: 'Employees', icon: '/main-menu-icons/employee-management-icon.png', route: '/employee-management', permission: { feature: 'Employees', action: 'view' }, type: 'direct' },
    { label: 'Time Off', icon: '/main-menu-icons/clock.png', route: '/time-off', permission: { feature: 'Time-Off', action: 'view' }, type: 'dropdown', dropdownComponent: 'time-off' },
    { label: 'Attendance', icon: '/main-menu-icons/finger-print.png', route: '/attendance', permission: { feature: 'Attendance', action: 'view' }, type: 'direct' },
    { label: 'Reports', icon: '/main-menu-icons/reports.png', route: '/reports', permission: { feature: 'Reports', action: 'view' }, type: 'direct' },
    { label: 'Project Management', icon: '/main-menu-icons/project-management-icon.png', route: '/project-management', permission: { feature: 'Project Management', action: 'view' }, type: 'dropdown', dropdownComponent: 'project-management' },
    { label: 'Skill Set', icon: '/main-menu-icons/skill-management.png', route: '/skill-management', permission: { feature: 'Skill Set Management', action: 'view' }, type: 'direct' },
    { label: 'On Behalf Of', icon: '/main-menu-icons/clock.png', route: '/on-behalf-of', permission: { feature: 'On Behalf Of', action: 'view' }, type: 'dropdown', dropdownComponent: 'on-behalf-of' },
    { label: 'Pending Approvals', icon: '/main-menu-icons/pending-approvals.png', route: '/pending-approvals', permission: { feature: 'Pending Approvals Module', action: 'view' }, type: 'dropdown', dropdownComponent: 'pending-approvals' },
    { label: 'PMS', icon: '/main-menu-icons/pms.png', route: '/pms', permission: { feature: 'PMS', action: 'view' }, type: 'dropdown', dropdownComponent: 'pms' },
  ];

  private originalModules: any[] = [];
  private originalMainMenuItems: any[] = [];
  private empinfo: any;

  columnsPerRow = 3;
  dropdownOpen = false;
  selectedDropdownModule: any = null;
  filteredModules: any[] = [];
  spinnerLoader = false;
  @ViewChild('logoutpopup') logoutpopup: any;

  constructor(private authService: AuthService, private modalservie: NgbModal, public rbac: RbacService,
    private router: Router, private accessNav: AccessNavigationService, private menuOrderService: MenuOrderService) {
    effect(() => {
      const order = this.menuOrderService.menuOrder();
      if (order) {
        this.applyMenuOrder();
        this.updateFilteredModules();
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    this.modules = this.modules.filter(tab =>
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
    this.mainMenuItems = this.mainMenuItems.filter(tab =>
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );

    this.originalModules = [...this.modules];
    this.originalMainMenuItems = [...this.mainMenuItems];

    this.applyMenuOrder();
    this.setSelectedModuleFromRoute();
  }

  applyMenuOrder(): void {
    const order = this.menuOrderService.menuOrder();
    if (!order) return;

    if (order.mainMenuRoutes?.length) {
      const mainRoutes = order.mainMenuRoutes.filter(r => r !== '/dashboard');
      const reordered: any[] = [];
      mainRoutes.forEach(route => {
        const found = this.originalMainMenuItems.find(m => m.route === route);
        if (found) reordered.push(found);
      });
      this.originalMainMenuItems.forEach(m => {
        if (!reordered.find(r => r.route === m.route)) reordered.push(m);
      });
      this.mainMenuItems = reordered;
    }

    if (order.threeDotRoutes?.length) {
      const source = this.originalModules;
      const reordered: any[] = [];
      order.threeDotRoutes.forEach(route => {
        const found = source.find(m => m.route === route);
        if (found) reordered.push(found);
      });
      source.forEach(m => {
        if (!reordered.find((r: any) => r.route === m.route)) reordered.push(m);
      });
      this.modules = reordered;
    }
  }

  onDirectItemClick(item: any): void {
    // Some routes use direct navigation (not through accessNav)
    // directRoutes = routes NOT handled by navigateToAccessedHeaderRoute (no sub-route resolution needed)
    const directRoutes = ['/employee-management', '/attendance'];
    if (directRoutes.includes(item.route)) {
      this.router.navigate([item.route]);
    } else {
      this.goToAccessibleRoute(item.route);
    }
    this.resetDropdown();
  }

  closeOpenDropdowns(): void {
    // Close any open Bootstrap dropdowns
    document.querySelectorAll('.dropdown-menu.show').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('[data-bs-toggle="dropdown"].show').forEach(el => el.classList.remove('show'));
    document.querySelectorAll('.btn-group.show').forEach(el => el.classList.remove('show'));
  }

  onMainMenuDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.mainMenuItems, event.previousIndex, event.currentIndex);
    this.saveCurrentOrder();
  }

  onThreeDotDrop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.modules, event.previousIndex, event.currentIndex);
    this.updateFilteredModules();
    this.saveCurrentOrder();
  }

  private saveCurrentOrder(): void {
    const order: MenuOrder = {
      mainMenuRoutes: ['/dashboard', ...this.mainMenuItems.map(m => m.route)],
      threeDotRoutes: this.modules.map(m => m.route)
    };
    this.menuOrderService.saveOrder(this.empinfo?.employeeId || 0, order);
  }

  getMainMenuOrder(route: string): number { return 0; }

  isActiveItem(item: any): boolean {
    if (item.type === 'dropdown') {
      if (item.dropdownComponent === 'project-management') return this.isActiveprojectManagement();
      return this.isActiveRoute(item.route);
    }
    if (item.route === '/employee-management') return this.ActiveRoute();
    return this.isActiveRoute(item.route);
  }

  onLogout() {
    this.authService.removeToken();
    localStorage.clear();
    window.location.href = "https://login.microsoftonline.com/common/oauth2/v2.0/logout";
  }

  close() { this.modalservie.dismissAll(); }

  openlogoutModal() { this.modalservie.open(this.logoutpopup, { centered: true }); }

  goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) { this.router.navigate([route]); } else { this.router.navigate(['/unauthorized']); }
  }

  isActiveRoute(link: string): boolean {
    const currentUrl = this.router.url;
    if (currentUrl === link || currentUrl.startsWith(link + '/')) return true;
    if (link === '/theme' && currentUrl.startsWith('/menus/')) return true;
    return false;
  }

  isActiveRoutePms(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/pms/review-cycle' || currentUrl === '/pms/apprisal' ||
      currentUrl.startsWith('/pms/myPerformance') || currentUrl.startsWith('/pms/team-performance') ||
      currentUrl === '/pms/assessment-form';
  }

  isActiveprojectManagement(): boolean {
    return this.router.url.startsWith('/project-management');
  }

  isActiveskillsetManagement(): boolean {
    return this.router.url.startsWith('/skill-management');
  }

  resetDropdown(): void {
    this.selectedDropdownModule = null;
    this.updateFilteredModules();
  }

  getGridItemClasses(module: any): any {
    const visibleModules = this.modules.filter(m => m.route !== this.selectedDropdownModule?.route);
    const i = visibleModules.indexOf(module);
    if (i === -1) return {};
    const total = visibleModules.length;
    const totalRows = Math.ceil(total / this.columnsPerRow);
    const currentRow = Math.floor(i / this.columnsPerRow);
    const col = i % this.columnsPerRow;
    const isLastRow = currentRow + 1 === totalRows;
    const isFirstCol = col === 0;
    const isLastCol = col === this.columnsPerRow - 1;
    const isTopRow = currentRow === 0;
    const isMiddleRow = !isTopRow && !isLastRow;
    return {
      'border-right-top': isTopRow && !isLastCol,
      'border-right-middle': isMiddleRow && !isLastCol,
      'border-right-bottom': isLastRow && !isLastCol,
      'border-bottom-left': isFirstCol && !isLastRow,
      'border-bottom-middle': !isFirstCol && !isLastCol && !isLastRow,
      'border-bottom-right': isLastCol && !isLastRow
    };
  }

  isInTopRow(index: number): boolean { return Math.floor(index / this.columnsPerRow) === 0; }
  isInLastRow(index: number): boolean {
    const totalRows = Math.ceil(this.modules.length / this.columnsPerRow);
    return Math.floor(index / this.columnsPerRow) + 1 === totalRows;
  }
  isInMiddleRow(index: number): boolean { return !this.isInTopRow(index) && !this.isInLastRow(index); }
  isFirstColumn(index: number): boolean { return index % this.columnsPerRow === 0; }
  isLastColumn(index: number): boolean { return (index + 1) % this.columnsPerRow === 0; }
  isMiddleColumn(index: number): boolean { return !this.isFirstColumn(index) && !this.isLastColumn(index); }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const dropdown = document.querySelector('.custom-main-menu-dropdown');
    const selectedItem = document.querySelector('.selected-module-item');
    const menuItems = document.querySelectorAll('.menu-item-clear');
    const target = event.target as Node;
    const shouldIgnore = dropdown?.contains(target) || selectedItem?.contains(target) ||
      Array.from(menuItems).some(item => item.contains(target));
    if (!shouldIgnore) setTimeout(() => this.setSelectedModuleFromRoute(), 100);
  }

  setSelectedModuleFromRoute(): void {
    const currentRoute = this.router.url;
    const matchedModules = this.modules.filter(mod => {
      if (currentRoute === mod.route || currentRoute.startsWith(mod.route + '/')) return true;
      if (mod.route === '/theme' && currentRoute.startsWith('/menus/')) return true;
      return false;
    });
    this.selectedDropdownModule = matchedModules.sort((a, b) => b.route.length - a.route.length)[0];
    this.updateFilteredModules();
  }

  selectDropdownModule(module: any): void {
    if (this.selectedDropdownModule?.route !== module.route) {
      this.selectedDropdownModule = module;
      this.updateFilteredModules();
      if (module.route === '/organization-chart') { this.router.navigate(['/organization-chart']); }
      else if (module.route === '/theme') { this.router.navigate(['/theme']); }
      else { this.goToAccessibleRoute(module.route); }
    }
  }

  updateFilteredModules(): void {
    this.filteredModules = this.modules.filter(m => m.route !== this.selectedDropdownModule?.route);
  }

  ActiveRoute(): boolean {
    return ['/employee-management', '/letters', '/invite-user'].some(r => this.router.url.startsWith(r));
  }
}

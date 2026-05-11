import { CommonModule } from '@angular/common';
import { Component, effect, HostListener, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
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
import { MenuRegistryService, MenuItemDef } from '../../services/theme-service/menu-registry.service';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuOrder } from '../../theme-customization/theme-action.service';

declare var bootstrap: any;

@Component({
  selector: 'app-sidenav',
  imports: [CommonModule, RouterModule, TranslateModule, DragDropModule,
    TimeOffTabsComponent, ProjectManagementMainTabsComponent,
    OnbehalfofMainTabsComponent, PendingApprovalsTabsComponent, PmsMainTabsComponent],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent implements OnInit, OnDestroy {

  mainMenuItems: MenuItemDef[] = [];
  modules: MenuItemDef[] = [];

  private allowedRoutes = new Set<string>();
  private empinfo: any;
  private routerSub!: Subscription;

  columnsPerRow = 3;
  selectedDropdownModule: MenuItemDef | null = null;
  filteredModules: MenuItemDef[] = [];
  spinnerLoader = false;
  @ViewChild('logoutpopup') logoutpopup: any;

  constructor(
    private authService: AuthService,
    private modalservie: NgbModal,
    public rbac: RbacService,
    private router: Router,
    private accessNav: AccessNavigationService,
    private menuOrderService: MenuOrderService,
    private menuRegistry: MenuRegistryService,
    private cdr: ChangeDetectorRef
  ) {
    effect(() => {
      const order = this.menuOrderService.menuOrder();
      if (order && this.allowedRoutes.size > 0) {
        this.applyMenuOrder(order);
        this.updateFilteredModules();
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

    // Build allowed routes set from RBAC
    this.allowedRoutes = new Set(
      this.menuRegistry.ALL_ITEMS
        .filter(i => this.rbac.allowedToAccess(`${i.permission.feature}.${i.permission.action}`))
        .map(i => i.route)
    );

    const order = this.menuOrderService.menuOrder();
    if (order) {
      this.applyMenuOrder(order);
    } else {
      // No saved order — use defaults
      const { main, ellipses } = this.menuRegistry.resolveMenus([], [], this.allowedRoutes);
      this.mainMenuItems = main;
      this.modules = ellipses;
    }

    this.updateFilteredModules();
    this.setSelectedModuleFromRoute();

    // Re-evaluate pinned selection on every navigation (back button, child routes, etc.)
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.setSelectedModuleFromRoute());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  private applyMenuOrder(order: MenuOrder): void {
    const { main, ellipses } = this.menuRegistry.resolveMenus(
      order.mainMenuRoutes,
      order.threeDotRoutes,
      this.allowedRoutes
    );
    this.mainMenuItems = main;
    this.modules = ellipses;
  }

  onDirectItemClick(item: MenuItemDef): void {
    const directRoutes = ['/employee-management', '/attendance'];
    if (directRoutes.includes(item.route)) {
      this.router.navigate([item.route]);
    } else {
      this.goToAccessibleRoute(item.route);
    }
    this.resetDropdown();
  }

  onMainMenuDrop(event: CdkDragDrop<MenuItemDef[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(this.mainMenuItems, event.previousIndex, event.currentIndex);
    } else {
      // Item dragged from filteredModules into main menu
      const item = this.filteredModules[event.previousIndex];
      this.filteredModules.splice(event.previousIndex, 1);
      this.mainMenuItems.splice(event.currentIndex, 0, item);
      this.syncModulesFromFiltered();
      this.mainMenuItems = [...this.mainMenuItems];
      this.updateFilteredModules();
    }
    this.saveCurrentOrder();
  }

  onThreeDotDrop(event: CdkDragDrop<MenuItemDef[]>): void {
    if (event.previousContainer === event.container) {
      // Reorder within filteredModules, then rebuild modules preserving the selected item's position
      moveItemInArray(this.filteredModules, event.previousIndex, event.currentIndex);
      this.syncModulesFromFiltered();
    } else {
      // Item dragged from main menu into ellipses — insert into filteredModules at drop index
      const item = event.previousContainer.data[event.previousIndex];
      this.mainMenuItems.splice(event.previousIndex, 1);
      this.filteredModules.splice(event.currentIndex, 0, item);
      this.syncModulesFromFiltered();
      this.mainMenuItems = [...this.mainMenuItems];
    }
    this.updateFilteredModules();
    this.saveCurrentOrder();
  }

  /**
   * Rebuild the full modules array from filteredModules, re-inserting the
   * selectedDropdownModule at its original position (or appending if not found).
   */
  private syncModulesFromFiltered(): void {
    if (!this.selectedDropdownModule) {
      this.modules = [...this.filteredModules];
      return;
    }
    // Find where the selected item was in the old modules array
    const selectedRoute = this.selectedDropdownModule.route;
    const oldIndex = this.modules.findIndex(m => m.route === selectedRoute);
    const rebuilt = [...this.filteredModules];
    if (oldIndex >= 0) {
      // Re-insert at the same position, clamped to array bounds
      const insertAt = Math.min(oldIndex, rebuilt.length);
      rebuilt.splice(insertAt, 0, this.selectedDropdownModule);
    } else {
      rebuilt.push(this.selectedDropdownModule);
    }
    this.modules = rebuilt;
  }

  private saveCurrentOrder(): void {
    const order: MenuOrder = {
      mainMenuRoutes: ['/dashboard', ...this.mainMenuItems.map(m => m.route)],
      threeDotRoutes: this.modules.map(m => m.route)
    };
    this.menuOrderService.saveOrder(this.empinfo?.employeeId || 0, order);
  }

  isActiveItem(item: MenuItemDef): boolean {
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

  /**
   * Called when a grid item inside the ellipses panel is clicked.
   * Both direct and dropdown items are pinned as selectedDropdownModule (shown in sidenav list).
   * Dropdown items additionally open their submenu flyout from the pinned position.
   */
  selectDropdownModule(module: MenuItemDef): void {
    const isSame = this.selectedDropdownModule?.route === module.route;
    this.selectedDropdownModule = isSame ? null : module;
    this.updateFilteredModules();
    this.cdr.detectChanges();

    if (isSame) return;

    // Close the ellipses Bootstrap dropdown
    const ellipsesToggle = document.querySelector('.ellipses-dropdown-toggle') as HTMLElement | null;
    if (ellipsesToggle) {
      ellipsesToggle.click();
    }

    if (module.type === 'dropdown') {
      // After ellipses closes and DOM updates, open the pinned item's flyout
      setTimeout(() => {
        setTimeout(() => {
          const pinnedToggle = document.querySelector('.selected-module-item [data-bs-toggle="dropdown"]') as HTMLElement | null;
          if (pinnedToggle) {
            const dropdown = new bootstrap.Dropdown(pinnedToggle);
            dropdown.show();
          }
        }, 100);
      }, 0);
    } else {
      if (module.route === '/organization-chart') { this.router.navigate(['/organization-chart']); }
      else if (module.route === '/theme') { this.router.navigate(['/theme']); }
      else { this.goToAccessibleRoute(module.route); }
    }
  }

  updateFilteredModules(): void {
    this.filteredModules = this.modules.filter(m => m.route !== this.selectedDropdownModule?.route);
  }

  getGridItemClasses(module: MenuItemDef): any {
    const i = this.filteredModules.indexOf(module);
    if (i === -1) return {};
    const total = this.filteredModules.length;
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

    // If current route matches a main menu item, clear the pinned ellipses selection
    const isMainMenuRoute = this.mainMenuItems.some(item =>
      currentRoute === item.route || currentRoute.startsWith(item.route + '/')
    );
    if (isMainMenuRoute || currentRoute === '/dashboard' || currentRoute.startsWith('/dashboard/')) {
      this.selectedDropdownModule = null;
      this.updateFilteredModules();
      return;
    }

    // Check if current route matches an ellipses module
    const matchedModules = this.modules.filter(mod => {
      if (currentRoute === mod.route || currentRoute.startsWith(mod.route + '/')) return true;
      if (mod.route === '/theme' && currentRoute.startsWith('/menus/')) return true;
      return false;
    });
    const matched = matchedModules.sort((a, b) => b.route.length - a.route.length)[0] ?? null;

    // If no ellipses module matches the current route, clear the selection
    this.selectedDropdownModule = matched;
    this.updateFilteredModules();
  }

  trackByRoute(_: number, item: MenuItemDef): string { return item.route; }

  ActiveRoute(): boolean {
    return ['/employee-management', '/letters', '/invite-user'].some(r => this.router.url.startsWith(r));
  }
}

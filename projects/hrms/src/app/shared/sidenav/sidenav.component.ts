import { CommonModule } from '@angular/common';
import { ApplicationRef, Component, ComponentRef, createComponent, effect, EnvironmentInjector, HostListener, OnInit, OnDestroy, ViewChild } from '@angular/core';
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
import { MenuRegistryService, MenuItemDef } from './menu-registry.service';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MenuOrder } from '../../theme-customization/theme-action.service';

/** Maps dropdownComponent key → the tab component class */
const DROPDOWN_COMPONENT_MAP: Record<string, any> = {
  'time-off': TimeOffTabsComponent,
  'project-management': ProjectManagementMainTabsComponent,
  'on-behalf-of': OnbehalfofMainTabsComponent,
  'pending-approvals': PendingApprovalsTabsComponent,
  'pms': PmsMainTabsComponent,
};

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

  /** The body-level overlay div that wraps the dynamically created tab component */
  private overlayEl: HTMLElement | null = null;
  private overlayCompRef: ComponentRef<any> | null = null;

  columnsPerRow = 3;
  selectedDropdownModule: MenuItemDef | null = null;
  pinnedDropdownOpen = false;
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
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector
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

    this.allowedRoutes = new Set(
      this.menuRegistry.ALL_ITEMS
        .filter(i => this.rbac.allowedToAccess(`${i.permission.feature}.${i.permission.action}`))
        .map(i => i.route)
    );

    const order = this.menuOrderService.menuOrder();
    if (order) {
      this.applyMenuOrder(order);
    } else {
      const { main, ellipses } = this.menuRegistry.resolveMenus([], [], this.allowedRoutes);
      this.mainMenuItems = main;
      this.modules = ellipses;
    }

    this.updateFilteredModules();
    this.setSelectedModuleFromRoute();

    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.onNavigationEnd());
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    this.destroyOverlay();
  }

  private applyMenuOrder(order: MenuOrder): void {
    const { main, ellipses } = this.menuRegistry.resolveMenus(
      order.mainMenuRoutes,
      order.threeDotRoutes,
      this.allowedRoutes
    );
    this.mainMenuItems = main;
    this.modules = ellipses;

    // If the currently pinned item was moved to the main menu, clear the pinned state
    if (this.selectedDropdownModule) {
      const isNowInMain = main.some(m => m.route === this.selectedDropdownModule!.route);
      if (isNowInMain) {
        this.selectedDropdownModule = null;
        this.pinnedDropdownOpen = false;
        this.destroyOverlay();
      }
    }
  }

  // ── Overlay management ────────────────────────────────────────────────────

  private createOverlay(module: MenuItemDef): void {
    this.destroyOverlay();

    const componentClass = DROPDOWN_COMPONENT_MAP[module.dropdownComponent!];
    if (!componentClass) {
      console.warn('[Sidenav] No component found for dropdownComponent:', module.dropdownComponent);
      return;
    }

    // Create wrapper div appended directly to body — completely outside any transform context
    const wrapper = document.createElement('div');
    wrapper.className = 'sidenav-pinned-overlay';
    wrapper.style.cssText = `
      position: fixed;
      z-index: 1055;
      width: 325px;
      min-height: 225px;
      max-height: 325px;
      overflow-y: auto;
      border-radius: 0.625rem;
      box-shadow: 0px 0px 20px 0px rgba(0,0,0,0.4);
      background: #fff;
      padding: 0.75rem;
    `;
    document.body.appendChild(wrapper);
    this.overlayEl = wrapper;

    // Dynamically create the tab component and attach to Angular's app tree
    const compRef = createComponent(componentClass, {
      environmentInjector: this.injector,
      hostElement: wrapper
    });
    this.appRef.attachView(compRef.hostView);
    this.overlayCompRef = compRef;

    // Position after DOM is ready
    setTimeout(() => this.positionOverlay(), 0);
  }

private positionOverlay(): void {

  if (!this.overlayEl) return;

  const sidenavEl = document.querySelector(
    '.sidenav-main-container'
  ) as HTMLElement | null;

  const pinnedEl = document.querySelector(
    '.selected-module-item'
  ) as HTMLElement | null;

  if (!sidenavEl || !pinnedEl) return;

  const sidenavRect = sidenavEl.getBoundingClientRect();
  const pinnedRect = pinnedEl.getBoundingClientRect();

  const viewportHeight = window.innerHeight;

  // IMPORTANT
  // Wait for actual rendered height
  const actualHeight = this.overlayEl.scrollHeight;

  // Keep some breathing space
  const topPadding = 10;
  const bottomPadding = 10;

  // Available space below clicked item
  const availableBottomSpace =
    viewportHeight - pinnedRect.top - bottomPadding;

  // Available space above clicked item
  const availableTopSpace =
    pinnedRect.bottom - topPadding;

  let finalTop = pinnedRect.top;

  // CASE 1:
  // Dropdown fits below
  if (actualHeight <= availableBottomSpace) {

    finalTop = pinnedRect.top;

    this.overlayEl.style.maxHeight =
      `${availableBottomSpace}px`;
  }

  // CASE 2:
  // Doesn't fit below but fits above
  else if (actualHeight <= availableTopSpace) {

    finalTop =
      pinnedRect.bottom - actualHeight;

    this.overlayEl.style.maxHeight =
      `${availableTopSpace}px`;
  }

  // CASE 3:
  // Doesn't fit anywhere fully
  // Use best possible height with scrolling
  else {

    const bestHeight = Math.max(
      availableBottomSpace,
      availableTopSpace
    );

    // Open in direction with more space
    if (availableBottomSpace >= availableTopSpace) {

      finalTop = pinnedRect.top;

    } else {

      finalTop = topPadding;
    }

    this.overlayEl.style.maxHeight =
      `${bestHeight}px`;
  }

  // Final positioning
  this.overlayEl.style.left =
    `${sidenavRect.right + 6}px`;

  this.overlayEl.style.top =
    `${Math.max(topPadding, finalTop)}px`;

  // Enable scrolling
  this.overlayEl.style.overflowY = 'auto';

  console.log({
    actualHeight,
    availableBottomSpace,
    availableTopSpace,
    finalTop
  });
}

  private destroyOverlay(): void {
    if (this.overlayCompRef) {
      this.appRef.detachView(this.overlayCompRef.hostView);
      this.overlayCompRef.destroy();
      this.overlayCompRef = null;
    }
    if (this.overlayEl) {
      this.overlayEl.remove();
      this.overlayEl = null;
    }
  }

  // ── Drop handlers ─────────────────────────────────────────────────────────

  onDirectItemClick(item: MenuItemDef): void {
    this.closePinnedOverlay();
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
      const item = event.previousContainer.data[event.previousIndex];
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
      moveItemInArray(this.filteredModules, event.previousIndex, event.currentIndex);
      this.syncModulesFromFiltered();
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      this.mainMenuItems.splice(event.previousIndex, 1);
      this.filteredModules.splice(event.currentIndex, 0, item);
      this.syncModulesFromFiltered();
      this.mainMenuItems = [...this.mainMenuItems];
    }
    this.updateFilteredModules();
    this.saveCurrentOrder();
  }

  private syncModulesFromFiltered(): void {
    if (!this.selectedDropdownModule) {
      this.modules = [...this.filteredModules];
      return;
    }
    const selectedRoute = this.selectedDropdownModule.route;
    const oldIndex = this.modules.findIndex(m => m.route === selectedRoute);
    const rebuilt = [...this.filteredModules];
    if (oldIndex >= 0) {
      rebuilt.splice(Math.min(oldIndex, rebuilt.length), 0, this.selectedDropdownModule);
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

  // ── Selection ─────────────────────────────────────────────────────────────

  resetDropdown(): void {
    this.selectedDropdownModule = null;
    this.pinnedDropdownOpen = false;
    this.destroyOverlay();
    this.updateFilteredModules();
  }

  selectDropdownModule(module: MenuItemDef): void {
    const isSame = this.selectedDropdownModule?.route === module.route;

    if (isSame) {
      if (module.type === 'dropdown') {
        this.togglePinnedDropdown();
      } else {
        this.selectedDropdownModule = null;
        this.destroyOverlay();
        this.updateFilteredModules();
      }
      return;
    }

    this.selectedDropdownModule = module;
    this.pinnedDropdownOpen = module.type === 'dropdown';
    this.updateFilteredModules();

    // Close Bootstrap ellipses dropdown
    const ellipsesMenu = document.querySelector('.ellipses-dropdown-menu') as HTMLElement | null;
    const ellipsesToggle = document.querySelector('.ellipses-dropdown-toggle') as HTMLElement | null;
    const btnGroup = ellipsesToggle?.closest('.btn-group') as HTMLElement | null;
    if (ellipsesMenu) ellipsesMenu.classList.remove('show');
    if (ellipsesToggle) ellipsesToggle.classList.remove('show');
    if (btnGroup) btnGroup.classList.remove('show');

    if (module.type === 'dropdown') {
      // Create body-level overlay after Angular renders the pinned item
      setTimeout(() => this.createOverlay(module), 0);
    } else {
      this.destroyOverlay();
      // Routes that must use direct navigation (same as onDirectItemClick)
      const directRoutes = ['/employee-management', '/attendance'];
      if (directRoutes.includes(module.route)) {
        this.router.navigate([module.route]);
      } else if (module.route === '/organization-chart') {
        this.router.navigate(['/organization-chart']);
      } else if (module.route === '/theme') {
        this.router.navigate(['/theme']);
      } else {
        this.goToAccessibleRoute(module.route);
      }
    }
  }

  togglePinnedDropdown(): void {
    this.pinnedDropdownOpen = !this.pinnedDropdownOpen;
    if (this.pinnedDropdownOpen) {
      if (this.selectedDropdownModule) {
        setTimeout(() => this.createOverlay(this.selectedDropdownModule!), 0);
      }
    } else {
      this.destroyOverlay();
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  updateFilteredModules(): void {
    this.filteredModules = this.modules.filter(m => m.route !== this.selectedDropdownModule?.route);
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

  isActiveprojectManagement(): boolean { return this.router.url.startsWith('/project-management'); }
  isActiveskillsetManagement(): boolean { return this.router.url.startsWith('/skill-management'); }

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
    return Math.floor(index / this.columnsPerRow) + 1 === Math.ceil(this.modules.length / this.columnsPerRow);
  }
  isInMiddleRow(index: number): boolean { return !this.isInTopRow(index) && !this.isInLastRow(index); }
  isFirstColumn(index: number): boolean { return index % this.columnsPerRow === 0; }
  isLastColumn(index: number): boolean { return (index + 1) % this.columnsPerRow === 0; }
  isMiddleColumn(index: number): boolean { return !this.isFirstColumn(index) && !this.isLastColumn(index); }

  closePinnedOverlay(): void {
    if (this.pinnedDropdownOpen) {
      this.pinnedDropdownOpen = false;
      this.destroyOverlay();
    }
  }

  onEllipsesToggleClick(): void {
    // Issue 2: close the pinned overlay when ellipses opens
    if (this.pinnedDropdownOpen) {
      this.pinnedDropdownOpen = false;
      this.destroyOverlay();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const ellipsesMenu = document.querySelector('.ellipses-dropdown-menu');
    const ellipsesToggle = document.querySelector('.ellipses-dropdown-toggle');
    const selectedItem = document.querySelector('.selected-module-item');
    const overlay = document.querySelector('.sidenav-pinned-overlay');
    const menuItems = document.querySelectorAll('.menu-item-clear');
    const target = event.target as Node;

    const isInsideEllipses = ellipsesMenu?.contains(target) || ellipsesToggle?.contains(target);
    const isInsideSelected = selectedItem?.contains(target);
    const isInsideOverlay = overlay?.contains(target);
    const isInsideMenuItem = Array.from(menuItems).some(item => item.contains(target));

    // Issue 3: never call setSelectedModuleFromRoute when user is interacting with
    // ellipses or the pinned item — this would reset selectedDropdownModule based on
    // current route, overwriting the user's last explicit selection
    const shouldIgnore = isInsideEllipses || isInsideSelected || isInsideOverlay || isInsideMenuItem;
    if (!shouldIgnore) {
      setTimeout(() => this.onNavigationEnd(), 100);
    }
  }

  /**
   * Called on every NavigationEnd.
   * Handles all three dropdown state scenarios:
   * 1. Child navigation inside a pinned dropdown → close overlay (Issue 1)
   * 2. Navigation to a main menu route → clear selection entirely
   * 3. Navigation to an ellipses module route → pin that module
   */
  private onNavigationEnd(): void {
    const currentRoute = this.router.url;

    // Clear if navigated to a main menu or dashboard route
    const isMainMenuRoute = this.mainMenuItems.some(item =>
      currentRoute === item.route || currentRoute.startsWith(item.route + '/')
    );
    if (isMainMenuRoute || currentRoute === '/dashboard' || currentRoute.startsWith('/dashboard/')) {
      this.selectedDropdownModule = null;
      this.pinnedDropdownOpen = false;
      this.destroyOverlay();
      this.updateFilteredModules();
      return;
    }

    // Check if current route is a child of the currently pinned dropdown module
    if (this.selectedDropdownModule?.type === 'dropdown') {
      const isChildRoute = currentRoute.startsWith(this.selectedDropdownModule.route + '/');
      if (isChildRoute) {
        // Issue 1: child item was clicked — close the overlay but keep the item selected/highlighted
        this.pinnedDropdownOpen = false;
        this.destroyOverlay();
        return;
      }
    }

    // Check if current route matches a different ellipses module
    const matchedModules = this.modules.filter(mod => {
      if (currentRoute === mod.route || currentRoute.startsWith(mod.route + '/')) return true;
      if (mod.route === '/theme' && currentRoute.startsWith('/menus/')) return true;
      return false;
    });
    const matched = matchedModules.sort((a, b) => b.route.length - a.route.length)[0] ?? null;

    if (matched && matched.route !== this.selectedDropdownModule?.route) {
      // Navigated to a different ellipses module's route
      this.selectedDropdownModule = matched;
      this.pinnedDropdownOpen = false; // don't auto-open overlay on route change
      this.destroyOverlay();
      this.updateFilteredModules();
    } else if (!matched && !this.selectedDropdownModule) {
      // No match and nothing selected — nothing to do
    }
    // If matched === selectedDropdownModule, keep current state (don't reset)
  }

  setSelectedModuleFromRoute(): void {
    // Initial load only — delegates to onNavigationEnd logic
    this.onNavigationEnd();
  }

  trackByRoute(_: number, item: MenuItemDef): string { return item.route; }

  ActiveRoute(): boolean {
    return ['/employee-management', '/letters', '/invite-user'].some(r => this.router.url.startsWith(r));
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, effect } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { RbacService } from '../../services/rbac.service';
import { ThemeActionService, MenuOrder } from '../theme-action.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../services/open-modal.service';
import { ConfirmationIconComponent } from '../../icons/confirmation-icon/confirmation-icon.component';
import { HttpService } from '../../services/http.service';
import { MenuOrderService, MENU_PREF_KEY } from '../../services/theme-service/menu-order.service';
import { MenuRegistryService, MenuItemDef } from '../../services/theme-service/menu-registry.service';
import { UserPreferenceService } from '../../services/user-preference.service';

@Component({
  selector: 'app-menus-personalization',
  imports: [CommonModule, TranslateModule, DragDropModule, ConfirmationIconComponent],
  templateUrl: './menus-personalization.component.html',
  styleUrl: './menus-personalization.component.scss'
})
export class MenusPersonalizationComponent implements OnInit, OnDestroy {

  @ViewChild('resetConfirmPopup') resetConfirmPopup: any;

  readonly dashboardIcon = '/personalization/Dashboard.png';


  dashboardItem: MenuItemDef = {
  label: 'Dashboard',
  route: '/dashboard',
  personalizationIcon: '/personalization/Dashboard.png',
  permission: {
    feature: 'Dashboard',
    action: 'view'
  }
} as MenuItemDef;

  mainMenuItems: MenuItemDef[] = [];
  threeDotItems: MenuItemDef[] = [];
  dataLoad = false;

  private allowedRoutes = new Set<string>();
  private empinfo: any;
  private savedOrder: MenuOrder | null = null;
  private subs: Subscription[] = [];

  constructor(
    public rbac: RbacService,
    private themeAction: ThemeActionService,
    private modalService: NgbModal,
    private openModalService: OpenModalService,
    private http: HttpService,
    private menuOrderService: MenuOrderService,
    private menuRegistry: MenuRegistryService,
    private userPrefService: UserPreferenceService
  ) {
    let previousOrderJson: string | null = null;
    effect(() => {
      const order = this.menuOrderService.menuOrder();
      const currentJson = order ? JSON.stringify(order) : null;
      // Only reload if signal changed AND component is already initialized
      if (currentJson && currentJson !== previousOrderJson && this.savedOrder !== null) {
        previousOrderJson = currentJson;
        this.loadMenuOrder();
      } else {
        previousOrderJson = currentJson;
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

    this.loadMenuOrder();

    this.subs.push(
      this.themeAction.applyMenuChanges$.subscribe(() => this.applyChanges()),
      this.themeAction.resetMenuToDefault$.subscribe(() => this.openResetConfirm())
    );
  }

  async loadMenuOrder(forceRefresh = false): Promise<void> {
    this.dataLoad = true;
    try {
      const data = await this.userPrefService.getPreferences(forceRefresh);
      this.dataLoad = false;
      const savedValue = data?.[MENU_PREF_KEY];
      if (savedValue) {
        const order: MenuOrder = JSON.parse(savedValue);
        this.menuOrderService.setMenuOrder(order);
        this.applyOrder(order);
      } else {
        this.menuOrderService.setMenuOrder(null);
        this.applyOrder(null);
      }
      this.savedOrder = this.getCurrentOrder();
      this.themeAction.canApplyMenuChanges.set(false);
    } catch (error) {
      this.dataLoad = false;
      this.applyOrder(null);
      this.savedOrder = this.getCurrentOrder();
      this.themeAction.canApplyMenuChanges.set(false);
    }
  }

  private applyOrder(order: MenuOrder | null): void {
    const { main, ellipses } = this.menuRegistry.resolveMenus(
      order?.mainMenuRoutes ?? [],
      order?.threeDotRoutes ?? [],
      this.allowedRoutes
    );
    this.mainMenuItems = main;
    this.threeDotItems = ellipses;
  }

  private getCurrentOrder(): MenuOrder {
    return {
      mainMenuRoutes: this.mainMenuItems.map(i => i.route),
      threeDotRoutes: this.threeDotItems.map(i => i.route)
    };
  }

  private hasChanges(): boolean {
    if (!this.savedOrder) return false;
    return JSON.stringify(this.getCurrentOrder()) !== JSON.stringify(this.savedOrder);
  }

  onDrop(event: CdkDragDrop<MenuItemDef[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    this.themeAction.canApplyMenuChanges.set(this.hasChanges());
  }

  applyChanges(): void {
    const current = this.getCurrentOrder();
    const order: MenuOrder = {
      mainMenuRoutes: ['/dashboard', ...current.mainMenuRoutes],
      threeDotRoutes: current.threeDotRoutes
    };
    const payload = {
      employeeId: this.empinfo?.employeeId || 0,
      key: MENU_PREF_KEY,
      value: JSON.stringify(order)
    };
    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => {
        this.openModalService.openSuccessModal('Menu order has been saved successfully.');
        this.loadMenuOrder(true);
      },
      error: () => this.openModalService.openErrorModal('Failed to save menu order')
    });
  }

  openResetConfirm(): void {
    this.modalService.open(this.resetConfirmPopup, { centered: true, backdrop: 'static' });
  }

  confirmReset(): void {
    this.modalService.dismissAll();
    const { main, ellipses } = this.menuRegistry.resolveMenus([], [], this.allowedRoutes);
    const defaultOrder: MenuOrder = {
      mainMenuRoutes: ['/dashboard', ...main.map(i => i.route)],
      threeDotRoutes: ellipses.map(i => i.route)
    };
    const payload = {
      employeeId: this.empinfo?.employeeId || 0,
      key: MENU_PREF_KEY,
      value: JSON.stringify(defaultOrder)
    };
    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => {
        this.openModalService.openSuccessModal('Menu order has been reset successfully.');
        this.loadMenuOrder(true);
      },
      error: () => this.openModalService.openErrorModal('Failed to reset menu order')
    });
  }

  trackByRoute(_: number, item: MenuItemDef): string { return item.route; }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.themeAction.canApplyMenuChanges.set(false);
  }
}

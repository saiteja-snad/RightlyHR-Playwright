import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, effect } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { RbacService } from '../../services/rbac.service';
import { ThemeActionService, MenuOrder } from '../theme-action.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../services/open-modal.service';
import { ConfirmationIconComponent } from '../../icons/confirmation-icon/confirmation-icon.component';
import { HttpService } from '../../services/http.service';
import { MenuOrderService, MENU_PREF_KEY } from '../../services/theme-service/menu-order.service';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  permission: { feature: string; action: string };
}

@Component({
  selector: 'app-menus-personalization',
  imports: [CommonModule, TranslateModule, DragDropModule, ConfirmationIconComponent],
  templateUrl: './menus-personalization.component.html',
  styleUrl: './menus-personalization.component.scss'
})
export class MenusPersonalizationComponent implements OnInit, OnDestroy {

  @ViewChild('resetConfirmPopup') resetConfirmPopup: any;

  dashboardItem: MenuItem = {
    label: 'Dashboard', icon: '/main-menu-icons/dashboard-square.png',
    route: '/dashboard', permission: { feature: 'Dashboard', action: 'view' }
  };

  allMainMenuItems: MenuItem[] = [
    { label: 'My Info', icon: '/personalization/My info.jpg', route: '/myinfo', permission: { feature: 'My Info', action: 'view' } },
    { label: 'Employees', icon: '/personalization/Employees.png', route: '/employee-management', permission: { feature: 'Employees', action: 'view' } },
    { label: 'Time Off', icon: '/personalization/Time Off.png', route: '/time-off', permission: { feature: 'Time-Off', action: 'view' } },
    { label: 'Attendance', icon: '/personalization/Attendance.png', route: '/attendance', permission: { feature: 'Attendance', action: 'view' } },
    { label: 'Reports', icon: '/personalization/Reports.png', route: '/reports', permission: { feature: 'Reports', action: 'view' } },
    { label: 'Project Management', icon: '/personalization/Project Management.png', route: '/project-management', permission: { feature: 'Project Management', action: 'view' } },
    { label: 'Skill Set', icon: '/personalization/Skill Set.png', route: '/skill-management', permission: { feature: 'Skill Set Management', action: 'view' } },
    { label: 'On Behalf Of', icon: '/personalization/On Behalf Of.png', route: '/on-behalf-of', permission: { feature: 'On Behalf Of', action: 'view' } },
    { label: 'Pending Approvals', icon: '/personalization/Pending Approvals.png', route: '/pending-approvals', permission: { feature: 'Pending Approvals Module', action: 'view' } },
    { label: 'PMS', icon: '/personalization/PMS.png', route: '/pms', permission: { feature: 'PMS', action: 'view' } },
  ];

  allThreeDotItems: MenuItem[] = [
    { label: 'Holidays', icon: '/main-menu-icons/holiday-icon.png', route: '/holidays', permission: { feature: 'Holidays', action: 'view' } },
    { label: 'Policies', icon: '/main-menu-icons/policies-icon.png', route: '/policies', permission: { feature: 'Policies', action: 'view' } },
    { label: 'Events', icon: '/main-menu-icons/events-colored-icon.png', route: '/events', permission: { feature: 'Events', action: 'view' } },
    { label: 'Expenses', icon: '/main-menu-icons/expenses-icon.png', route: '/claimsandexpenses', permission: { feature: 'Expenses', action: 'view' } },
    { label: 'Org Hierarchy', icon: '/main-menu-icons/org.png', route: '/organization-chart', permission: { feature: 'Org Hierarchy', action: 'view' } },
    { label: 'Personalization', icon: '/main-menu-icons/themes-color-icon.png', route: '/theme', permission: { feature: 'Themes', action: 'view' } },
    { label: 'Blood Bank', icon: '/main-menu-icons/blood-bank-color-icon.png', route: '/blood-bank', permission: { feature: 'Blood Bank', action: 'view' } },
    { label: 'Contacts Directory', icon: '/main-menu-icons/contact-directory-color-icon.png', route: '/contacts-directory', permission: { feature: 'Contacts Directory', action: 'view' } },
    { label: 'Phone Book', icon: '/main-menu-icons/phonebook-color-icon.png', route: '/phonebook', permission: { feature: 'Phone Book', action: 'view' } },
    { label: 'Assets', icon: '/main-menu-icons/assets-icon.png', route: '/assets-management', permission: { feature: 'Asset Management', action: 'view' } },
    { label: 'Cards Management', icon: '/main-menu-icons/card-management-icon.png', route: '/card-management', permission: { feature: 'Desk Allocation', action: 'view' } },
  ];

  private defaultMain: MenuItem[] = [];
  private defaultThree: MenuItem[] = [];
  private empinfo: any;

  mainMenuItems: MenuItem[] = [];
  threeDotItems: MenuItem[] = [];
  activeDropList: string | null = null;
  dataLoad = false;

  private savedOrder: MenuOrder | null = null;
  private subs: Subscription[] = [];

  constructor(
    public rbac: RbacService,
    private themeAction: ThemeActionService,
    private modalService: NgbModal,
    private openModalService: OpenModalService,
    private http: HttpService,
    private menuOrderService: MenuOrderService
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

    const allowedMain = this.allMainMenuItems.filter(i =>
      this.rbac.allowedToAccess(`${i.permission.feature}.${i.permission.action}`)
    );
    const allowedThree = this.allThreeDotItems.filter(i =>
      this.rbac.allowedToAccess(`${i.permission.feature}.${i.permission.action}`)
    );

    this.defaultMain = [...allowedMain];
    this.defaultThree = [...allowedThree];

    this.mainMenuItems = [...allowedMain];
    this.threeDotItems = [...allowedThree];

    this.loadMenuOrder();

    this.subs.push(
      this.themeAction.applyMenuChanges$.subscribe(() => this.applyChanges()),
      this.themeAction.resetMenuToDefault$.subscribe(() => this.openResetConfirm())
    );
  }

  loadMenuOrder(): void {
    this.dataLoad = true;
    this.http.getData(`Employeedata/get-user-preference/${this.empinfo?.employeeId}`).subscribe({
      next: (data: any) => {
        this.dataLoad = false;
        const savedValue = data?.data?.[MENU_PREF_KEY];
        if (savedValue) {
          const order: MenuOrder = JSON.parse(savedValue);
          this.menuOrderService.setMenuOrder(order);
          const mainRoutes = order.mainMenuRoutes.filter(r => r !== '/dashboard');
          this.mainMenuItems = this.buildListFromRoutes(mainRoutes, this.defaultMain);
          this.threeDotItems = this.buildListFromRoutes(order.threeDotRoutes, this.defaultThree);
        } else {
          this.menuOrderService.setMenuOrder(null);
        }
        this.savedOrder = this.getCurrentOrder();
        this.themeAction.canApplyMenuChanges.set(false);
      },
      error: () => {
        this.dataLoad = false;
        this.savedOrder = this.getCurrentOrder();
        this.themeAction.canApplyMenuChanges.set(false);
      }
    });
  }

  private buildListFromRoutes(routes: string[], items: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];
    routes.forEach(route => {
      const found = items.find(i => i.route === route);
      if (found) result.push(found);
    });
    // Append any allowed items not in saved order
    items.forEach(i => {
      if (!result.find(r => r.route === i.route)) result.push(i);
    });
    return result;
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

  onDrop(event: CdkDragDrop<MenuItem[]>) {
    moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
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
        this.loadMenuOrder();
      },
      error: () => this.openModalService.openErrorModal('Failed to save menu order')
    });
  }

  openResetConfirm(): void {
    this.modalService.open(this.resetConfirmPopup, { centered: true, backdrop: 'static' });
  }

  confirmReset(): void {
    this.modalService.dismissAll();
    const defaultOrder: MenuOrder = {
      mainMenuRoutes: ['/dashboard', ...this.defaultMain.map(i => i.route)],
      threeDotRoutes: this.defaultThree.map(i => i.route)
    };
    const payload = {
      employeeId: this.empinfo?.employeeId || 0,
      key: MENU_PREF_KEY,
      value: JSON.stringify(defaultOrder)
    };
    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => {
        this.openModalService.openSuccessModal('Menu order has been reset to default successfully.');
        this.loadMenuOrder();
      },
      error: () => this.openModalService.openErrorModal('Failed to reset menu order')
    });
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.themeAction.canApplyMenuChanges.set(false);
  }
}

import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { IExpense, ISummary } from '../../../Interfaces/claimsandexpenses.model';
import { HttpService } from '../../../services/http.service';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { RbacService } from '../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../tabs-dnd/tabs-dnd.directive';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';

@Component({
  selector: 'app-on-behalf-of-expenses-tabs',
  imports: [RouterModule, CommonModule, TabsModule, TranslateModule, DragDropModule, TabsDndDirective],
  templateUrl: './on-behalf-of-expenses-tabs.component.html',
  styleUrl: './on-behalf-of-expenses-tabs.component.scss'
})
export class OnBehalfOfExpensesTabsComponent {
  readonly tabsKey = 'on-behalf-of-expenses-tabs';
  filteredTabs: any[] = [];
  loading = false
  empdata = {} as any;
  expenesEmplyeedata = new BehaviorSubject<IExpense[]>([]);
  expenesEmplyeedatastatusfliter = new BehaviorSubject<IExpense[]>([]);
  ApprovedCount = 0;
  processedCount = 0;
  pendingCount = 0;
  rejectedCount = 0;
  totalExpense: any;
  expenseChartLegend: any;
  selectemp: any;
  selectedMonth: number | null = null;
  selectedMouthly: number | null = null;
  getExpenseSummaryDetails = {} as ISummary;
  flitredapproved = new BehaviorSubject<any[]>([]);
  flitredpending = new BehaviorSubject<any[]>([]);
  flitredrejected = new BehaviorSubject<any[]>([]);
  flitredDrafts = new BehaviorSubject<any[]>([]);
  processedExpenses = new BehaviorSubject<any[]>([]);
  destroy$: Subject<boolean> = new Subject<boolean>();
  rejectedExpensesRequestsCount = 0;
  waitingForApprovalExpensesCount = 0;
  approvedExpensesCount = 0;
  processedExpensesCount = 0;
  subscription!: Subscription;
  selectedYear: any;
  seletedMouthly: any;
  public defaultRoute: string = '';
  public navTabs: any[] = [];
  private allTabs = [
    {
      tabId: '/on-behalf-of/on-behalf-of-expenses/waiting-for-approval',
      label: 'Waiting For Approval',
      link: 'waiting-for-approval',
      icon: '/time-off-icon/waiting-for-approval-icon.png',
      permission: { feature: 'Waiting For Approval (On Behalf Of Expenses)', action: 'view' },
      count: this.pendingCount
    },
    {
      tabId: '/on-behalf-of/on-behalf-of-expenses/approved',
      label: 'Approved',
      link: 'approved',
      icon: '/time-off-icon/approved-icon.png',
      permission: { feature: 'Approved (On Behalf Of Expenses)', action: 'view' },
      count: this.ApprovedCount
    },
    {
      tabId: '/on-behalf-of/on-behalf-of-expenses/processed',
      label: 'Processed',
      link: 'processed',
      icon: '/time-off-icon/processed-icon.png',
      permission: { feature: 'Processed (On Behalf Of Expenses)', action: 'view' },
      count: this.processedCount
    },
    {
      tabId: '/on-behalf-of/on-behalf-of-expenses/rejected',
      label: 'Rejected',
      link: 'rejected',
      icon: '/time-off-icon/rejected-icon.png',
      permission: { feature: 'Rejected (On Behalf Of Expenses)', action: 'view' },
      count: this.rejectedCount
    },
  ];

  constructor(private http: HttpService, private rbac: RbacService, private router: Router, private SelectedyeartimeOffService: TimeoffYearFilterService, private menuOrderService: MenuOrderService) {
  }
  
  ngOnInit(): void {
    this.selectemp = null;
    this.expenesEmplyeedata.next([]);
    this.flitredapproved.next([]);
    this.flitredpending.next([]);
    this.processedExpenses.next([]);
    this.flitredrejected.next([]);

    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      tab.permission.feature &&
      tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );

    // Apply saved order
    this.filteredTabs = this.menuOrderService.applySavedTabsOrder(this.tabsKey, this.navTabs, (t) => t.tabId || t.link);

    if (this.filteredTabs.length > 0) {
      this.defaultRoute = this.filteredTabs[0].link;
    }

    const currentUrl = this.router.url;
    const baseUrl = '/on-behalf-of/on-behalf-of-expenses';
    if (currentUrl === baseUrl && this.defaultRoute) {
      this.router.navigateByUrl(this.defaultRoute);
      return;
    }
    const isAllowed = this.filteredTabs.some(tab => tab.link === currentUrl || tab.tabId === currentUrl || currentUrl.endsWith(`/${tab.link}`));
    if (!isAllowed && this.defaultRoute) {
      this.router.navigateByUrl(this.defaultRoute);
    }

    // Subscribe with takeUntil for cleanup
    this.http.selectedEmployeeIdExpensesforonbehalf$
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        if (id) {
          this.selectemp = id;
        } else {
          this.selectemp = null;
        }
        this.getexpensesheaderbyemployeeid();
      });

    this.http.expensesprocesscountOnBehalfof$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.getexpensesheaderbyemployeeid();
      });

    // Listen for year changes
    this.SelectedyeartimeOffService.selectedYear$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (this.selectemp) {
        this.getexpensesheaderbyemployeeid();
      }
    });
  }

  getexpensesheaderbyemployeeid(): void {
    if (!this.selectemp) {
      // No employee selected, clear all
      this.expenesEmplyeedata.next([]);
      this.flitredapproved.next([]);
      this.flitredpending.next([]);
      this.processedExpenses.next([]);
      this.flitredrejected.next([]);
      this.ApprovedCount = 0;
      this.pendingCount = 0;
      this.processedCount = 0;
      this.rejectedCount = 0;
      this.updateNavTabs();
      return;
    }

    const empId = this.selectemp;
    const selectedYear = this.SelectedyeartimeOffService.getSelectedYear();

    this.subscription = this.http.getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}&year=${selectedYear}`)
      .subscribe({
        next: (data: any) => {
          this.expenesEmplyeedata.next(data);
          this.updateAllFilteredExpenses();
        },
        error: () => {
          this.expenesEmplyeedata.next([]);
          this.flitredapproved.next([]);
          this.flitredpending.next([]);
          this.processedExpenses.next([]);
          this.flitredrejected.next([]);
          this.ApprovedCount = 0;
          this.pendingCount = 0;
          this.processedCount = 0;
          this.rejectedCount = 0;
          this.updateNavTabs();
        },
        complete: () => { this.loading = false; }
      });
  }



  updateNavTabs() {
    this.allTabs[0].count = this.pendingCount;
    this.allTabs[1].count = this.ApprovedCount;
    this.allTabs[2].count = this.processedCount;
    this.allTabs[3].count = this.rejectedCount;

    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );

    this.filteredTabs = this.menuOrderService.applySavedTabsOrder(this.tabsKey, this.navTabs, (t) => t.tabId || t.link);
  }

  trackByTabId(_: number, tab: any): string {
    return tab.tabId || tab.link;
  }

  updateAllFilteredExpenses() {
    const data = this.expenesEmplyeedata.value;
    const pending = data.filter(x => x.status === 'Waiting for Approval').reverse();
    const approved = data.filter(x => x.status === 'Approved').reverse();
    const processed = data.filter(x => x.status === 'Processed').reverse();
    const rejected = data.filter(x => x.status === 'Rejected').reverse();
    this.flitredapproved.next(approved);
    this.flitredpending.next(pending);
    this.processedExpenses.next(processed);
    this.flitredrejected.next(rejected);
    this.ApprovedCount = approved.length;
    this.pendingCount = pending.length;
    this.processedCount = processed.length;
    this.rejectedCount = rejected.length;
    this.updateNavTabs();
  }
  get isOnBehalfAddPage(): boolean {
    return this.router.url.includes('/on-behalf-of/on-behalf-of-expenses/add');
  }
ngOnDestroy(): void {
  this.destroy$.next(true);
  this.destroy$.complete();

  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}

}

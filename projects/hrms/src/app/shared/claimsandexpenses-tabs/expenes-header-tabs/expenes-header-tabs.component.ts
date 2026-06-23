import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { IExpense } from '../../../Interfaces/claimsandexpenses.model';
import { HttpService } from '../../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RbacService } from '../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TabsDndDirective } from '../../tabs-dnd/tabs-dnd.directive';
import { MenuOrderService } from '../../../services/theme-service/menu-order.service';

interface StatusTab {
  tabId: string;
  label: string;
  link: string;
  count?: number;
  permission?: { feature: string; action: string };
  icon: string;
}

@Component({
  selector: 'app-expenes-header-tabs',
  imports: [CommonModule, RouterModule, TabsModule,TranslateModule,DragDropModule,TabsDndDirective],
  templateUrl: './expenes-header-tabs.component.html',
  styleUrl: './expenes-header-tabs.component.scss'
})

export class ExpenesHeaderTabsComponent implements OnInit, OnDestroy {
  readonly tabsKey = 'claimsandexpenses-tabs';
  subscription!: Subscription;
  empinfo: any;
  expenesEmplyeedata = new BehaviorSubject<IExpense[]>([]);
  flitredapproved = new BehaviorSubject<any[]>([]);
  flitredpending = new BehaviorSubject<any[]>([]);
  flitredrejected = new BehaviorSubject<any[]>([]);
  flitredDrafts = new BehaviorSubject<any[]>([]);
  processedExpenses = new BehaviorSubject<any[]>([]);
  ApprovedCount = 0;
  processedCount = 0;
  pendingCount = 0;
  rejectedCount = 0;
  draftsCount = 0;
  requiredClarificationCount=0;
  flitredrequiredClarification = new BehaviorSubject<any[]>([]);
   selectemp: any;
 selectedYear: any;
  seletedMouthly: any;
  public navTabs: StatusTab[] = [];
  public defaultRoute: string = '';
    private allTabs: StatusTab[] = [
    { tabId: '/claimsandexpenses/expenses/draft',  label: 'Draft', link: '/claimsandexpenses/expenses/draft', icon: '/time-off-icon/waiting-for-approval-icon.png', permission: { feature: 'Draft Tab', action: 'view' }, count: this.draftsCount },
    { tabId: '/claimsandexpenses/expenses/approved',  label: 'Approved', link: '/claimsandexpenses/expenses/approved', icon: '/time-off-icon/approved-icon.png', permission: { feature: 'Approved Tab', action: 'view' }, count: this.ApprovedCount },
    { tabId: '/claimsandexpenses/expenses/pending',  label: 'Waiting For Approval', link: '/claimsandexpenses/expenses/pending', icon: '/time-off-icon/waiting-for-approval-icon.png', permission: { feature: 'Pending Tab', action: 'view' }, count: this.pendingCount },
    { tabId: '/claimsandexpenses/expenses/processed',  label: 'Processed', link: '/claimsandexpenses/expenses/processed', icon: '/time-off-icon/processed-icon.png', permission: { feature: 'Processed Tab', action: 'view' }, count: this.processedCount },
    { tabId: '/claimsandexpenses/expenses/rejected',  label: 'Rejected', link: '/claimsandexpenses/expenses/rejected', icon: '/time-off-icon/rejected-icon.png', permission: { feature: 'Rejected Tab', action: 'view' }, count: this.rejectedCount },
    { tabId: '/claimsandexpenses/expenses/required-clarification',  label: 'Expense Clarifications', link: '/claimsandexpenses/expenses/required-clarification', icon: '/time-off-icon/clarification.png', permission: { feature: 'Expense Clarifications Tab', action: 'view' }, count: this.requiredClarificationCount },

  ];

  constructor(private http: HttpService, private rbac: RbacService, private router: Router,private SelectedyeartimeOffService:TimeoffYearFilterService, private menuOrderService: MenuOrderService ) { }

  ngOnInit(): void {
    void this.initTabsAndRedirect();
    this.SelectedyeartimeOffService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
           this.SelectedyeartimeOffService.selectedMounthly$.subscribe(mounthly => {
          if (mounthly !== null) {
            this.seletedMouthly = mounthly;

          }
        })
        this.http.selectedEmployeeIdExpenses$.subscribe((id) => {
          if (id) {
            this.selectemp = id;
            this.getexpensesheaderbyemployeeid();
          } else {
            this.selectemp = null;
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getexpensesheaderbyemployeeid();
          }
        });
      }
    });

    this.http.expensesprocesscount$.subscribe(() => {
      this.getexpensesheaderbyemployeeid();
    });
  }

   private async initTabsAndRedirect(): Promise<void> {
    try {
      await this.menuOrderService.ensureLoaded();
    } catch {
    }

    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      tab.permission.feature &&
      tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
    this.navTabs = this.menuOrderService.applySavedTabsOrder(
      this.tabsKey,
      this.navTabs,
      tab => tab.tabId
    );
    this.defaultRoute = this.navTabs[0]?.link ?? '';

    const currentUrl = this.router.url;
    const baseUrl = '/claimsandexpenses/expenses';
    if (currentUrl === baseUrl && this.defaultRoute) {
      this.router.navigateByUrl(this.defaultRoute);
      return;
    }
    const isAllowed = this.navTabs.some(tab => tab.link === currentUrl);
    if (!isAllowed && this.defaultRoute) {
      this.router.navigateByUrl(this.defaultRoute);
    }
  }

  getexpensesheaderbyemployeeid(): void {
     let empId = this.selectemp ?? this.empinfo?.employeeId;
    this.subscription = this.http.getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}&month=${this.seletedMouthly}&year=${this.selectedYear}`,).subscribe({
      next: (data: any) => {
        this.expenesEmplyeedata.next(data);
        this.updateAllFilteredExpenses();
      },
      error(err) {
        console.log('expensesheadererror', err);
      },
    });
  }

  updateNavTabs() {
    this.allTabs[0].count = this.draftsCount;
    this.allTabs[1].count = this.ApprovedCount;
    this.allTabs[2].count = this.pendingCount;
    this.allTabs[3].count = this.processedCount;
    this.allTabs[4].count = this.rejectedCount;
    this.allTabs[5].count = this.requiredClarificationCount;
    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      tab.permission.feature &&
      tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
     this.navTabs = this.menuOrderService.applySavedTabsOrder(
      this.tabsKey,
      this.navTabs,
      tab => tab.tabId
    );
  }

  updateAllFilteredExpenses() {
    const data = this.expenesEmplyeedata.value;
    const drafts = data.filter(x => x.status === 'Draft').reverse();
    const approved = data.filter(x => x.status === 'Approved').reverse();
    const pending = data.filter(x => x.status === 'Waiting for Approval').reverse();
    const processed = data.filter(x => x.status === 'Processed').reverse();
    const rejected = data.filter(x => x.status === 'Rejected').reverse();
    const requiredClarification = data.filter(x => x.status === 'Required Clarification').reverse();
    this.flitredDrafts.next(drafts);
    this.flitredapproved.next(approved);
    this.flitredpending.next(pending);
    this.processedExpenses.next(processed);
    this.flitredrejected.next(rejected);
    this.flitredrequiredClarification.next(requiredClarification);
    this.requiredClarificationCount = requiredClarification.length;
    this.draftsCount = drafts.length;
    this.ApprovedCount = approved.length;
    this.pendingCount = pending.length;
    this.processedCount = processed.length;
    this.rejectedCount = rejected.length;

    this.updateNavTabs();
  }

  trackByTabId(_: number, tab: StatusTab): string {
    return tab.tabId;
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

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

@Component({
  selector: 'app-on-behalf-of-expenses-tabs',
  imports: [RouterModule, CommonModule, TabsModule, TranslateModule],
  templateUrl: './on-behalf-of-expenses-tabs.component.html',
  styleUrl: './on-behalf-of-expenses-tabs.component.scss'
})
export class OnBehalfOfExpensesTabsComponent {
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
      label: 'Waiting For Approval',
      link: 'waiting-for-approval',
      icon: '/time-off-icon/waiting-for-approval-icon.png',
      permission: { feature: 'Waiting For Approval (On Behalf Of Expenses)', action: 'view' },
      count: this.pendingCount
    },
    {
      label: 'Approved',
      link: 'approved',
      icon: '/time-off-icon/approved-icon.png',
      permission: { feature: 'Approved (On Behalf Of Expenses)', action: 'view' },
      count: this.ApprovedCount
    },
    {
      label: 'Processed',
      link: 'processed',
      icon: '/time-off-icon/processed-icon.png',
      permission: { feature: 'Processed (On Behalf Of Expenses)', action: 'view' },
      count: this.processedCount
    },
    {
      label: 'Rejected',
      link: 'rejected',
      icon: '/time-off-icon/rejected-icon.png',
      permission: { feature: 'Rejected (On Behalf Of Expenses)', action: 'view' },
      count: this.rejectedCount
    },
  ];

  constructor(private http: HttpService, private rbac: RbacService, private router: Router, private SelectedyeartimeOffService: TimeoffYearFilterService) {
  }
  ngOnInit(): void {

    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      tab.permission.feature &&
      tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
    if (this.navTabs.length > 0) {
      this.defaultRoute = this.navTabs[0].link;
    }
    const currentUrl = this.router.url;
    const baseUrl = '/on-behalf-of/on-behalf-of-expenses';
    if (currentUrl === baseUrl && this.defaultRoute) {
      this.router.navigateByUrl(this.defaultRoute);
      return;
    }
    const isAllowed = this.navTabs.some(tab => tab.link === currentUrl);
    if (!isAllowed && this.defaultRoute) {
      this.router.navigateByUrl(this.defaultRoute);
    }


    this.http.selectedEmployeeIdExpensesforonbehalf$.subscribe((id) => {
      if (id) {
        this.selectemp = id;
     
        this.getexpensesheaderbyemployeeid();
      } else {
        this.selectemp = null;
        this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
        this.getexpensesheaderbyemployeeid();
      }
    });

    this.http.expensesprocesscountOnBehalfof$.subscribe(() => {
      
      this.getexpensesheaderbyemployeeid();
    });
  }

  getexpensesheaderbyemployeeid(): void {  
    const empId = this.selectemp;
    const year = this.selectedYear ?? new Date().getFullYear();
    const month = this.seletedMouthly ?? new Date().getMonth() + 1;
    this.subscription = this.http.getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}`,).subscribe({
      next: (data: any) => {
        this.expenesEmplyeedata.next(data);
        this.updateAllFilteredExpenses();
      }, error: (err: any) => {
        this.loading = false;
        this.expenesEmplyeedata.next([]);
      },
      complete: () => {
        this.loading = false;
      },
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
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}

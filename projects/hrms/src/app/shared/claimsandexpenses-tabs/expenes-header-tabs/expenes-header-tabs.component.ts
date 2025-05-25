import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { IExpense } from '../../../Interfaces/claimsandexpenses.model';
import { HttpService } from '../../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-expenes-header-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './expenes-header-tabs.component.html',
  styleUrl: './expenes-header-tabs.component.scss'
})

export class ExpenesHeaderTabsComponent implements OnInit, OnDestroy {
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
  public navTabs: any[] = [];
  public defaultRoute: string = '';
  private allTabs = [
    { label: 'Draft', link: '/claimsandexpenses/expenses/draft', icon: '/time-off-icon/waiting-for-approval-icon.png', permission: { feature: 'Draft Tab', action: 'view' }, count: this.draftsCount },
    { label: 'Approved', link: '/claimsandexpenses/expenses/approved', icon: '/time-off-icon/approved-icon.png', permission: { feature: 'Approved Tab', action: 'view' }, count: this.ApprovedCount },
    { label: 'Pending', link: '/claimsandexpenses/expenses/pending', icon: '/time-off-icon/waiting-for-approval-icon.png', permission: { feature: 'Pending Tab', action: 'view' }, count: this.pendingCount },
    { label: 'Processed', link: '/claimsandexpenses/expenses/processed', icon: '/time-off-icon/processed-icon.png', permission: { feature: 'Processed Tab', action: 'view' }, count: this.processedCount },
    { label: 'Rejected', link: '/claimsandexpenses/expenses/rejected', icon: '/time-off-icon/rejected-icon.png', permission: { feature: 'Rejected Tab', action: 'view' }, count: this.rejectedCount }
  ];

  constructor(private http: HttpService, private rbac: RbacService, private router: Router) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
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
    const baseUrl = '/claimsandexpenses/expenses';
    if (currentUrl === baseUrl && this.defaultRoute) {
      this.router.navigateByUrl(this.defaultRoute);
      return;
    }
    const isAllowed = this.navTabs.some(tab => tab.link === currentUrl);
    if (!isAllowed && this.defaultRoute) {
      this.router.navigateByUrl(this.defaultRoute);
    }
    this.getexpensesheaderbyemployeeid(this.empinfo.employeeid);
  }

  getexpensesheaderbyemployeeid(_employeeId: number): void {
    const params = this.empinfo.employeeId;
    this.subscription = this.http.getDatabyid(`Expenses_Header/gettotalamount`, params).subscribe({
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
    this.navTabs = this.allTabs.filter(tab =>
      tab.permission &&
      tab.permission.feature &&
      tab.permission.action &&
      this.rbac.allowedToAccess(`${tab.permission.feature}.${tab.permission.action}`)
    );
  }

  updateAllFilteredExpenses() {
    const data = this.expenesEmplyeedata.value;
    const drafts = data.filter(x => x.status === 'Draft').reverse();
    const approved = data.filter(x => x.status === 'Approved').reverse();
    const pending = data.filter(x => x.status === 'Waiting for Approval').reverse();
    const processed = data.filter(x => x.status === 'Processed').reverse();
    const rejected = data.filter(x => x.status === 'Rejected').reverse();
    this.flitredDrafts.next(drafts);
    this.flitredapproved.next(approved);
    this.flitredpending.next(pending);
    this.processedExpenses.next(processed);
    this.flitredrejected.next(rejected);
    this.draftsCount = drafts.length;
    this.ApprovedCount = approved.length;
    this.pendingCount = pending.length;
    this.processedCount = processed.length;
    this.rejectedCount = rejected.length;
    this.updateNavTabs();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

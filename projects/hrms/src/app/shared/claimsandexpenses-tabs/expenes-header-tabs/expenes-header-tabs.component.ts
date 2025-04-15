import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { IExpense } from '../../../Interfaces/claimsandexpenses.model';
import { HttpService } from '../../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';

@Component({
  selector: 'app-expenes-header-tabs',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './expenes-header-tabs.component.html',
  styleUrl: './expenes-header-tabs.component.scss'
})
export class ExpenesHeaderTabsComponent implements OnInit ,OnDestroy{
  subscription!:Subscription

  empinfo: any;
  expenesEmplyeedata=new BehaviorSubject<IExpense[]>([]) 
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
  navTabs: any[] = [
    { label: 'Draft', link: '/claimsandexpenses/expenses/draft', count: this.draftsCount },
    { label: 'Approved', link: '/claimsandexpenses/expenses/approved', count: this.ApprovedCount },
    { label: 'Pending', link: '/claimsandexpenses/expenses/pending', count: this.pendingCount },
    { label: 'Processed', link: '/claimsandexpenses/expenses/processed', count: this.processedCount },
    { label: 'Rejected', link: '/claimsandexpenses/expenses/rejected', count: this.rejectedCount }
  ];
  constructor(
    private http: HttpService ) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')
    this.getexpensesheaderbyemployeeid(this.empinfo.employeeid)
  }


  getexpensesheaderbyemployeeid(_employeeId: number): void {
    //params
    const params = this.empinfo.employeeId;

    this.subscription = this.http
      .getDatabyid(`Expenses_Header/gettotalamount`, params).subscribe({
        next: (data: any) => {
          this.expenesEmplyeedata.next(data);
          this.updateAllFilteredExpenses();
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  updateNavTabs() {
    this.navTabs = [
      { label: 'Draft', link: '/claimsandexpenses/expenses/draft', count: this.draftsCount },
      { label: 'Approved', link: '/claimsandexpenses/expenses/approved', count: this.ApprovedCount },
      { label: 'Pending', link: '/claimsandexpenses/expenses/pending', count: this.pendingCount },
      { label: 'Processed', link: '/claimsandexpenses/expenses/processed', count: this.processedCount },
      { label: 'Rejected', link: '/claimsandexpenses/expenses/rejected', count: this.rejectedCount }
    ];
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
      this.subscription.unsubscribe()
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { HttpService } from '../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { DateformatPipe } from "../../pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-desk-history',
  imports: [CommonModule, RouterModule, TabsModule, DateformatPipe, NoDataFoundComponent, TranslateModule, TableModule],
  templateUrl: './desk-history.component.html',
  styleUrl: './desk-history.component.scss'
})

export class DeskHistoryComponent implements OnInit,OnDestroy {
  @ViewChild('deskHistoryTable') deskHistoryTable!: Table;
  subscription!: Subscription;
  deskResponse: any;
  originalDeskHistory = [] as any[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  navTabs = [
    { label: 'Desk Details', icon: '/desk-icon/details-icon.png', route: '/desk/view-desk/desk-data', },
    { label: 'Desk History', icon: '/desk-icon/History-icon.png', route: '/desk/view-desk/desk-history', },
  ];
  deskid: any;
  transtiondesk = new BehaviorSubject<any[]>([]);
  inactivedesk = new BehaviorSubject<any[]>([]);

  constructor(private readonly http: HttpService,
    public readonly route: ActivatedRoute,
    public router: Router) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.deskid = params.get('id');
      if (this.deskid) {
        this.viewdata(this.deskid);
      }
    });
  }

  viewdata(data: any) {
    this.subscription = this.http.getData(`DeskAllocationHeader/ById?id=${this.deskid}`).subscribe({
      next: (response: any) => {
        this.deskResponse = response;
        const historyData = response.items;
        this.transtiondesk.next(historyData);
        this.originalDeskHistory = [...historyData];
        this.inactivedesk.next(response.deskHistory);
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
  }

  navigateassets() {
    this.router.navigate(['/desk/management/available-desks']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  getFilteredAndSortedDeskHistory(): any[] {
    return this.transtiondesk.getValue();
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.transtiondesk.next([...this.originalDeskHistory]);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.deskHistoryTable) {
          this.deskHistoryTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle nested fields and dates
      if (field === 'employeeName') {
        val1 = a.employee?.name;
        val2 = b.employee?.name;
      } else if (field === 'assignedBy') {
        val1 = a.assignedBy?.name;
        val2 = b.assignedBy?.name;
      } else if (field === 'allocatedDate' || field === 'releasedDate') {
        val1 = new Date(a[field]);
        val2 = new Date(b[field]);
        return event.order * (val1.getTime() - val2.getTime());
      } else {
        // Handle direct fields
        val1 = a[field];
        val2 = b[field];
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-desk',
  imports: [CommonModule, DateformatPipe, NoDataFoundComponent,TranslateModule, DataLoaderContentComponent, TableModule],
  templateUrl: './desk.component.html',
  styleUrl: './desk.component.scss'
})
export class DeskComponent implements OnInit, OnDestroy {
  @ViewChild('deskTable') deskTable!: Table;
  empinfo: any;
  subscription!: Subscription
  loading = false
  deskdata = new BehaviorSubject<any>([]);
  originalDeskData = [] as any[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  constructor(private http: HttpService,
    private router: Router,

  ) { }
  ngOnInit() {
    this.getEmpInfoFromRoute();

  }


  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getdesk();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getdesk();
    }
  }
  getdesk() {
    this.loading = true
    let EmpId = parseInt(this.empinfo.employeeId);
    console.log(EmpId);
    this.subscription = this.http
      .getData(`DeskAllocationItem/Employeeid?employeeid=${EmpId}`)
      .subscribe({
        next: (data: any) => {
          this.loading = false
          this.deskdata.next(data);
          this.originalDeskData = [...data];
        },
        error: (err: any) => {
          this.loading = false
          console.log(err);
        },
      });
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
        this.deskdata.next([...this.originalDeskData]);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.deskTable) {
          this.deskTable.reset();
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

      // Handle direct fields
      val1 = a[field];
      val2 = b[field];

      // Handle date fields
      if (['allocationDate', 'deallocationDate'].includes(field)) {
        if (!val1 && !val2) return 0;
        if (!val1) return event.order * 1; // null dates go to end
        if (!val2) return event.order * -1;
        
        const date1 = new Date(val1);
        const date2 = new Date(val2);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

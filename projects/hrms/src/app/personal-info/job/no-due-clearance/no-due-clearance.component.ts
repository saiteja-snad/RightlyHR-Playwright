import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, BehaviorSubject } from 'rxjs';

import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { Ipersonal } from '../../../Interfaces/personal-modal';

import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-no-due-clearance',
  imports: [NoDataFoundComponent, CommonModule,
    TranslateModule,
    NgbPopoverModule,
    ReactiveFormsModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    RouterModule,
    NoDataFoundComponent, DataLoaderContentComponent, TableModule],
  templateUrl: './no-due-clearance.component.html',
  styleUrl: './no-due-clearance.component.scss'
})
export class NoDueClearanceComponent implements OnInit, OnDestroy {
  @ViewChild('noDueTable') noDueTable!: Table;
  subscription!: Subscription
  nodue_Clearance_Details = new BehaviorSubject<any[]>([]);
  originalNoDueData = [] as any[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  nodueapprovalcount!: any;
  empinfo = {} as Ipersonal;
  empdata = {} as Ipersonal;
  lineOrder = false;
  loading = false
  constructor(


    private http: HttpService,
    private router: Router,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
    public permissionRouteService: AccessForEmployeeinfoService,
  ) {
    // Initialize any required services or dependencies here
  }
  ngOnInit(): void {
    this.getEmpInfoFromRoute();

  }

  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getNodueClearance();
      this.getEmployeeId();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getNodueClearance();
      this.getEmployeeId();
    }
  }
  //function to pass the employeeid
  onsubmission(Value: any) {
    this.http.tirggerCountSignal.update((status) => ({
      ...status,
      employeeId: Value,
    }));

    localStorage.setItem('no-due-data', JSON.stringify(Value));
  }
  //function to get employee by id
  getEmployeeId() {
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.empdata = data as Ipersonal;
        },
        error: (err: any) => {
          console.log(err);
          this.conformationPopup.openErrorModal('Insertion of data faild');
        },
      });
  }
  //function to get the nodue data
  allApproved = false;
  nodueapprovedcount = 0;
  // getNodueClearance() {
  //   this.loading = true
  //   const employeeId = parseInt(this.empinfo.employeeId)
  //   this.subscription = this.http.getData(`NoDueClearanceForm/getByEmployeeId/${employeeId}`).subscribe({
  //     next: (data: any) => {
  //       this.loading = false
  //       this.nodue_Clearance_Details.next(data);
  //       const totalCount = data.filter((ele: any) => (ele.subStatus?.toLowerCase() !== 'rerequested')).length;
  //       const approvedCount = data.filter((ele: any) => (ele.status?.toLowerCase() === 'approved')).length;
  //       this.nodueapprovedcount = approvedCount;
  //       this.allApproved = totalCount > 0 && approvedCount === totalCount;
  //       this.nodueapprovalcount = data.length
  //       if (data.length > 0) {
  //         const lineOrders = data.map((item: any) => item.lineOrder);
  //         const highestLineOrder = Math.max(...lineOrders);
  //         if (highestLineOrder == this.nodueapprovalcount) {
  //           this.lineOrder = true
  //           console.log(this.lineOrder);

  //         }
  //       }
  //     }, error: (err) => {
  //       this.loading = false
  //     }
  //   })
  // }

  getNodueClearance() {
  this.loading = true;
  const employeeId = parseInt(this.empinfo.employeeId);

  this.subscription = this.http.getData(`NoDueClearanceForm/getByEmployeeId/${employeeId}`).subscribe({
    next: (data: any) => {
      this.loading = false;
      this.nodue_Clearance_Details.next(data);
      this.originalNoDueData = [...data];

      // Filter out re-requested
      const validItems = data.filter((ele: any) => ele.subStatus?.toLowerCase() !== 'rerequested');
      const approvedCount = validItems.filter((ele: any) => ele.status?.toLowerCase() === 'approved').length;

      this.nodueapprovedcount = approvedCount;
      this.allApproved = validItems.length > 0 && approvedCount === validItems.length;

      this.nodueapprovalcount = data.length;

      if (data.length > 0) {
        const uniqueLineOrders = new Set<number>(data.map((item: any) => Number(item.lineOrder)));
        const highestLineOrder = Math.max(...Array.from(uniqueLineOrders));
        this.lineOrder = highestLineOrder === uniqueLineOrders.size;
        console.log('lineOrder:', this.lineOrder);
      }
    },
    error: (err) => {
      this.loading = false;
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
        this.nodue_Clearance_Details.next([...this.originalNoDueData]);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.noDueTable) {
          this.noDueTable.reset();
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
      if (['createdAt', 'updatedAt'].includes(field)) {
        if (!val1 && !val2) return 0;
        if (!val1) return event.order * 1; // null dates go to end
        if (!val2) return event.order * -1;
        
        const date1 = new Date(val1);
        const date2 = new Date(val2);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle numeric fields
      if (['lineOrder'].includes(field)) {
        const num1 = parseInt(String(val1)) || 0;
        const num2 = parseInt(String(val2)) || 0;
        return event.order * (num1 - num2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }


  rerequestFornoDue(Value: any) {

    let noduereq = {
      parentId: Value.id
    };
    this.subscription = this.http.postdata(`NoDueClearanceForm/re-request/${Value.id}`, noduereq).subscribe({
      next: (data: any) => {
        console.log(data);
        this.conformationPopup.openSuccessModal('No Due requested successfully');
        this.getNodueClearance();
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('Re Request Failed')
      },
    })
  }
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

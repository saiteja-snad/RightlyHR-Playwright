import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { LeaveEntitlementSideBarComponent } from "../../../shared/leave-entitlement-side-bar/leave-entitlement-side-bar.component";
import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { ICategoryDetails, IEmployees } from '../flexible-leave-allocation/leave-allocation.model';
import { TranslateModule } from '@ngx-translate/core';
import { Select, SelectModule } from 'primeng/select';


@Component({
  selector: 'app-load-entilements-alloction',
  imports: [RouterModule, CommonModule, TranslateModule, Select, SelectModule, PaginatorModule, FormsModule, NgbPopoverModule, LeaveEntitlementSideBarComponent, DataLoaderContentComponent, NoDataFoundComponent, InfoIconComponent, ReactiveFormsModule],
  templateUrl: './load-entilements-alloction.component.html',
  styleUrl: './load-entilements-alloction.component.scss'
})
export class LoadEntilementsAlloctionComponent {
  loading = false;
  subscription!: Subscription;
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  destroy$: Subject<boolean> = new Subject<boolean>();
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  jobid: any;
  jobSummary: any = {};
  employees: any[] = [];
  categoryDetails = [] as ICategoryDetails[];
  employeeDetails = [] as IEmployees[];
  selectedEmployee: any;
  selectedCategory: any;
  isApplyDisabledFlag = true;
  leaveAllocationForm!: FormGroup;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpService,
    private offcanvasService: NgbOffcanvas,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.initilaiztionFrom();
    this.route.queryParams.subscribe((params) => {
      const jobid = params['id'];
      if (jobid) {
        this.jobid = jobid;
        this.getdatacarryforword();
      }

    });

  }
  initilaiztionFrom() {
    this.leaveAllocationForm = this.fb.group({
      categoryName: [null,],
      employeeName: [null,],
    });
    this.leaveAllocationForm.valueChanges.subscribe(() => {
      this.isApplyDisabledFlag = this.checkIfFormIsEmpty();
    });
  }

  checkIfFormIsEmpty(): boolean {
    const v = this.leaveAllocationForm.value;
    return !(
      v.categoryName ||
      v.employeeName

    );
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getdatacarryforword();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getdatacarryforword();
  }

  onSelectedEmployee(event: any) {
    this.selectedEmployee = event.employeeId;
    this.getdatacarryforword();
  }

  changeCategory(event: any) {
    console.log(event)
    this.selectedCategory = event.id;
    this.getdatacarryforword();
  }
  clearFilters() {
    this.selectedEmployee = null;
    this.selectedCategory = null;
    this.leaveAllocationForm.reset();
    this.getdatacarryforword();
  }

  getdatacarryforword() {
    const params = [
      `pageNumber=${this.page}`,
      `pageSize=${this.pageSize}`,
    ];

    if (this.selectedEmployee) {
      params.push(`employeeId=${this.selectedEmployee}`);
    }

    if (this.selectedCategory) {
      params.push(`leaveCategoryId=${this.selectedCategory}`);
    }

    const url = `LeaveEntitlementJobs/${this.jobid}/details?${params.join('&')}`;
    this.subscription = this.http.get(url).subscribe({
      next: (res: any) => {
        this.jobSummary = res.data.jobSummary;
        this.employees = res.data.employees;
        this.collectionSize = res.pagination.totalRecords;
        this.getAllEmployees();
        this.getCategoryDetails();
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
        this.loading = false
        this.employees = [];
      },
    });

  }

  getCategoryDetails(): void {
    const payload = {
      year: this.jobSummary?.processingYear,
      locationId: this.jobSummary?.locationId,
      subLocationId: this.jobSummary?.subLocationId,
      shiftId: this.jobSummary?.shiftId,
      status: 'Published',
    };

    this.http.getDataWithQueryParams("OrgLeavesCategories", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.categoryDetails = res;

      },
      error: err => {
        console.error('Error fetching categories:', err);

      }
    });
  }

  getAllEmployees() {
    const payload = {
      locationId: this.jobSummary?.locationId,
      subLocationId: this.jobSummary?.subLocationId,
      shiftId: this.jobSummary?.shiftId,
    };
    this.http.getDataWithQueryParams("Employeedata/getAll", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.employeeDetails = res.map((employee: any) => ({
          ...employee,
          fullName: `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`
        }));

      },
      error: err => {
        console.error('Error fetching employees:', err);

      }
    });
  }

}

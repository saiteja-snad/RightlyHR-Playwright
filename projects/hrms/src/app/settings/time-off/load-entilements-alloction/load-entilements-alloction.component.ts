import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { PaginatorModule } from 'primeng/paginator';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ICategoryDetails, IEmployees } from '../flexible-leave-allocation/leave-allocation.model';
import { TranslateModule } from '@ngx-translate/core';
import { Select, SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { OpenModalService } from '../../../services/open-modal.service';
@Component({
  selector: 'app-load-entilements-alloction',
  imports: [RouterModule, CommonModule, TranslateModule, Select, SelectModule, MultiSelectModule, PaginatorModule, FormsModule,
    DataLoaderContentComponent, NoDataFoundComponent, ReactiveFormsModule],
  templateUrl: './load-entilements-alloction.component.html',
  styleUrl: './load-entilements-alloction.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class LoadEntilementsAlloctionComponent implements OnInit, OnDestroy {
  loading = false;
  subscription!: Subscription;
  page = 1;
  pageSize = 25;
  rows = 25;
  collectionSize!: number;
  first = 0;
  destroy$: Subject<boolean> = new Subject<boolean>();
  options = [
    { label: 25, value: 25 },
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 200, value: 200 },
  ];
  jobid: any;
  jobSummary: any = {};
  employees: any[] = [];
  categoryDetails = [] as ICategoryDetails[];
  employeeDetails = [] as IEmployees[];
  selectedEmployee: any[] = [];
  selectedCategory: any[] = [];
  selectedStatus: any[] = [];
  statusOptions = [
    { label: 'Executed', value: 'EXECUTED' },
    {label: 'Pending', value:'PENDING'},
    { label: 'Failed', value: 'FAILED' },
  ];
  selectedCycleEmployee: any = null;
  isApplyDisabledFlag = true;
  leaveAllocationForm!: FormGroup;

  newEmployees: any[] = [];
  selectedNewEmployees: any[] = [];
  loadingNewEmployees = false;
  submittingLoad = false;

  constructor(private route: ActivatedRoute, private http: HttpService, private fb: FormBuilder,
    private modalService: NgbModal, private conformationPopup: OpenModalService) { }

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
      categoryName: [null],
      employeeName: [null],
      status: [null],
    });
    this.leaveAllocationForm.valueChanges.subscribe(() => {
      this.isApplyDisabledFlag = this.checkIfFormIsEmpty();
    });
  }

  checkIfFormIsEmpty(): boolean {
    const v = this.leaveAllocationForm.value;
    return !(
      (Array.isArray(v.categoryName) && v.categoryName.length) ||
      (Array.isArray(v.employeeName) && v.employeeName.length) ||
      (Array.isArray(v.status) && v.status.length)
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

  onSelectedEmployee(values: any[]) {
    this.page = 1;
    this.first = 0;
    this.selectedEmployee = Array.isArray(values) && values.length ? values.map((e: any) => e.employeeId) : [];
    if (!this.selectedEmployee.length) this.leaveAllocationForm.get('employeeName')?.setValue(null, { emitEvent: false });
    this.getdatacarryforword();
  }

  changeCategory(values: any[]) {
    this.page = 1;
    this.first = 0;
    this.selectedCategory = Array.isArray(values) && values.length ? values.map((c: any) => c.id) : [];
    if (!this.selectedCategory.length) this.leaveAllocationForm.get('categoryName')?.setValue(null, { emitEvent: false });
    this.getdatacarryforword();
  }

  onStatusChange(values: any[]) {
    this.page = 1;
    this.first = 0;
    this.selectedStatus = Array.isArray(values) && values.length ? values.map((s: any) => s.value) : [];
    if (!this.selectedStatus.length) this.leaveAllocationForm.get('status')?.setValue(null, { emitEvent: false });
    this.getdatacarryforword();
  }

  clearFilters() {
    this.page = 1;
    this.first = 0;
    this.selectedEmployee = [];
    this.selectedCategory = [];
    this.selectedStatus = [];
    this.leaveAllocationForm.reset();
    this.getdatacarryforword();
  }

  getdatacarryforword() {
    const params = [
      `pageNumber=${this.page}`,
      `pageSize=${this.pageSize}`,
    ];
    if (this.selectedEmployee?.length) {
      params.push(`employeeIds=${this.selectedEmployee.join(',')}`);
    }
    if (this.selectedCategory?.length) {
      params.push(`categoryIds=${this.selectedCategory.join(',')}`);
    }
    if (this.selectedStatus?.length) {
      params.push(`status=${this.selectedStatus.join(',')}`);
    }
    const url = `LeaveEntitlementJobs/${this.jobid}/details?${params.join('&')}`;
    this.subscription = this.http.get(url).subscribe({
      next: (res: any) => {
        this.jobSummary = res.data.jobSummary;
        this.employees = res.data.employees;
        this.collectionSize = res.pagination.totalRecords;
        this.buildEmployeeDropdown();
        this.getCategoryDetails();
        this.getNewEmployees();
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
        this.loading = false
        this.employees = [];
      },
    });
  }

  openCycleModal(content: any, employee: any) {
    this.selectedCycleEmployee = employee;
    this.modalService.open(content, { size: 'lg', centered: true, backdrop: 'static' });
  }

  isCyclePastOrCurrent(cycle: any): boolean {
    return new Date(cycle.cycleStart) <= new Date() && cycle.status === 'PENDING';
  }

  retryCycle(jobid: any, cycle: any) {
    this.http.postbyId(`LeaveEntitlementJobs/${jobid}/retry`).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal("Leave Entitlements added Successfully");
        this.getdatacarryforword();
      },
      error: (err) => {
        console.error(err);
      }
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

  buildEmployeeDropdown(): void {
    const seen = new Set<number>();
    this.employeeDetails = this.employees
      .filter((e: any) => {
        const id = e?.employee?.id;
        if (!id || seen.has(id)) return false;
        seen.add(id);
        return true;
      })
      .map((e: any) => ({
        ...e.employee,
        employeeId: e.employee.id,
        fusionEmpId: e.employee.fusionEmpId ?? '',
        firstName: e.employee.name ?? '',
        middleName: '',
        lastName: '',
        fullName: `${e.employee.fusionEmpId ?? ''} ${e.employee.name ?? ''}`.trim()
      }));
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
          fullName: ` ${employee.fusionEmpId} ${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`
        }));
      },
      error: err => {
        console.error('Error fetching employees:', err);
      }
    });
  }

  getNewEmployees(): void {
    this.loadingNewEmployees = true;
    this.http.get(`LeaveEntitlementJobs/${this.jobid}/new-employees`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loadingNewEmployees = false;
        this.newEmployees = Array.isArray(res?.data?.employees) ? res.data.employees.map((emp: any) => ({
          ...emp,
          fullName: `${emp.fusionEmpId} - ${emp.name ?? ''}`.trim()
        })) : [];
      },
      error: () => { this.loadingNewEmployees = false; this.newEmployees = []; }
    });
  }

  openLoadEmployeesModal(content: any): void {
    this.selectedNewEmployees = [];
    this.modalService.open(content, { size: 'lg', centered: true, backdrop: 'static' });
  }

  loadEmployees(modal: any): void {
    if (!this.selectedNewEmployees.length) return;
    this.submittingLoad = true;
    const payload = { employeeIds: this.selectedNewEmployees.map((e: any) => e.employeeId) };
    this.http.postdata(`LeaveEntitlementJobs/${this.jobid}/load-employees`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.submittingLoad = false;
        modal.dismiss();
        this.conformationPopup.openSuccessModal('Employees loaded successfully.');
        this.getdatacarryforword();
      },
      error: (err: any) => {
        this.submittingLoad = false;
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to load employees.');
      }
    });
  }

   formatLabel(value: string): string {
    return value
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

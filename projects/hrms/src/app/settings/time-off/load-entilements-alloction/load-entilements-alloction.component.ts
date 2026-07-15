import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
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
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
@Component({
  selector: 'app-load-entilements-alloction',
  imports: [RouterModule, CommonModule, TranslateModule, Select, SelectModule, MultiSelectModule, PaginatorModule, FormsModule,
    DataLoaderContentComponent, NoDataFoundComponent, ReactiveFormsModule, NgbPopoverModule, InfoIconComponent],
  templateUrl: './load-entilements-alloction.component.html',
  styleUrl: './load-entilements-alloction.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class LoadEntilementsAlloctionComponent implements OnInit, OnDestroy {
  loading = false;
  subscription!: Subscription;

  destroy$: Subject<boolean> = new Subject<boolean>();
  totalRecords = 0;
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];
  jobid: any;
  jobSummary: any = {};
  employees: any[] = [];
  categoryDetails = [] as ICategoryDetails[];
  allCategoryDetails = [] as ICategoryDetails[];
  employeeDetails = [] as IEmployees[];
  selectedEmployee: any[] = [];
  selectedCategory: any[] = [];
  selectedStatus: any[] = [];
  statusOptions = [
    { label: 'Executed', value: 'EXECUTED' },
    {label: 'Pending', value:'PENDING'},
    { label: 'Queued', value: 'QUEUED' },
    { label: 'Failed', value: 'FAILED' },
  ];
  selectedCycleEmployee: any = null;
  isApplyDisabledFlag = true;
  leaveAllocationForm!: FormGroup;

  newEmployees: any[] = [];
  selectedNewEmployees: any[] = [];
  newCategories: any[] = [];
  selectedNewCategories: any[] = [];
  loadingNewEmployees = false;
  dropdownsInitialized = false;
  submittingLoad = false;
  submittingLoadCategories = false;
  validationErrors: any[] = [];
  validationMessage = '';

  constructor(private route: ActivatedRoute, private http: HttpService, private fb: FormBuilder,
    private modalService: NgbModal, private conformationPopup: OpenModalService, private router: Router) { }

  ngOnInit() {
    this.initilaiztionFrom();
    this.route.queryParams.subscribe((params) => {
      const jobid = params['id'];
      if (jobid) {
        this.jobid = jobid;
        this.dropdownsInitialized = false;
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
    this.selectedEmployee = Array.isArray(values) && values.length ? values.map((e: any) => e.id) : [];
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
        if (!this.dropdownsInitialized) {
          this.buildEmployeeDropdown(res.data.employees);
          this.buildCategoryDropdown(res.data.employees);
          this.dropdownsInitialized = true;
        }
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

  hasRetry(row: any): boolean {
    return (
      row?.requiresRetry === true ||
      (Array.isArray(row?.cycles) && row.cycles.some((c: any) => c?.requiresRetry === true))
    );
  }

  private getPlanId(row: any): number | null {
    const raw = row?.planId;
    const num = typeof raw === 'string' ? Number(raw) : raw;
    return Number.isFinite(num) && num > 0 ? num : null;
  }

  private getRetryPlanIdsFromRow(row: any): number[] {
    const cycles = Array.isArray(row?.cycles) ? row.cycles : [];
    const retryCycles = cycles.filter((c: any) => c?.requiresRetry === true);

    const ids = new Set<number>();
    const addId = (value: any) => {
      const num = typeof value === 'string' ? Number(value) : value;
      if (Number.isFinite(num) && num > 0) ids.add(num);
    };

    if (retryCycles.length) {
      for (const c of retryCycles) addId(this.getPlanId(c));
      return Array.from(ids);
    }

    if (row?.requiresRetry === true && cycles.length) {
      for (const c of cycles) addId(this.getPlanId(c));
      return Array.from(ids);
    }

    if (row?.requiresRetry === true) {
      addId(this.getPlanId(row));
      return Array.from(ids);
    }

    return [];
  }

  retryPlan(jobid: any, row: any) {
    const jobId = Number(jobid);
    if (!Number.isFinite(jobId) || jobId <= 0) return;

    const planIds = this.getRetryPlanIdsFromRow(row);
    if (!planIds.length) {
      this.conformationPopup.openErrorModal('Unable to retry: missing plan id.');
      return;
    }

    const payload = { jobId, planIds };
    this.http.postdata('LeaveEntitlementJobs/retry', payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Retry initiated successfully.');
        this.getdatacarryforword();
      },
      error: (err) => {
        this.conformationPopup.openErrorModal(err?.error?.message || 'Retry failed.');
      }
    });
  }

  retryCyclePlan(jobid: any, cycle: any) {
    const jobId = Number(jobid);
    if (!Number.isFinite(jobId) || jobId <= 0) return;

    const planId = this.getPlanId(cycle);
    if (!planId) {
      this.conformationPopup.openErrorModal('Unable to retry missing plan id.');
      return;
    }

    const payload = { jobId, planIds: [planId] };
    this.http.postdata('LeaveEntitlementJobs/retry', payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Retry initiated successfully.');
        this.getdatacarryforword();
      },
      error: (err) => {
        this.conformationPopup.openErrorModal(err?.error?.message || 'Retry failed.');
      }
    });
  }

  buildEmployeeDropdown(employees: any[]): void {
    const seen = new Set<number>();
    this.employeeDetails = (employees || []).reduce((acc: any[], e: any) => {
      const emp = e?.employee;
      if (emp?.id && !seen.has(emp.id)) {
        seen.add(emp.id);
        acc.push({ ...emp, fullName: `${emp.fusionEmpId ?? ''} ${emp.name ?? ''}`.trim() });
      }
      return acc;
    }, []);
  }

  buildCategoryDropdown(employees: any[]): void {
    const presentIds = new Set((employees || []).map((e: any) => e?.leaveCategoryId).filter(Boolean));
    if (this.allCategoryDetails.length) {
      this.categoryDetails = this.allCategoryDetails.filter((c: any) => presentIds.has(c.id));
    } else {
      this.getCategoryDetails(presentIds);
    }
  }

  getCategoryDetails(filterIds?: Set<number>): void {
    const payload = {
      year: this.jobSummary?.processingYear,
      locationId: this.jobSummary?.locationId,
      subLocationId: this.jobSummary?.subLocationId,
      shiftId: this.jobSummary?.shiftId,
      status: 'Published',
    };
    this.http.getDataWithQueryParams("OrgLeavesCategories", payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.allCategoryDetails = res;
        this.categoryDetails = filterIds ? res.filter((c: any) => filterIds.has(c.id)) : res;
      },
      error: err => {
        console.error('Error fetching categories:', err);
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
        this.newCategories = Array.isArray(res?.data?.categories)
          ? res.data.categories.map((c: any) => ({
            ...c,
            categoryId: c?.categoryId,
            categoryName: c?.categoryName ?? '',
          })).filter((c: any) => c?.categoryId)
          : [];
      },
      error: () => { this.loadingNewEmployees = false; this.newEmployees = []; this.newCategories = []; }
    });
  }

  openLoadEmployeesModal(content: any): void {
    this.selectedNewEmployees = [];
    this.modalService.open(content, { size: 'lg', centered: true, backdrop: 'static' });
  }

  openLoadCategoriesModal(content: any): void {
    this.selectedNewCategories = [];
    this.modalService.open(content, { size: 'lg', centered: true, backdrop: 'static' });
  }

  loadEmployees(modal: any, validationModal: any): void {
    if (!this.selectedNewEmployees.length) return;
    this.submittingLoad = true;
    const payload = { employeeIds: this.selectedNewEmployees.map((e: any) => e.employeeId) };
    this.http.postdata(`LeaveEntitlementJobs/${this.jobid}/load-employees`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.submittingLoad = false;
        modal.dismiss();
        const errors = res?.data?.validationErrors;
        if (Array.isArray(errors) && errors.length > 0) {
          this.validationErrors = errors;
          this.validationMessage = res?.data?.message || 'Some employees were skipped due to validation errors.';
          this.modalService.open(validationModal, { size: 'lg', centered: true, backdrop: 'static' });
        } else {
          this.conformationPopup.openSuccessModal('Employees loaded successfully.');
        }
        this.getdatacarryforword();
      },
      error: (err: any) => {
        this.submittingLoad = false;
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to load employees.');
      }
    });
  }

  loadCategories(modal: any): void {
    if (!this.selectedNewCategories.length) return;
    this.submittingLoadCategories = true;

    const categoryIds = this.selectedNewCategories
      .map((c: any) => c?.categoryId)
      .filter((id: any) => Number.isFinite(Number(id)))
      .map((id: any) => Number(id));

    if (!categoryIds.length) {
      this.submittingLoadCategories = false;
      return;
    }

    const payload: any = {
      flow: 'jobview',
      jobId: Number(this.jobid),
      year: this.jobSummary?.processingYear,
      location: { id: this.jobSummary?.locationId, jobLocationName: this.jobSummary?.location },
      subLocation: { id: this.jobSummary?.subLocationId, jobSubLocationName: this.jobSummary?.subLocation },
      shift: { id: this.jobSummary?.shiftId, shiftName: this.jobSummary?.shiftName },
      category_ids: categoryIds,
      originalBreakdownData: [],
      breakdownData: []
    };

    localStorage.setItem('intialloadEntitlement', JSON.stringify(payload));
    modal.dismiss();
    this.router.navigate(['/settings/timeoff-configurations/intial-leave-entitlements/intial-load-entitlement-breakdown']);
    this.submittingLoadCategories = false;
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
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

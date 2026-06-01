import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, Subscription, Subject, debounceTime, distinctUntilChanged, expand, map, reduce, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { ILocation, ISubLocation, IShiftHeader } from '../../flexible-leave-allocation/leave-allocation.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PaginatorModule } from 'primeng/paginator';
import { Select } from 'primeng/select';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { ModuleInformationComponent } from '../../../../shared/module-information/module-information.component';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { OpenModalService } from '../../../../services/open-modal.service';

@Component({
  selector: 'app-intial-load-entitlement',
  imports: [CommonModule, PaginatorModule, DataLoaderContentComponent, Select, ReactiveFormsModule, TranslateModule, NoDataFoundComponent, FormsModule, ModuleInformationComponent],

  templateUrl: './intial-load-entitlement.component.html',
  styleUrl: './intial-load-entitlement.component.scss'
})
export class IntialLoadEntitlementComponent implements OnInit, OnDestroy {
  loading = false;
  retryingJobId: number | null = null;
  searchQuery = '';
  private searchSubject = new Subject<string>();
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
  subscription!: Subscription;
  jobData: any[] = [];
  leaveAllocationForm!: FormGroup;

  yearsList: number[] = [];
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  shiftDetails = [] as IShiftHeader[];
  isApplyDisabledFlag = true;
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(private http: HttpService, private fb: FormBuilder, private router: Router, private offcanvasService: NgbOffcanvas, private conformationPopup: OpenModalService) { }

  get showActionColumn(): boolean {
    return Array.isArray(this.jobData) && this.jobData.some((x: any) => x?.requiresRetry === true);
  }

  ngOnInit(): void {
    this.getdatacarryforword();
    this.initializefilter();
    this.getAllLocations();
    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(value => {
        this.page = 1;
        this.searchQuery = value;
        this.getdatacarryforword();
      });
  }
  initializefilter() {
    this.leaveAllocationForm = this.fb.group({
      year: ['',],
      location: [''],
      subLocation: [{ value: '', disabled: true },],
      shift: [{ value: '', disabled: true },],
    });
    this.yearsList = this.getYears();
    this.leaveAllocationForm.valueChanges.subscribe(() => {
      this.isApplyDisabledFlag = this.checkIfFormIsEmpty();
    });
  }
  checkIfFormIsEmpty(): boolean {
    const v = this.leaveAllocationForm.value;
    return !(
      v.year ||
      v.location ||
      v.subLocation ||
      v.shift
    );
  }

  activeFilters: any = {};
  applydata() {
    const form = this.leaveAllocationForm.value;
    this.activeFilters = {}; // reset old filters
    if (form.year) this.activeFilters.years = form.year.year || form.year;
    if (form.location) this.activeFilters.locationIds = form.location.id;
    if (form.subLocation) this.activeFilters.subLocationIds = form.subLocation.id;
    if (form.shift) this.activeFilters.shiftIds = form.shift.id;
    this.page = 1;
    this.first = 0;
    this.getdatacarryforword(); // NOW table loads using filters
    this.offcanvasService.dismiss();
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
  resetForm() {
    this.leaveAllocationForm.reset();
    this.isApplyDisabledFlag = true;

    // 3. Remove active filters
    this.subLocationDetails = [];
    this.shiftDetails = [];
    this.activeFilters = {};
    this.getdatacarryforword();
    //localStorage.removeItem(l)
  }
  onSearchChange(value: string) {
    this.searchSubject.next(value);
  }
  getdatacarryforword() {
    const params: any = {
      pageNumber: this.page,
      pageSize: this.pageSize,
      jobType: 'Initial Load',
      searchTerm: this.searchQuery,
      ...this.activeFilters   // merge filters here
    };

    const query = new URLSearchParams(params).toString();
    let url = `LeaveEntitlementJobs?${query}`;

    this.subscription = this.http.get(url).subscribe({
      next: (res: any) => {
        this.jobData = res?.data;
        this.collectionSize = res.pagination.totalRecords;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
        this.jobData = [];
      },
    });
  }

  isFilterApplied(): boolean {
    const formValue = this.leaveAllocationForm?.value;
    // Check if any filter (except date & employee) has value
    return (
      (formValue?.year) ||
      (formValue?.location && formValue?.location.jobLocationName?.length > 0) ||
      (formValue?.subLocation && formValue?.subLocation.jobSubLocationName?.length > 0) ||
      (formValue?.shift && formValue?.shift.shiftName?.length > 0)
    );
  }

  private getYears(): number[] {
    const currentYear = new Date().getFullYear();
    let yearsList: number[] = []
    for (let i = -1; i < 11; i++) {
      yearsList.push(currentYear + i);
    }
    return yearsList;
  }

  enableLocation(): void {
    if (this.leaveAllocationForm.get('year')?.value) {
      this.leaveAllocationForm.get('location')?.enable();
    }
  }

  private getAllLocations(): void {
    this.http.getData('JobLocation').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => this.locationDetails = res.jobLocations || [],
      error: err => console.error('Error fetching locations:', err)
    });
  }

  onLocationChange(location: ILocation): void {
    if (location?.jobSubLocations?.length) {
      this.subLocationDetails = location.jobSubLocations;
      this.leaveAllocationForm.get('subLocation')?.enable();
      this.leaveAllocationForm.get('subLocation')?.reset();
    } else {
      this.subLocationDetails = [];
      this.leaveAllocationForm.get('subLocation')?.enable();
      this.leaveAllocationForm.get('subLocation')?.reset();
    }
  }

  getAllShifts(subLocation: ISubLocation): void {
    const params = {
      locationId: subLocation.jobLocationId,
      subLocationId: subLocation.id
    };
    this.http.getDataWithQueryParams(`orgShifts/getshiftlocation`, params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.shiftDetails = res.flatMap((header: any) => header.orgShiftsItems || []);
        this.leaveAllocationForm.get('shift')?.enable();
      },
      error: err => {
        console.error('Error fetching shifts:', err);
        this.shiftDetails = [];
        this.leaveAllocationForm.get('shift')?.reset();
        this.leaveAllocationForm.get('shift')?.disable();
      }
    });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
    this.leaveAllocationForm.reset();
    this.getdatacarryforword();

  }
  resetFormdata() {
    this.leaveAllocationForm.reset();
    this.isApplyDisabledFlag = true;

    // 3. Remove active filters
    this.activeFilters = {};
    this.getdatacarryforword();
    this.offcanvasService.dismiss();

  }
  navigateView(jobId: number) {
    this.router.navigate(['/settings/timeoff-configurations/jobview'], { queryParams: { id: jobId } });
  }
  toggleFilters(content: TemplateRef<any>) {

    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
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

  private extractRetryPlanIds(employees: any[]): number[] {
    if (!Array.isArray(employees)) return [];
    const ids = new Set<number>();
    for (const row of employees) {
      const needsRetry =
        row?.requiresRetry === true ||
        (Array.isArray(row?.cycles) && row.cycles.some((c: any) => c?.requiresRetry === true));
      if (!needsRetry) continue;

      const planIds = this.getRetryPlanIdsFromRow(row);
      for (const id of planIds) ids.add(id);
    }
    return Array.from(ids);
  }

  private collectRetryPlanIdsForJob(jobId: number) {
    const pageSize = 500;
    const urlForPage = (pageNumber: number) =>
      `LeaveEntitlementJobs/${jobId}/details?pageNumber=${pageNumber}&pageSize=${pageSize}`;

    return this.http.get(urlForPage(1)).pipe(
      expand((res: any) => {
        const pagination = res?.pagination;
        const hasNext =
          pagination?.hasNextPage === true ||
          (Number.isFinite(pagination?.currentPage) &&
            Number.isFinite(pagination?.totalPages) &&
            pagination.currentPage < pagination.totalPages);
        if (!hasNext) return EMPTY;
        const nextPage =
          Number.isFinite(pagination?.nextPage) && pagination.nextPage > 0
            ? pagination.nextPage
            : (pagination?.currentPage ?? 1) + 1;
        return this.http.get(urlForPage(nextPage));
      }),
      map((res: any) => this.extractRetryPlanIds(res?.data?.employees)),
      reduce((acc: Set<number>, ids: number[]) => {
        for (const id of ids) acc.add(id);
        return acc;
      }, new Set<number>()),
      map((set: Set<number>) => Array.from(set))
    );
  }

  postretryrecoder(jobid: any) {
    const jobId = Number(jobid);
    if (!Number.isFinite(jobId) || jobId <= 0) return;

    this.retryingJobId = jobId;
    this.collectRetryPlanIdsForJob(jobId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (planIds: number[]) => {
        if (!planIds.length) {
          this.retryingJobId = null;
          this.conformationPopup.openErrorModal('No records available to retry.');
          return;
        }

        const payload = { jobId, planIds };
        this.http.postdata('LeaveEntitlementJobs/retry', payload).pipe(takeUntil(this.destroy$)).subscribe({
          next: () => {
            this.retryingJobId = null;
            this.conformationPopup.openSuccessModal('Retry initiated successfully.');
            this.getdatacarryforword();
          },
          error: (err) => {
            this.retryingJobId = null;
            this.conformationPopup.openErrorModal(err?.error?.message || 'Retry failed.');
          }
        });
      },
      error: (err) => {
        this.retryingJobId = null;
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to prepare retry payload.');
      }
    });
  }



  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

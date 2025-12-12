import { CommonModule } from '@angular/common';
import { Component, TemplateRef } from '@angular/core';
import { PaginatorModule } from 'primeng/paginator';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { ILocation, IShiftHeader, ISubLocation } from '../../flexible-leave-allocation/leave-allocation.model';
import { Select } from 'primeng/select';
import { ModuleInformationComponent } from "../../../../shared/module-information/module-information.component";

@Component({
  selector: 'app-carry-forward-leave-entitlement',
  imports: [CommonModule, PaginatorModule, DataLoaderContentComponent, Select, ReactiveFormsModule, TranslateModule, NoDataFoundComponent, FormsModule, ModuleInformationComponent],
  templateUrl: './carry-forward-leave-entitlement.component.html',
  styleUrl: './carry-forward-leave-entitlement.component.scss'
})
export class CarryForwardLeaveEntitlementComponent {
  loading = false;
  searchQuery = ''
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
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
  constructor(private http: HttpService, private fb: FormBuilder, private router: Router, private offcanvasService: NgbOffcanvas) { }

  ngOnInit(): void {
    this.getdatacarryforword();
    this.initializefilter();
    this.getAllLocations();
  }
  initializefilter() {
    this.leaveAllocationForm = this.fb.group({
      year: ['', Validators.required],
      location: [{ value: '', disabled: true }, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
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
    this.closeCanvas();
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
    this.activeFilters = {};
    this.getdatacarryforword();
    //localStorage.removeItem(l)
  }
  onSearchChange(value: string) {
    this.page = 1;   // reset to page 1 when searching
    this.searchQuery = value;
    this.getdatacarryforword();
  }

  // getdatacarryforword() {
  //   let url = `LeaveEntitlementJobs?pageNumber=${this.page}&pageSize=${this.pageSize}&searchTerm=${this.searchQuery}`
  //   this.subscription = this.http.get(url).subscribe({
  //     next: (res: any) => {
  //       this.jobData = res?.data;
  //       this.collectionSize = res.pagination.totalRecords;
  //     },
  //     error: (err) => {
  //       console.error('Error fetching projects:', err);
  //       this.loading = false
  //       this.jobData = [];
  //     },
  //   });

  // }
  getdatacarryforword() {
    const params: any = {
      pageNumber: this.page,
      pageSize: this.pageSize,
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
      (formValue?.year && formValue?.year?.length > 0) ||
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
  }
  navigateView(jobId: number) {
    this.router.navigate(['/settings/timeoff-configurations/jobview'], { queryParams: { id: jobId } });
  }
  toggleFilters(content: TemplateRef<any>) {

    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }
}

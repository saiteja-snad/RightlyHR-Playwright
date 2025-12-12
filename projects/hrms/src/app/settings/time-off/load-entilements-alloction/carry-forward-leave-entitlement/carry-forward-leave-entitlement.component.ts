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

@Component({
  selector: 'app-carry-forward-leave-entitlement',
  imports: [CommonModule, PaginatorModule, DataLoaderContentComponent,Select,ReactiveFormsModule, TranslateModule, NoDataFoundComponent, FormsModule],
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
  destroy$: Subject<boolean> = new Subject<boolean>();
  constructor(private http: HttpService, private fb: FormBuilder, private router: Router, private offcanvasService: NgbOffcanvas) { }

  ngOnInit(): void {
    this.getdatacarryforword()
    this.leaveAllocationForm = this.fb.group({
      year: ['', Validators.required],
      location: [{ value: '', disabled: true }, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      shift: [{ value: '', disabled: true }, Validators.required],
    });
    this.getAllLocations();
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

  onSearchChange(value: string) {
    this.page = 1;   // reset to page 1 when searching
    this.searchQuery = value;
    this.getdatacarryforword();
  }

  getdatacarryforword() {
    let url = `LeaveEntitlementJobs?pageNumber=${this.page}&pageSize=${this.pageSize}&searchTerm=${this.searchQuery}`
    this.subscription = this.http.get(url).subscribe({
      next: (res: any) => {
        this.jobData = res?.data;
        this.collectionSize = res.pagination.totalRecords;
      },
      error: (err) => {
        console.error('Error fetching projects:', err);
        this.loading = false
        this.jobData = [];
      },
    });

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

  navigateView(jobId: number) {
    this.router.navigate(['/settings/timeoff-configurations/jobview'], { queryParams: { id: jobId } });
  }
  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }


}

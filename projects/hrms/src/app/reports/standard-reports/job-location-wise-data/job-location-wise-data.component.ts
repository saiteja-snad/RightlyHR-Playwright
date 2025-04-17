import { Component, OnDestroy, OnInit } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { ILocation, ILocationReportData, ISubLocation } from './location-reports.model';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { ReportsService } from '../../../services/reports/reports.service';

@Component({
  selector: 'app-job-location-wise-data',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxDaterangepickerBootstrapDirective, SelectModule, TranslateModule],
  templateUrl: './job-location-wise-data.component.html',
  styleUrls: ['./job-location-wise-data.component.scss']
})
export class JobLocationWiseDataComponent implements OnInit, OnDestroy {
  locationReportsForm!: FormGroup;
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  locationReportList = [] as ILocationReportData[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  ngOnInit(): void {
    this.initializeForm();
    // this.handleFormValueChanges();
    this.getStandardReports();
    this.getAllLocations();
  }

  constructor(
    private reports: ReportsService,
    private http: HttpService,
    private fb: FormBuilder
  ) {}

  initializeForm() {
    this.locationReportsForm = this.fb.group({
      dateOfJoining: [null, Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required]
    });
  }

  get dateOfJoiningControl(): FormControl {
    return this.locationReportsForm.get('dateOfJoining') as FormControl;
  }
  
  getAllLocations(): void {
    this.reports.getJobLocations().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => this.locationDetails = res.jobLocations || [],
      error: err => console.error('Error fetching locations:', err)
    });
  }

  ranges: any = {
    Today: [dayjs(), dayjs()],
    Yesterday: [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  };

  localeOptions: any = {
    applyLabel: 'ok',
    format: environment.dateformat.toUpperCase(),
    direction: 'ltr',
    clearLabel: 'Clear',
  };

  enableLocation(): void {
    console.log(this.locationReportsForm.get('dateOfJoining')?.value);
    if (this.locationReportsForm.get('dateOfJoining')?.value) {
      this.getAllLocations();
      this.locationReportsForm.get('location')?.enable();
    }
  }

  onLocationChange(location: ILocation): void {
    if (location?.jobSubLocations?.length) {
      this.getSubLocations(location);
      this.locationReportsForm.get('subLocation')?.enable();
    } else {
      this.subLocationDetails = [];
      this.locationReportsForm.get('subLocation')?.enable();
      this.locationReportsForm.get('subLocation')?.reset();
    }
  }

  getSubLocations(location: ILocation) {
    this.http.getData(`JobLocation/sub-location-by-joblocation/${location.id}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => this.subLocationDetails = res.jobSubLocations || [],
      error: err => console.error('Error fetching locations:', err)
    });
  }

  private handleFormValueChanges(): void {
    const form = this.locationReportsForm;

    const resetAndDisable = (controls: string[]) => {
      controls.forEach(control => {
        form.get(control)?.reset();
        form.get(control)?.disable();
      });
    };

    form.get('dateOfJoining')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        form.get('location')?.reset();
        resetAndDisable(['subLocation']);
      });

    form.get('location')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        resetAndDisable(['subLocation']);
      });
  }

  parseDate(date: any): Date {
    return (date instanceof Date) ? date : new Date(date);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  getStandardReports() {
    const params = new URLSearchParams();
    const formData = this.locationReportsForm.value;

    if (formData.dateOfJoining?.startDate && formData.dateOfJoining?.endDate) {
      const startDate = dayjs(formData.dateOfJoining.startDate).format('YYYY-MM-DD');
      const endDate = dayjs(formData.dateOfJoining.endDate).format('YYYY-MM-DD');
      params.append('DOJStart', startDate);
      params.append('DOJEnd', endDate);
    }

    if (formData.location && formData.location != "All Job Locations") {
      params.append('JobLocation', formData.location.jobLocationName.toString());
    }

    if (formData.subLocation && formData.subLocation != "All Job Sub Locations") {
      params.append('SubLocation', formData.subLocation.jobSubLocationName.toString());
    }

    const endpoint = params.toString() ? `Reports/standardReportsWithoutPagination?${params.toString()}` : 'Reports/standardReportsWithoutPagination';
    this.http.getData(endpoint).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.locationReportList = res.standardReports || [];
        },
        error: (err: any) => {
          console.log(err);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

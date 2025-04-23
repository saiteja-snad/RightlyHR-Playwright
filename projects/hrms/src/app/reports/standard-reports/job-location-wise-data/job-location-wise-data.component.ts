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
import { IStandardReportRequest } from '../../../Interfaces/reports.model';
import * as XLSX from "xlsx";
import { IJob } from '../../../Interfaces/letters-model';
import { StandardReportTabsComponent } from "../../../shared/reports-tabs/standard-report-tabs/standard-report-tabs.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
@Component({
  selector: 'app-job-location-wise-data',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxDaterangepickerBootstrapDirective, SelectModule, TranslateModule, StandardReportTabsComponent, NoDataFoundComponent],
  templateUrl: './job-location-wise-data.component.html',
  styleUrls: ['./job-location-wise-data.component.scss']
})

export class JobLocationWiseDataComponent implements OnInit, OnDestroy {
  spinnerLoader = false;
  locationReportsForm!: FormGroup;
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  locationReportList = [] as ILocationReportData[];
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private reports: ReportsService,private http: HttpService,private fb: FormBuilder) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initializeForm();
    this.handleFormValueChanges();
    this.getStandardReports();
    this.getAllLocations();
  }

  initializeForm() {
    this.locationReportsForm = this.fb.group({
      dateOfJoining: [null, Validators.required],
      location: ['', Validators.required],
      subLocation: [{value: '', disabled:true}, Validators.required]
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
    form.get('dateOfJoining')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      form.get('location')?.reset();
      resetAndDisable(['subLocation']);
    });

    form.get('location')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
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
    const endpoint = params.toString() ? `Reports/standardReportsWithoutPagination?${params.toString()}` : 'Reports/standardReportsWithoutPagination';
    this.http.getData(endpoint).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.locationReportList = res.standardReports || [];
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  onSubmit(form: FormGroup) {
    if (form.valid) {
      const formData = form.value;
      const request: IStandardReportRequest = {
        dateRange: {
          startDate: formData.dateOfJoining.startDate,
          endDate: formData.dateOfJoining.endDate,
        },
        selectedJobLocation: formData.location.jobLocationName.toString(),
        selectedJobSubLocation: formData.subLocation.jobSubLocationName.toString()
      };
      this.reports.getStandardReports(request).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          if (res) {
            this.locationReportList = res.standardReports || [];
          }
        },
        error: (err: any) => {
          console.log(err);
        },
      });
    }
  }

  onClickJobLocationExport() {
    this.spinnerLoader = true;
    let { arrayBuffer, fileName } = this.exportTableToExcel("jobLocation", "Job_location_wise_data")
    this.uploadReports(arrayBuffer, fileName)
    this.createReportLog("Job Location Wise Data")
  }

  exportTableToExcel(tableId: string, name?: string) {
    let { sheetName, fileName } = this.getFileName(name);
    let targetTableElm = document.getElementById(tableId);
    let wb = XLSX.utils.table_to_book(targetTableElm, <XLSX.Table2SheetOpts>{
      sheet: sheetName
    });
    let ws = wb.Sheets[sheetName];
    this.convertHeadersToUpperCase(ws);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    let arrayBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    return { arrayBuffer, fileName }
  }

  getFileName(name: string | undefined) {
    let timeSpan = new Date().toISOString();
    let sheetName = name || "ExportResult";
    let fileName = `${sheetName}-${timeSpan}`;
    return {
      sheetName,
      fileName
    }
  }

  private convertHeadersToUpperCase(ws: XLSX.WorkSheet) {
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });
      let cell = ws[cellAddress];
      if (cell && cell.v) {
        cell.v = cell.v.toString().toUpperCase(); // Convert to uppercase
        cell.w = cell.v; // Ensure display is updated
      }
    }
  }

  uploadReports(reportsData: any, fileName: string) {
    const reportFile = new File([reportsData], `${fileName}.xlsx`, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
    );
    let filePath = `/FusionDocuments/Employee Documents/Reports/${this.empinfo.employeeId}`;
    this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, reportFile).subscribe({
      next: (data: any) => {
        this.ReportEmail(data.path, fileName);
        //window.location.reload();
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
      },
    });
  }

  ReportEmail(docUrl: string, fileName: string) {
    let loggedInUser = this.empinfo;
    //let filetitle = this.fileName.reports;
    //console.log(filetitle);
    const date = new Date();
    let reportdata = {
      employeeId: loggedInUser.employeeId,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`,
      documentUrl: docUrl,
      reporttitle: fileName,
      date: date,
      senderEmail: loggedInUser.workEmail,
    };
    if (loggedInUser.middleName) {
      reportdata.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`
    } else {
      reportdata.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`
    }
    this.http.postdata(`CustomEmail/Reports`, reportdata).subscribe({
      next: (data: any) => {
        console.log(data);
      }, error: (err: any) => {
        this.spinnerLoader = false;
      }
    });
  }

  createReportLog(reportName: string) {
    const req = {
      generatedBy: this.empinfo.employeeId,
      reportsType: "Standard Reports",
      reportsName: reportName
    }
    this.http.postdata("ReportsLog", req).subscribe({
      next: (res: any) => {
        this.spinnerLoader = false;
      },
      error: (err) => {
        this.spinnerLoader = false;
      },
      complete: () => { }
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

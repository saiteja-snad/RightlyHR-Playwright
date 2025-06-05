import { Component, OnDestroy, OnInit } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { ILocation, ILocationReportData, ISubLocation } from './location-reports.model';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { ReportsService } from '../../../services/reports/reports.service';
import { IStandardReportRequest } from '../../../Interfaces/reports.model';
import * as XLSX from "xlsx";
import { IJob } from '../../../Interfaces/letters-model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-job-location-wise-data',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxDaterangepickerBootstrapDirective, SelectModule, TranslateModule, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './job-location-wise-data.component.html',
  styleUrls: ['./job-location-wise-data.component.scss']
})

export class JobLocationWiseDataComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
  spinnerLoader = false;
  dataload = false;
  spinnerLoader1= false;
  disableBtn= false;
  locationReportsForm!: FormGroup;
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  locationReportList = [] as ILocationReportData[];
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private reports: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    private modal: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initializeForm();
    this.handleFormValueChanges();
    // this.getStandardReports();
    this.getAllLocations();

    this.locationReportsForm.valueChanges.subscribe(()=>{
      this.disableBtn= true;
    })
   
  }

  initializeForm() {
    this.locationReportsForm = this.fb.group({
      dateOfJoining: [null],
      location: [''],
      subLocation: ['']
    });
  }



  get dateOfJoiningControl(): FormControl {
    return this.locationReportsForm.get('dateOfJoining') as FormControl;
  }

  // Function to get All the lcoations
  getAllLocations(): void {
    this.reports.getJobLocations().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.locationDetails = res.jobLocations || [];
        if (this.locationDetails.length > 0) {
          const allLocationsOption: ILocation = {
            id: -1,
            jobLocationName: 'All Locations',
            isDeleted: false,
            jobSubLocations: []
          };
          this.locationDetails.unshift(allLocationsOption);
    
          this.locationReportsForm.patchValue({
            location: allLocationsOption
          });
          
          const allSubLocationOption: ISubLocation = {
            id: -1,
            jobLocationId: -1,
            jobSubLocationName: 'All Sub Locations',
            isDeleted: false,
            jobLocationName: 'All Locations'
          };
  
          this.subLocationDetails = [allSubLocationOption];
  
          this.locationReportsForm.patchValue({
            subLocation: allSubLocationOption
          });
        
        }
      },
      error: err => console.error('Error fetching locations:', err),
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

  // Function to get All the Sub Locations based on the Job lcocation id 
  getSubLocations(location: ILocation) {
    this.http.getData(`JobLocation/sub-location-by-joblocation/${location.id}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const subLocations = res.jobSubLocations || [];
        const allSubLocationsOption: ISubLocation = {
          id: -1,
          jobLocationId: location.id,
          jobSubLocationName: 'All Sub Locations',
          isDeleted: false,
          jobLocationName: location.jobLocationName
        };

        this.subLocationDetails = [allSubLocationsOption, ...subLocations];

        this.locationReportsForm.patchValue({
          subLocation: allSubLocationsOption
        });
      },
      error: err => console.error('Error fetching locations:', err)
    });
  }

  // Function to handle field changes
  private handleFormValueChanges(): void {
    const form = this.locationReportsForm;

    form.get('location')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((location: ILocation) => {
      if (location?.id === -1) {
        // this.getSubLocations(location);
      } else if (location?.id) {
        this.getSubLocations(location);
      } else {
        this.subLocationDetails = [];
        form.get('subLocation')?.reset();
      }

      this.disableBtn = true; 
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

  // Function to get the reports with out filter
  getStandardReports() {
    this.dataload = true;
    const params = new URLSearchParams();
    const endpoint = params.toString() ? `Reports/standardReportsWithoutPagination?${params.toString()}` : 'Reports/standardReportsWithoutPagination';
    this.http.getData(endpoint).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.locationReportList = res.standardReports || [];
        this.disableBtn= false;
      },
      error: (err: any) => {
        this.dataload = false;
      },
      complete: ()=>{
        this.dataload = false;
      }
    });
  }

  // Function to get the data after click on Generat button
  onSubmit(form: FormGroup) {
    const formData = form.value;
    
    if (formData.location.jobLocationName === 'All Locations' && formData.dateOfJoining == null){
      this.getStandardReports();
    } else{
      const isEmptyDate = !formData.dateOfJoining;
      const isEmptyLocation = !formData.location;
      const isEmptySubLocation = !formData.subLocation;
    
      if (isEmptyDate && isEmptyLocation && isEmptySubLocation) {
        return;
      }
    
      this.getFilterReports(formData); 
    }
  }
    

// Function to get the report data based on filters selection
  getFilterReports(formData: any): void {
    this.dataload = true;
    this.spinnerLoader1 = true;
  
    const request: IStandardReportRequest = {
      dateRange: {
        startDate: formData.dateOfJoining?.startDate || null,
        endDate: formData.dateOfJoining?.endDate || null,
      },
      selectedJobLocation: formData.location?.jobLocationName === 'All Locations'? '' : formData.location?.jobLocationName,
      selectedJobSubLocation:  formData.subLocation?.jobSubLocationName === 'All Sub Locations'? '' : formData.subLocation?.jobSubLocationName
    };
  
    this.reports.getStandardReports(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.locationReportList = res?.standardReports || [];
        this.disableBtn= false;
      },
      error: (err: any) => {
        this.spinnerLoader1 = false;
        this.dataload = false;
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.dataload = false;
      }
    });
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
 navigation(){
    this.router.navigate(['/reports']);
  }

  private convertHeadersToUpperCase(ws: XLSX.WorkSheet) {
    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });
      let cell = ws[cellAddress];
      if (cell && cell.v) {
        cell.v = cell.v.toString().toUpperCase(); 
        cell.w = cell.v; 
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
      },
      error: (reason: any) => {
        this.spinnerLoader = false;
      },
    });
  }

  ReportEmail(docUrl: string, fileName: string) {
    let loggedInUser = this.empinfo;
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
      next: (data: any) => { }, error: (err: any) => {
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
       this.modal.openSuccessModal('Job Location Wise Data downloaded successfully');
      },
      error: (err) => {
        this.spinnerLoader = false;
        this.modal.openErrorModal("Failed to download job location wise data");
      },
      complete: () => {
        this.spinnerLoader = false;
       }
    })
  }

  extractPhoneCode(code: string | undefined): string {
  if (!code) return '';
  const match = code.match(/\((\+\d+)\)/);
  if (match) {
    return match[1];
  }
  if (/^\+\d+$/.test(code.trim())) {
    return code.trim();
  }

  return '';
}

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

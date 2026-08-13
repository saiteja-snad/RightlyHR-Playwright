import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import dayjs, { Dayjs } from 'dayjs';
import { environment } from '../../../../environments/environment';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { ILocation, ILocationReportData, ISubLocation } from './location-reports.model';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslateModule } from '@ngx-translate/core';
import { ReportsService } from '../../../services/reports/reports.service';
import { IStandardReportRequest } from '../../../Interfaces/reports.model';
import * as XLSX from 'xlsx-js-style';
import { IJob } from '../../../Interfaces/letters-model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import {  Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { DatePicker } from 'primeng/datepicker';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { TableModule, Table } from 'primeng/table';
@Component({
  selector: 'app-job-location-wise-data',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePicker, SelectModule, MultiSelectModule, TranslateModule, NoDataFoundComponent, DataLoaderContentComponent, ReportsHeaderComponent, DateformatPipe, TableModule],
  templateUrl: './job-location-wise-data.component.html',
  styleUrls: ['./job-location-wise-data.component.scss'],
  encapsulation: ViewEncapsulation.None,
})

export class JobLocationWiseDataComponent implements OnInit, OnDestroy {
  @ViewChild('jobLocationTable') jobLocationTable!: Table;
  sortedData: ILocationReportData[] = [];
  moduleinfo : string = '';
  spinnerLoader = false;
  dataload = false;
  spinnerLoader1= false;
  disableBtn= false;
  isFilterIndicatorActive = false;
  locationReportsForm!: FormGroup;
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  locationDetails = [] as ILocation[];
  subLocationDetails = [] as ISubLocation[];
  locationReportList = [] as ILocationReportData[];
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  originalLocationReportList: ILocationReportData[] = [];
  currentSortField: string = '';
  currentSortOrder: number = 0;
  employeeStatusOptions = [
    { label: 'All Employees', value: 'All' },
    { label: 'Active', value: 'Active,Trainee Active,Active Contract' },
    { label: 'Inactive', value: 'Inactive,Trainee Inactive,Active Inactive,Trainee Inactive,Inactive Trainees' },
    { label: 'Prospective', value: 'Prospective,Prospective Contractors,Prospective Contract Employees,Prospective Trainees,Trainee Prospective' }
  ];

  constructor(
    private reports: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    private modal: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router,
    private offcanvasService: NgbOffcanvas
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initializeForm();
    this.handleFormValueChanges();
    this.handleEmployeeStatusChanges();
    this.getAllLocations();
    this.locationReportsForm.valueChanges.subscribe(()=>{
      this.disableBtn= true;
    });
  }

  handleEmployeeStatusChanges(): void {
    this.locationReportsForm.get('empStatus')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((selected: string[]) => {
      if (!selected || selected.length === 0) return;
      
      if (selected.length > 1) {
        const lastSelected = selected[selected.length - 1];
        if (lastSelected === 'All') {
          setTimeout(() => this.locationReportsForm.get('empStatus')?.setValue(['All'], { emitEvent: false }));
        } else if (selected.includes('All')) {
          setTimeout(() => this.locationReportsForm.get('empStatus')?.setValue(selected.filter(s => s !== 'All'), { emitEvent: false }));
        }
      }
    });
  }

  initializeForm() {
    this.locationReportsForm = this.fb.group({
      dateOfJoining: [null],
      location: [''],
      subLocation: [''],
      empStatus: [['All']]
    });
  }

  get dateOfJoiningControl(): FormControl {
    return this.locationReportsForm.get('dateOfJoining') as FormControl;
  }

  isFilterApplied(): boolean {
    const { dateOfJoining, location, subLocation, empStatus } = this.locationReportsForm.value;
    const isDateSelected = !!dateOfJoining;
    const isLocationSelected = location && location.id !== -1;
    const isSubLocationSelected = subLocation && subLocation.id !== -1;
    const isEmpStatusSelected = empStatus && empStatus.length > 0 && !empStatus.includes('All');
    return isDateSelected || isLocationSelected || isSubLocationSelected || isEmpStatusSelected;
  }

  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  clearAllFilters(): void {
    this.locationReportsForm.reset();
    
    // Reset to default values (All Locations, All Sub Locations)
    // We need to find the "All" options from the lists
    const allLocationsOption = this.locationDetails.find(l => l.id === -1);
    const allSubLocationOption = this.subLocationDetails.find(s => s.id === -1);

    this.locationReportsForm.patchValue({
        location: allLocationsOption || '',
        subLocation: allSubLocationOption || '',
        dateOfJoining: null,
        empStatus: ['All']
    });
    this.disableBtn = false;
    this.isFilterIndicatorActive = false;
    this.locationReportList = [];
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
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

  showClearAllButton(): boolean {
    const form = this.locationReportsForm;
    const doj = form.get('dateOfJoining')?.value;
    const location = form.get('location')?.value;
    const subLocation = form.get('subLocation')?.value;
    const empStatus = form.get('empStatus')?.value;
    
    const hasDoj = !!doj;
    const hasLocation = location && location.id !== -1 && location !== '';
    const hasSubLocation = subLocation && subLocation.id !== -1 && subLocation !== '';
    const hasEmpStatus = empStatus && empStatus.length > 0 && !empStatus.includes('All');
    
    return hasDoj || hasLocation || hasSubLocation || hasEmpStatus;
  }

  // Function to get the data after click on Generat button
  onSubmit(form: FormGroup) {
    this.isFilterIndicatorActive = this.isFilterApplied();
    const formData = form.value;
    const isEmptyDate = !formData.dateOfJoining;
    const isEmptyLocation = !formData.location;
    const isEmptySubLocation = !formData.subLocation;
    const isEmptyStatus = !formData.empStatus || formData.empStatus.length === 0;
    
    if (isEmptyDate && isEmptyLocation && isEmptySubLocation && isEmptyStatus) {
      this.isFilterIndicatorActive = false;
      return;
    }
    this.getFilterReports(formData);
  }

  // Function to get the report data based on filters selection
  getFilterReports(formData: any): void {
    this.dataload = true;
    this.spinnerLoader1 = true;
    const dateRangeArray = formData.dateOfJoining || [];
    const startDate: Dayjs | null = dateRangeArray[0] ? dayjs(dateRangeArray[0]) : null;
    const endDate: Dayjs | null = dateRangeArray[1] ? dayjs(dateRangeArray[1]) : startDate ? startDate : null;
    
    const employeeStatus = formData.empStatus && formData.empStatus.length > 0 && !formData.empStatus.includes('All')
      ? formData.empStatus.join(',')
      : '';
    
    const request: IStandardReportRequest = {
      dateRange: {
        startDate: startDate,
        endDate: endDate
      },
      selectedJobLocation: formData.location?.jobLocationName === 'All Locations'? '' : formData.location?.jobLocationName,
      selectedJobSubLocation:  formData.subLocation?.jobSubLocationName === 'All Sub Locations'? '' : formData.subLocation?.jobSubLocationName,
      employeeStatus: employeeStatus
    };
    this.reports.getStandardReports(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.locationReportList = res?.standardReports || [];
        this.originalLocationReportList = [...this.locationReportList];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        this.sortedData = [];
        this.disableBtn= false;
      },
      error: (err: any) => {
        this.spinnerLoader1 = false;
        this.dataload = false;
        this.closeCanvas();
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.dataload = false;
        this.closeCanvas();
      }
    });
  }

  onClickJobLocationExport() {
    this.spinnerLoader = true;
    setTimeout(() => {
      const dataToExport = this.sortedData.length ? this.sortedData : (this.jobLocationTable?.filteredValue ?? this.jobLocationTable?.value ?? this.locationReportList);
      let { arrayBuffer, fileName } = this.exportTableToExcel(dataToExport, 'Job Location Report');
      this.uploadReports(arrayBuffer, fileName);
      this.createReportLog('Job Location Report');
    }, 100);
  }

  onSortChange(event: any): void {
    this.sortedData = this.jobLocationTable?.filteredValue ?? this.jobLocationTable?.value ?? this.locationReportList;
  }

  exportTableToExcel(data: ILocationReportData[], name?: string) {
    let { sheetName, fileName } = this.getFileName(name);

    const reportTitle = name ? name.replace(/_/g, ' ') : 'Report';
    const ws = XLSX.utils.aoa_to_sheet([[reportTitle.toUpperCase()]]);

    const headers = [
      'EMPLOYEE ID', 'SALUTATION', 'FIRST NAME', 'MIDDLE NAME', 'LAST NAME', 'EMPLOYEE STATUS',
      'DATE OF JOINING', 'WORK NUMBER', 'PHONE NUMBER', 'WORK MAIL', 'PERSONAL EMAIL',
      'ADDRESS LINE 1(CURRENT)', 'ADDRESS LINE 2(CURRENT)', 'CITY(CURRENT)', 'STATE(CURRENT)',
      'COUNTRY(CURRENT)', 'ZIPCODE(CURRENT)', 'ADDRESS LINE 1(COMMUNICATION)',
      'ADDRESS LINE 2(COMMUNICATION)', 'CITY(COMMUNICATION)', 'STATE(COMMUNICATION)',
      'COUNTRY(COMMUNICATION)', 'ZIPCODE(COMMUNICATION)', 'BRANCH CODE', 'JOB EFFECTIVE DATE',
      'JOB ROLE', 'JOB GRADE', 'DEPARTMENT', 'TEAM', 'TEAM MANAGER', 'REPORTING MANAGER',
      'LOCATION', 'SUB LOCATION', 'SHIFT', 'SHIFT CODE', 'JOB TYPE'
    ];

    const rows = data.map(emp => [
  emp.fusionEmpId || '-',
  emp.title || '-',
  emp.firstName || '-',
  emp.middleName || '-',
  emp.lastName || '-',
  emp.empstatus || '-',

  emp.dateOfJoining ? this.formatDate(new Date(emp.dateOfJoining)) : '-',

  this.extractPhoneCode(emp.workPhoneCountryCode) + (emp.workPhone ? ' ' + emp.workPhone : ' -'),

  this.extractPhoneCode(emp.mobilePhoneCountryCode) + (emp.contactnumber ? ' ' + emp.contactnumber : ' -'),

  emp.workEmail || '-',
  emp.emailaddress || '-',

  // Current Address
  emp.currentaddressline1 || '-',
  emp.currentaddressline2 || '-',
  emp.currentcity || '-',
  emp.currentstate || '-',
  emp.currentcountry || '-',
  emp.currentzipcode || '-',

  // Permanent Address
  emp.permanentaddressline1 || '-',
  emp.permanentaddressline2 || '-',
  emp.permanentcity || '-',
  emp.permanentstate || '-',
  emp.permanentcountry || '-',
  emp.permanentzipcode || '-',

  // Job / Org Info
  emp.branchCode || '-',

  emp.jobeffectivedate ? this.formatDate(new Date(emp.jobeffectivedate)) : '-',

  emp.jobRole || '-',
  emp.gradeName || '-',
  emp.departmentName || '-',
  emp.subdepartment_name || '-',

  emp.teammanager || '-',
  emp.reportingmanager || '-',

  emp.joblocationname || '-',
  emp.jobsublocationname || '-',

  emp.shiftname || '-',
  emp.shiftcode || '-',

  emp.jobType || '-'
]);

    XLSX.utils.sheet_add_aoa(ws, [headers, ...rows], { origin: 'A2' });

    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } });
      if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'left' } };
    }

    this.convertHeadersToUpperCase(ws, 1);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);

    const arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', bookSST: true });
    return { arrayBuffer, fileName };
  }

  getFileName(name: string | undefined) {
    let timeSpan = dayjs().format('MMM DD YYYY');
    let sheetName = name || 'ExportResult';
    let fileName = `${sheetName.replace(/_/g, ' ')} - ${timeSpan}`;
    return {
      sheetName,
      fileName,
    };
  }

  navigation(){
    this.router.navigate(['/reports']);
  }

  private convertHeadersToUpperCase(ws: XLSX.WorkSheet, headerRowIndex?: number) {
    const range = XLSX.utils.decode_range(ws['!ref']!);
    const row = headerRowIndex !== undefined ? headerRowIndex : range.s.r;
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let cellAddress = XLSX.utils.encode_cell({ r: row, c: C });
      let cell = ws[cellAddress];
      if (cell && cell.v) {
        cell.v = cell.v.toString().toUpperCase(); 
        cell.w = cell.v; 
        cell.s = { font: { bold: true } };
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
       this.modal.openSuccessModal('Job Location Report exported successfully');
      },
      error: (err) => {
        this.spinnerLoader = false;
        this.modal.openErrorModal("Failed to download Job Location Report");
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
customSort(event: any): void {
    const field = event.field;

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.locationReportList = [...this.originalLocationReportList];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.jobLocationTable) this.jobLocationTable.reset();
        return;
      } else {
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1 = a[field];
      let val2 = b[field];

      if (field === 'fusionEmpId') {
        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;
        return event.order * (num1 - num2);
      }

      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
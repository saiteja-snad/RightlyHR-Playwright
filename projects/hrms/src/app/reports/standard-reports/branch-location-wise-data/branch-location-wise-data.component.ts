import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Branch, EmployeeDetails, IFamilyDetails, IStandardReportRequest } from '../../../Interfaces/reports.model';
import { Subject, takeUntil } from 'rxjs';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import * as XLSX from 'xlsx-js-style';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { environment } from '../../../../environments/environment';
import dayjs, { Dayjs } from 'dayjs';
import { ReportsService } from '../../../services/reports/reports.service';
import { IJob } from '../../../Interfaces/letters-model';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { DatePicker } from 'primeng/datepicker';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule, Table } from 'primeng/table';

@Component({
  selector: 'app-branch-location-wise-data',
  imports: [
    SelectModule,
    MultiSelectModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NoDataFoundComponent,
    DateformatPipe,
    DatePicker,
    DataLoaderContentComponent,
    ReportsHeaderComponent,
    TranslateModule,
    TableModule
  ],
  templateUrl: './branch-location-wise-data.component.html',
  styleUrl: './branch-location-wise-data.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class BranchLocationWiseDataComponent implements OnInit, OnDestroy {
  @ViewChild('branchTable') branchTable!: Table;
  sortedData: EmployeeDetails[] = [];
  moduleinfo: string = '';
  empinfo = {} as IJob;
  reportForm!: FormGroup;
  familydata = [] as IFamilyDetails[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  standardReportData = [] as EmployeeDetails[];
  branchLocations = [] as Branch[];
  employeeStatusOptions = [
    { label: 'All Employees', value: 'All' },
    { label: 'Active', value: 'Active,Trainee Active,Active Contract' },
    { label: 'Inactive', value: 'Inactive,Trainee Inactive,Active Inactive,Trainee Inactive,Inactive Trainees' },
    { label: 'Prospective', value: 'Prospective,Prospective Contractors,Prospective Contract Employees,Prospective Trainees,Trainee Prospective' }
  ];
  localeOptions: any = {
    applyLabel: 'ok',
    format: environment.dateformat.toUpperCase(),
    direction: 'ltr',
    clearLabel: 'Clear', // could be rtl
  };
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
  spinnerLoader = false;
  spinnerLoader1 = false;
  dataload = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  originalStandardReportData: EmployeeDetails[] = [];
  currentSortField: string = '';
  currentSortOrder: number = 0;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    private reportService: ReportsService,
    public rbac: RbacService,
    public readonly router: Router,
    private authService: AuthService,
    private offcanvasService: NgbOffcanvas
  ) { }

  ngOnInit(): void {
     this.localeOptions = {
      applyLabel: 'ok',
      format: this.authService.convertAngularDateFormatToJs(environment.dateformat).toUpperCase(),
      direction: 'ltr',
      clearLabel: 'Clear',
    };
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initializeForm();
    this.getBranchLocations();
    this.handleEmployeeStatusChanges();
    this.reportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    });
  }

  handleEmployeeStatusChanges(): void {
    this.reportForm.get('empStatus')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((selected: string[]) => {
      if (!selected || selected.length === 0) return;
      
      if (selected.length > 1) {
        const lastSelected = selected[selected.length - 1];
        if (lastSelected === 'All') {
          setTimeout(() => this.reportForm.get('empStatus')?.setValue(['All'], { emitEvent: false }));
        } else if (selected.includes('All')) {
          setTimeout(() => this.reportForm.get('empStatus')?.setValue(selected.filter(s => s !== 'All'), { emitEvent: false }));
        }
      }
    });
  }

  initializeForm() {
    this.reportForm = this.fb.group({
      location: ['All'],
      dateOfJoining: [null],
      empStatus: [['All']]
    });
  }

  showClearAllButton(): boolean {
    const form = this.reportForm;
    const doj = form.get('dateOfJoining')?.value;
    const location = form.get('location')?.value;
    const empStatus = form.get('empStatus')?.value;
    
    const hasDoj = !!doj;
    const hasLocation = location && location !== 'All' && location !== '';
    const hasEmpStatus = empStatus && empStatus.length > 0 && !empStatus.includes('All');
    
    return hasDoj || hasLocation || hasEmpStatus;
  }

  getBranchLocations() {
    this.http.getData('BranchLocation').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res) {
          this.branchLocations = res;
          if (this.branchLocations.length > 0) {
            this.branchLocations.unshift({
              sno: -1,
              branchCode: 'All',
              branchLocation1: 'All Branch Locations',
              isDeleted: false,
            });
            this.reportForm.patchValue({
              location: 'All',
            });
          }
        }
      },
      error: (err) => { }
    });
  }

  onSubmit(form: FormGroup) {
    this.dataload = true;
    this.spinnerLoader1 = true;
    this.isFilterIndicatorActive = this.isFilterApplied();
    if (form.valid) {
      const formData = form.value;
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
        selectedBranchLocation: formData.location,
        employeeStatus: employeeStatus
      };
      this.reportService.getStandardReports(request).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            if (res) {
              this.standardReportData = res.standardReports;
              this.originalStandardReportData = [...this.standardReportData];
              this.currentSortField = '';
              this.currentSortOrder = 0;
              this.sortedData = [];
            }
          },
          error: (err: any) => {
            this.spinnerLoader1 = false;
            this.dataload = false;
            this.disableBtn = true;
            this.closeCanvas();
          },
          complete: () => {
            this.spinnerLoader1 = false;
            this.dataload = false;
            this.disableBtn = false;
            this.closeCanvas();
          }
        });
    }
  }

  onClickBranchLocationExport() {
    this.spinnerLoader = true;
    setTimeout(() => {
      const dataToExport = this.sortedData.length ? this.sortedData : (this.branchTable?.filteredValue ?? this.branchTable?.value ?? this.standardReportData);
      let { arrayBuffer, fileName } = this.exportTableToExcel(dataToExport, 'Branch-Wise Employee Report');
      this.uploadReports(arrayBuffer, fileName);
      this.createReportLog('Branch-Wise Employee Report');
    }, 100);
  }

  onSortChange(event: any): void {
    this.sortedData = this.branchTable?.filteredValue ?? this.branchTable?.value ?? this.standardReportData;
  }

  uploadReports(reportsData: any, fileName: string) {
    const reportFile = new File([reportsData], `${fileName}.xlsx`, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    let filePath = `/FusionDocuments/Employee Documents/Reports/${this.empinfo.employeeId}`;
    this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, reportFile)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.ReportEmail(data.path, fileName);
        },
        error: (reason: any) => {
          this.spinnerLoader = false;
          this.modal.openErrorModal('file upload  is failed');
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
      reportdata.senderName = `${loggedInUser.firstName} ${loggedInUser.middleName} ${loggedInUser.lastName}`;
    } else {
      reportdata.senderName = `${loggedInUser.firstName} ${loggedInUser.lastName}`;
    }
    this.http.postdata(`CustomEmail/Reports`, reportdata).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => { },
      error: (err) => {
        this.spinnerLoader = false;
      }
    });
  }

  navigation() {
    this.router.navigate(['/reports']);
  }

  createReportLog(reportName: string) {
    const req = {
      generatedBy: this.empinfo.employeeId,
      reportsType: 'Standard Reports',
      reportsName: reportName,
    };
    this.http.postdata('ReportsLog', req).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.modal.openSuccessModal('Branch-Wise Employee Report exported successfully');
      },
      error: (err: any) => {
        this.spinnerLoader = false;
        this.modal.openErrorModal('Failed to download Branch-Wise Employee Report');
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  exportTableToExcel(data: EmployeeDetails[], name?: string) {
    let { sheetName, fileName } = this.getFileName(name);

    const reportTitle = name ? name.replace(/_/g, ' ') : 'Report';
    const ws = XLSX.utils.aoa_to_sheet([[reportTitle.toUpperCase()]]);

    const headers = [
      'EMPLOYEE ID', 'SALUTATION', 'FIRST NAME', 'MIDDLE NAME', 'LAST NAME', 'EMPLOYEE STATUS',
      'DATE OF JOINING', 'WORK NUMBER', 'PHONE NUMBER', 'WORK MAIL', 'PERSONAL EMAIL',
      'ADDRESS LINE 1(CURRENT)', 'ADDRESS LINE 2(CURRENT)', 'CITY(CURRENT)', 'STATE(CURRENT)',
      'COUNTRY(CURRENT)', 'ZIPCODE(CURRENT)', 'ADDRESS LINE 1(COMMUNICATION)',
      'ADDRESS LINE 2(COMMUNICATION)', 'CITY(COMMUNICATION)', 'STATE(COMMUNICATION)',
      'COUNTRY(COMMUNICATION)', 'ZIPCODE(COMMUNICATION)', 'JOB EFFECTIVE DATE', 'BRANCH CODE',
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
      emp.dateOfJoining ? dayjs(emp.dateOfJoining).format('DD-MMM-YYYY') : '-',
      this.extractPhoneCode(emp.workPhoneCountryCode) + (emp.workPhone ? ' ' + emp.workPhone : ' -'),
      this.extractPhoneCode(emp.mobilePhoneCountryCode) + (emp.contactnumber ? ' ' + emp.contactnumber : ' -'),
      emp.workEmail || '-',
      emp.emailaddress || '-',
      emp.currentaddressline1 || '-',
      emp.currentaddressline2 || '-',
      emp.currentcity || '-',
      emp.currentstate || '-',
      emp.currentcountry || '-',
      emp.currentzipcode || '-',
      emp.permanentaddressline1 || '-',
      emp.permanentaddressline2 || '-',
      emp.permanentcity || '-',
      emp.permanentstate || '-',
      emp.permanentcountry || '-',
      emp.permanentzipcode || '-',
      emp.jobEffectiveDate ? dayjs(emp.jobEffectiveDate).format('DD-MMM-YYYY') : '-',
      emp.branchcode || '-',
      emp.jobRole || '-',
      emp.gradeName || '-',
      emp.departmentName || '-',
      emp.subdepartment_name || '-',
      emp.teammanager || '-',
      emp.reportingManager || '-',
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

    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);

    let arrayBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', bookSST: true });
    return { arrayBuffer, fileName };
  }

  // Function to convert headers to uppercase
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

  getFileName(name: string | undefined) {
    let timeSpan = dayjs().format('MMM DD YYYY');
    let sheetName = name || 'ExportResult';
    let fileName = `${sheetName.replace(/_/g, ' ')} - ${timeSpan}`;
    return {
      sheetName,
      fileName,
    };
  }

  getColumnWidth(data: any[], columnName: string): number {
    const maxWidth = data.reduce((max: number, record: any) => {
      const value = record[columnName]?.toString().length || 0;
      return value > max ? value : max;
    }, 0);
    return Math.max(10, maxWidth);
  }

  extractPhoneCode(code: string | undefined): string {
  if (!code) return '';
  const match = code.match(/\((\+\d+)\)/);
  if (match) {
    return match[1];
  }

  return code.startsWith('+') ? code : '';
}

  isFilterApplied(): boolean {
    const { dateOfJoining, location, empStatus } = this.reportForm.value;
    const isDateSelected = !!dateOfJoining;
    const isLocationSelected = location && location !== 'All';
    const isEmpStatusSelected = empStatus && empStatus.length > 0 && !empStatus.includes('All');
    return isDateSelected || isLocationSelected || isEmpStatusSelected;
  }

  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  clearAllFilters(): void {
    this.reportForm.reset();
    this.reportForm.patchValue({
      location: 'All',
      dateOfJoining: null,
      empStatus: ['All']
    });
    this.disableBtn = false;
    this.standardReportData = [];
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }
customSort(event: any): void {
    const field = event.field;

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.standardReportData = [...this.originalStandardReportData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.branchTable) this.branchTable.reset();
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
import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { NgxDaterangepickerBootstrapDirective } from "ngx-daterangepicker-bootstrap";
import dayjs, { Dayjs } from 'dayjs';
import { environment } from '../../../../environments/environment';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { IemployeeDetails } from '../../../Interfaces/job-model';
import { ReportsService } from '../../../services/reports/reports.service';
import { IStandardReportRequest } from '../../../Interfaces/reports.model';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import * as XLSX from 'xlsx-js-style';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { DatePicker } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-employee-master-data',
  imports: [FormsModule, DateformatPipe, ReactiveFormsModule, CommonModule, NoDataFoundComponent, DataLoaderContentComponent, ReportsHeaderComponent, DatePicker, MultiSelectModule, TranslateModule],
  templateUrl: './employee-master-data.component.html',
  styleUrl: './employee-master-data.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class EmployeeMasterDataComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  subscription!: Subscription
  loggedInUser = {} as IemployeeDetails
  selectedEmployeeStatus: string | undefined = undefined;
  selectedBranchLocation: string | undefined = undefined;
  selectedJobLocation: string | undefined = undefined;
  selectedJobSubLocation: string | undefined = undefined;
  employeeMasterData = [] as any[];
  masterDataForm!: FormGroup;
  dataload = false;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
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
  employeeStatusOptions = [
    { label: 'All Employees', value: 'All' },
    {
      label: 'Active',
      value: 'Active,Trainee Active,Active Contract'
    },
    { label: 'Inactive', value: 'Inactive,Trainee Inactive,Active Inactive,Trainee Inactive,Inactive Trainees' },
    { label: 'Prospective', value: 'Prospective,Prospective Contractors,Prospective Contract Employees,Prospective Trainees,Trainee Prospective' }
  ];

  localeOptions: any;

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router,
    private offcanvasService: NgbOffcanvas
  ) { }

  ngOnInit(): void {
    this.localeOptions = {
      applyLabel: 'ok',
      format: this.authService.convertAngularDateFormatToJs(environment.dateformat).toUpperCase(),
      direction: 'ltr',
      clearLabel: 'Clear',
    };
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.handleEmployeeStatusChanges();

    this.masterDataForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    });
  }

  handleEmployeeStatusChanges(): void {
    this.masterDataForm.get('empStatus')?.valueChanges.subscribe((selected: string[]) => {
      if (!selected || selected.length === 0) return;

      if (selected.length > 1) {
        const lastSelected = selected[selected.length - 1];
        if (lastSelected === 'All') {
          setTimeout(() => this.masterDataForm.get('empStatus')?.setValue(['All'], { emitEvent: false }));
        } else if (selected.includes('All')) {
          setTimeout(() => this.masterDataForm.get('empStatus')?.setValue(selected.filter(s => s !== 'All'), { emitEvent: false }));
        }
      }
    });
  }

  initializeForm() {
    this.masterDataForm = this.fb.group({
      dateOfJoining: [null],
      empStatus: [['All']],
    });
  }

  //method to get All the reports
  // getStandardReports() {
  //   this.dataload = true;
  //   const params = new URLSearchParams();
  //   const endpoint = params.toString() ? `Reports/standardReportsWithoutPagination?${params.toString()}` : 'Reports/standardReportsWithoutPagination';
  //   this.subscription = this.http.getData(endpoint).subscribe({
  //     next: (res: any) => {
  //       if (res) {
  //         this.employeeMasterData = res.standardReports;
  //       }
  //     },
  //     error: (err: any) => {
  //       this.dataload = false;
  //     },
  //     complete: ()=>{
  //       this.dataload = false;
  //     }
  //   });
  // }

  onSubmit(form: FormGroup) {
    this.spinnerLoader1 = true;
    this.isFilterIndicatorActive = this.isFilterApplied();

    const formData = form.value;
    const isEmptyStatus = !formData.empStatus || formData.empStatus.length === 0;
    const isEmptyDateRange = !formData.dateOfJoining;

    if (isEmptyStatus && isEmptyDateRange) {
      this.spinnerLoader1 = false;
      this.isFilterIndicatorActive = false;
      return;
    }

    this.dataload = true;

    const dateRangeArray = formData.dateOfJoining || [];
    const startDate = dateRangeArray[0] ? dayjs(dateRangeArray[0]) : null;
    const endDate = dateRangeArray[1]
      ? dayjs(dateRangeArray[1])
      : startDate;

    const employeeStatus = formData.empStatus && formData.empStatus.length > 0 && !formData.empStatus.includes('All')
      ? formData.empStatus.join(',')
      : '';

    const request: IStandardReportRequest = {
      dateRange: {
        startDate,
        endDate
      },
      employeeStatus
    };

    this.subscription = this.reportsService.getStandardReports(request).subscribe({
      next: (res: any) => {
        this.employeeMasterData = res?.standardReports || [];
      },
      error: () => {
        this.employeeMasterData = [];
        this.spinnerLoader1 = false;
        this.dataload = false;
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

  onClickEmpMasterExport() {
    this.spinnerLoader2 = true;
    setTimeout(() => {
      let { arrayBuffer, fileName } = this.exportTableToExcel("employeeMasterData", "Employee_Overview_Report")
      this.uploadReports(arrayBuffer, fileName)
      this.createReportLog("Employee Overview Report")
    }, 100);
  }

  exportTableToExcel(tableId: string, name?: string) {
    let { sheetName, fileName } = this.getFileName(name);
    let targetTableElm = document.getElementById(tableId);
    
    const reportTitle = name ? name.replace(/_/g, ' ') : 'Report';
    const ws = XLSX.utils.aoa_to_sheet([
      [reportTitle.toUpperCase()]
    ]);
    XLSX.utils.sheet_add_dom(ws, targetTableElm, { origin: 'A2', raw: true });

    if (ws['!ref']) {
      const range = XLSX.utils.decode_range(ws['!ref']);
      if (!ws['!merges']) ws['!merges'] = [];
      ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: range.e.c } });
      
      if (ws['A1']) {
        ws['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'left' } };
      }
    }

    this.convertHeadersToUpperCase(ws, 1);

    // Create a new workbook with the formatted worksheet
    let wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    // Write the file
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    // Also return the array buffer for upload
    let arrayBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
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
        // Add bold style to header
        cell.s = { font: { bold: true } };
      }
    }
  }

  getFileName(name: string | undefined) {
    let timeSpan = dayjs().format('MMM DD YYYY');
    let sheetName = name || "ExportResult";
    let fileName = `${sheetName.replace(/_/g, ' ')} - ${timeSpan}`;
    return {
      sheetName,
      fileName
    };
  };

  navigation() {
    this.router.navigate(['/reports']);
  }

  uploadReports(reportsData: any, fileName: string) {
    const reportFile = new File(
      [reportsData],
      `${fileName}.xlsx`,
      {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }
    );
    let filePath = `/FusionDocuments/Employee Documents/Reports/${this.loggedInUser.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        reportFile
      )
      .subscribe({
        next: (data: any) => {
          this.ReportEmail(data.path, fileName);
        },
        error: (reason: any) => {
          this.spinnerLoader2 = false;
          alert('file upload  is failed');
        },
      });
  }

  ReportEmail(docUrl: string, fileName: string) {
    let loggedInUser = this.authService.getToken();
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
    this.subscription = this.http
      .postdata(`CustomEmail/Reports`, reportdata)
      .subscribe({
        next: (data: any) => { },
      });
  }

  createReportLog(reportName: string) {
    const req = {
      generatedBy: this.loggedInUser.employeeId,
      reportsType: "Standard Reports",
      reportsName: reportName
    }
    this.subscription = this.http.postdata("ReportsLog", req).subscribe({
      next: (res: any) => {
        this.modal.openSuccessModal('Employee Overview Report exported successfully');
        this.spinnerLoader2 = false;
      },
      error: (err) => {
        this.spinnerLoader2 = false;
        this.modal.openErrorModal('Failed to download employee Overview Report');
      },
      complete: () => {
        this.spinnerLoader2 = false;
      }
    })
  }

  isFilterApplied(): boolean {
    const { dateOfJoining, empStatus } = this.masterDataForm.value;
    const isDateSelected = !!dateOfJoining;
    const isStatusSelected = empStatus && empStatus.length > 0 && (empStatus.length > 1 || empStatus[0] !== 'All');
    return isDateSelected || isStatusSelected;
  }

  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  clearAllFilters(): void {
    this.masterDataForm.reset();
    this.masterDataForm.patchValue({
      empStatus: ['All'],
      dateOfJoining: null
    });
    this.disableBtn = false;
    this.isFilterIndicatorActive = false;
    this.employeeMasterData = [];
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  showClearAllButton(): boolean {
    const form = this.masterDataForm;
    const doj = form.get('dateOfJoining')?.value;
    const empStatus = form.get('empStatus')?.value;

    const hasDoj = !!doj;
    const hasEmpStatus = empStatus && empStatus.length > 0 && !(empStatus.length === 1 && empStatus[0] === 'All');

    return hasDoj || hasEmpStatus;
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

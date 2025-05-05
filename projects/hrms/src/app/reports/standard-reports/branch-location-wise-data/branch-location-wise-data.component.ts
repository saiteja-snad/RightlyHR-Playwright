import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { Branch, EmployeeDetails, IFamilyDetails, IStandardReportRequest } from '../../../Interfaces/reports.model';
import { Subject, takeUntil } from 'rxjs';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import * as XLSX from 'xlsx';
import { StandardReportTabsComponent } from '../../../shared/reports-tabs/standard-report-tabs/standard-report-tabs.component';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { environment } from '../../../../environments/environment';
import dayjs from 'dayjs';
import { ReportsService } from '../../../services/reports/reports.service';
import { IJob } from '../../../Interfaces/letters-model';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-branch-location-wise-data',
  imports: [
    SelectModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    NoDataFoundComponent,
    StandardReportTabsComponent,
    DateformatPipe,
    NgxDaterangepickerBootstrapDirective,
    DataLoaderContentComponent
  ],
  templateUrl: './branch-location-wise-data.component.html',
  styleUrl: './branch-location-wise-data.component.scss',
})
export class BranchLocationWiseDataComponent implements OnInit, OnDestroy {
  empinfo = {} as IJob;
  reportForm!: FormGroup;
  familydata = [] as IFamilyDetails[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  standardReportData = [] as EmployeeDetails[];
  branchLocations = [] as Branch[];
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
  disableBtn= false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private modal: OpenModalService,
    private reportService: ReportsService,
     public rbac:RbacService
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initializeForm();
    this.getBranchLocations();

    this.reportForm.valueChanges.subscribe(()=>{
      this.disableBtn= true;
    })
  }

  initializeForm() {
    this.reportForm = this.fb.group({
      location: [''],
      dateOfJoining: [null],
    });

  }

  onSubmit(form: FormGroup) {
    this.dataload = true;
    this.spinnerLoader1 = true;
    if (form.valid) {
      const formData = form.value;

      const request: IStandardReportRequest = {
        dateRange: {
          startDate: formData.dateOfJoining?.startDate,
          endDate: formData.dateOfJoining?.endDate,
        },
        selectedBranchLocation: formData.location,
      };
      this.reportService.getStandardReports(request).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (res: any) => {
            if (res) {
              this.standardReportData = res.standardReports;
            }
          },
          error: (err: any) => {
            this.spinnerLoader1 = false;
            this.dataload = false;
            this.disableBtn= true;
          },
          complete: () => {
            this.spinnerLoader1 = false;
            this.dataload = false;
            this.disableBtn= false;
          }
        });
    }
  }

  onClickBranchLocationExport() {
    this.spinnerLoader = true;
    let { arrayBuffer, fileName } = this.exportTableToExcel(
      'branchLocation',
      'Branch_location_wise_data'
    );

    this.uploadReports(arrayBuffer, fileName);
    this.createReportLog('Branch Location Wise Data');
  }

  uploadReports(reportsData: any, fileName: string) {
    const reportFile = new File([reportsData], `${fileName}.xlsx`, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    let filePath = `/FusionDocuments/Employee Documents/Reports/${this.empinfo.employeeId}`;
    this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        reportFile
      )
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
    this.http
      .postdata(`CustomEmail/Reports`, reportdata)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => { },
        error: (err) => {
          this.spinnerLoader = false;
        }
      });
  }

  createReportLog(reportName: string) {
    const req = {
      generatedBy: this.empinfo.employeeId,
      reportsType: 'Standard Reports',
      reportsName: reportName,
    };

    this.http
      .postdata('ReportsLog', req)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.modal.openSuccessModal('Branch Location Wise Data downloaded successfully');
        },
        error: (err: any) => {
          this.spinnerLoader = false;
          this.modal.openErrorModal('Failed to download branch location wise data');
        },
        complete: () => {
          this.spinnerLoader = false;
         }
      });
  }

  exportTableToExcel(tableId: string, name?: string) {
    let { sheetName, fileName } = this.getFileName(name);
    let targetTableElm = document.getElementById(tableId);
    let wb = XLSX.utils.table_to_book(targetTableElm, <XLSX.Table2SheetOpts>{
      sheet: sheetName,
    });
    let ws = wb.Sheets[sheetName];
    this.convertHeadersToUpperCase(ws);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
    let arrayBuffer = XLSX.write(wb, {
      bookType: 'xlsx',
      type: 'array',
    });
    return { arrayBuffer, fileName };
  }

  // Function to convert headers to uppercase
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

  getFileName(name: string | undefined) {
    let timeSpan = new Date().toISOString();
    let sheetName = name || 'ExportResult';
    let fileName = `${sheetName}-${timeSpan}`;
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

  getBranchLocations() {
    this.http.getData('BranchLocation').pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          if (res) {
            this.branchLocations = res;
            if (this.branchLocations.length > 0) {
              this.branchLocations.unshift({
                sno: -1,
                branchCode: 'ALL',
                branchLocation1: 'All Branch Locations',
                isDeleted: false,
              });

              this.reportForm.patchValue({
                location: 'All Branch Locations',
              });
            }
          }
        },
        error: (err) => { }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

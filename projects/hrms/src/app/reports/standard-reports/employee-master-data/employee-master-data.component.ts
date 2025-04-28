import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxDaterangepickerBootstrapDirective } from "ngx-daterangepicker-bootstrap";
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { environment } from '../../../../environments/environment';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { IemployeeDetails } from '../../../Interfaces/job-model';
import { ReportsService } from '../../../services/reports/reports.service';
import { IStandardReportRequest } from '../../../Interfaces/reports.model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { StandardReportTabsComponent } from "../../../shared/reports-tabs/standard-report-tabs/standard-report-tabs.component";
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import * as XLSX from "xlsx";
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-employee-master-data',
  imports: [NgxDaterangepickerBootstrapDirective, FormsModule, DateformatPipe, StandardReportTabsComponent, 
    SelectModule, ReactiveFormsModule, CommonModule, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './employee-master-data.component.html',
  styleUrl: './employee-master-data.component.scss'
})

export class EmployeeMasterDataComponent implements OnInit, OnDestroy {
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  subscription!: Subscription
  loggedInUser = {} as IemployeeDetails
  isLoading: boolean = false;
  selectedEmployeeStatus: string | undefined = undefined;
  selectedBranchLocation: string | undefined = undefined;
  selectedJobLocation: string | undefined = undefined;
  selectedJobSubLocation: string | undefined = undefined;
  employeeMasterData = [] as any[];
  masterDataForm!: FormGroup;
  dataload = false;

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
    { label: 'All Employees', value: '' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
    { label: 'Prospective', value: 'Prospective' }
  ];

  localeOptions: any = {
    applyLabel: 'ok',
    format: environment.dateformat.toUpperCase(),
    direction: 'ltr',
    clearLabel: 'Clear', // could be rtl
  };

  constructor(private authService: AuthService, private reportsService: ReportsService, private fb: FormBuilder, private http: HttpService) { }

  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getStandardReports()
  }

  initializeForm() {
    this.masterDataForm = this.fb.group({
      dateOfJoining: [null],
      empStatus: [''],
    });
  }

  //method to get All the reports
  getStandardReports() {
    this.dataload = true;
    const params = new URLSearchParams();
    const endpoint = params.toString() ? `Reports/standardReportsWithoutPagination?${params.toString()}` : 'Reports/standardReportsWithoutPagination';
    this.subscription = this.http.getData(endpoint).subscribe({
      next: (res: any) => {
        if (res) {
          this.employeeMasterData = res.standardReports;
          // this.maxPageNumber = res.maxPageNumber;
        }
      },
      error: (err: any) => {
        this.dataload = false;
        console.log(err);
      },
      complete: ()=>{
        this.dataload = false;
      }
    });
  }

  onSubmit(form: FormGroup) {
    this.dataload = true;
    if (form.valid) {
      const formData = form.value;
      const request: IStandardReportRequest = {
        dateRange: {
          startDate: formData.dateOfJoining.startDate,
          endDate: formData.dateOfJoining.endDate,
        },
        employeeStatus: formData.empStatus.value
      };
      this.subscription = this.reportsService.getStandardReports(request).subscribe({
        next: (res: any) => {
          if (res) {
            this.employeeMasterData = res.standardReports || [];
            this.isLoading = false;
          }
        },
        error: (err: any) => {
          this.dataload = false;
        },
        complete: ()=>{
        this.dataload = false;
        }
      });
    }
  }

  onClickEmpMasterExport() {
    let { arrayBuffer, fileName } = this.exportTableToExcel("employeeMasterData", "Employee_master_data")

    this.uploadReports(arrayBuffer, fileName)
    this.createReportLog("Employee Master Data")
  }

  exportTableToExcel(tableId: string, name?: string) {
    let { sheetName, fileName } = this.getFileName(name);
    let targetTableElm = document.getElementById(tableId);
    let wb = XLSX.utils.table_to_book(targetTableElm, <XLSX.Table2SheetOpts>{
      sheet: sheetName
    });

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
    };
  };

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
          console.log(data);
          this.ReportEmail(data.path, fileName);
        },
        error: (reason: any) => {
          console.log(reason);
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
    console.log(reportdata);
    this.subscription = this.http
      .postdata(`CustomEmail/Reports`, reportdata)
      .subscribe({
        next: (data: any) => {
          console.log(data);
        },
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
        console.log(res);
      },
      error: (err) => {
        console.log(err);
      },
      complete: () => { }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
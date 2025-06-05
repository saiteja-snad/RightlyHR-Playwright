import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxDaterangepickerBootstrapDirective } from "ngx-daterangepicker-bootstrap";
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { environment } from '../../../../environments/environment';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import {  Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { IemployeeDetails } from '../../../Interfaces/job-model';
import { ReportsService } from '../../../services/reports/reports.service';
import { IStandardReportRequest } from '../../../Interfaces/reports.model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { SelectModule } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import * as XLSX from "xlsx";
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-employee-master-data',
  imports: [NgxDaterangepickerBootstrapDirective, FormsModule, DateformatPipe,
    SelectModule, ReactiveFormsModule, CommonModule, NoDataFoundComponent, DataLoaderContentComponent, ],
  templateUrl: './employee-master-data.component.html',
  styleUrl: './employee-master-data.component.scss'
})

export class EmployeeMasterDataComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
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
  spinnerLoader1= false;
  spinnerLoader2= false;
  disableBtn= false;

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
    clearLabel: 'Clear',
  };

  constructor(
    private authService: AuthService, 
    private reportsService: ReportsService, 
    private fb: FormBuilder, 
    private http: HttpService,
    private modal: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    // this.getStandardReports();

    this.masterDataForm.patchValue({
      empStatus: 'All Employees',
    });

    this.masterDataForm.valueChanges.subscribe(()=>{
      this.disableBtn= true;
    });
  }

  initializeForm() {
    this.masterDataForm = this.fb.group({
      dateOfJoining: [null],
      empStatus: [''],
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
    this.spinnerLoader1= true;
    const formData = form.value;
  
    const isEmptyStatus = !formData.empStatus;
    const isEmptyDateRange = !formData.dateOfJoining;
  
    if (isEmptyStatus && isEmptyDateRange) {
      return;
    }
  
    this.dataload = true;
  
    const request: IStandardReportRequest = {
      dateRange: {
        startDate: formData.dateOfJoining?.startDate || null,
        endDate: formData.dateOfJoining?.endDate || null
      },
      employeeStatus: formData.empStatus === 'All Employees'? '' : formData.empStatus
    };
  
    this.subscription = this.reportsService.getStandardReports(request).subscribe({
      next: (res: any) => {
        if (res) {
          this.employeeMasterData = res.standardReports || [];
        }
        console.log(this.employeeMasterData);
      },
      error: (err: any) => {
        this.dataload = false;
        this.spinnerLoader1= false;
        this.disableBtn= true;
        this.employeeMasterData = [];
      },
      complete: () => {
        this.dataload = false;
        this.spinnerLoader1= false;
        this.disableBtn= false;
      }
    });
  }  

  onClickEmpMasterExport() {
    this.spinnerLoader2= true;
    let { arrayBuffer, fileName } = this.exportTableToExcel("employeeMasterData", "Employee_master_data")

    this.uploadReports(arrayBuffer, fileName)
    this.createReportLog("Employee Master Data")
  }

 

 exportTableToExcel(tableId: string, name?: string) {
    let { sheetName, fileName } = this.getFileName(name);
    let targetTableElm = document.getElementById(tableId);
    
    // First convert the table to a worksheet
    let ws = XLSX.utils.table_to_sheet(targetTableElm, <XLSX.Table2SheetOpts>{
      sheet: sheetName,
    });
    
    // Convert headers to uppercase and ensure they are properly formatted
    const range = XLSX.utils.decode_range(ws['!ref']!);
    
    // Format header row (first row) with bold font
    for (let C = range.s.c; C <= range.e.c; ++C) {
      let cellAddress = XLSX.utils.encode_cell({ r: range.s.r, c: C });
      if (ws[cellAddress]) {
        // Convert to uppercase
        ws[cellAddress].v = ws[cellAddress].v.toString().toUpperCase();
        ws[cellAddress].w = ws[cellAddress].v;
        
        // Add bold style to header
        ws[cellAddress].s = { font: { bold: true } };
      }
    }
    
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
    let sheetName = name || "ExportResult";
    let fileName = `${sheetName}-${timeSpan}`;
    return {
      sheetName,
      fileName
    };
  };
  navigation(){
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
          this.spinnerLoader2= false;
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
        this.modal.openSuccessModal('Employee Master Data downlaoded successfully');
        this.spinnerLoader2  =  false;
      },
      error: (err) => {
        this.spinnerLoader2= false;
        this.modal.openErrorModal('Failed to download employee masted data');
      },
      complete: () => { 
        this.spinnerLoader2= false;
      }
    })
  }

  extractPhoneCode(code: string | undefined): string {
  if (!code) return '';
  const match = code.match(/\((\+\d+)\)/);
  if (match) {
    return match[1];
  }
  return code.startsWith('+') ? code : '';
}

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
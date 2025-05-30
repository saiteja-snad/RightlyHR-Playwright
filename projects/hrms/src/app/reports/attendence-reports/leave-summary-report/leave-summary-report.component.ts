import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { filter, Subscription } from 'rxjs';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { AttandaceReportTabsComponent } from '../../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component';
import * as XLSX from 'xlsx';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { environment } from '../../../../environments/environment';
import { ILeavesummery } from '../../../Interfaces/reports.model';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-leave-summary-report',
  imports: [
    CommonModule,
    FormsModule,
    AttandaceReportTabsComponent,
    DropdownModule,
    SelectModule,
    TranslateModule,
    ReactiveFormsModule, NoDataFoundComponent,
    DataLoaderContentComponent,
    ModuleInformationComponent,
    NgbPopoverModule
],
  templateUrl: './leave-summary-report.component.html',
  styleUrl: './leave-summary-report.component.scss'
})
export class LeaveSummaryReportComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filterlvsumRecord: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  selectedEmployeeId: any = null;
  selectedWfhManager: string | null = null;
  selectedMonth: string | null = null;
  selectedLeave: string | null = null;
  selectedYear: string | null = null;
  uniqueLeaveCategory: any[] = [];
  years: number[] = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
  lvSummeryReportForm!: FormGroup;
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  selectedDateRange: any;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
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

  localeOptions: any = {
    applyLabel: 'ok',
    format: environment.dateformat.toUpperCase(),
    direction: 'ltr',
    clearLabel: 'Clear', // could be rtl
  };

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loggedInUser = this.authService.getToken();
    this.getEmployeeId();
    this.getLeaveSummaryReport();
    this.getTeam();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  clearAllFilters(): void {
    this.lvSummeryReportForm.reset();
    this.filterlvsumRecord = [];
  }

  initializeForm() {
    this.lvSummeryReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      year: [''],
      leaveCategory: [null]
    });

    this.lvSummeryReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  initiateUpdateModuleInfo(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/reports/attendence-reports/leave-summary-report': MODULE_INFOS.ATTENDANCE_LEAVE_SUMMARY_REPORTS_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  getEmployeeId() {
    const loggedInUser = this.authService.getToken();
    this.subscription = this.http

      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          const employeedata = data.map((employee: any) => {
            return {
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
                }${employee.lastName}`,
            };
          });

          this.employeeiddetails = [
            { fullName: 'All Employees', employeeId: 'all' },
            ...employeedata
          ];
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  getTeam() {
    this.subscription = this.http.getData('PendingApprovalsAuthority/getAll').subscribe({
      next: (data: any) => {
        this.teamdetails = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => console.log(reason),
    });
  }

  getLeaveSummaryReport() {
    this.subscription = this.reportsService.getLeaveSummaryReport({}).subscribe({
      next: (res: any) => {
        this.extractUniqueYearlyFilters(res);
      },
      error: (err: any) => console.log(err)
    });
  }

  extractUniqueYearlyFilters(data: any[]): void {
    const uniqueCategories = Array.from(new Set(data.map((item: any) => item.leaveType))).filter(Boolean);

    this.uniqueLeaveCategory = uniqueCategories.map(category => ({
      label: category,
      value: category
    }));
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format as 'YYYY-MM-DD'
  }

  parseDate(date: any): Date {
    return date instanceof Date ? date : new Date(date);
  }


  get isLeaveGenerateDisabled(): boolean {
    const form = this.lvSummeryReportForm;
    return !(
      form.get('employee')?.value ||
      form.get('manager')?.value ||
      form.get('year')?.value ||
      form.get('leaveCategory')?.value
    );
  }

  leavesummeryReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;

    const formValue = this.lvSummeryReportForm.value;
    const isAllEmployeesSelected = formValue.employee?.employeeId === 'all';
    // Check if no filter is provided
    const noFilterProvided =
      !formValue.employee &&
      !formValue.manager &&
      !formValue.leaveCategory &&
      !formValue.year;

    if (noFilterProvided) {
      this.filterlvsumRecord = [];
      this.filterlvsumRecord = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      return;
    }

    const request: ILeavesummery = {};

    if (formValue.employee?.employeeId) {
      request.EmployeeId = formValue.employee.employeeId !== 'all';
    }

    // Manager full name
    if (formValue.manager) {
      request.teamManagerID = formValue.manager.employeeId;
    }

    // Leave category
    if (formValue.leaveCategory) {
      request.LeaveName = formValue.leaveCategory.value;
    }

    // Year
    if (formValue.year) {
      request.Year = formValue.year;
    }

    if (!isAllEmployeesSelected && formValue.employee?.employeeId) {
      request.EmployeeId = formValue.employee.employeeId;
    }

    // Call service with the constructed request
    this.reportsService.getLeaveSummaryReport(request).subscribe({
      next: (data: any) => {
        // Extract the year from startDate and add it to each record
        this.filterlvsumRecord = data.map((record: any) => {
          const startDate = new Date(record.startDate);  // Assuming startDate is in a valid format
          return {
            ...record,
            year: startDate.getFullYear()  // Add the year as a new field
          };
        });

        if (this.filterlvsumRecord.length === 0) {
          // Show modal: no data
        } else {
          console.log('Fetched Yearly Record:', this.filterlvsumRecord);
        }
      },
      error: (error: any) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
      }
    });
  }

  exportToExcelYearly(): void {
    // Define header mappings
    this.spinnerLoader2 = true;
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      shift: 'SHIFT',
      monthName: 'MONTH',
      leaveType: 'LEAVE TYPE',
      availed: 'LEAVES AVAILED',
    };

    // Define new sequence
    const NEW_SEQUENCE: string[] = [
      'EMPLOYEE ID',
      'EMPLOYEE NAME',
      'DEPARTMENT',
      'TEAM MANAGER',
      'LOCATION',
      'SUB LOCATION',
      'SHIFT',
      'MONTH',
      'LEAVE TYPE',
      'LEAVES AVAILED',
    ];

    // Modify data with renamed headers and new sequence
    const modifiedData = this.filterlvsumRecord.map(record => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach(columnName => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (originalColumnName === 'startDate') {
            // Extract the year part from the date
            const year = new Date(record[originalColumnName]).getFullYear();
            modifiedRecord[columnName] = year;
          } else {
            modifiedRecord[columnName] = record[originalColumnName];
          }
        } else {
          modifiedRecord[columnName] = '';
        }
      });
      return modifiedRecord;
    });

    // Create a new empty worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]]);

    // Merge cells for WFH Report row from A1 to I1
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];

    // Add WFH Report row
    XLSX.utils.sheet_add_aoa(ws, [['LEAVE SUMMARY REPORT']], { origin: 'A1' });

    // Add header row
    const headerRow = NEW_SEQUENCE.map(columnName => HEADER_MAPPINGS[columnName]);
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3' });

    // Apply styles to WFH Report row
    const wfhReportCell = ws['A1'] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
    wfhReportCell.s = { font: { bold: true }, alignment: { horizontal: 'center' }, fill: { bgColor: { rgb: 'FFFF00' } } };
    ws['A1'] = wfhReportCell; // Assign the styled cell back to the worksheet

    // Apply styles to column headers
    NEW_SEQUENCE.forEach((columnName, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
      const cell = ws[cellAddress] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
      cell.s = { font: { bold: true }, alignment: { horizontal: 'center' }, fill: { bgColor: { rgb: '0000FF' } }, fontColor: { rgb: 'FFFFFF' } };
      ws[cellAddress] = cell; // Assign the styled cell back to the worksheet
    });

    // Adjust column width to fit data
    NEW_SEQUENCE.forEach((columnName, index) => {
      let columnWidth = this.getColumnWidth(modifiedData, columnName);

      if (columnName === 'EMPLOYEE ID' || columnName === 'DEPARTMENT' || columnName === 'APPLIED DATE' || columnName === 'SUB LOCATION') {
        columnWidth += 5; // Increase width by 5
      }
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'][index] = { wch: columnWidth };
    });

    // Generate Excel file and trigger download
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Summary Report');
    XLSX.writeFile(wb, 'Leave_Summary_Report.xlsx');
    this.spinnerLoader2 = false;
  }


  getColumnWidth(data: any[], columnName: string): number {
    // Find the maximum width of data in the column
    const maxWidth = data.reduce((max: number, record: any) => {
      const value = record[columnName]?.toString().length || 0;
      return value > max ? value : max;
    }, 0);

    // Set minimum width to 10
    return Math.max(10, maxWidth);
  }
   navigation(){
    this.router.navigate(['/reports']);
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}

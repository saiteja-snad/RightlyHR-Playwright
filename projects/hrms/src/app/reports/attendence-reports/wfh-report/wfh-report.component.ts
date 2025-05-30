import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { filter, Subscription } from 'rxjs';
import dayjs from 'dayjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { AuthService } from '../../../services/auth.service';
import { ReportsService } from '../../../services/reports/reports.service';
import * as XLSX from 'xlsx';
import { AttandaceReportTabsComponent } from '../../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component';
import { IWfhReportRequest } from '../../../Interfaces/reports.model';
import { HttpService } from '../../../services/http.service';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-wfh-report',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, NgxDaterangepickerBootstrapDirective,
    AttandaceReportTabsComponent, DropdownModule, SelectModule, TranslateModule,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    ModuleInformationComponent,
    NgbPopoverModule
],
  templateUrl: './wfh-report.component.html',
  styleUrl: './wfh-report.component.scss',
})
export class WfhReportComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  uniqueEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  filteredWfhEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  selectedDate: string | null = null;
  selectedDateRange: { startDate: any; endDate: any } | null = null;
  searchTerm: string = '';
  selectedEmployeeId: any = null;
  isDropdownOpen: boolean = false;
  isFilterGivenwfh: boolean = false;
  filteredWfhRecord: any[] = [];
  employeeMasterData: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  isDropdownOpenwfh: boolean = false;
  selectedWfhManager: string | null = null;
  selectedMonth: number | null = null;
  wfhReportForm!: FormGroup;
  spinnerLoader1= false;
  spinnerLoader2= false;
  disableBtn= false;
  getEmployeeInfo = [] as any;
  selectLeaveEmployeeIds: number[] = [];
  filteredleaveRecords = true;

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

  localeOptions: any;
  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router
  ) {}

  ngOnInit(): void {
      this.localeOptions = {
      applyLabel: 'ok',
      format: this.authService.convertAngularDateFormatToJs(environment.dateformat).toUpperCase(),
      direction: 'ltr',
      clearLabel: 'Clear', // could be rtl
    };
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getEmployeeId();
    this.getTeam();
    this.getMyTeam();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initializeForm() {
    this.wfhReportForm = this.fb.group({
      employee: [null, Validators.required],
      manager: [null],
      dateRange: [null],
      team:[null]
    });

    this.wfhReportForm.valueChanges.subscribe(()=>{
      this.disableBtn= true;
    })
  }

  get isWFHGenerateDisabled(): boolean {
    const { employee, manager, dateRange, leaveCategory, team } = this.wfhReportForm.value;
    
    // Check if any field has a value
    return !(
        employee ||
        manager ||
        (dateRange && (dateRange.startDate || dateRange.endDate)) ||
        leaveCategory ||
        team
    );
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
      '/reports/attendence-reports/wfh-report': MODULE_INFOS.ATTENDANCE_WFH_REPORTS_MODULE_INFO
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
    this.subscription = this.http
      .getData('PendingApprovalsAuthority/getAll')
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.teamdetails = data.map((employee: any) => {
              return {
                ...employee,
                fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
              };
            });
          }
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  generateWfhReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;

    const formValue = this.wfhReportForm.value;
    const isAllEmployeesSelected = formValue.employee?.employeeId === 'all';
  
    const noFilterProvided =
      !formValue.employee &&
      (!formValue.dateRange?.startDate || !formValue.dateRange?.endDate) &&
      !formValue.month &&
      !formValue.manager && !formValue.team;
  
    if (noFilterProvided) {
      this.spinnerLoader1 = false;
      this.isLoading = false;
      this.filteredWfhRecord = [];
      return;
    }
  
    const request: IWfhReportRequest = {};

    if (this.selectLeaveEmployeeIds.length >= 0) {
      const ids = this.selectLeaveEmployeeIds?.join(',');
      request.employeeId = ids;  // The selected employee IDs are set here
    }
    
    if (formValue.employee?.employeeId !== 'all' && formValue.employee?.employeeId) {
      request.employeeId = formValue.employee.employeeId;
    }

    if (formValue.dateRange?.startDate && formValue.dateRange?.endDate) {
      const startDate = this.formatDate(this.parseDate(formValue.dateRange.startDate));
      const endDate = this.formatDate(this.parseDate(formValue.dateRange.endDate));
      request.StartDate = startDate;
      request.EndDate = endDate;
    }

    if (formValue.month) {
      request.Worked_Month = formValue.month;
    }

    if (formValue.manager) {
      request.teamManagerID = formValue.manager.employeeId;
    }

    // Only include filters if not "All Employees"
    if (!isAllEmployeesSelected && formValue.employee?.employeeId) {
      request.employeeId = formValue.employee.employeeId;
    }

    // Single API call
    this.reportsService.getWfhReports(request).subscribe({
      next: (response: any) => {
        this.filteredWfhRecord = response ?? [];
      },
      error: (error) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredWfhRecord = [];
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
      }
    });
  }

  clearAllFilters(): void {
    this.wfhReportForm.reset();
    this.filteredWfhRecord = [];
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
  
  exportToExcelWfh(): void {
    // Define header mappings
    this.spinnerLoader2= true;
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      shift: 'SHIFT',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      worked_Date: 'WFH DATE',
      duration: 'DURATION',
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
      'WFH DATE',
      'DURATION',
    ];

    // Modify data with renamed headers and new sequence
    const modifiedData = this.filteredWfhRecord.map((record) => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach((columnName) => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(
          (key) => HEADER_MAPPINGS[key] === columnName
        );
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (record[originalColumnName] === null) {
            modifiedRecord[columnName] = '-';
          } else if (originalColumnName === 'worked_Date') {
            const date = new Date(record[originalColumnName]);
            modifiedRecord[
              columnName
            ] = `${date.getDate()}-${date.toLocaleString('default', {
              month: 'short',
            })}-${date.getFullYear()}`;
          } else {
            modifiedRecord[columnName] = record[originalColumnName];
          }
        } else {
          modifiedRecord[columnName] = '-';
        }
      });
      return modifiedRecord;
    });

    // Create a new empty worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]]);

    // Merge cells for WFH Report row from A1 to I1
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } },
    ];

    // Add WFH Report row
    XLSX.utils.sheet_add_aoa(ws, [['WFH REPORT']], { origin: 'A1' });

    // Add header row
    const headerRow = NEW_SEQUENCE.map(
      (columnName) => HEADER_MAPPINGS[columnName]
    );
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3' });

    // Apply styles to WFH Report row
    const wfhReportCell = ws['A1'] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
    wfhReportCell.s = {
      font: { bold: true },
      alignment: { horizontal: 'center' },
      fill: { bgColor: { rgb: 'FFFF00' } },
    };
    ws['A1'] = wfhReportCell; // Assign the styled cell back to the worksheet

    // Apply styles to column headers
    NEW_SEQUENCE.forEach((columnName, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
      const cell = ws[cellAddress] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
      cell.s = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
        fill: { bgColor: { rgb: '0000FF' } },
        fontColor: { rgb: 'FFFFFF' },
      };
      ws[cellAddress] = cell; // Assign the styled cell back to the worksheet
    });

    // Adjust column width to fit data
    NEW_SEQUENCE.forEach((columnName, index) => {
      let columnWidth = this.getColumnWidth(modifiedData, columnName);

      if (
        columnName === 'EMPLOYEE ID' ||
        columnName === 'DEPARTMENT' ||
        columnName === 'WORKED DATE'
      ) {
        columnWidth += 5; // Increase width by 5
      }
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'][index] = { wch: columnWidth };
    });

    // Generate Excel file and trigger download
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WFH Report');
    XLSX.writeFile(wb, 'WFH_Report.xlsx');
    this.spinnerLoader2= false;
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

  onClick(employeeIds: any) {
    if (employeeIds.value) {
      console.log(employeeIds);
      this.filteredleaveRecords = false;
      this.selectLeaveEmployeeIds = [];
      this.selectedEmployeeId = [];
      // If "All Employees" is selected, set employeeId as an empty array or a special flag
      if (employeeIds.value.employeeId == this.loggedInUser.employeeId) {
        this.selectLeaveEmployeeIds = this.getEmployeeInfo.filter((employee: any) => employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId); // Select all employees
        this.selectedEmployeeId = this.getEmployeeInfo.filter((employee: any) => employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
      } else {
        this.selectLeaveEmployeeIds.push(employeeIds.value.employeeId);
        this.selectedEmployeeId.push(employeeIds.value.employeeId);
      }
    }
  }

  getMyTeam() {
    const EmployeeId = this.loggedInUser?.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          if (response) {
            const myTeam = response.filter((e: any) => e.isAccess);
            this.getEmployeeInfo = myTeam.map((employee: any) => {
              return {
                ...employee,
                fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                  }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
                  }${employee.lastName}`,
              };
            });

            this.getEmployeeInfo.unshift({
              fullName: 'All Employees',
              fusionEmpId: this.loggedInUser.fusionEmpId,
              employeeId: this.loggedInUser.employeeId,
            });
          }
        },
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

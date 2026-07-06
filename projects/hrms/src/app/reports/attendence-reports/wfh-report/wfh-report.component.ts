import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation, } from '@angular/core';
import { Subscription } from 'rxjs';
import dayjs, { Dayjs } from 'dayjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { AuthService } from '../../../services/auth.service';
import { ReportsService } from '../../../services/reports/reports.service';
import * as XLSX from 'xlsx-js-style';
import { IWfhReportRequest } from '../../../Interfaces/reports.model';
import { HttpService } from '../../../services/http.service';
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { DatePicker } from 'primeng/datepicker';
import { NgbOffcanvas, NgbOffcanvasRef } from '@ng-bootstrap/ng-bootstrap';
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-wfh-report',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, DatePicker, DropdownModule, MultiSelectModule, TranslateModule,
    NoDataFoundComponent, DataLoaderContentComponent, ReportsHeaderComponent, TableModule
  ],
  templateUrl: './wfh-report.component.html',
  styleUrl: './wfh-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class WfhReportComponent implements OnInit, OnDestroy {
  @ViewChild('dt') table!: Table;
  moduleinfo: string = '';
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
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  getEmployeeInfo = [] as any;
  selectLeaveEmployeeIds: number[] = [];
  filteredleaveRecords = true;
  
  // Sorting properties
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  currentUIField: string | null = null; // Track the UI field name for visual state
  originalWfhRecord: any[] = []; // Store original order for reset
  
  // Sort field mapping for client-side sorting
  readonly sortFieldMap: Record<string, string> = {
    fusionEmpId: 'fusionEmpId',
    employeeName: 'employeeName',
    department: 'department',
    teamManagerName: 'teamManagerName',
    shift: 'shift',
    location: 'location',
    subLocation: 'subLocation',
    worked_Date: 'worked_Date',
    duration: 'duration'
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
  localeOptions: any;
  private offcanvasRef: NgbOffcanvasRef | undefined;
  today: Date = new Date();

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private offcanvasService: NgbOffcanvas
  ) { }

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
  }

  initializeForm() {
    this.wfhReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      dateRange: [null],
      team: [null]
    });

    this.wfhReportForm.get('manager')?.valueChanges.subscribe((managers: any[]) => {
      if (managers && managers.length > 0) {
        const managerIds = managers.map(m => m.employeeId).join(',');
        this.getEmployeeId(managerIds);
      } else {
        this.getEmployeeId();
      }
      this.wfhReportForm.get('employee')?.setValue(null);
    });

    this.wfhReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  isAnyFilterApplied(): boolean {
    const form = this.wfhReportForm;
    const value = form.value;
    const hasEmployee = !!value.employee;
    const hasManager = !!value.manager;
    const hasTeam = !!value.team;
    const range = value.dateRange;
    const hasDateRange = !!(range && (range[0] || range[1] || range.startDate || range.endDate));
    return hasEmployee || hasManager || hasTeam || hasDateRange;
  }

  get isWFHGenerateDisabled(): boolean {
    const { employee, manager, dateRange, team } = this.wfhReportForm.value;
    const isEmployeeSelected = employee && employee.length > 0;
    const isManagerSelected = manager && manager.length > 0;
    const isTeamSelected = team && team.length > 0;
    const isDateSelected = dateRange && dateRange.length > 0;

    return !(isEmployeeSelected || isManagerSelected || isDateSelected || isTeamSelected);
  }

  getEmployeeId(managerIds?: string) {
    let url = 'Employeedata/employees/by-managers';
    if (managerIds) {
      url += `?managerIds=${managerIds}`;
    }

    this.subscription = this.http.getData(url).subscribe({
      next: (data: any) => {
        const loggedInEmployee = {
          ...this.loggedInUser,
          fullName: `${this.loggedInUser.fusionEmpId ? this.loggedInUser.fusionEmpId + ' - ' : ''}${this.loggedInUser.firstName} ${this.loggedInUser.middleName ? this.loggedInUser.middleName + ' ' : ''}${this.loggedInUser.lastName}`.trim(),
        };

        const mappedData = data.map((employee: any) => {
          const firstName = employee.firstName ? employee.firstName.trim() : '';
          const middleName = employee.middleName ? employee.middleName.trim() : '';
          const lastName = employee.lastName ? employee.lastName.trim() : '';
          
          return {
            ...employee,
            firstName,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
          };
        });

        const combinedData = [loggedInEmployee, ...mappedData];

        // Filter unique by employeeId and sort by firstName
        this.employeeiddetails = combinedData
          .filter((employee, index, self) =>
            index === self.findIndex((e) => e.employeeId === employee.employeeId)
          )
          .sort((a: any, b: any) => (a.firstName ?? '').toLowerCase().localeCompare((b.firstName ?? '').toLowerCase()));
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getTeam() {
    const statuses = 'Active';
    this.subscription = this.http.getData(`PendingApprovalsAuthority/getAll?statuses=${encodeURIComponent(statuses)}`).subscribe({
      next: (data: any) => {
        if (data) {
          const loggedInEmployee = {
            ...this.loggedInUser,
            fusionEmployeeId: this.loggedInUser.fusionEmpId,
            fullName: `${this.loggedInUser.fusionEmpId ? this.loggedInUser.fusionEmpId + ' - ' : ''}${this.loggedInUser.firstName} ${this.loggedInUser.middleName ? this.loggedInUser.middleName + ' ' : ''}${this.loggedInUser.lastName}`.trim(),
          };

          const mappedData = data.map((employee: any) => {
            return {
              ...employee,
              fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`.trim(),
            };
          });

          const combinedData = [loggedInEmployee, ...mappedData];

          // Filter unique by employeeId and sort by firstName
          this.teamdetails = combinedData
            .filter((employee, index, self) =>
              index === self.findIndex((e) => e.employeeId === employee.employeeId)
            )
            .sort((a: any, b: any) => (a.firstName ?? '').toLowerCase().localeCompare((b.firstName ?? '').toLowerCase()));
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
    const dateRangeArray = formValue.dateRange || [];
    const startDate: Dayjs | null = dateRangeArray[0] ? dayjs(dateRangeArray[0]) : null;
    const endDate: Dayjs | null = dateRangeArray[1] ? dayjs(dateRangeArray[1]) : (startDate ? startDate : null);
    
    const isEmployeeSelected = formValue.employee && formValue.employee.length > 0;
    const isManagerSelected = formValue.manager && formValue.manager.length > 0;
    const isTeamSelected = formValue.team && formValue.team.length > 0;
    const isDateSelected = startDate && endDate;

    //filter condition
    const noFilterProvided = !isEmployeeSelected && !isDateSelected && !formValue.month && !isManagerSelected && !isTeamSelected;

    if (noFilterProvided) {
      this.spinnerLoader1 = false;
      this.isLoading = false;
      this.filteredWfhRecord = [];
      return;
    }

    const request: IWfhReportRequest = {};

    // Check if My Team dropdown is visible
    const isMyTeamVisible = this.rbac.allowedToAccess('My Team Report(WFH).view') &&
      !this.rbac.allowedToAccess('Attendance All Employees List(WFH).view') &&
      !this.rbac.allowedToAccess('Attendance Team Manager List(WFH).view');

    if (isMyTeamVisible) {
      (request as any).ReportingManagerId = this.loggedInUser.employeeId;
    }

    // Handle Employee Multi-Select
    if (isEmployeeSelected) {
      const isAllEmployeesSelected = formValue.employee.some((emp: any) => emp.employeeId === 'all');
      
      if (!isAllEmployeesSelected) {
        const employeeIds = formValue.employee.map((emp: any) => emp.employeeId).join(',');
        request.employeeId = employeeIds;
      }
    }

    // Handle Manager Multi-Select
    if (isManagerSelected) {
      const managerIds = formValue.manager.map((mgr: any) => mgr.employeeId).join(',');
      request.teamManagerID = managerIds;
    }

    // Handle Team Multi-Select
    if (isTeamSelected) {
       const teamMemberIds = formValue.team.map((member: any) => member.employeeId).join(',');
       request.employeeId = teamMemberIds;
    }

    // Apply date range if provided
    if (startDate && endDate) {
      request.StartDate = this.formatDate(this.parseDate(startDate));
      request.EndDate = this.formatDate(this.parseDate(endDate));
    }

    if (formValue.month) {
      request.Worked_Month = formValue.month;
    }

    // Single API call
    this.reportsService.getWfhReports(request).subscribe({
      next: (response: any) => {
        this.filteredWfhRecord = response ?? [];
        this.originalWfhRecord = [...this.filteredWfhRecord]; // Store original order
        // Apply current sorting if any
        this.applySorting();
      },
      error: (error) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredWfhRecord = [];
        this.originalWfhRecord = [];
        this.closeCanvas();
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
        this.closeCanvas();
      }
    });
  }

  // Method to handle column header clicks
  onColumnSort(field: string): void {
    const backendField = this.sortFieldMap[field] || field;

    // Handle the three-state sorting: none → asc → desc → none
    if (this.currentUIField === field) {
      // Same field clicked - cycle through states
      if (this.currentSortOrder === 0) {
        // Currently no sort, set to ascending
        this.currentSortOrder = 1;
        this.currentSortField = backendField;
        this.currentUIField = field;
      } else if (this.currentSortOrder === 1) {
        // Currently ascending, set to descending
        this.currentSortOrder = -1;
        this.currentSortField = backendField;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to no sort
        this.currentSortField = '';
        this.currentUIField = null as any;
        this.currentSortOrder = 0;
        
        // Manually reset PrimeNG table sort state
        if (this.table) {
          this.table.reset();
        }
        
        // Reload data without sorting
        this.applySorting();
        return;
      }
    } else {
      // Different field clicked - start with ascending
      this.currentUIField = field;
      this.currentSortField = backendField;
      this.currentSortOrder = 1; // Always start with ascending for new field
    }

    // Apply sorting
    this.applySorting();
  }

  // Apply sorting to the filtered data
  applySorting(): void {
    if (!this.currentSortField || this.currentSortOrder === 0) {
      // No sorting - restore original order
      if (this.originalWfhRecord.length > 0) {
        this.filteredWfhRecord = [...this.originalWfhRecord];
      }
      return;
    }

    this.filteredWfhRecord = [...this.filteredWfhRecord].sort((a: any, b: any) => {
      const field = this.currentSortField;
      let valueA = a[field];
      let valueB = b[field];

      // Handle null/undefined values
      if (valueA == null) valueA = '';
      if (valueB == null) valueB = '';

      // Handle different data types
      if (field === 'worked_Date') {
        // Date comparison
        const dateA = new Date(valueA).getTime();
        const dateB = new Date(valueB).getTime();
        return this.currentSortOrder === 1 ? dateA - dateB : dateB - dateA;
      } else {
        // String comparison (case-insensitive)
        const strA = String(valueA).toLowerCase();
        const strB = String(valueB).toLowerCase();
        if (strA < strB) return this.currentSortOrder === 1 ? -1 : 1;
        if (strA > strB) return this.currentSortOrder === 1 ? 1 : -1;
        return 0;
      }
    });
  }

  customSort(event: any): void {
    // This method is kept for compatibility but does nothing
    // We handle sorting through onColumnSort instead
    return;
  }

  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  onGenerate(): void {
    this.isFilterIndicatorActive = this.isFilterApplied();
    this.generateWfhReport();
  }

  isFilterApplied(): boolean {
    const formValue = this.wfhReportForm.value;
    return (
      (formValue.employee && formValue.employee.length > 0) ||
      (formValue.dateRange && formValue.dateRange.length > 0) ||
      (formValue.manager && formValue.manager.length > 0) ||
      (formValue.team && formValue.team.length > 0)
    );
  }

  clearAllFilters(): void {
    this.wfhReportForm.reset();
    this.filteredWfhRecord = [];
    this.originalWfhRecord = []; // Clear original order too
    this.isFilterIndicatorActive = false;
    
    // Reset sorting arrows
    this.currentSortField = '';
    this.currentUIField = null;
    this.currentSortOrder = 0;
    
    // Reset the table sort state
    if (this.table) {
      this.table.reset();
    }
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
    this.spinnerLoader2 = true;
    setTimeout(() => {
      // Define header mappings
      const HEADER_MAPPINGS: { [key: string]: string } = {
        fusionEmpId: 'EMPLOYEE ID',
        employeeName: 'EMPLOYEE NAME',
        department: 'DEPARTMENT',
        teamManagerName: 'TEAM MANAGER',
        shift: 'SHIFT',
        location: 'LOCATION',
        subLocation: 'SUB LOCATION',
        worked_Date: 'WFH DATE',
        duration: 'AVAILED',
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
        'AVAILED',
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
              modifiedRecord[columnName] = dayjs(record[originalColumnName]).format('MMM DD, YYYY');
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

      // Add data rows (Headers will be automatically generated at A2)
      XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A2' });

      // Apply styles to WFH Report row
      const wfhReportCell = ws['A1'] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
      wfhReportCell.s = {
        font: { bold: true, sz: 14, color: { rgb: "000000" } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };

      // Explicitly set row height
      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][0] = { hpt: 25 };

      ws['A1'] = wfhReportCell; // Assign the styled cell back to the worksheet

      // Apply styles to column headers
      NEW_SEQUENCE.forEach((columnName, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
        const cell = ws[cellAddress] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
        cell.s = {
          font: { bold: true },
          alignment: { horizontal: 'center' }
        };
        ws[cellAddress] = cell; // Assign the styled cell back to the worksheet
      });

      // Apply styles to data rows
      modifiedData.forEach((record, rowIndex) => {
        NEW_SEQUENCE.forEach((columnName, colIndex) => {
          const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 2, c: colIndex });
          const cell = ws[cellAddress] || { t: '', v: '' };
          cell.s = {
            alignment: { horizontal: 'center', vertical: 'center' }
          };
          ws[cellAddress] = cell;
        });
      });

      // Adjust column width to fit data
      NEW_SEQUENCE.forEach((columnName, index) => {
        let columnWidth = this.getColumnWidth(modifiedData, columnName);

        if (columnName === 'EMPLOYEE ID' || columnName === 'DEPARTMENT' || columnName === 'WORKED DATE') {
          columnWidth += 5; // Increase width by 5
        }
        ws['!cols'] = ws['!cols'] || [];
        ws['!cols'][index] = { wch: columnWidth };
      });

      // Generate Excel file and trigger download
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'WFH Report');
      const fileName = `WFH Report - ${dayjs().format('MMM DD YYYY')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      this.spinnerLoader2 = false;
    }, 100);
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

  getMyTeam() {
    const EmployeeId = this.loggedInUser?.employeeId;
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
      next: (response: any) => {
        if (response) {
          const myTeam = response.filter((e: any) => e.isAccess);
          this.getEmployeeInfo = myTeam.map((employee: any) => {
            return {
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : '' }${employee.firstName} 
              ${employee.middleName ? employee.middleName + ' ' : '' }${employee.lastName}`,
            };
          });

          const isUserInList = this.getEmployeeInfo.some((e: any) => e.employeeId === this.loggedInUser.employeeId);
          if (!isUserInList) {
            this.getEmployeeInfo.unshift({
              ...this.loggedInUser,
              fullName: `${this.loggedInUser.fusionEmpId ? this.loggedInUser.fusionEmpId + ' - ' : ''}${this.loggedInUser.firstName} ${this.loggedInUser.middleName ? this.loggedInUser.middleName + ' ' : ''}${this.loggedInUser.lastName}`,
            });
          }

          this.getEmployeeInfo.sort((a: any, b: any) =>
            (a.firstName?.toLowerCase() ?? '').localeCompare(b.firstName?.toLowerCase() ?? '')
          );
        }
      },
    });
  }

  navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

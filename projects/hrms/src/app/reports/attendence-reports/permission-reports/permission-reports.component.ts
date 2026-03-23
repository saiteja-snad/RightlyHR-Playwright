import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Select } from 'primeng/select';
import { IemployeeDetails, ITeamManagerEmployees } from '../reports.modal';
import dayjs, { Dayjs } from 'dayjs';
import { environment } from '../../../../environments/environment';
import { IAttendanceDetails } from '../../../Interfaces/reports.model';
import * as XLSX from 'xlsx-js-style';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { DatePicker } from 'primeng/datepicker';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-permission-reports',
  imports: [CommonModule, ReactiveFormsModule, Select, DatePicker, DataLoaderContentComponent, MultiSelectModule, NoDataFoundComponent, ReportsHeaderComponent],
  templateUrl: './permission-reports.component.html',
  styleUrl: './permission-reports.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class PermissionReportsComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  subscription!: Subscription;
  permissionReportForm!: FormGroup;
  loggedInUser = {} as IemployeeDetails;
  employeeDetails: IemployeeDetails[] = [];
  teamManagerDetails: ITeamManagerEmployees[] = [];
  filteredPermissionData: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  isLoading = false;
  getEmployeeInfo = [] as any;
  selectLeaveEmployeeIds: number[] = [];
  filteredleaveRecords = true;
  selectedEmployeeId: any = null;
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
    this.getAllEmployees();
    this.getTeam();
    this.getMyTeam();
    // this.getAttendanceReports();
  }

  initializeForm() {
    this.permissionReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      dateRange: [null],
      team: [null]
    });

    this.permissionReportForm.get('manager')?.valueChanges.subscribe((managers: any[]) => {
      if (managers && managers.length > 0) {
        const managerIds = managers.map(m => m.employeeId).join(',');
        this.getAllEmployees(managerIds);
      } else {
        this.getAllEmployees();
      }
      this.permissionReportForm.get('employee')?.setValue(null);
    });

    this.permissionReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  isAnyFilterApplied(): boolean {
    const form = this.permissionReportForm;
    const value = form.value;
    const hasEmployee = !!value.employee;
    const hasManager = !!value.manager;
    const hasTeam = !!value.team;
    const range = value.dateRange;
    const hasDateRange = !!(range && (range[0] || range[1] || range.startDate || range.endDate));
    return hasEmployee || hasManager || hasTeam || hasDateRange;
  }

  get isPermissionGenerateDisabled(): boolean {
    const { employee, manager, dateRange, leaveCategory, team } = this.permissionReportForm.value;
    // Check if any field has a value
    return !((employee && employee?.length > 0) || 
             (manager && manager?.length > 0) || 
             (dateRange && dateRange?.length === 2 && dateRange[0] && dateRange[1]) || 
             leaveCategory || 
             (team && team?.length > 0));
  }

  getAllEmployees(managerIds?: string) {
    let url = 'Employeedata/employees/by-managers';
    if (managerIds) {
      url += `?managerIds=${managerIds}`;
    }

    this.http.getData(url).pipe(takeUntil(this.destroy$))
      .subscribe({
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
          this.employeeDetails = combinedData
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
  this.http.getData(`PendingApprovalsAuthority/getAll?statuses=${encodeURIComponent(statuses)}`).pipe(takeUntil(this.destroy$)).subscribe({
    next: (data: any) => {
      if (data) {
        const loggedInEmployee = {
          ...this.loggedInUser,
          fusionEmployeeId: this.loggedInUser.fusionEmpId,
          fullName: `${this.loggedInUser.fusionEmpId ? this.loggedInUser.fusionEmpId + ' - ' : ''}${this.loggedInUser.firstName} ${this.loggedInUser.middleName ? this.loggedInUser.middleName + ' ' : ''}${this.loggedInUser.lastName}`.trim(),
        };

        const mappedData = data.map((employee: any) => {
          const firstName = employee.firstName ? employee.firstName.trim() : '';
          const middleName = employee.middleName ? employee.middleName.trim() : '';
          const lastName = employee.lastName ? employee.lastName.trim() : '';

          return {
            ...employee,
            firstName,
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
          };
        });

        const combinedData = [loggedInEmployee, ...mappedData];

        // Filter unique by employeeId and sort by firstName
        this.teamManagerDetails = combinedData
          .filter((employee, index, self) =>
            index === self.findIndex((e) => e.employeeId === employee.employeeId)
          )
          .sort((a: any, b: any) => (a.firstName ?? '').toLowerCase().localeCompare((b.firstName ?? '').toLowerCase()));
      }
    },
    error: (reason: any) => console.log(reason),
  });
}

  clearAllFilters() {
    this.permissionReportForm.reset();
    this.filteredPermissionData = [];
    this.isFilterIndicatorActive = false;
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

  onGenerate(): void {
    this.isFilterIndicatorActive = this.isAnyFilterApplied();
    this.generatePermissionReport();
  }

  generatePermissionReport(): void {
    this.offcanvasService.dismiss();
    this.spinnerLoader1 = true;
    this.isLoading = true;
    const formValue = this.permissionReportForm.value;
    
    const dateRangeArray = formValue.dateRange || [];
    const startDate: Dayjs | null = dateRangeArray[0] ? dayjs(dateRangeArray[0]) : null;
    const endDate: Dayjs | null = dateRangeArray[1] ? dayjs(dateRangeArray[1]) : (startDate ? startDate : null);
    
    // Check if any filter is provided
    const isEmployeeSelected = formValue.employee && formValue.employee.length > 0;
    const isManagerSelected = formValue.manager && formValue.manager.length > 0;
    const isTeamSelected = formValue.team && formValue.team.length > 0;
    const isDateSelected = startDate && endDate;

    const noFilterProvided = !isEmployeeSelected && !isDateSelected && !formValue.month && !isManagerSelected && !isTeamSelected;

    if (noFilterProvided) {
      this.filteredPermissionData = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      return;
    }

    const request: IAttendanceDetails = {};

    // Check if My Team dropdown is visible
    const isMyTeamVisible = this.rbac.allowedToAccess('My Team Report(Permission).view') &&
      !this.rbac.allowedToAccess('Attendance All Employees List(Permission).view') &&
      !this.rbac.allowedToAccess('Attendance Team Manager List(Permission).view');

    if (isMyTeamVisible) {
      (request as any).ReportingManagerId = this.loggedInUser.employeeId;
    }

    // Handle Employee Multi-Select
    if (isEmployeeSelected) {
      const employeeIds = formValue.employee.map((emp: any) => emp.employeeId).join(',');
      request.employeeId = employeeIds;
    }

    // Handle Manager Multi-Select
    if (isManagerSelected) {
      const managerIds = formValue.manager.map((mgr: any) => mgr.employeeId).join(',');
      request.teamManagerId = managerIds;
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

    this.reportsService.gterPermissionReports(request).subscribe({
      next: (response: any) => {
        this.filteredPermissionData = response ?? [];
      },
      error: (error) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredPermissionData = [];
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

  exportToExcelPemrissionReport(): void {
    this.spinnerLoader2 = true;
    setTimeout(() => {
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManager: 'TEAM MANAGER',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
       shift: 'SHIFT',
      utilizedCount: 'UTILIZED COUNT',
      totalDuration: 'TOTAL DURATION (HH:MM)',
    };

    const NEW_SEQUENCE: string[] = [
      'EMPLOYEE ID',
      'EMPLOYEE NAME',
      'DEPARTMENT',
      'TEAM MANAGER',
      'LOCATION',
      'SUB LOCATION',
      'SHIFT',
      'UTILIZED COUNT',
      'TOTAL DURATION (HH:MM)',
    ];

    const modifiedData = this.filteredPermissionData.map(record => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach(columnName => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (originalColumnName === 'permissionDate' && record[originalColumnName]) {
            // Convert the date to a Date object
            const date = new Date(record[originalColumnName]);

            // Format the date to 'dd MMM yyyy'
            const date_formatted = `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

            // Assign the formatted date to the modified record
            modifiedRecord[columnName] = date_formatted;
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

    // Merge cells for Leave Report row from A1 to J1
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];

    // Add Leave Report row
    XLSX.utils.sheet_add_aoa(ws, [['PERMISSION REPORT']], { origin: 'A1' });

    // Add header row
    XLSX.utils.sheet_add_aoa(ws, [NEW_SEQUENCE], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3', skipHeader: true });

    // Apply styles to Report Title row to match other reports
    const leaveReportCell = ws['A1'] || { t: '', v: '' };
    leaveReportCell.s = { 
      font: { bold: true, sz: 14, color: { rgb: "000000" } }, 
      alignment: { horizontal: 'center', vertical: 'center' } 
    };
    // Explicitly set row height for title
    if (!ws['!rows']) ws['!rows'] = [];
    ws['!rows'][0] = { hpt: 25 };
    ws['A1'] = leaveReportCell;

    // Apply styles to column headers
    NEW_SEQUENCE.forEach((columnName, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
      const cell = ws[cellAddress] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
      cell.s = { font: { bold: true }, alignment: { horizontal: 'center' } };
      ws[cellAddress] = cell; // Assign the styled cell back to the worksheet
    });
    // Apply styles to data rows
    for (let rowIndex = 2; rowIndex < modifiedData.length + 2; rowIndex++) {
      NEW_SEQUENCE.forEach((columnName, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: index });
        const cell = ws[cellAddress] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
        cell.s = { alignment: { horizontal: 'center', vertical: 'middle' } };
        ws[cellAddress] = cell; // Assign the styled cell back to the worksheet
      });
    }

    // Adjust column width to fit data
    NEW_SEQUENCE.forEach((columnName, index) => {
      let columnWidth = this.getColumnWidth(modifiedData, columnName);
      // Increase the width for 'EMPLOYEE ID' and 'DEPARTMENT' columns
      if (columnName === 'EMPLOYEE ID' || columnName === 'SUB LOCATION' || columnName === 'DEPARTMENT') {
        columnWidth += 5; // Increase width by 5
      }
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'][index] = { wch: columnWidth };
    });

    // Generate Excel file and trigger download
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Permission Report');
    const today = dayjs().format('DD-MMM-YYYY');
    XLSX.writeFile(wb, `Permission Report - ${dayjs().format('MMM DD YYYY')}.xlsx`);
    this.spinnerLoader2 = false;
  }, 100);
  }

  getColumnWidth(data: any[], columnName: string): number {
    const maxWidth = data.reduce((max: number, record: any) => {
      const value = record[columnName]?.toString().length || 0;
      return value > max ? value : max;
    }, 0);
    return Math.max(10, maxWidth);
  }

  onClick(employeeIds: any) {
    if (employeeIds.value) {
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

  getMyTeam() {
    const EmployeeId = this.loggedInUser?.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
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
            // this.getEmployeeInfo.unshift({
            //   fullName: 'All Employees',
            //   fusionEmpId: this.loggedInUser.fusionEmpId,
            //   employeeId: this.loggedInUser.employeeId,
            // });
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
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

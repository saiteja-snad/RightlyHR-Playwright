import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { IemployeeDetails } from '../reports.modal';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import dayjs, { Dayjs } from 'dayjs';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { ReportsHeaderComponent } from '../../../shared/reports-tabs/reports-header/reports-header.component';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { IWfhReportRequest } from '../../../Interfaces/reports.model';
import * as XLSX from 'xlsx-js-style';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { NgbPopoverModule, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-extraloghour-report',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DatePicker, DropdownModule, SelectModule, MultiSelectModule, TranslateModule, NgbPopoverModule,
    NoDataFoundComponent, DataLoaderContentComponent, ReportsHeaderComponent, InfoIconComponent, TableModule],
  templateUrl: './extraloghour-report.component.html',
  styleUrl: './extraloghour-report.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class ExtraloghourReportComponent implements OnInit, OnDestroy {
  @ViewChild('extraLogTable') extraLogTable!: Table;
  moduleinfo: string = '';
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  uniqueEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  filteredRemoteEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  selectedDate: string | null = null;
  selectedDateRange: { startDate: any; endDate: any } | null = null;
  searchTerm: string = '';
  selectedEmployeeId: any = null;
  isDropdownOpen: boolean = false;
  isFilterGivenwfh: boolean = false;
  filteredExtraLogHourRecord: any[] = [];
  originalFilteredExtraLogHourRecord: any[] = [];
  employeeMasterData: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  isDropdownOpenwfh: boolean = false;
  selectedWfhManager: string | null = null;
  selectedMonth: number | null = null;
  extraLogHourReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  getEmployeeInfo = [] as any;
  selectLeaveEmployeeIds: number[] = [];
  filteredleaveRecords = true;
  currentSortField: string = '';
  currentSortOrder: number = 0;
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

  toggleFilters(content: any) {
    this.offcanvasService.open(content, { position: 'end',  backdrop: 'static', });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  onGenerate(): void {
    this.isFilterIndicatorActive = this.isAnyFilterApplied();
    this.getExtraLogHoursReports();
  }

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
    this.extraLogHourReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      dateRange: [null],
      team: [null]
    });

    this.extraLogHourReportForm.get('manager')?.valueChanges.subscribe((managers: any[]) => {
      if (managers && managers.length > 0) {
        const managerIds = managers.map(m => m.employeeId).join(',');
        this.getEmployeeId(managerIds);
      } else {
        this.getEmployeeId();
      }
      this.extraLogHourReportForm.get('employee')?.setValue(null);
    });

    this.extraLogHourReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  isAnyFilterApplied(): boolean {
    const form = this.extraLogHourReportForm;
    const value = form.value;
    const hasEmployee = !!value.employee;
    const hasManager = !!value.manager;
    const hasTeam = !!value.team;
    const range = value.dateRange;
    const hasDateRange = !!(range && (range[0] || range[1] || range.startDate || range.endDate));
    return hasEmployee || hasManager || hasTeam || hasDateRange;
  }

  get isExtraLogReportGenerateDisabled(): boolean {
    const { employee, manager, dateRange, leaveCategory, team } = this.extraLogHourReportForm.value;
    // Check if any field has a value
    return !((employee && employee.length > 0) ||
      (manager && manager.length > 0) ||
      (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1]) ||
      leaveCategory ||
      (team && team.length > 0));
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

  getExtraLogHoursReports(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;
    const formValue = this.extraLogHourReportForm.value;

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
      this.spinnerLoader1 = false;
      this.isLoading = false;
      this.filteredExtraLogHourRecord = [];
      return;
    }

    const request: IWfhReportRequest = {};

    // Handle Employee Multi-Select
    if (isEmployeeSelected) {
      // Check if "All Employees" is selected
      const isAllEmployeesSelected = formValue.employee.some((emp: any) => emp.employeeId === 'all');

      if (!isAllEmployeesSelected) {
        const employeeIds = formValue.employee.map((emp: any) => emp.employeeId).join(',');
        request.employeeId = employeeIds;
      }
      // If "All Employees" is selected, we don't send employeeId filter (fetch all)
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

    // Check if My Team dropdown is visible
    const isMyTeamVisible = this.rbac.allowedToAccess('My Team Report(ExtraLogHour).view') &&
      !this.rbac.allowedToAccess('Attendance All Employees List(ExtraLogHour).view') &&
      !this.rbac.allowedToAccess('Attendance Team Manager List(ExtraLogHour).view');

    if (isMyTeamVisible) {
      request.ReportingManagerId = this.loggedInUser.employeeId;
    }

    // Single API call
    this.reportsService.getExtraLogHoursReports(request).subscribe({
      next: (response: any) => {
        this.filteredExtraLogHourRecord = response ?? [];
        this.originalFilteredExtraLogHourRecord = [...this.filteredExtraLogHourRecord];
        this.currentSortField = '';
        this.currentSortOrder = 0;
      },
      error: (error) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredExtraLogHourRecord = [];
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

  customSort(event: any): void {
    const field = event.field;
    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.filteredExtraLogHourRecord = [...this.originalFilteredExtraLogHourRecord];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.extraLogTable) this.extraLogTable.reset();
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
      if (field === 'empId') {
        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;
        return event.order * (num1 - num2);
      }
      if (field === 'requestedDate') {
        return event.order * (new Date(val1 ?? 0).getTime() - new Date(val2 ?? 0).getTime());
      }
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  clearAllFilters(): void {
    this.extraLogHourReportForm.reset();
    this.filteredExtraLogHourRecord = [];
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

  exportToExcelextraLogHours(): void {
    this.spinnerLoader2 = true;
    setTimeout(() => {
      const HEADER_MAPPINGS: { [key: string]: string } = {
        empId: 'EMPLOYEE ID',
        employeeName: 'EMPLOYEE NAME',
        department: 'DEPARTMENT',
        teamManagerName: 'TEAM MANAGER',
        location: 'LOCATION',
        subLocation: 'SUB LOCATION',
        shift: 'SHIFT',
        requestedDate: 'WORKED DATE',
        duration: 'DURATION',
        // notes: 'DESCRIPTION',
      };

      const NEW_SEQUENCE: string[] = [
        'EMPLOYEE ID',
        'EMPLOYEE NAME',
        'DEPARTMENT',
        'TEAM MANAGER',
        'LOCATION',
        'SUB LOCATION',
        'SHIFT',
        'WORKED DATE',
        'DURATION',
        // 'DESCRIPTION',
      ];

      // Prepare data for Excel (Array of Arrays) to ensure proper cell initialization
      const excelData: any[][] = [];

      // 1. Add Title Row
      excelData.push(['EXTRA LOG HOURS REPORT']);

      // 2. Add Header Row
      excelData.push(NEW_SEQUENCE);

      // 3. Add Data Rows
      this.filteredExtraLogHourRecord.forEach((record) => {
        const row: any[] = [];
        NEW_SEQUENCE.forEach((columnName) => {
          const originalKey = Object.keys(HEADER_MAPPINGS).find(
            (key) => HEADER_MAPPINGS[key] === columnName
          );

          let value = '-';
          if (originalKey && record.hasOwnProperty(originalKey)) {
            const rawValue = record[originalKey];
            if (rawValue !== null && rawValue !== undefined) {
              if (originalKey === 'requestedDate') {
                // Format: MMM DD YYYY (e.g. Mar 02 2026)
                value = dayjs(rawValue).format('MMM D, YYYY');
              } else {
                value = rawValue;
              }
            }
          }
          row.push(value);
        });
        excelData.push(row);
      });

      // Create Worksheet from the complete data array
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);

      // Merge Title Row (A1 across all columns)
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } },
      ];

      // Style Title Row (A1)
      if (!ws['A1']) ws['A1'] = { t: 's', v: 'EXTRA LOG HOURS REPORT' };
      
      // Explicitly set type and value to ensure consistency
      ws['A1'].t = 's';
      ws['A1'].v = 'EXTRA LOG HOURS REPORT';

      ws['A1'].s = {
        font: { bold: true, sz: 14, color: { rgb: "000000" } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };

      // Set explicit row height for the title row
      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][0] = { hpt: 25 }; // Set height for title row

      // Style Header Row (Row 2, Index 1)
      const headerRowIndex = 1;
      NEW_SEQUENCE.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: colIndex });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: NEW_SEQUENCE[colIndex] };
        ws[cellRef].s = {
          font: { bold: true },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      });

      // Style Data Rows (Row 3 onwards, Index 2+)
      for (let i = 2; i < excelData.length; i++) {
        NEW_SEQUENCE.forEach((_, colIndex) => {
          const cellRef = XLSX.utils.encode_cell({ r: i, c: colIndex });
          if (ws[cellRef]) {
            if (!ws[cellRef].s) ws[cellRef].s = {};
            ws[cellRef].s = {
              ...ws[cellRef].s,
              alignment: { horizontal: 'center', vertical: 'center' },
            };
          }
        });
      }

      // Calculate and Set Column Widths
      const colWidths = NEW_SEQUENCE.map((colName, colIndex) => {
        let maxLength = colName.length;
        // Check data rows (starting from index 2)
        for (let i = 2; i < excelData.length; i++) {
          const cellValue = excelData[i][colIndex] ? String(excelData[i][colIndex]) : '';
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length;
          }
        }
        return { wch: maxLength + 5 }; // Add padding
      });
      ws['!cols'] = colWidths;

      // Generate Excel file and trigger download
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Extra Log Hours Report');
      const date = new Date();
      // const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const fileName = `Extra Log Hours Report - ${dayjs().format('MMM DD YYYY')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      this.spinnerLoader2 = false;
    }, 100);
  }

  onClick(employeeIds: any) {
    if (employeeIds.value) {
      this.filteredleaveRecords = false;
      this.selectLeaveEmployeeIds = [];
      this.selectedEmployeeId = [];
      // If "All Employees" is selected, set employeeId as an empty array or a special flag
      if (employeeIds.value.employeeId == this.loggedInUser.employeeId) {
        this.selectLeaveEmployeeIds = this.getEmployeeInfo.filter((employee: any) =>
          employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId); // Select all employees
        this.selectedEmployeeId = this.getEmployeeInfo.filter((employee: any) =>
          employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
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
 
            const isUserInList = this.getEmployeeInfo.some((e: any) => e.employeeId === this.loggedInUser.employeeId);
            if (!isUserInList) {
              this.getEmployeeInfo.unshift({
                ...this.loggedInUser,
                fullName: `${this.loggedInUser.fusionEmpId ? this.loggedInUser.fusionEmpId + ' - ' : ''}
                ${this.loggedInUser.firstName} ${this.loggedInUser.middleName ? this.loggedInUser.middleName + ' ' : ''}
                ${this.loggedInUser.lastName}`,
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

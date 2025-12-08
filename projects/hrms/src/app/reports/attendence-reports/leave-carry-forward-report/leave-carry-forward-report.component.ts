import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IAttendanceDetails } from '../../../Interfaces/reports.model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { IemployeeDetails } from '../reports.modal';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ReportsHeaderComponent } from '../../../shared/reports-tabs/reports-header/reports-header.component';
import * as XLSX from 'xlsx';
import dayjs, { Dayjs } from 'dayjs';

@Component({
  selector: 'app-leave-carry-forward-report',
  imports: [CommonModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, DataLoaderContentComponent, ReportsHeaderComponent],
  templateUrl: './leave-carry-forward-report.component.html',
  styleUrl: './leave-carry-forward-report.component.scss'
})
export class LeaveCarryForwardReportComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredleaveRecord: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  selectedEmployeeId: any = null;
  selectedWfhManager: string | null = null;
  selectedMonth: string | null = null;
  selectedLeave: string | null = null;
  selectedYear: string | null = null;
  uniqueLeaveCategory: any[] = [];
  LeaveReportForm!: FormGroup;
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  selectedDateRange: any;
  wfhReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;
  filteredleaveRecords = false;
  selectLeaveEmployeeIds: number[] = [];
  getEmployeeInfo = [] as any;
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
  years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];

  constructor(
    public authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router
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
    this.getAttendanceReports();
    this.getTeam();
    this.getMyTeam();
  }

  initializeForm() {
    this.LeaveReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      leaveCategory: [null],
      team: [null], 
      year: ['']
    });
    this.LeaveReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  clearAllFilters(): void {
    this.LeaveReportForm.reset();
    this.filteredleaveRecord = [];
  }

getEmployeeId() {
  const loggedInUser = this.authService.getToken();
  this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
    next: (data: any) => {
      const employeedata = data
        .map((employee: any) => {
          const firstName = employee.firstName ? employee.firstName.trim() : '';
          const middleName = employee.middleName ? employee.middleName.trim() : '';
          const lastName = employee.lastName ? employee.lastName.trim() : '';

          return {
            ...employee,
            firstName, // trimmed
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
          };
        })
        .filter((employee: any) => employee.employeeId !== loggedInUser.employeeId)
        .sort((a: any, b: any) =>
          a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()) //  Alphabetical by first name
        );

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
  const statuses = 'Active';
  this.subscription = this.http.getData(`PendingApprovalsAuthority/getAll?statuses=${encodeURIComponent(statuses)}`).subscribe({
    next: (data: any) => {
      this.teamdetails = data
        .map((employee: any) => {
          const firstName = employee.firstName ? employee.firstName.trim() : '';
          const middleName = employee.middleName ? employee.middleName.trim() : '';
          const lastName = employee.lastName ? employee.lastName.trim() : '';

          return {
            ...employee,
            firstName, //  trimmed
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
          };
        })
        .sort((a: any, b: any) =>
          a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()) //  Alphabetical by first name
        );
    },
    error: (reason: any) => console.log(reason),
  });
}


  getAttendanceReports() {
    this.subscription = this.reportsService.getAttendanceReports({}).subscribe({
      next: (res: any) => {
        this.extractUniqueYearlyFilters(res);
      }
    });
  }

  extractUniqueYearlyFilters(data: any[]): void {
    const uniqueLeaveCategory = Array.from(new Set(data.map((item: any) => item.leaveType))).filter(Boolean);
    this.uniqueLeaveCategory = uniqueLeaveCategory.map(category => ({
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
    const { employee, manager, leaveCategory, team,year } = this.LeaveReportForm.value;
    // Check if any field has a value
    return !(employee || manager  || leaveCategory || team || year);
  }

  generateleaveReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;
    const formValue = this.LeaveReportForm.value;
    const isAllEmployeesSelected = formValue.employee?.employeeId === 'all';
    //filter condition
    const noFilterProvided = !formValue.employee  && !formValue.month && !formValue.manager && !formValue.team  && !formValue.year && !formValue.leaveCategory;

    if (noFilterProvided) {
      this.filteredleaveRecord = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      return;
    }

    const request: IAttendanceDetails = {};

    if (this.selectLeaveEmployeeIds.length >= 0) {
      const ids = this.selectLeaveEmployeeIds?.join(',');
      request.employeeId = ids;  // The selected employee IDs are set here
    }

    // Apply leave category if selected
    if (formValue.leaveCategory) {
      request.LeaveName = formValue.leaveCategory.value;
    }

    // // Apply date range if provided
    // if (startDate && endDate) {
    //   request.StartDate = this.formatDate(this.parseDate(startDate));
    //   request.EndDate = this.formatDate(this.parseDate(endDate));
    // }

    // Apply manager name if provided
    if (formValue.manager) {
      request.teamManagerID = formValue.manager.employeeId;
    }

       // Year
    if (formValue.year) {
      request.year = formValue.year;
    }

    // Only include employee filter if not "All Employees"
    if (!isAllEmployeesSelected && formValue.employee?.employeeId) {
      request.employeeId = formValue.employee.employeeId;
    }

    this.reportsService.getLeaveCarryForwardReport(request).subscribe({
      next: (response: any) => {
        this.filteredleaveRecord = response.data ?? [];
      },
      error: (error) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredleaveRecord = [];
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
      year: 'YEAR',
      shift: 'SHIFT',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      leaveType: 'LEAVE TYPE',
      entitled: 'ENTITLED',
      availed: 'AVAILED',
      balance: 'BALANCE',
      maxCarryForward: 'MAX CARRY FORWARD',
      actualCarryForward: 'ACTUAL CARRY FORWARD',
      maxEncashment: 'MAX ENCASHMENT',
      leaveEncashed: 'LEAVES ENCASED',
      leaveLapsed: 'LEAVES LAPSED'
    };


    // Define new sequence
    const NEW_SEQUENCE: string[] = [
      'EMPLOYEE ID',
      'EMPLOYEE NAME',
      'DEPARTMENT',
      'TEAM MANAGER',
      'YEAR',
      'SHIFT',
      'LOCATION',
      'SUB LOCATION',
      'LEAVE TYPE',
      'ENTITLED',
      'AVAILED',
      'BALANCE',
      'MAX CARRY FORWARD',
      'ACTUAL CARRY FORWARD',
      'MAX ENCASHMENT',
      'LEAVES ENCASED',
      'LEAVES LAPSED'
    ];

    // Function to format date in dd-MMM-yyyy format
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const options = { day: '2-digit', month: 'short', year: 'numeric' } as const;
      return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
    };

    // Modify data with renamed headers and new sequence
    const modifiedData = this.filteredleaveRecord.map(record => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach(columnName => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (originalColumnName === 'startdate' || originalColumnName === 'enddate' || originalColumnName === 'appliedDate') {
            // Extract the year part from the date
            modifiedRecord[columnName] = formatDate(record[originalColumnName]);
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
    XLSX.utils.sheet_add_aoa(ws, [['LEAVE CARRY FORWARD REPORT']], { origin: 'A1' });

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
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Carry Forward Report');
    XLSX.writeFile(wb, 'Leave_Carry_Forward_Report.xlsx');
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

  onClick(employeeIds: any) {
    if (employeeIds.value) {
      this.filteredleaveRecords = true;
      this.selectLeaveEmployeeIds = [];
      this.selectedEmployeeId = [];
      if (employeeIds.value.employeeId == this.loggedInUser.employeeId) {
        this.selectLeaveEmployeeIds = this.getEmployeeInfo.filter((employee: any) =>
          employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
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
  this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
    next: (response: any) => {
      if (response) {
        const myTeam = response.filter((e: any) => e.isAccess);

        this.getEmployeeInfo = myTeam
          .map((employee: any) => {
            const firstName = employee.firstName ? employee.firstName.trim() : '';
            const middleName = employee.middleName ? employee.middleName.trim() : '';
            const lastName = employee.lastName ? employee.lastName.trim() : '';

            return {
              ...employee,
              firstName, //  trimmed
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
            };
          })
          .sort((a: any, b: any) =>
            a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()) //  Alphabetical by first name
          );

        // Insert "All Employees" at the top
        this.getEmployeeInfo.unshift({
          fullName: 'All Employees',
          fusionEmpId: this.loggedInUser.fusionEmpId,
          employeeId: this.loggedInUser.employeeId,
        });
      }
    },
    error: (err) => console.log(err),
  });
}


  // isAnyFilterApplied(): boolean {
  //   const form = this.LeaveReportForm.value;
  //   return !!(form.dateRange || form.employee || form.manager || form.team || form.leaveCategory);
  // }

  navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
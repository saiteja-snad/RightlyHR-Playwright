import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Select } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
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
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-regularization-reports',
  imports: [CommonModule, ReactiveFormsModule, Select, MultiSelectModule, DatePicker, DataLoaderContentComponent, 
    NoDataFoundComponent, ReportsHeaderComponent,TranslateModule],
  templateUrl: './regularization-reports.component.html',
  styleUrl: './regularization-reports.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class RegularizationReportsComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  subscription!: Subscription;
  regularizationReportForm!: FormGroup;
  loggedInUser = {} as IemployeeDetails;
  employeeDetails: IemployeeDetails[] = [];
  teamManagerDetails: ITeamManagerEmployees[] = [];
  filteredRegularizationData: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  isLoading = false;
  getEmployeeInfo = [] as any;
  filteredleaveRecords = true;
  selectedEmployeeId: any = null;
  selectLeaveEmployeeIds: number[] = [];
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
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
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
    this.getAllEmployees();
    this.getTeam();
    this.getMyTeam();
    // this.getAttendanceReports();
  }

  initializeForm() {
    this.regularizationReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      dateRange: [null],
      team: [null]
    });

    this.regularizationReportForm.get('manager')?.valueChanges.subscribe((managers: any[]) => {
      if (managers && managers.length > 0) {
        const managerIds = managers.map(m => m.employeeId).join(',');
        this.getAllEmployees(managerIds);
      } else {
        this.getAllEmployees();
      }
      this.regularizationReportForm.get('employee')?.setValue(null);
    });

    this.regularizationReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  isAnyFilterApplied(): boolean {
    const form = this.regularizationReportForm;
    const value = form.value;
    const hasEmployee = !!value.employee;
    const hasManager = !!value.manager;
    const hasTeam = !!value.team;
    const range = value.dateRange;
    const hasDateRange = !!(range && (range[0] || range[1] || range.startDate || range.endDate));
    return hasEmployee || hasManager || hasTeam || hasDateRange;
  }

  get isPermissionGenerateDisabled(): boolean {
    const { employee, manager, dateRange, leaveCategory, team } = this.regularizationReportForm.value;
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
            lastName,
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
    this.regularizationReportForm.reset();
    this.filteredRegularizationData = [];
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
    this.generateRegularizationReport();
  }

  generateRegularizationReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;
    const formValue = this.regularizationReportForm.value;
    
    const dateRangeArray = formValue.dateRange || [];
    const startDate: Dayjs | null = dateRangeArray[0] ? dayjs(dateRangeArray[0]) : null;
    const endDate: Dayjs | null = dateRangeArray[1] ? dayjs(dateRangeArray[1]) : (startDate ? startDate : null);
    
    //filter condition
    const noFilterProvided = (!formValue.employee || formValue.employee.length === 0) && 
                             (!startDate || !endDate) && 
                             !formValue.month && 
                             (!formValue.manager || formValue.manager.length === 0) && 
                             (!formValue.team || formValue.team.length === 0);

    if (noFilterProvided) {
      this.filteredRegularizationData = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      return;
    }

    const request: IAttendanceDetails = {};

    // Check if My Team dropdown is visible
    const isMyTeamVisible = this.rbac.allowedToAccess('My Team Report(Regularization).view') &&
      !this.rbac.allowedToAccess('Attendance All Employees List(Regularization).view') &&
      !this.rbac.allowedToAccess('Attendance Team Manager List(Regularization).view');

    if (isMyTeamVisible) {
      (request as any).ReportingManagerId = this.loggedInUser.employeeId;
    }

    if (this.selectLeaveEmployeeIds.length >= 0) {
      const ids = this.selectLeaveEmployeeIds?.join(',');
      request.employeeId = ids;  // The selected employee IDs are set here
    }

    // Only include employee filter if not "All Employees"
    if (formValue.employee && formValue.employee?.length > 0) {
      const isAllSelected = formValue.employee?.some((e: any) => e.employeeId === 'all');
      if (!isAllSelected) {
        request.employeeId = formValue.employee?.map((item: any) => item.employeeId).join(',');
      }
    }

    // Apply leave category if selected
    if (formValue.leaveCategory) {
      request.LeaveName = formValue.leaveCategory.value;
    }

    // Apply date range if provided
    if (startDate && endDate) {
      request.StartDate = this.formatDate(this.parseDate(startDate));
      request.EndDate = this.formatDate(this.parseDate(endDate));
    }

    // Apply manager name if provided
    if (formValue.manager && formValue.manager?.length > 0) {
      request.teamManagerId = formValue.manager?.map((item: any) => item?.employeeId).join(',');
    }
    
    //Apply my team
    if (formValue.team && formValue.team?.length > 0) {
       // logic for team if needed, but usually team selection populates employeeId via onClick or similar?
       // In PermissionReportsComponent:
       // if (formValue.team && formValue.team?.length > 0) {
       //    request.employeeId = formValue.team?.map((item: any) => item.employeeId).join(',');
       // }
       // Wait, let's check how 'team' was handled in the original code.
       // It wasn't explicitly handled in the original generateRegularizationReport I read.
       // In the original code: 
       // if (this.selectLeaveEmployeeIds.length >= 0) { ... request.employeeId = ids ... }
       // And selectLeaveEmployeeIds is populated by onClick event on the select.
       // If I switch to multi-select, I might not need onClick if I just bind the value.
       
       // However, to keep it simple and consistent with PermissionReports:
       // If 'team' is selected, we map it to employeeId.
       if (!request.employeeId && formValue.team) { // If employeeId not already set by 'employee' filter
          request.employeeId = formValue.team?.map((item: any) => item.employeeId).join(',');
       }
    }

    this.reportsService.getRegularizationReports(request).subscribe({
      next: (response: any) => {
        this.filteredRegularizationData = response ?? [];
      },
      error: (error) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredRegularizationData = [];
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

  exportToExcelAttendanceRegularization(): void {
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
      utilizedCount: 'UTILIZATION COUNT',
      totalDuration: 'TOTAL DURATION (HH:MM)'
    };

    const NEW_SEQUENCE: string[] = [
      'EMPLOYEE ID',
      'EMPLOYEE NAME',
      'DEPARTMENT',
      'TEAM MANAGER',
      'LOCATION',
      'SUB LOCATION',
      'SHIFT',
      'UTILIZATION COUNT',
      'TOTAL DURATION (HH:MM)'
    ];

    const modifiedData = this.filteredRegularizationData.map(record => {
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
    XLSX.utils.sheet_add_aoa(ws, [['REGULARIZATION REPORT']], { origin: 'A1' });

    // Add header row
    XLSX.utils.sheet_add_aoa(ws, [NEW_SEQUENCE], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3', skipHeader: true });

    // Apply styles to Leave Report row
    const leaveReportCell = ws['A1'] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
    leaveReportCell.s = { 
      font: { bold: true, sz: 14, color: { rgb: "000000" } }, 
      alignment: { horizontal: 'center', vertical: 'center' } 
    };
    
    // Explicitly set row height
    if (!ws['!rows']) ws['!rows'] = [];
    ws['!rows'][0] = { hpt: 25 };
    
    ws['A1'] = leaveReportCell; // Assign the styled cell back to the worksheet

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
        cell.s = { alignment: { horizontal: 'center', vertical: 'center' } };
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
    XLSX.utils.book_append_sheet(wb, ws, 'Regularization Report');
    const date = new Date();
    // const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const fileName = `Regularization Report - ${dayjs().format('MMM DD YYYY')}.xlsx`;
    XLSX.writeFile(wb, fileName);
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
          if (response) {
            const loggedInEmployee = {
              ...this.loggedInUser,
              fullName: `${this.loggedInUser.fusionEmpId ? this.loggedInUser.fusionEmpId + ' - ' : ''}${this.loggedInUser.firstName} ${this.loggedInUser.middleName ? this.loggedInUser.middleName + ' ' : ''}${this.loggedInUser.lastName}`.trim(),
            };

            const myTeam = response.filter((e: any) => e.isAccess);
            const mappedData = myTeam.map((employee: any) => {
              return {
                ...employee,
                fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`.trim(),
              };
            });

            const combinedData = [loggedInEmployee, ...mappedData];

            // Filter unique by employeeId and sort by firstName
            this.getEmployeeInfo = combinedData
              .filter((employee, index, self) =>
                index === self.findIndex((e) => e.employeeId === employee.employeeId)
              )
              .sort((a: any, b: any) => (a.firstName ?? '').toLowerCase().localeCompare((b.firstName ?? '').toLowerCase()));
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

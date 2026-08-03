import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import * as XLSX from 'xlsx-js-style';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import { environment } from '../../../../environments/environment';
import { Dayjs } from 'dayjs';
import { ICompoffDetails } from '../../../Interfaces/reports.model';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { DatePicker } from 'primeng/datepicker';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-compoff-report',
  imports: [
    DatePicker,
    CommonModule,
    FormsModule,
    DropdownModule,
    SelectModule,
    MultiSelectModule,
    TranslateModule,
    ReactiveFormsModule, NoDataFoundComponent,
    DataLoaderContentComponent,
    ReportsHeaderComponent,
    TableModule
  ],
  templateUrl: './compoff-report.component.html',
  styleUrl: './compoff-report.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class CompoffReportComponent implements OnInit, OnDestroy {
  @ViewChild('compoffTable') compoffTable!: Table;
  moduleinfo: string = '';
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredCompoffRecord: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  compoffReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  getEmployeeInfo = [] as any;
  localeOptions: any;
  today: Date = new Date();
  originalFilteredCompoffRecord: any[] = [];
  currentSortField: string = '';
  currentSortOrder: number = 0;
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
    this.initializeForm();
    this.loggedInUser = this.authService.getToken();
    this.getEmployeeId();
    this.getTeam();
    this.getMyTeam();
  }

  initializeForm() {
    this.compoffReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      dateRange: [null],
      team: [null]
    });

    this.compoffReportForm.get('manager')?.valueChanges.subscribe((managers: any[]) => {
      if (managers && managers.length > 0) {
        const managerIds = managers.map(m => m.employeeId).join(',');
        this.getEmployeeId(managerIds);
      } else {
        this.getEmployeeId();
      }
      this.compoffReportForm.get('employee')?.setValue(null);
    });

    this.compoffReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  isAnyFilterApplied(): boolean {
    const form = this.compoffReportForm;
    const value = form.value;
    const hasEmployee = !!value.employee;
    const hasManager = !!value.manager;
    const hasTeam = !!value.team;
    const range = value.dateRange;
    const hasDateRange = !!(range && (range[0] || range[1] || range.startDate || range.endDate));
    return hasEmployee || hasManager || hasTeam || hasDateRange;
  }

  clearAllFilters(): void {
    this.compoffReportForm.reset();
    this.filteredCompoffRecord = [];
    this.isFilterIndicatorActive = false;
  }

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

  onGenerate(): void {
    this.isFilterIndicatorActive = this.isFilterApplied();
    this.generateCompoffReport();
  }

  isFilterApplied(): boolean {
    const { employee, manager, dateRange, team } = this.compoffReportForm.value;
    return (employee && employee.length > 0) || 
           (manager && manager.length > 0) || 
           (dateRange && (dateRange[0] || dateRange[1])) || 
           (team && team.length > 0);
  }

  get isCompOffGenerateDisabled(): boolean {
    const { employee, manager, dateRange, team } = this.compoffReportForm.value;
    // Check if any field has a value
    return !((employee && employee.length > 0) || 
             (manager && manager.length > 0) || 
             (dateRange && (dateRange[0] || dateRange[1])) || 
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
          this.teamdetails = combinedData
            .filter((employee, index, self) =>
              index === self.findIndex((e) => e.employeeId === employee.employeeId)
            )
            .sort((a: any, b: any) => (a.firstName ?? '').toLowerCase().localeCompare((b.firstName ?? '').toLowerCase()));
        }
      },
      error: (reason: any) => console.log(reason),
    });
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

  generateCompoffReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;
    const formValue = this.compoffReportForm.value;
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
      this.filteredCompoffRecord = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      return;
    }

    const request: ICompoffDetails = {};

    // Check if My Team dropdown is visible
    const isMyTeamVisible = this.rbac.allowedToAccess('My Team Report(Compoff).view') &&
      !this.rbac.allowedToAccess('Attendance All Employees List(Compoff).view') &&
      !this.rbac.allowedToAccess('Attendance Team Manager List(Compoff).view');

    if (isMyTeamVisible) {
      (request as any).ReportingManagerId = this.loggedInUser.employeeId;
    }

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

    // Single API call
    this.reportsService.getcompOffReports(request).subscribe({
      next: (response: any) => {
        this.filteredCompoffRecord = response ?? [];
        this.originalFilteredCompoffRecord = [...this.filteredCompoffRecord];
        this.currentSortField = '';
        this.currentSortOrder = 0;
      },
      error: (error) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredCompoffRecord = [];
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

  exportToExcelYearly(): void {
    this.spinnerLoader2 = true;

    const dataToExport = this.compoffTable?.filteredValue ?? this.compoffTable?.value ?? this.filteredCompoffRecord;

    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      shift: 'SHIFT',
      worked_Date: 'WORKED DATE',
      entitlementDays: 'ENTITLED DAYS',
      duration: 'AVAILED'
    };

    const NEW_SEQUENCE: string[] = [
      'EMPLOYEE ID', 'EMPLOYEE NAME', 'DEPARTMENT', 'TEAM MANAGER',
      'LOCATION', 'SUB LOCATION', 'SHIFT', 'WORKED DATE', 'ENTITLED DAYS', 'AVAILED'
    ];

    const normalizeCell = (key: string, value: any) => {
      if (key === 'worked_Date') return value ? dayjs(value).format('MMM DD, YYYY') : '-';
      if (value === null || value === undefined) return '-';
      if (typeof value === 'string') return value.trim().length > 0 ? value.trim() : '-';
      return value;
    };

    const modifiedData = dataToExport.map((record: any) => {
      const row: any = {};
      NEW_SEQUENCE.forEach(col => {
        const originalKey = Object.keys(HEADER_MAPPINGS).find(k => HEADER_MAPPINGS[k] === col);
        row[col] = originalKey && record.hasOwnProperty(originalKey) ? normalizeCell(originalKey, record[originalKey]) : '-';
      });
      return row;
    });

    if (modifiedData.length === 0) {
      const emptyRow: any = {};
      NEW_SEQUENCE.forEach(col => { emptyRow[col] = '-'; });
      modifiedData.push(emptyRow);
    }

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([]);

    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];
    XLSX.utils.sheet_add_aoa(ws, [['COMP OFF REPORT']], { origin: 'A1' });
    ws['A1'].s = { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center', vertical: 'center' } };

    XLSX.utils.sheet_add_aoa(ws, [NEW_SEQUENCE], { origin: 'A2' });
    NEW_SEQUENCE.forEach((_, index) => {
      const cellRef = XLSX.utils.encode_cell({ r: 1, c: index });
      ws[cellRef].s = {
        font: { bold: true },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } }
      };
    });

    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3', skipHeader: true });
    modifiedData.forEach((_: any, rowIndex: number) => {
      NEW_SEQUENCE.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 2, c: colIndex });
        if (ws[cellRef]) {
          ws[cellRef].s = { alignment: { horizontal: 'center', vertical: 'center' } };
        }
      });
    });

    ws['!autofilter'] = { ref: `A2:${XLSX.utils.encode_col(NEW_SEQUENCE.length - 1)}2` };
    ws['!cols'] = NEW_SEQUENCE.map(col => ({
      wch: Math.max(col.length, ...modifiedData.map((r: any) => String(r[col] ?? '').length)) + 2
    }));

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Comp Off Report');
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');
    XLSX.writeFile(wb, `Comp Off Report - ${formattedDate}.xlsx`);
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
customSort(event: any): void {
    const field = event.field;

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.filteredCompoffRecord = [...this.originalFilteredCompoffRecord];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.compoffTable) this.compoffTable.reset();
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

      if (field === 'fusionEmpId') {
        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;
        return event.order * (num1 - num2);
      }
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
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

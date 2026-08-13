import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { filter, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { IAbsentReportRequest } from '../../../Interfaces/reports.model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { AttandaceReportTabsComponent } from '../../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { ModuleInformationComponent } from "../../../shared/module-information/module-information.component";
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../../shared/modules-info';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-absent-report',
  imports: [
    CommonModule,
    FormsModule,
    NgxDaterangepickerBootstrapDirective,
    AttandaceReportTabsComponent,
    DropdownModule,
    SelectModule,
    TranslateModule,
    ReactiveFormsModule,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    ModuleInformationComponent,
    TableModule
  ],
  templateUrl: './absent-report.component.html',
  styleUrl: './absent-report.component.scss'
})

export class AbsentReportComponent implements OnInit, OnDestroy {
  @ViewChild('absentTable') absentTable!: Table;
  moduleinfo: string = '';
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  uniqueEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  filteredAbsentEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  selectedDate: string | null = null;
  selectedDateRange: { startDate: any; endDate: any } | null = null;
  searchTerm: string = '';
  selectedEmployeeId: any = null;
  isDropdownOpen: boolean = false;
  isFilterGivenAbsent: boolean = false;
  filteredAbsentRecord: any[] = [];
  employeeMasterData: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  isDropdownOpenwfh: boolean = false;
  selectedAbsentManager: string | null = null;
  selectedMonth: number | null = null;
  frequency: string = '';
  absentReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;
  originalFilteredAbsentRecord: any[] = [];
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

  isFilterGivenabsent = false;
  selectedAbsentMonth: string | null = null;
  isInvalidDate = () => false;

  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];

  frequencyOptions = [
    { label: 'Month wise', value: 'month' },
    { label: 'Date wise', value: 'date' }
  ];

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router
  ) { }

  getParsedEmployee(event: Event): any {
    const target = event.target as HTMLSelectElement;
    return JSON.parse(target.value);
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
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initializeForm() {
    this.absentReportForm = this.fb.group({
      employee: [null, Validators.required],
      manager: [null],
      frequency: [null],
      dateRange: [null],
      month: ['']
    });

    this.absentReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })

    this.absentReportForm.get('frequency')?.valueChanges.subscribe(() => {
      this.absentReportForm.get('dateRange')?.reset();
      this.absentReportForm.get('month')?.reset();
    })
  }

  get isAbsentGenerateDisabled(): boolean {
    const form = this.absentReportForm;
    return !(
      form.get('employee')?.value ||
      form.get('manager')?.value ||
      form.get('frequency')?.value ||
      form.get('dateRange')?.value ||
      form.get('month')?.value
    );
  }

  initiateUpdateModuleInfo() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateModuleInfo();
      });
  }

  updateModuleInfo() {
    const url = this.router.url;

    const routeToInfoMap: { [key: string]: string } = {
      '/reports/attendence-reports/absent-report': MODULE_INFOS.ATTENDANCE_ABSENT_REPORTS_MODULE_INFO
    };

    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
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
            firstName, //  trimmed
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


  generateAbsentReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;

    const formValue = this.absentReportForm.value;
    const isAllEmployeesSelected = formValue.employee?.employeeId === 'all';
    const noFilterProvided =
      !formValue.employee &&
      this.searchTerm !== 'All Employees' &&
      (!formValue.dateRange?.startDate || !formValue.dateRange?.endDate) &&
      !formValue.month &&
      !formValue.manager;

    if (noFilterProvided) {
      this.filteredAbsentRecord = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      return;
    }

    const request: IAbsentReportRequest = {};
    if (!isAllEmployeesSelected && formValue.employee?.fusionEmpId) {
      request.FusionEmpId = formValue.employee.fusionEmpId;
    }

    if (formValue.employee?.fusionEmpId) {
      request.FusionEmpId = formValue.employee.fusionEmpId;
    }

    // Date Range
    if (formValue.dateRange?.startDate && formValue.dateRange?.endDate) {
      const startDate = this.formatDate(this.parseDate(formValue.dateRange.startDate));
      const endDate = this.formatDate(this.parseDate(formValue.dateRange.endDate));
      request.StartDate = startDate;
      request.EndDate = endDate;
    }

    // Month
    if (formValue.month) {
      request.Worked_Month = formValue.month;
    }

    // Manager full name
    if (formValue.manager) {
      request.TeamManagerSnadId = formValue.manager.fusionEmployeeId;
    }

    this.reportsService.getAbsentReports(request).subscribe({
      next: (response: any) => {
        this.filteredAbsentRecord = response ?? [];
        this.originalFilteredAbsentRecord = [...this.filteredAbsentRecord];
        this.currentSortField = '';
        this.currentSortOrder = 0;
      },
      error: (error) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredAbsentRecord = [];
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
      }
    });
  }

  clearAllFilters(): void {
    this.absentReportForm.reset();
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

  exportToExcelAbsent(): void {
    this.spinnerLoader2 = true;

    const dataToExport = this.absentTable?.filteredValue ?? this.absentTable?.value ?? this.filteredAbsentRecord;

    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      location: 'LOCATION',
      sublocation: 'SUB LOCATION',
      shift: 'SHIFT',
      leaveType: 'LEAVE TYPE',
      startDate: 'START DATE',
      endDate: 'END DATE',
      days: 'DAYS'
    };

    const NEW_SEQUENCE: string[] = [
      'EMPLOYEE ID',
      'EMPLOYEE NAME',
      'DEPARTMENT',
      'TEAM MANAGER',
      'LOCATION',
      'SUB LOCATION',
      'SHIFT',
      'LEAVE TYPE',
      'START DATE',
      'END DATE',
      'DAYS'
    ];

    const normalizeCell = (key: string, value: any) => {
      if (key === 'startDate' || key === 'endDate') {
        if (!value) return '-';
        const date = new Date(value);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
      }
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
    XLSX.utils.sheet_add_aoa(ws, [['ABSENT REPORT']], { origin: 'A1' });
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
    XLSX.utils.book_append_sheet(wb, ws, 'Absent Report');
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');
    XLSX.writeFile(wb, `Absent Report - ${formattedDate}.xlsx`);
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
  customSort(event: any): void {
    const field = event.field;

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.filteredAbsentRecord = [...this.originalFilteredAbsentRecord];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.absentTable) this.absentTable.reset();
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

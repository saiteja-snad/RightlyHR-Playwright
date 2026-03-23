import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import * as XLSX from 'xlsx-js-style';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import { environment } from '../../../../environments/environment';
import { Dayjs } from 'dayjs';
import { IAttendanceDetails } from '../../../Interfaces/reports.model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { DatePicker } from 'primeng/datepicker';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-leave-report',
  imports: [DatePicker, CommonModule, FormsModule, DropdownModule, SelectModule, MultiSelectModule, TranslateModule, ReactiveFormsModule, 
    NoDataFoundComponent, DataLoaderContentComponent,TranslateModule, ReportsHeaderComponent],
  templateUrl: './leave-report.component.html',
  styleUrl: './leave-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class LeaveReportComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  subscription!: Subscription;
  private readonly destroy$ = new Subject<void>();
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredleaveRecord: any[] = [];
  employeeiddetails: any[] = [];
  employeeMultiSelectOptions: any[] = [];
  teamdetails = [] as any[];
  selectedWfhManager: string | null = null;
  selectedMonth: string | null = null;
  selectedLeave: string | null = null;
  uniqueLeaveCategory: any[] = [];
  LeaveReportForm!: FormGroup;
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  selectedDateRange: any;
  wfhReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  getEmployeeInfo = [] as any;
  today: Date = new Date();
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
    public authService: AuthService,
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
    this.getAttendanceReports();
    this.getTeam();
    this.getMyTeam();
  }

  initializeForm() {
    this.LeaveReportForm = this.fb.group({
      dateRange: [null],
      leaveCategory: [[]],
      manager: [[]],
      employeeIds: [[]],
      team: [[]]
    });

    this.LeaveReportForm.get('manager')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((managers: any[]) => {
        if (managers && managers.length > 0) {
          const managerIds = managers.map(m => m.employeeId).join(',');
          this.getEmployeeId(managerIds);
        } else {
          this.getEmployeeId();
        }
        this.LeaveReportForm.get('employeeIds')?.setValue([]);
      });

    this.LeaveReportForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.disableBtn = true;
    })
  }

  clearAllFilters(): void {
    this.LeaveReportForm.reset({ 
      dateRange: null,
      employeeIds: [],
      leaveCategory: [],
      manager: [],
      team: []
    });
    this.filteredleaveRecord = [];
    this.isFilterIndicatorActive = false;
    this.disableBtn = false;
    this.uniqueLeaveCategory = [];
    this.employeeMultiSelectOptions = [];
    this.getEmployeeId();
    this.getAttendanceReports();
    this.getEmployeeId();
  }

  isFilterApplied(): boolean {
    const { employeeIds, manager, dateRange, leaveCategory, team } = this.LeaveReportForm.value;
    const dateRangeArray = dateRange || [];
    const hasDates = !!(dateRangeArray?.[0] || dateRangeArray?.[1]);
    return !!(
      (employeeIds && employeeIds.length > 0) ||
      (manager && manager.length > 0) ||
      hasDates ||
      (leaveCategory && leaveCategory.length > 0) ||
      (team && team.length > 0)
    );
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
    this.generateleaveReport();
  }

  getEmployeeId(managerIds?: string) {
    let url = 'Employeedata/employees/by-managers';
    if (managerIds) {
      url += `?managerIds=${managerIds}`;
    }
    this.subscription = this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        const employeedata = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : '' }${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : '' }${employee.lastName}`,
          };
        });
        this.employeeMultiSelectOptions = employeedata;
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getTeam() {
    this.subscription = this.http.getData('PendingApprovalsAuthority/getAll').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.teamdetails = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => console.log(reason),
    });
  }


  getAttendanceReports() {
    this.subscription = this.reportsService.getAttendanceReportsV2({}).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.extractUniqueYearlyFilters(res);
      }
    });
  }

  extractUniqueYearlyFilters(data: any[]): void {
    const items = Array.isArray(data) ? data : [];
    const map = new Map<any, { label: string; value: any }>();
    items.forEach((item: any) => {
      const label = item?.leaveCategoryName ?? item?.leaveType;
      const value = item?.leaveCategoryId ?? item?.categoryId;
      if (typeof label === 'string' && label.trim().length > 0) {
        map.set(value, { label, value });
      }
    });
    this.uniqueLeaveCategory = Array.from(map.values()).sort((a, b) =>
      a.label.toLowerCase().localeCompare(b.label.toLowerCase())
    );
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
    return !this.isFilterApplied();
  }

  generateleaveReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;
    this.disableBtn = true;
    const formValue = this.LeaveReportForm.value;
    const dateRangeArray = formValue.dateRange || [];
    const startDate: Dayjs | null = dateRangeArray[0] ? dayjs(dateRangeArray[0]) : null;
    const endDate: Dayjs | null = dateRangeArray[1] ? dayjs(dateRangeArray[1]) : (startDate ? startDate : null);
    //filter condition
    const employeeIds: any[] = formValue.employeeIds || [];
    const noFilterProvided =
      employeeIds.length === 0 &&
      (!formValue.manager || formValue.manager.length === 0) &&
      (!formValue.team || formValue.team.length === 0) &&
      (!formValue.leaveCategory || formValue.leaveCategory.length === 0) &&
      !startDate &&
      !endDate;

    if (noFilterProvided) {
      this.filteredleaveRecord = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      this.disableBtn = false;
      return;
    }

    const request: IAttendanceDetails = {};

    // Apply leave category if selected
    if (formValue.leaveCategory && formValue.leaveCategory.length > 0) {
      request.leaveCategorys = formValue.leaveCategory.map((x: any) => x.value).join(',');
    }

    // Apply date range if provided
    if (startDate && endDate) {
      request.startdate = startDate.format('YYYY-MM-DD');
      request.enddate = endDate.format('YYYY-MM-DD');
    } 

    // Apply manager name if provided
    if (formValue.manager && formValue.manager.length > 0) {
      request.teamManagerID = formValue.manager.map((x: any) => x.employeeId).join(',');
    }

    if (formValue.team && formValue.team.length > 0) {
      request.employeeId = formValue.team.join(',');
    } else if (employeeIds.length > 0) {
      request.employeeId = employeeIds.join(',');
    }

    this.reportsService.getAttendanceReportsV2(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.filteredleaveRecord = response ?? [];
      },
      error: (error) => {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
        this.filteredleaveRecord = [];
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
    // Define header mappings
    this.spinnerLoader2 = true;
    setTimeout(() => {
      const HEADER_MAPPINGS: { [key: string]: string } = {
        fusionEmpId: 'EMPLOYEE ID',
        employeeName: 'EMPLOYEE NAME',
        department: 'DEPARTMENT',
        teamManagerName: 'TEAM MANAGER',
        location: 'LOCATION',
        subLocation: 'SUB LOCATION',
        shift: 'SHIFT',
        leaveCategoryName: 'LEAVE CATEGORY',
        startdate: 'LEAVE START DATE',
        enddate: 'LEAVE END DATE',
        availed: 'AVAILED',
        appliedDate: 'APPLIED DATE',
        days: 'DAYS'
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
        'LEAVE CATEGORY',
        'LEAVE START DATE',
        'LEAVE END DATE',
        'AVAILED',
        'APPLIED DATE',
        'DAYS'
      ];

      // Function to format date in MMM d, yyyy format (e.g., Mar 6, 2026)
      const formatDate = (dateString: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      };

      // Modify data with renamed headers and new sequence
      const modifiedData = this.filteredleaveRecord.map(record => {
        const modifiedRecord: any = {};
        NEW_SEQUENCE.forEach(columnName => {
          const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
          if (originalColumnName) {
            // Check for lowercase or camelCase variants if main key fails
            let value = record[originalColumnName];
            
            // Fallback for LEAVE TYPE
            if (originalColumnName === 'leaveType' && (value === undefined || value === null || value === '')) {
               value = record['leaveCategoryName'];
            }
            
            if (value !== undefined && value !== null) {
              if (['startdate', 'enddate', 'appliedDate', 'startDate', 'endDate'].includes(originalColumnName)) {
                 modifiedRecord[columnName] = formatDate(value);
              } else {
                 modifiedRecord[columnName] = value;
              }
            } else {
              modifiedRecord[columnName] = '';
            }
          } else {
            modifiedRecord[columnName] = '';
          }
        });
        return modifiedRecord;
      });

      // Create a new empty worksheet
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]]);

      // Merge cells for Title row from A1 to end of columns
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];

      // Add Title row
      XLSX.utils.sheet_add_aoa(ws, [['LEAVE REPORT']], { origin: 'A1' });

      // Add header row
      // Use NEW_SEQUENCE directly for headers as it contains the display names
      XLSX.utils.sheet_add_aoa(ws, [NEW_SEQUENCE], { origin: 'A2' });

      // Add data rows
      XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3', skipHeader: true });

      // Apply styles to Title row (Bold)
      const titleCell = ws['A1'] || { t: '', v: '' };
      titleCell.s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
      ws['A1'] = titleCell;

      // Apply styles to column headers (Bold)
      NEW_SEQUENCE.forEach((columnName, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
        const cell = ws[cellAddress] || { t: '', v: '' };
        cell.s = { font: { bold: true }, alignment: { horizontal: 'center' } };
        ws[cellAddress] = cell;
      });

      // Apply middle alignment to all data cells
      modifiedData.forEach((_, rowIndex) => {
        NEW_SEQUENCE.forEach((_, colIndex) => {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 2, c: colIndex });
          if (ws[cellRef]) {
            ws[cellRef].s = {
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          }
        });
      });

      // Adjust column width to fit data
      NEW_SEQUENCE.forEach((columnName, index) => {
        let columnWidth = this.getColumnWidth(modifiedData, columnName);
        // Add extra padding for specific columns
        if (['EMPLOYEE ID', 'DEPARTMENT', 'APPLIED DATE', 'SUB LOCATION'].includes(columnName)) {
          columnWidth += 5;
        }
        ws['!cols'] = ws['!cols'] || [];
        ws['!cols'][index] = { wch: columnWidth };
      });

      // Generate Excel file with current date in filename
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leave Report');
      
      const today = new Date();
     const filenameDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '');
      XLSX.writeFile(wb, `Leave Report - ${filenameDate}.xlsx`);
      
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
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response) {
          const myTeam = response.filter((e: any) => e.isAccess);
          this.getEmployeeInfo = myTeam.map((employee: any) => ({
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
          }));
        }
      },
    });
  }

  navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

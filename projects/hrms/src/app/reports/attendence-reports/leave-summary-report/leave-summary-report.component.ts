import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import * as XLSX from 'xlsx-js-style';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { environment } from '../../../../environments/environment';
import { IAttendanceDetails, ILeavesummery } from '../../../Interfaces/reports.model';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import {  Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-leave-summary-report',
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    SelectModule,
    TranslateModule,
    ReactiveFormsModule, NoDataFoundComponent,
    DataLoaderContentComponent,
    ReportsHeaderComponent,
    TranslateModule,
    MultiSelectModule,
    TableModule
],
  templateUrl: './leave-summary-report.component.html',
  styleUrl: './leave-summary-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LeaveSummaryReportComponent implements OnInit, OnDestroy {
  @ViewChild('leaveSummaryTable') leaveSummaryTable!: Table;
  moduleinfo : string = '';
  subscription!: Subscription;
  private readonly destroy$ = new Subject<void>();
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filterlvsumRecord: any[] = [];
  employeeiddetails: any[] = [];
  employeeMultiSelectOptions: any[] = [];
  teamdetails = [] as any[];
  selectedEmployeeId: any = null;
  selectedWfhManager: string | null = null;
  selectedMonth: string | null = null;
  selectedLeave: string | null = null;
  uniqueLeaveCategory: any[] = [];
  lvSummeryReportForm!: FormGroup;
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  selectedDateRange: any;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  getEmployeeInfo = [] as any;
  filteredleaveRecords = false;
  selectLeaveEmployeeIds: number[] = [];
  originalFilterlvsumRecord: any[] = [];
  currentSortField: string = '';
  currentSortOrder: number = 0;
   years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];

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
    this.getLeaveSummaryReport();
    this.getTeam();
    this.getMyTeam();
  }

  clearAllFilters(): void {
    this.lvSummeryReportForm.reset({
      year: null,
      leaveCategory: [],
      manager: [],
      employee: [],
      team: []
    });
    this.filterlvsumRecord = [];
    this.isFilterIndicatorActive = false;
    this.disableBtn = false;
    this.uniqueLeaveCategory = [];
    this.employeeMultiSelectOptions = [];
    this.getEmployeeId();
    this.getLeaveSummaryReport();
  }

  initializeForm() {
    this.lvSummeryReportForm = this.fb.group({
      year: [null],
      leaveCategory: [[]],
      manager: [[]],
      employee: [[]],
      team:[[]]
    });

    this.lvSummeryReportForm.get('manager')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((managers: any[]) => {
        if (managers && managers.length > 0) {
          const managerIds = managers.map(m => m.employeeId).join(',');
          this.getEmployeeId(managerIds);
        } else {
          this.getEmployeeId();
        }
        this.lvSummeryReportForm.get('employee')?.setValue([]);
      });

    this.lvSummeryReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  onClick(employeeIds: any) {
    if (employeeIds.value) {
      console.log(employeeIds);
      this.filteredleaveRecords = true;
      this.selectLeaveEmployeeIds = [];
      this.selectedEmployeeId = [];
      if (employeeIds.value.employeeId== this.loggedInUser.employeeId) {
        this.selectLeaveEmployeeIds = this.getEmployeeInfo.filter((employee: any) => employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId); 
        this.selectedEmployeeId = this.getEmployeeInfo.filter((employee: any) => employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
      } else {
        this.selectLeaveEmployeeIds.push(employeeIds.value.employeeId);
        this.selectedEmployeeId.push(employeeIds.value.employeeId);
      }
    }
  }


  getMyTeam() {
    const EmployeeId = this.loggedInUser?.employeeId;
    console.log(this.loggedInUser)
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          if (response) {
            const myTeam = response.filter((e: any) => e.isAccess);
            this.getEmployeeInfo = myTeam.map((employee: any) => ({
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
                }${employee.lastName}`,
            }));

            this.getEmployeeInfo.unshift({
              fullName: 'All Employees',
              fusionEmpId: this.loggedInUser.fusionEmpId,
              employeeId: this.loggedInUser.employeeId,
            });
          }
        },
      });
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
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
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
    this.subscription = this.reportsService.getLeaveSummaryReportV2({}).subscribe({
      next: (res: any) => {
        // this.filterlvsumRecord = res ?? [];
        this.extractUniqueYearlyFilters(res);
      },
      error: (err: any) => console.log(err)
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
    return !this.isAnyFilterApplied();
  }

  isAnyFilterApplied(): boolean {
    const form = this.lvSummeryReportForm;
    return !!(
      (form.get('employee')?.value && form.get('employee')?.value.length > 0) ||
      (form.get('manager')?.value && form.get('manager')?.value.length > 0) ||
      (form.get('leaveCategory')?.value && form.get('leaveCategory')?.value.length > 0) ||
      (form.get('team')?.value && form.get('team')?.value.length > 0) ||
      !!form.get('year')?.value
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
    this.isFilterIndicatorActive = this.isAnyFilterApplied();
    this.lvSummeryReportForm.markAllAsTouched();
    this.leavesummeryReport();
  }

  leavesummeryReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;
    this.disableBtn = true;
    const formValue = this.lvSummeryReportForm.value;
    
    // Check if no filter is provided
    if (!this.isAnyFilterApplied()) {
      this.filterlvsumRecord = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      this.disableBtn = false;
      return;
    }

    const request: ILeavesummery = {};

    if (formValue.leaveCategory && formValue.leaveCategory.length > 0) {
      request.leaveCategories = formValue.leaveCategory.map((x: any) => x.value).join(',');
    }

    if (formValue.manager && formValue.manager.length > 0) {
      request.teamManagerID = formValue.manager.map((x: any) => x.employeeId).join(',');
    }

    if (formValue.team && formValue.team.length > 0) {
      request.employeeId = formValue.team.join(',');
    } else if (formValue.employee && formValue.employee.length > 0) {
      request.employeeId = formValue.employee.map((x: any) => x.employeeId).join(',');
    }

    if (formValue.year) {
      request.year = (typeof formValue.year === 'object' && formValue.year !== null) ? formValue.year.value : formValue.year;
    }

    // Call service with the constructed request
    // Assuming getLeaveSummaryReport needs to be updated to POST or handle this payload structure
    // For now we assume getLeaveSummaryReport is similar to leave-report's V2 but for summary
    this.subscription = this.reportsService.getLeaveSummaryReportV2(request).subscribe({
      next: (res: any) => {
        this.filterlvsumRecord = res ?? [];
        this.originalFilterlvsumRecord = [...this.filterlvsumRecord];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        this.spinnerLoader1 = false;
        this.isLoading = false;
        this.disableBtn = false;
        this.closeCanvas();
      },
      error: (err: any) => {
        console.log(err);
        this.filterlvsumRecord = [];
        this.spinnerLoader1 = false;
        this.isLoading = false;
        this.disableBtn = false;
        this.closeCanvas();
      },
    });
  }

  exportToExcelYearly(): void {
    this.spinnerLoader2 = true;

    const dataToExport = this.leaveSummaryTable?.filteredValue ?? this.leaveSummaryTable?.value ?? this.filterlvsumRecord;

    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      shift: 'SHIFT',
      year: 'YEAR',
      monthName: 'MONTH',
      leaveCategoryName: 'LEAVE CATEGORY',
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
        'YEAR',
        'MONTH',
        'LEAVE CATEGORY',
        'LEAVES AVAILED',
    ];

    const normalizeCell = (value: any) => {
      if (value === null || value === undefined) return '-';
      if (typeof value === 'string') return value.trim().length > 0 ? value.trim() : '-';
      return value;
    };

    const modifiedData = dataToExport.map((record: any) => {
      const row: any = {};
      NEW_SEQUENCE.forEach(col => {
        const originalKey = Object.keys(HEADER_MAPPINGS).find(k => HEADER_MAPPINGS[k] === col);
        row[col] = originalKey && record.hasOwnProperty(originalKey) ? normalizeCell(record[originalKey]) : '-';
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
    XLSX.utils.sheet_add_aoa(ws, [['LEAVE SUMMARY REPORT']], { origin: 'A1' });
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
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Summary Report');
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');
    XLSX.writeFile(wb, `Leave Summary Report - ${formattedDate}.xlsx`);
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
  private readonly MONTH_ORDER: Record<string, number> = {
    'january': 1, 'february': 2, 'march': 3, 'april': 4,
    'may': 5, 'june': 6, 'july': 7, 'august': 8,
    'september': 9, 'october': 10, 'november': 11, 'december': 12
  };

  customSort(event: any): void {
    const field = event.field;

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.filterlvsumRecord = [...this.originalFilterlvsumRecord];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.leaveSummaryTable) this.leaveSummaryTable.reset();
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

      if (field === 'monthName') {
        const m1 = this.MONTH_ORDER[String(val1).toLowerCase()] ?? 0;
        const m2 = this.MONTH_ORDER[String(val2).toLowerCase()] ?? 0;
        return event.order * (m1 - m2);
      }
      if (field === 'year') {
        const year1 = Number(val1 ?? 0);
        const year2 = Number(val2 ?? 0);
        return event.order * (year1 - year2);
      }
       // Numeric fields
      if (field === 'availed') {

        val1 = Number(a[field] || 0);
        val2 = Number(b[field] || 0);

        return event.order * (val1 - val2);
      }
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

   navigation(){
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

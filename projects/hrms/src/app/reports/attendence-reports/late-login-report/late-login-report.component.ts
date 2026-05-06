import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import {
  IAttendanceDetails,
  ILeavesummery,
} from '../../../Interfaces/reports.model';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from '../../../shared/reports-tabs/reports-header/reports-header.component';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';
import { DatePickerModule } from 'primeng/datepicker';
@Component({
  selector: 'app-late-login-report',
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    SelectModule,
    TranslateModule,
    ReactiveFormsModule,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    ReportsHeaderComponent,
    TranslateModule,
    MultiSelectModule,
    NgxDaterangepickerBootstrapModule,
    DatePickerModule,
  ],

  templateUrl: './late-login-report.component.html',
  styleUrl: './late-login-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LateLoginReportComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
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

  LateLoginReport!: FormGroup;

  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;

  selectedDateRange: any;

  spinnerLoader1 = false;

  spinnerLoader2 = false;

  isFilterIndicatorActive = false;

  disableBtn = false;

  getEmployeeInfo = [] as any;

  filteredleaveRecords = false;

  selectLeaveEmployeeIds: number[] = [];

  data: any[] = [];

  summary: any;

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

    private offcanvasService: NgbOffcanvas,
  ) {}

  ngOnInit(): void {
    this.localeOptions = {
      applyLabel: 'ok',

      format: this.authService

        .convertAngularDateFormatToJs(environment.dateformat)

        .toUpperCase(),

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
    this.LateLoginReport = this.fb.group({
      dateRange: [null],

      leaveCategory: [[]],

      manager: [[]],

      employeeIds: [[]],

      team: [[]],
    });

    this.LateLoginReport.get('manager')

      ?.valueChanges.pipe(takeUntil(this.destroy$))

      .subscribe((managers: any[]) => {
        if (managers && managers.length > 0) {
          const managerIds = managers.map((m) => m.employeeId).join(',');

          this.getEmployeeId(managerIds);
        } else {
          this.getEmployeeId();
        }

        this.LateLoginReport.get('employeeIds')?.setValue([]);
      });

    this.LateLoginReport.valueChanges

      .pipe(takeUntil(this.destroy$))

      .subscribe(() => {
        this.disableBtn = true;
      });
  }

  getEmployeeId(managerIds?: string) {
    let url = 'Employeedata/employees/by-managers';

    if (managerIds) {
      url += `?managerIds=${managerIds}`;
    }

    this.subscription = this.http

      .getData(url)

      .pipe(takeUntil(this.destroy$))

      .subscribe({
        next: (data: any) => {
          const employeedata = data.map((employee: any) => {
            return {
              ...employee,

              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName}

            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
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
    this.subscription = this.http

      .getData('PendingApprovalsAuthority/getAll')

      .pipe(takeUntil(this.destroy$))

      .subscribe({
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

  getMyTeam() {
    const EmployeeId = this.loggedInUser?.employeeId;

    this.subscription = this.http

      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)

      .pipe(takeUntil(this.destroy$))

      .subscribe({
        next: (response: any) => {
          if (response) {
            const myTeam = response.filter((e: any) => e.isAccess);

            this.getEmployeeInfo = myTeam.map((employee: any) => ({
              ...employee,

              fullName: `${
                employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${
                employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
            }));
          }
        },
      });
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

  onGenerate() {
    this.isFilterIndicatorActive = true;
    this.generateLateLoginReport();
    this.closeCanvas();
  }

  // clearAllFilters() {
  //   this.LateLoginReport.reset({
  //     employeeIds: [],
  //     manager: [],
  //     dateRange: null,
  //   });

  //   this.data = [];
  //   this.summary = null;
  //   this.isFilterIndicatorActive = false;
  // }
  clearAllFilters() {
    this.LateLoginReport.patchValue({
      employeeIds: [],
      manager: [],
      dateRange: null,
    });

    this.data = [];
    this.summary = null;
    this.isFilterIndicatorActive = false;
  }

  // get isLateLoginGenerateDisabled(): boolean {
  //   const { employeeIds, manager, dateRange } = this.LateLoginReport.value;

  //   return !(
  //     (employeeIds && employeeIds.length > 0) ||
  //     (manager && manager.length > 0) ||
  //     (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1])
  //   );
  // }
  get isLateLoginGenerateDisabled(): boolean {
    const { employeeIds, manager, dateRange } = this.LateLoginReport.value;

    return !(
      (employeeIds && employeeIds.length > 0) ||
      (manager && manager.length > 0) ||
      (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1])
    );
  }

  // onGenerate(): void {
  //   this.isFilterIndicatorActive = this.isAnyFilterApplied();
  //   this.getLateLoginReport();
  // }

  // 🔹 Employees

  getEmployees() {
    this.http.getData('Employeedata/ActiveEmployees').subscribe((res: any) => {
      this.employeeiddetails = res.map((e: any) => ({
        ...e,

        fullName: `${e.fusionEmpId} - ${e.firstName} ${e.lastName}`,
      }));
    });
  }

  // 🔹 Managers

  getManagers() {
    this.http
      .getData('PendingApprovalsAuthority/getAll')
      .subscribe((res: any) => {
        this.teamdetails = res.map((e: any) => ({
          ...e,
          fullName: `${e.fusionEmployeeId} - ${e.firstName} ${e.lastName}`,
        }));
      });
  }

  // 🔥 MAIN API CALL

  // generateLateLoginReport() {
  //   const formValue = this.LateLoginReport.value;
  //   const dateRange = formValue.dateRange || [];

  //   const start = dateRange[0] ? dayjs(dateRange[0]) : null;
  //   const end = dateRange[1] ? dayjs(dateRange[1]) : start;

  //   const params: any = {
  //     employeeId:
  //       formValue.employeeIds?.length === 1
  //         ? formValue.employeeIds[0].employeeId
  //         : null,

  //     managerId:
  //       formValue.manager?.length === 1
  //         ? formValue.manager[0].employeeId ||
  //           formValue.manager[0].fusionEmployeeId
  //         : null,
  //     locationId: null,
  //     sublocationId: null,
  //     fromDate: start ? this.formatDate(start.toDate()) : null,
  //     toDate: end ? this.formatDate(end.toDate()) : null,
  //   };

  //   this.isLoading = true;

  //   this.reportsService.getLateLoginReport(params).subscribe({
  //     next: (res: any) => {
  //       this.data = Array.isArray(res) ? res : (res?.Data ?? []);
  //       this.summary = res?.Summary ?? res?.summary;
  //     },

  //     error: (err) => {
  //       console.error(err);
  //       this.data = [];
  //     },

  //     complete: () => {
  //       this.isLoading = false;
  //     },
  //   });
  // }

  generateLateLoginReport() {
    const formValue = this.LateLoginReport.value;
    const dateRange = formValue.dateRange || [];

    // ✅ Always ensure valid date range
    let start = dateRange[0] ? dayjs(dateRange[0]) : dayjs().startOf('month');
    let end = dateRange[1] ? dayjs(dateRange[1]) : dayjs();

    const params: any = {
      // ✅ Employee (only if ONE selected)
      employeeId:
        formValue.employeeIds?.length === 1
          ? formValue.employeeIds[0].employeeId
          : null,

      // ✅ Manager (FIXED mapping)
      managerId:
        formValue.manager?.length === 1
          ? formValue.manager[0].employeeId
          : null,

      locationId: null,
      sublocationId: null,

      // ✅ Correct date format
      fromDate: this.formatDate(start.toDate()),
      toDate: this.formatDate(end.toDate()),
    };

    console.log('FINAL PARAMS:', params); // 🔍 Debug

    this.isLoading = true;

    this.reportsService.getLateLoginReport(params).subscribe({
      next: (res: any) => {
        this.data = res?.data as [];
        this.disableBtn = false; // ✅ Enable export button after successful data load
      },
      error: (err) => {
        console.error(err);
        this.data = [];
        this.disableBtn = true; // ✅ Keep disabled on error
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  // 🔹 Date format for .NET

  // formatDate(date: any): string | null {
  //   if (!date) return null;
  //   return new Date(date).toISOString();
  // }
  formatDate(date: any): string | null {
    if (!date) return null;
    return dayjs(date).format('YYYY-MM-DD');
  }

  // 🔹 Export functionality

  exportLateLogin() {
    this.spinnerLoader2 = true;
    setTimeout(() => {
      const HEADER_MAPPINGS: { [key: string]: string } = {
        fusionEmpId: 'EMPLOYEE ID',
        employeeName: 'EMPLOYEE NAME',
        departmentName: 'DEPARTMENT',
        tmEmployeeName: 'TEAM MANAGER',
        loctaionName: 'LOCATION',
        subLocationName: 'SUB LOCATION',
        shiftName: 'SHIFT',
        utilizedCount: 'LATE COUNT',
        totalDuration: 'TOTAL DURATION',
        avgDuration: 'AVG DURATION',
      };

      const NEW_SEQUENCE: string[] = [
        'EMPLOYEE ID',
        'EMPLOYEE NAME',
        'DEPARTMENT',
        'TEAM MANAGER',
        'LOCATION',
        'SUB LOCATION',
        'SHIFT',
        'LATE COUNT',
        'TOTAL DURATION',
        'AVG DURATION',
      ];

      // Prepare data for Excel
      const excelData: any[][] = [];

      // Add Title Row
      excelData.push(['LATE LOGIN REPORT']);

      // Add Header Row
      excelData.push(NEW_SEQUENCE);

      // Add Data Rows
      this.data.forEach((record) => {
        const row: any[] = [];
        NEW_SEQUENCE.forEach((columnName) => {
          const originalKey = Object.keys(HEADER_MAPPINGS).find(
            (key) => HEADER_MAPPINGS[key] === columnName,
          );

          let value = '-';
          if (originalKey && record.hasOwnProperty(originalKey)) {
            const rawValue = record[originalKey];
            if (rawValue !== null && rawValue !== undefined) {
              value = rawValue;
            }
          }
          row.push(value);
        });
        excelData.push(row);
      });

      // Create Worksheet
      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);

      // Merge Title Row
      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } },
      ];

      // Style Title Row
      if (!ws['A1']) ws['A1'] = { t: 's', v: 'LATE LOGIN REPORT' };
      ws['A1'].t = 's';
      ws['A1'].v = 'LATE LOGIN REPORT';
      ws['A1'].s = {
        font: { bold: true, sz: 14, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };

      // Set row height for title
      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][0] = { hpt: 25 };

      // Style Header Row
      const headerRowIndex = 1;
      NEW_SEQUENCE.forEach((_, colIndex) => {
        const cellRef = XLSX.utils.encode_cell({
          r: headerRowIndex,
          c: colIndex,
        });
        if (!ws[cellRef]) ws[cellRef] = { t: 's', v: NEW_SEQUENCE[colIndex] };
        ws[cellRef].s = {
          font: { bold: true },
          alignment: { horizontal: 'center', vertical: 'center' },
        };
      });

      // Style Data Rows
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

      // Set Column Widths
      const colWidths = NEW_SEQUENCE.map((colName, colIndex) => {
        let maxLength = colName.length;
        for (let i = 2; i < excelData.length; i++) {
          const cellValue = excelData[i][colIndex]
            ? String(excelData[i][colIndex])
            : '';
          if (cellValue.length > maxLength) {
            maxLength = cellValue.length;
          }
        }
        return { wch: maxLength + 5 };
      });
      ws['!cols'] = colWidths;

      // Generate and download Excel file
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Late Login Report');
      const fileName = `Late Login Report - ${dayjs().format('MMM DD YYYY')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      this.spinnerLoader2 = false;
    }, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

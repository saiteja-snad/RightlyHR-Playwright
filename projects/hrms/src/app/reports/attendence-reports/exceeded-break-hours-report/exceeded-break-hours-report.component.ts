import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
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
import dayjs from 'dayjs';
import { environment } from '../../../../environments/environment';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from '../../../shared/reports-tabs/reports-header/reports-header.component';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MultiSelectModule } from 'primeng/multiselect';
import { DatePickerModule } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-exceeded-break-hours-report',
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
    MultiSelectModule,
    DatePickerModule,
    TableModule,
  ],
  templateUrl: './exceeded-break-hours-report.component.html',
  styleUrl: './exceeded-break-hours-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ExceededBreakHoursReportComponent implements OnInit, OnDestroy {
  @ViewChild('exceededBreakHoursTable') exceededBreakHoursTable!: Table;
  private readonly destroy$ = new Subject<void>();
  subscription!: Subscription;

  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  employeeMultiSelectOptions: any[] = [];
  teamdetails = [] as any[];
  data: any[] = [];
  originalData: any[] = [];

  ExceededBreakHoursReport!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  getEmployeeInfo = [] as any;
  today: Date = new Date();
  localeOptions: any;
  currentSortField: string = '';
  currentSortOrder: number = 0;

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
      clearLabel: 'Clear',
    };

    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getEmployeeId();
    this.getTeam();
    this.getMyTeam();
  }

  initializeForm() {
    this.ExceededBreakHoursReport = this.fb.group({
      dateRange: [null],
      manager: [[]],
      employeeIds: [[]],
      team: [[]],
    });

    this.ExceededBreakHoursReport.get('manager')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((managers: any[]) => {
        if (managers && managers.length > 0) {
          const managerIds = managers.map((m) => m.employeeId).join(',');
          this.getEmployeeId(managerIds);
        } else {
          this.getEmployeeId();
        }
        this.ExceededBreakHoursReport.get('employeeIds')?.setValue([]);
      });

    this.ExceededBreakHoursReport.valueChanges
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
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
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
              fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
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
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
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
    this.generateExceededBreakHoursReport();
    this.closeCanvas();
  }

  clearAllFilters() {
    this.ExceededBreakHoursReport.patchValue({
      employeeIds: [],
      manager: [],
      dateRange: null,
    });
    this.data = [];
    this.originalData = [];
    this.currentSortField = '';
    this.currentSortOrder = 0;
    this.isFilterIndicatorActive = false;
  }

  get isExceededBreakHoursGenerateDisabled(): boolean {
    const { employeeIds, manager, dateRange } =
      this.ExceededBreakHoursReport.value;
    return !(
      (employeeIds && employeeIds.length > 0) ||
      (manager && manager.length > 0) ||
      (dateRange && dateRange.length === 2 && dateRange[0] && dateRange[1])
    );
  }

  generateExceededBreakHoursReport() {
    const formValue = this.ExceededBreakHoursReport.value;
    const dateRange = formValue.dateRange || [];

    let start = dateRange[0] ? dayjs(dateRange[0]) : dayjs().startOf('month');
    let end = dateRange[1] ? dayjs(dateRange[1]) : dayjs();

    const params: any = {
      employeeId:
        formValue.employeeIds?.length === 1
          ? formValue.employeeIds[0].employeeId
          : null,
      managerId:
        formValue.manager?.length === 1
          ? formValue.manager[0].employeeId
          : null,
      locationId: null,
      sublocationId: null,
      fromDate: this.formatDate(start.toDate()),
      toDate: this.formatDate(end.toDate()),
    };

    console.log('EXCEEDED BREAK HOURS PARAMS:', params);

    this.isLoading = true;

    // Note: You'll need to implement this method in ReportsService
    this.reportsService.getExceededBreakHoursReport(params).subscribe({
      next: (res: any) => {
        this.data = res?.data as [];
        this.originalData = [...this.data];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        this.disableBtn = false;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.data = [];
        this.originalData = [];
        this.disableBtn = true;
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  formatDate(date: any): string | null {
    if (!date) return null;
    return dayjs(date).format('YYYY-MM-DD');
  }

  customSort(event: any): void {
    const field = event.field;

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.data = [...this.originalData];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.exceededBreakHoursTable) this.exceededBreakHoursTable.reset();
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

      // Handle fusionEmpId numeric sorting
      if (field === 'fusionEmpId') {
        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;
        return event.order * (num1 - num2);
      }

      // Handle numeric fields for exceeded break hours
      if (field === 'utilizedCount' || field === 'totalDuration' || field === 'avgDuration') {
        const num1 = Number(val1) || 0;
        const num2 = Number(val2) || 0;
        return event.order * (num1 - num2);
      }

      // String sorting (default)
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  exportExceededBreakHours() {
    this.spinnerLoader2 = true;
    setTimeout(() => {
      const dataToExport = this.exceededBreakHoursTable?.filteredValue ?? this.exceededBreakHoursTable?.value ?? this.data;
      const HEADER_MAPPINGS: { [key: string]: string } = {
        fusionEmpId: 'EMPLOYEE ID',
        employeeName: 'EMPLOYEE NAME',
        departmentName: 'DEPARTMENT',
        tmEmployeeName: 'TEAM MANAGER',
        loctaionName: 'LOCATION',
        subLocationName: 'SUB LOCATION',
        shiftName: 'SHIFT',
        utilizedCount: 'EXCEEDED BREAK COUNT',
        totalDuration: 'TOTAL DURATION',
        avgDuration: 'AVERAGE DURATION',
      };

      const NEW_SEQUENCE: string[] = [
        'EMPLOYEE ID',
        'EMPLOYEE NAME',
        'DEPARTMENT',
        'TEAM MANAGER',
        'LOCATION',
        'SUB LOCATION',
        'SHIFT',
        'EXCEEDED BREAK COUNT',
        'TOTAL DURATION',
        'AVERAGE DURATION',
      ];

      const excelData: any[][] = [];
      excelData.push(['EXCEEDED BREAK HOURS REPORT']);
      excelData.push(NEW_SEQUENCE);

      dataToExport.forEach((record: any) => {
        const row: any[] = [];
        NEW_SEQUENCE.forEach((columnName) => {
          const originalKey = Object.keys(HEADER_MAPPINGS).find(
            (key) => HEADER_MAPPINGS[key] === columnName,
          );

          let value = '-';
          if (originalKey && record.hasOwnProperty(originalKey)) {
            const rawValue = record[originalKey];
            if (rawValue !== null && rawValue !== undefined) {
              if (originalKey === 'workDate') {
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

      const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(excelData);

      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } },
      ];

      if (!ws['A1']) ws['A1'] = { t: 's', v: 'EXCEEDED BREAK HOURS REPORT' };
      ws['A1'].t = 's';
      ws['A1'].v = 'EXCEEDED BREAK HOURS REPORT';
      ws['A1'].s = {
        font: { bold: true, sz: 14, color: { rgb: '000000' } },
        alignment: { horizontal: 'center', vertical: 'center' },
      };

      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][0] = { hpt: 25 };

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

      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Exceeded Break Hours Report');
      const fileName = `Exceeded Break Hours Report - ${dayjs().format('MMM DD YYYY')}.xlsx`;
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

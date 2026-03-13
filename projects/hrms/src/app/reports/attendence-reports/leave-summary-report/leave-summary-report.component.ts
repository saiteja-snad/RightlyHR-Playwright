import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
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
    MultiSelectModule
],
  templateUrl: './leave-summary-report.component.html',
  styleUrl: './leave-summary-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LeaveSummaryReportComponent implements OnInit, OnDestroy {
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
      (form.get('team')?.value && form.get('team')?.value.length > 0)
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

    // Call service with the constructed request
    // Assuming getLeaveSummaryReport needs to be updated to POST or handle this payload structure
    // For now we assume getLeaveSummaryReport is similar to leave-report's V2 but for summary
    this.subscription = this.reportsService.getLeaveSummaryReportV2(request).subscribe({
      next: (res: any) => {
        this.filterlvsumRecord = res ?? [];
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
        'MONTH',
        'LEAVE CATEGORY',
        'LEAVES AVAILED',
      ];

      // Modify data with renamed headers and new sequence
      const modifiedData = this.filterlvsumRecord.map(record => {
        const modifiedRecord: any = {};
        NEW_SEQUENCE.forEach(columnName => {
          const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
          if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
            if (originalColumnName === 'startDate') {
              // Extract the year part from the date
              const year = new Date(record[originalColumnName]).getFullYear();
              modifiedRecord[columnName] = year;
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
      XLSX.utils.sheet_add_aoa(ws, [['LEAVE SUMMARY REPORT']], { origin: 'A1' });

      // Add header row
      // Use NEW_SEQUENCE directly for headers as it contains the display names
      const headerRow = NEW_SEQUENCE.map(columnName => HEADER_MAPPINGS[columnName] || columnName);
      XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A2' });

      // Add data rows
      XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3', skipHeader: true });

      // Apply styles to WFH Report row
      const wfhReportCell = ws['A1'] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
      wfhReportCell.s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
      ws['A1'] = wfhReportCell; // Assign the styled cell back to the worksheet

      // Apply styles to column headers
      NEW_SEQUENCE.forEach((columnName, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
        const cell = ws[cellAddress] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
        cell.s = { font: { bold: true }, alignment: { horizontal: 'center' } };
        ws[cellAddress] = cell; // Assign the styled cell back to the worksheet
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

        if (columnName === 'EMPLOYEE ID' || columnName === 'DEPARTMENT' || columnName === 'APPLIED DATE' || columnName === 'SUB LOCATION') {
          columnWidth += 5; // Increase width by 5
        }
        ws['!cols'] = ws['!cols'] || [];
        ws['!cols'][index] = { wch: columnWidth };
      });

      // Generate Excel file and trigger download
      const wb: XLSX.WorkBook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Leave Summary Report');
      
      const today = new Date();
      const filenameDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '');
      XLSX.writeFile(wb, `Leave Summary Report - ${filenameDate}.xlsx`);
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

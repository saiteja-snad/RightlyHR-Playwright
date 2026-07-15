import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { IInactiveReportRequest } from '../../../Interfaces/reports.model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import * as XLSX from 'xlsx-js-style';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-inactive-employee-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    SelectModule,
    MultiSelectModule,
    TranslateModule,
    ReactiveFormsModule,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    ReportsHeaderComponent
  ],
  templateUrl: './inactive-employee-report.component.html',
  styleUrl: './inactive-employee-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class InactiveEmployeeReportComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  subscription!: Subscription;
  private readonly destroy$ = new Subject<void>();
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredInactiveRecord: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  inactiveReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  uniqueLeaveCategory: any[] = [];
  employeeMultiSelectOptions: any[] = [];

  years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private offcanvasService: NgbOffcanvas
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getEmployeeId();
    this.getTeam();
    this.getInactiveReports();
  }

  initializeForm() {
    this.inactiveReportForm = this.fb.group({
      employee: [[]],
      manager: [[]],
      leaveCategory: [[]],
      year: [null],
    });

    this.inactiveReportForm.get('manager')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((managers: any[]) => {
        if (Array.isArray(managers) && managers.length > 0) {
          const managerIds = managers.map(m => m.employeeId).filter(Boolean).join(',');
          this.getEmployeeId(managerIds);
        } else {
          this.getEmployeeId(null);
        }
        this.inactiveReportForm.get('employee')?.setValue([]);
      });

    this.inactiveReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
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

  get isInactiveGenerateDisabled(): boolean {
    return !this.isAnyFilterApplied();
  }

  isAnyFilterApplied(): boolean {
    const form = this.inactiveReportForm;
    return !!(
      (form.get('employee')?.value && form.get('employee')?.value.length > 0) ||
      (form.get('manager')?.value && form.get('manager')?.value.length > 0) ||
      (form.get('leaveCategory')?.value && form.get('leaveCategory')?.value.length > 0) ||
      form.get('year')?.value
    );
  }

  onGenerate(): void {
    this.isFilterIndicatorActive = this.isAnyFilterApplied();
    this.generateInactiveReport();
  }

  getEmployeeId(managerIds?: string | null) {
    const statuses = 'Inactive,Inactive Contract';
    const managerQuery = managerIds ? `&managerIds=${encodeURIComponent(managerIds)}` : '';
    this.subscription = this.http
      .getData(`Employeedata/employees/by-managers?statuses=${encodeURIComponent(statuses)}${managerQuery}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          const employeedata = data.map((employee: any) => {
            return {
              ...employee,
              fullName: `${
                employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${
                employee.middleName ? employee.middleName + ' ' : ''
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

  getInactiveReports() {
    this.subscription = this.reportsService.getInactiveReportsV2({}).subscribe({
      next: (res: any) => {
        // this.filteredInactiveRecord = res ?? [];
        this.extractUniqueYearlyFilters(res);
      },
      error: (err: any) => console.log(err)
    });
  }

  extractUniqueYearlyFilters(data: any[]): void {
    const items = Array.isArray(data) ? data : [];
    const map = new Map<any, { label: string; value: any }>();
    items.forEach((item: any) => {
      // Adjust property names based on Inactive Report V2 response structure
      // Assuming similar to Leave Summary or Yearly Summary
      const rawLabel = item?.leaveCategoryName ?? item?.leaveName ?? item?.leaveType;
      const label = typeof rawLabel === 'string' ? rawLabel.trim() : rawLabel;
      const value = item?.leaveCategoryId ?? item?.categoryId ?? item?.leaveName ?? item?.leaveType;
      if (typeof label === 'string' && label.trim().length > 0) {
        map.set(value, { label, value });
      }
    });
    this.uniqueLeaveCategory = Array.from(map.values()).sort((a, b) => {
      const aLabel = a.label.trim().toLowerCase();
      const bLabel = b.label.trim().toLowerCase();
      return aLabel.localeCompare(bLabel);
    });
  }

  generateInactiveReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;
    this.disableBtn = true;
    const formValue = this.inactiveReportForm.value;
    
    // Check if no filter is provided
    if (!this.isAnyFilterApplied()) {
      this.spinnerLoader1 = false;
      this.isLoading = false;
      this.disableBtn = false;
      this.filteredInactiveRecord = [];
      return;
    }

    const request: IInactiveReportRequest = {};

    if (formValue.leaveCategory && formValue.leaveCategory.length > 0) {
      request.leaveCategorys = formValue.leaveCategory.map((x: any) => x.value).join(',');
    }

    if (formValue.manager && formValue.manager.length > 0) {
      request.teamManagerID = formValue.manager.map((x: any) => x.employeeId).join(',');
    }

    if (formValue.employee && formValue.employee.length > 0) {
      request.employeeId = formValue.employee.map((x: any) => x.employeeId).join(',');
    }

    if (formValue.year) {
      request.year = (typeof formValue.year === 'object' && formValue.year !== null) ? formValue.year.value : formValue.year;
    }

    // Call service with the constructed request
    this.reportsService.getInactiveReportsV2(request).subscribe({
      next: (data: any) => {
        this.filteredInactiveRecord = data ?? [];
        this.spinnerLoader1 = false;
        this.isLoading = false;
        this.disableBtn = false;
        this.closeCanvas();
      },
      error: (error: any) => {
        console.log(error);
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
        this.filteredInactiveRecord = [];
        this.closeCanvas();
      }
    });
  }

  clearAllFilters(): void {
    this.inactiveReportForm.reset({
      year: null,
      leaveCategory: [],
      manager: [],
      employee: []
    }, { emitEvent: false });
    
    this.filteredInactiveRecord = [];
    this.isFilterIndicatorActive = false;
    this.disableBtn = false;
    this.isLoading = false;
    this.spinnerLoader1 = false;
    this.spinnerLoader2 = false;
    this.uniqueLeaveCategory = [];
    this.employeeMultiSelectOptions = [];
    this.getEmployeeId();
    this.getInactiveReports();
  }

  exportToExcelInactive(): void {
    // Define header mappings
    this.spinnerLoader2 = true;
    setTimeout(() => {
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      year: 'YEAR',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      shift: 'SHIFT',
      leaveCategoryName: 'LEAVE CATEGORY',
      entitled: 'ENTITLED',
      availed: 'AVAILED',
      frozenCount: 'FROZEN',
      balance: 'BALANCE'
    };

    // Define new sequence
    const NEW_SEQUENCE: string[] = [
      'EMPLOYEE ID',
      'EMPLOYEE NAME',
      'DEPARTMENT',
      'TEAM MANAGER',
      'YEAR',
      'LOCATION',
      'SUB LOCATION',
      'SHIFT',
      'LEAVE CATEGORY',
      'ENTITLED',
      'AVAILED',
      'FROZEN',
      'BALANCE'
    ];

    // Modify data with renamed headers and new sequence
    const modifiedData = this.filteredInactiveRecord.map(record => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach(columnName => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
           modifiedRecord[columnName] = record[originalColumnName];
        } else {
          modifiedRecord[columnName] = '';
        }
      });
      return modifiedRecord;
    });

    // Create a new empty worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]]);

    // Merge cells for Report row
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];

    // Add Report row
    XLSX.utils.sheet_add_aoa(ws, [['INACTIVE EMPLOYEE LEAVE SUMMARY REPORT']], { origin: 'A1' });

    // Add header row
    const headerRow = NEW_SEQUENCE.map(columnName => HEADER_MAPPINGS[columnName] || columnName);
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3', skipHeader: true });

    // Apply styles to Report row
    const wfhReportCell = ws['A1'] || { t: '', v: '' }; 
    wfhReportCell.s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
    ws['A1'] = wfhReportCell;

    // Apply styles to column headers
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

      if (columnName === 'EMPLOYEE ID' || columnName === 'DEPARTMENT' || columnName === 'SUB LOCATION') {
        columnWidth += 5; // Increase width by 5
      }
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'][index] = { wch: columnWidth };
    });

    // Generate Excel file and trigger download
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inactive Emp Leave Summary');
    const today = new Date();
    const filenameDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '');
    XLSX.writeFile(wb, `Inactive Employee Leave Summary Report - ${filenameDate}.xlsx`);
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

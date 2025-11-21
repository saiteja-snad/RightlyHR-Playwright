import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { ReportsHeaderComponent } from "../../shared/reports-tabs/reports-header/reports-header.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DatePicker } from 'primeng/datepicker';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { ReportsService } from '../../services/reports/reports.service';
import { Subscription } from 'rxjs';
import { IemployeeDetails } from '../attendence-reports/reports.modal';
import dayjs, { Dayjs } from 'dayjs';
import { IAttendanceDetails, IExpenseItemDetails, IExpenseReportsDetails, IExpenseReportsRequestDetails } from '../../Interfaces/reports.model';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { DateformatPipe } from "../../pipes/dateformat.pipe";

@Component({
  selector: 'app-expense-reports',
  imports: [ReportsHeaderComponent, DatePicker, CommonModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, DataLoaderContentComponent, TranslateModule, InfoIconComponent, NgbPopoverModule, DateformatPipe],
  templateUrl: './expense-reports.component.html',
  styleUrl: './expense-reports.component.scss'
})
export class ExpenseReportsComponent implements OnInit, OnDestroy {
  ExpenseReportForm!: FormGroup;
  subscription!: Subscription;
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  loggedInUser = {} as IemployeeDetails;
  getEmployeeInfo = [] as any;
  uniqueExpenseStatus: any[] = [];
  spinnerLoader1 = false;
  disableBtn = false;
  spinnerLoader2 = false;
  isLoading: boolean = false;
  filteredleaveRecord: IExpenseReportsDetails[] = [];
  expenseSummary: any = null;
  selectExpenseEmployeeIds: number[] = [];
  selectedEmployeeId: any = null;
  expenseStatus: any = []
  selectedEmployee: IExpenseReportsDetails | null = null;
  @ViewChild('expenseModal') expenseModal!: TemplateRef<any>;
  popupData: IExpenseItemDetails[] = [];

  constructor(
    public authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private modal: NgbModal,
  ) {
    this.loggedInUser = this.authService.getToken();
  }

  ngOnInit(): void {

    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getEmployeeId();
    this.getTeam();
    this.getMyTeam();
    this.getdatabyentriy();
  }

  initializeForm() {
    this.ExpenseReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      dateRange: [null, Validators.required],
      status: [null, Validators.required],
      team: [null]
      // year: ['']
    });
    this.ExpenseReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  clearAllFilters(): void {
    this.ExpenseReportForm.reset();
    this.filteredleaveRecord = [];
  }

  onClick(employeeIds: any) {
    if (employeeIds.value) {

      if (employeeIds.value.employeeId == this.loggedInUser.employeeId) {
        this.selectExpenseEmployeeIds = this.getEmployeeInfo.filter((employee: any) =>
          employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
        this.selectedEmployeeId = this.getEmployeeInfo.filter((employee: any) =>
          employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
      } else {
        this.selectExpenseEmployeeIds.push(employeeIds.value.employeeId);
        this.selectedEmployeeId.push(employeeIds.value.employeeId);
      }
    }
  }

  getEmployeeId() {
    const loggedInUser = this.authService.getToken();
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        const employeedata = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName} 
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
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
    this.subscription = this.http.getData('PendingApprovalsAuthority/getAll').subscribe({
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
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
      next: (response: any) => {
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

  getdatabyentriy() {
    const params = 'ExpenseReport';
    const param = 'Status';

    this.http
      .getDatabyentriyvalue(`entityAttributeValues`, params, param).subscribe({
        next: (data: any) => {
          if (data && data.length > 0) {
            this.expenseStatus = data;
            // this.expenseStatus = statusString.split(',').map((type: any) => ({ value: type }));

          } else {
            console.log('No data found.');
          }
        },
        error: (err) => {
          console.error('Error fetching data:', err);
        }
      });
  }

  extractUniqueYearlyFilters(data: any[]): void {
    const uniqueLeaveCategory = Array.from(new Set(data.map((item: any) => item.leaveType))).filter(Boolean);
    this.uniqueExpenseStatus = uniqueLeaveCategory.map(category => ({
      label: category,
      value: category
    }));
  }

  // get isExpenseGenerateDisabled(): boolean {
  //   const { employee, manager, dateRange, leaveCategory, team } = this.ExpenseReportForm.value;
  //   // Check if any field has a value
  //   return !(employee || manager || (dateRange && (dateRange.startDate || dateRange.endDate)) || leaveCategory || team);
  // }

  get isExpenseGenerateDisabled(): boolean {
  const { dateRange, status } = this.ExpenseReportForm.value;
  return this.spinnerLoader1 || !(dateRange && status);
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

  generateExpenseReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;

    const formValue = this.ExpenseReportForm.value;

    const isAllEmployeesSelected = formValue.employee?.employeeId === 'all';
    const dateRangeArray = formValue.dateRange || [];
    const startDate: Dayjs | null = dateRangeArray[0] ? dayjs(dateRangeArray[0]) : null;
    const endDate: Dayjs | null = dateRangeArray[1] ? dayjs(dateRangeArray[1]) : startDate;

    // Check if no filters are provided
    const noFilterProvided =
      !formValue.employee &&
      !formValue.manager &&
      !formValue.team &&
      !formValue.status &&
      !startDate &&
      !endDate;

    if (noFilterProvided) {
      this.filteredleaveRecord = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      return;
    }

    const request: IExpenseReportsRequestDetails = {};

    // Employee(s)
    if (this.selectExpenseEmployeeIds?.length > 0) {
      request.fusionEmpId = this.selectExpenseEmployeeIds.join(',');
    } else if (!isAllEmployeesSelected && formValue.employee?.employeeId) {
      request.employeeId = formValue.employee.employeeId;
    }

    // Manager
    if (formValue.manager?.employeeId) {
      request.teamManagerId = formValue.manager.employeeId;
    }

    // My Team
    if (formValue.team?.employeeId) {
      request.teamId = formValue.team.employeeId;
    }

    // Expense Status
    if (formValue.status) {
      request.expenseItemStatus = formValue.status;
    }

    // Date Range
    if (startDate && endDate) {
      request.startDate = this.formatDate(this.parseDate(startDate));
      request.endDate = this.formatDate(this.parseDate(endDate));
    }

    // Call API
    this.reportsService.getExpenseReports(request).subscribe({
      next: (response: any) => {
        this.filteredleaveRecord = response ?? [];
      },
      error: () => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredleaveRecord = [];
        this.expenseSummary = null;
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
      },
    });
  }

  openExpenseDetails(record: IExpenseReportsDetails): void {
    this.selectedEmployee = record;
    this.popupData = record.expensesItems || [];
    this.modal.open(this.expenseModal, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
  }


exportToExcelYearly(): void {
  this.spinnerLoader2 = true;

  const HEADER_MAPPINGS: { [key: string]: string } = {
    fusionEmpId: 'EMPLOYEE ID',
    employeeName: 'EMPLOYEE NAME',
    department: 'DEPARTMENT',
    teamManagerName: 'TEAM MANAGER',
    appliedDate: 'EXPENSE APPLIED DATE',
    expenseTitle: 'EXPENSE TITLE',
    totalAmount: 'TOTAL AMOUNT (USD)',
    expensesStatus: 'STATUS',
  };

  const CHILD_HEADERS = [
    'EXPENSE NAME',
    'DESCRIPTION',
    'EXPENSE DATE',
    'AMOUNT (USD)',
    'EXPENSE ITEM STATUS',
    'RECEIPT NUMBER',
  ];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Expense Report');

  // === TITLE (2 rows merged & centered) ===
  worksheet.mergeCells(1, 1, 2, Object.keys(HEADER_MAPPINGS).length + CHILD_HEADERS.length);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'EXPENSE REPORT';
  titleCell.font = { bold: true, size: 16 };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Add one blank row after the title (for spacing)
  worksheet.addRow([]);

  // === HEADER ROW ===
  const headerRow = worksheet.addRow([
    ...Object.values(HEADER_MAPPINGS),
    ...CHILD_HEADERS,
  ]);

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '305496' },
    };
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' },
    };
  });

  // Apply AutoFilter
  worksheet.autoFilter = {
    from: { row: headerRow.number, column: 1 },
    to: { row: headerRow.number, column: Object.keys(HEADER_MAPPINGS).length + CHILD_HEADERS.length },
  };

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('default', { month: 'short' });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatAmount = (val: any) => {
    const n = Number(val);
    return isNaN(n) ? '-' : n.toFixed(2);
  };

  // === DATA ROWS ===
  this.filteredleaveRecord.forEach((record) => {
    const startRow = (worksheet.lastRow?.number ?? 0) + 1;
    const items = record.expensesItems && record.expensesItems.length > 0
      ? record.expensesItems
      : [{}];

    items.forEach((item: any) => {
      const row = worksheet.addRow([
        record.fusionEmpId ?? '-',
        record.employeeName ?? '-',
        record.department ?? '-',
        record.teamManagerName ?? '-',
        record.appliedDate ? formatDate(record.appliedDate) : '-',
        record.expenseTitle ?? '-',
        formatAmount(record.totalAmount),
        record.expensesStatus ?? '-',
        item.expenseItemName ?? '-',
        item.expenseItemsDescription ?? '-',
        item.expenseDate ? formatDate(item.expenseDate) : '-',
        formatAmount(item.expenseAmount),
        item.status ?? '-',
        item.receiptNumber ?? '-',
      ]);

      row.height = 25;

      // Apply border + alignment
      row.eachCell((cell) => {
        const isDash = cell.value === '-';
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = {
          horizontal: isDash ? 'center' : 'left',
          vertical: 'middle',
          wrapText: true,
        };
      });
    });

    // === Merge main cells if multiple items ===
    if (items.length > 1) {
      const endRow = worksheet.lastRow?.number ?? startRow;
      for (let col = 1; col <= 7; col++) {
        worksheet.mergeCells(startRow, col, endRow, col);
        const mergedCell = worksheet.getCell(startRow, col);
        const isDash = mergedCell.value === '-';
        mergedCell.alignment = {
          horizontal: isDash ? 'center' : 'left',
          vertical: 'middle',
          wrapText: true,
        };
      }
    }
  });

  // === AUTO WIDTH ===
  worksheet.columns.forEach((col) => {
    col.width = 25;
  });

  // === Final Grid Border (thin) ===
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: '000000' } },
        left: { style: 'thin', color: { argb: '000000' } },
        bottom: { style: 'thin', color: { argb: '000000' } },
        right: { style: 'thin', color: { argb: '000000' } },
      };
    });
  });

  // === SAVE FILE ===
  workbook.xlsx.writeBuffer().then((data: any) => {
    const blob = new Blob([data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `Expense_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
    this.spinnerLoader2 = false;
  });
}


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

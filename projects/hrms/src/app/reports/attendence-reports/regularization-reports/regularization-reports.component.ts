import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { Subject, takeUntil } from 'rxjs';
import { AttandaceReportTabsComponent } from "../../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component";
import { Select } from 'primeng/select';
import { IemployeeDetails, ITeamManagerEmployees } from '../reports.modal';
import dayjs from 'dayjs';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { environment } from '../../../../environments/environment';
import { IAttendanceDetails } from '../../../Interfaces/reports.model';
import * as XLSX from 'xlsx';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-regularization-reports',
  imports: [CommonModule, ReactiveFormsModule, AttandaceReportTabsComponent, Select, NgxDaterangepickerBootstrapDirective, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './regularization-reports.component.html',
  styleUrl: './regularization-reports.component.scss'
})
export class RegularizationReportsComponent implements OnInit, OnDestroy{
  regularizationReportForm!: FormGroup;
  loggedInUser: IemployeeDetails | undefined;
  employeeDetails: IemployeeDetails[] = [];
  teamManagerDetails: ITeamManagerEmployees[] = [];
  filteredRegularizationData: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;
  isLoading = false;

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

  localeOptions: any = {
    applyLabel: 'ok',
    format: environment.dateformat.toUpperCase(),
    direction: 'ltr',
    clearLabel: 'Clear', // could be rtl
  };

  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac:RbacService
  ) { }

  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getAllEmployees();
    this.getTeam();
    // this.getAttendanceReports();
  }

  initializeForm() {
    this.regularizationReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      dateRange: [null]
    });

    this.regularizationReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  get isPermissionGenerateDisabled(): boolean {
    const form = this.regularizationReportForm;
    return !(
      form.get('employee')?.value ||
      form.get('manager')?.value ||
      form.get('dateRange')?.value
    );
  }

  getAllEmployees() {
    const loggedInUser = this.authService.getToken();
    this.http.getData('Employeedata/ActiveEmployees').pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          const employeedata = data.map((employee: any) => {
            return {
              ...employee,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
                }${employee.lastName}`,
            };
          });

          const filteredEmployees = employeedata.filter((element: any) => {
            return element.employeeId != loggedInUser.employeeId;
          });

          this.employeeDetails = [
            { fullName: 'All Employees', employeeId: 'all' },
            ...filteredEmployees
          ];
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  getTeam() {
    this.http.getData('PendingApprovalsAuthority/getAll').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.teamManagerDetails = data.map((employee: any) => {
          return {
            ...employee,
            fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
          };
        });
      },
      error: (reason: any) => console.log(reason),
    });
  }

  clearAllFilters() { 
    this.regularizationReportForm.reset();
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

  generateRegularizationReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;
  
    const formValue = this.regularizationReportForm.value;
    const isAllEmployeesSelected = formValue.employee?.employeeId === 'all';
  
    const noFilterProvided =
      !formValue.employee &&
      !formValue.leaveCategory &&
      (!formValue.dateRange?.startDate || !formValue.dateRange?.endDate) &&
      !formValue.month &&
      !formValue.manager;
  
    if (noFilterProvided) {
      this.filteredRegularizationData = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      return;
    }
  
    const request: IAttendanceDetails = {};
  
    // Apply leave category if selected
    if (formValue.leaveCategory) {
      request.LeaveName = formValue.leaveCategory.value;
    }
  
    // Apply date range if provided
    if (formValue.dateRange?.startDate && formValue.dateRange?.endDate) {
      const startDate = this.formatDate(this.parseDate(formValue.dateRange.startDate));
      const endDate = this.formatDate(this.parseDate(formValue.dateRange.endDate));
      request.StartDate = startDate;
      request.EndDate = endDate;
    }
  
    // Apply manager name if provided
    if (formValue.manager) {
      request.teamManagerId = formValue.manager.employeeId
    }
  
    // Only include employee filter if not "All Employees"
    if (!isAllEmployeesSelected && formValue.employee?.fusionEmpId) {
      request.FusionEmpId = formValue.employee.fusionEmpId;
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
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
      }
    });
  }

  exportToExcelAttendanceRegularization(): void {
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManager: 'TEAM MANAGER',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      utilizedCount: 'UTILIZED COUNT',
      totalDuration: 'Total Duration'

    };

    const NEW_SEQUENCE: string[] = [
      'EMPLOYEE ID',
      'EMPLOYEE NAME',
      'DEPARTMENT',
      'TEAM MANAGER',
      'LOCATION',
      'SUB LOCATION',
      'UTILIZED COUNT',
      'Total Duration'
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
    XLSX.utils.sheet_add_aoa(ws, [['ATTENDANCE REGULARIZATION REPORT']], { origin: 'A1' });

    // Add header row
    const headerRow = NEW_SEQUENCE.map(columnName => HEADER_MAPPINGS[columnName]);
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3' });

    // Apply styles to Leave Report row
    const leaveReportCell = ws['A1'] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
    leaveReportCell.s = { font: { bold: true }, alignment: { horizontal: 'center' }, fill: { bgColor: { rgb: 'FFFF00' } } };
    ws['A1'] = leaveReportCell; // Assign the styled cell back to the worksheet

    // Apply styles to column headers
    NEW_SEQUENCE.forEach((columnName, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
      const cell = ws[cellAddress] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
      cell.s = { font: { bold: true }, alignment: { horizontal: 'center' }, fill: { bgColor: { rgb: '0000FF' } }, fontColor: { rgb: 'FFFFFF' } };
      ws[cellAddress] = cell; // Assign the styled cell back to the worksheet
    });
    // Apply styles to data rows
    for (let rowIndex = 2; rowIndex < modifiedData.length + 2; rowIndex++) {
      NEW_SEQUENCE.forEach((columnName, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: index });
        const cell = ws[cellAddress] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
        cell.s = { alignment: { horizontal: 'center', vertical: 'middle' } };
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
    XLSX.writeFile(wb, 'Regularization_Report.xlsx');
  }


  getColumnWidth(data: any[], columnName: string): number {
    const maxWidth = data.reduce((max: number, record: any) => {
      const value = record[columnName]?.toString().length || 0;
      return value > max ? value : max;
    }, 0);

    return Math.max(10, maxWidth);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}

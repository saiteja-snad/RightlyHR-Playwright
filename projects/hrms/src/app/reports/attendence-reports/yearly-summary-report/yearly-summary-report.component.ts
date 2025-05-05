import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { AttandaceReportTabsComponent } from '../../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component';
import * as XLSX from 'xlsx';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { IYearlyReportRequest } from '../../../Interfaces/reports.model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-yearly-summary-report',
  imports: [
    CommonModule,
    FormsModule,
    AttandaceReportTabsComponent,
    DropdownModule,
    SelectModule,
    TranslateModule,
    ReactiveFormsModule,
    NoDataFoundComponent,
    DataLoaderContentComponent
  ],
  templateUrl: './yearly-summary-report.component.html',
  styleUrl: './yearly-summary-report.component.scss'
})
export class YearlySummaryReportComponent {
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredYearlyRecord: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  selectedEmployeeId: any = null;
  selectedWfhManager: string | null = null;
  selectedLeave: string | null = null;
  selectedYear: string | null = null;
  uniqueLeaveCategory: any[] = [];
  yearlyReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;

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
    public rbac:RbacService
  ) { }

  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getYearlyReports();
    this.getEmployeeId();
    this.getTeam();
  }

  initializeForm() {
    this.yearlyReportForm = this.fb.group({
      employee: [null, Validators.required],
      manager: [null],
      leaveCategory: [null],
      year: [null]
    });

    this.yearlyReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  get isYearlyGenerateDisabled(): boolean {
    const form = this.yearlyReportForm;
    return !(
      form.get('employee')?.value ||
      form.get('manager')?.value ||
      form.get('leaveCategory')?.value ||
      form.get('year')?.value
    );
  }

  getEmployeeId() {
    const loggedInUser = this.authService.getToken();
    this.subscription = this.http

      .getData('Employeedata/ActiveEmployees')
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

          this.employeeiddetails = [
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

  getYearlyReports() {
    this.subscription = this.reportsService.getYearlyReports({}).subscribe({
      next: (res: any) => {
        this.extractUniqueYearlyFilters(res);
      },
      error: (err: any) => console.log(err)
    });
  }

  extractUniqueYearlyFilters(data: any[]): void {
    const uniqueCategories = Array.from(new Set(data.map((item: any) => item.leaveType))).filter(Boolean);
  
    this.uniqueLeaveCategory = uniqueCategories.map(category => ({
      label: category,
      value: category
    }));
  }

  generateYearlyReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;

    const formValue = this.yearlyReportForm.value;
    const isAllEmployeesSelected = formValue.employee?.employeeId === 'all';
    // Check if no filter is provided
    const noFilterProvided =
      !formValue.employee &&
      !formValue.manager &&
      !formValue.leaveCategory &&
      !formValue.year;

    if (noFilterProvided) {
      this.spinnerLoader1 = false;
      this.isLoading = false;
      this.filteredYearlyRecord = [];
      return;
    }

    const request: IYearlyReportRequest = {};

    // Only include filters if not "All Employees"
    if (!isAllEmployeesSelected && formValue.employee?.fusionEmpId) {
      request.FusionEmpId = formValue.employee.fusionEmpId;
    }

    // Employee filter
    if (formValue.employee?.fusionEmpId) {
      request.FusionEmpId = formValue.employee.fusionEmpId;
    }

    // Manager full name
    if (formValue.manager) {
      const fullName = [formValue.manager.firstName, formValue.manager.middleName, formValue.manager.lastName]
        .filter(Boolean)
        .join(' ');
      request.TeamManagerName = fullName;
    }

    // Leave category
    if (formValue.leaveCategory) {
      request.LeaveName = formValue.leaveCategory.value;
    }

    // Year
    if (formValue.year) {
      request.Year = formValue.year;
    }

    // Call service with the constructed request
    this.reportsService.getYearlyReports(request).subscribe({
      next: (data: any) => {
        // Extract the year from startDate and add it to each record
        this.filteredYearlyRecord = data.map((record: any) => {
          const startDate = new Date(record.startDate);  // Assuming startDate is in a valid format
          return {
            ...record,
            year: startDate.getFullYear()  // Add the year as a new field
          };
        });

        if (this.filteredYearlyRecord.length === 0) {
          // Show modal: no data
        } else {
          console.log('Fetched Yearly Record:', this.filteredYearlyRecord);
        }
      },
      error: (error: any) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredYearlyRecord = [];
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
      }
    });
  }

  clearAllFilters(): void {
    this.yearlyReportForm.reset();
  }

  exportToExcelYearly(): void {
    // Define header mappings
    this.spinnerLoader2 = true;
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      shift: 'SHIFT',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      leaveType: 'LEAVE TYPE',
      startDate: 'YEAR',
      entitled: 'ENTITLED',
      availed: 'AVAILED',
      balanced: 'BALANCED'
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
      'LEAVE TYPE',
      'YEAR',
      'ENTITLED',
      'AVAILED',
      'BALANCED'
    ];

    // Modify data with renamed headers and new sequence
    const modifiedData = this.filteredYearlyRecord.map(record => {
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
    XLSX.utils.sheet_add_aoa(ws, [['YEARLY SUMMARY REPORT']], { origin: 'A1' });

    // Add header row
    const headerRow = NEW_SEQUENCE.map(columnName => HEADER_MAPPINGS[columnName]);
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3' });

    // Apply styles to WFH Report row
    const wfhReportCell = ws['A1'] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
    wfhReportCell.s = { font: { bold: true }, alignment: { horizontal: 'center' }, fill: { bgColor: { rgb: 'FFFF00' } } };
    ws['A1'] = wfhReportCell; // Assign the styled cell back to the worksheet

    // Apply styles to column headers
    NEW_SEQUENCE.forEach((columnName, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
      const cell = ws[cellAddress] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
      cell.s = { font: { bold: true }, alignment: { horizontal: 'center' }, fill: { bgColor: { rgb: '0000FF' } }, fontColor: { rgb: 'FFFFFF' } };
      ws[cellAddress] = cell; // Assign the styled cell back to the worksheet
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
    XLSX.utils.book_append_sheet(wb, ws, 'Yearly Summary Report');
    XLSX.writeFile(wb, 'Yearly_Summary_Report.xlsx');
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

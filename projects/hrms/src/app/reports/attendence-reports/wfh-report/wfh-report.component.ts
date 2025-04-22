import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import dayjs from 'dayjs';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { AuthService } from '../../../services/auth.service';
import { ReportsService } from '../../../services/reports/reports.service';
import * as XLSX from 'xlsx';
import { AttandaceReportTabsComponent } from '../../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component';
import { IWfhReportRequest } from '../../../Interfaces/reports.model';
import { HttpService } from '../../../services/http.service';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";

@Component({
  selector: 'app-wfh-report',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, NgxDaterangepickerBootstrapDirective,
    AttandaceReportTabsComponent, DropdownModule, SelectModule, TranslateModule,
    NoDataFoundComponent
],
  templateUrl: './wfh-report.component.html',
  styleUrl: './wfh-report.component.scss',
})
export class WfhReportComponent implements OnInit {
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  uniqueEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  filteredWfhEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  selectedDate: string | null = null;
  selectedDateRange: { startDate: any; endDate: any } | null = null;
  searchTerm: string = '';
  selectedEmployeeId: any = null;
  isDropdownOpen: boolean = false;
  isFilterGivenwfh: boolean = false;
  filteredWfhRecord: any[] = [];
  employeeMasterData: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  isDropdownOpenwfh: boolean = false;
  selectedWfhManager: string | null = null;
  selectedMonth: number | null = null;
  wfhReportForm!: FormGroup;
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
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    // this.getStandardReports();
    this.getEmployeeId();
    this.getTeam();
    this.initializeForm();
  }

  initializeForm() {
    this.wfhReportForm = this.fb.group({
      employee: [null, Validators.required],
      manager: [null],
      dateRange: [null]
    });
  }

  getParsedEmployee(event: Event): any {
    const target = event.target as HTMLSelectElement;
    return JSON.parse(target.value);
  }

  onEmployeeChange(event: any) {
    const selected = JSON.parse(event.target.value);
    this.selectedEmployeeId = selected.fusionEmployeeId;
    this.isFilterGivenwfh = true;
  }

  canGenerateOrExport(): boolean {
    return !!(
      this.selectedEmployeeId ||
      this.selectedWfhManager ||
      this.selectedDateRange
    );
  }

  getEmployeeId() {
    const loggedInUser = this.authService.getToken();
    this.subscription = this.http

      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);

          console.log('from wfh' + this.employeeiddetails);
          const employeedata = data.map((employee: any) => {
            return {
              ...employee,
              fullName: `${
                employee.fusionEmployeeId
                  ? employee.fusionEmployeeId + ' - '
                  : ''
              }${employee.firstName} ${
                employee.middleName ? employee.middleName + ' ' : ''
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
    this.subscription = this.http
      .getData('PendingApprovalsAuthority/getAll')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          if (data) {
            this.teamdetails = data.map((employee: any) => {
              return {
                ...employee,
                fullName: `${
                  employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                }${employee.firstName} ${
                  employee.middleName ? employee.middleName + ' ' : ''
                }${employee.lastName}`,
              };
            });
          }
          console.log('Team details' + this.teamdetails);
        },
        error: (reason: any) => {
          console.log(reason);
          alert('Insertion of data is failed');
        },
      });
  }

  //method to get All the reports
  // getStandardReports() {
  //   this.isLoading = true;
  //   const request: IWfhReportRequest = {
  //     // FusionEmpId: this.selectedEmployeeId,
  //     // TeamManagerName: this.selectedWfhManager,
  //     // StartDate: this.wfhDateRange?.startDate,
  //     // EndDate: this.wfhDateRange?.endDate,
  //     // Worked_Month: this.selectedMonth
  //   };
  //   this.subscription = this.reportsService.getWfhReports(request).subscribe({
  //     next: (res: any) => {
  //       if (res) {
  //         this.employeeMasterData = res;
  //         // this.maxPageNumber = res.maxPageNumber;
  //         this.isLoading = false;
  //       }
  //     },
  //     error: (err: any) => {
  //       console.log(err);
  //     },
  //     complete: () => {},
  //   });
  // }

  generateWfhReport(): void {
    const formValue = this.wfhReportForm.value;
    const isAllEmployeesSelected = formValue.employee?.employeeId === 'all';
  
    const noFilterProvided =
      !formValue.employee &&
      (!formValue.dateRange?.startDate || !formValue.dateRange?.endDate) &&
      !formValue.month &&
      !formValue.manager;
  
    if (noFilterProvided) {
      this.filteredWfhRecord = [];
      return;
    }
  
    const request: IWfhReportRequest = {};
  
    // Only include filters if not "All Employees"
    if (!isAllEmployeesSelected) {
      if (formValue.employee?.fusionEmpId) {
        request.FusionEmpId = formValue.employee.fusionEmpId;
      }
  
      if (formValue.dateRange?.startDate && formValue.dateRange?.endDate) {
        const startDate = this.formatDate(this.parseDate(formValue.dateRange.startDate));
        const endDate = this.formatDate(this.parseDate(formValue.dateRange.endDate));
        request.StartDate = startDate;
        request.EndDate = endDate;
      }
  
      if (formValue.month) {
        request.Worked_Month = formValue.month;
      }
  
      if (formValue.manager) {
        request.TeamManagerName = [formValue.manager.firstName, formValue.manager.middleName, formValue.manager.lastName]
          .filter(Boolean)
          .join(' ');
      }
    }
  
    // Single API call
    this.reportsService.getWfhReports(request).subscribe({
      next: (response: any) => {
        this.filteredWfhRecord = response ?? [];
      },
      error: (error) => {
        console.error('Error fetching WFH records', error);
        this.filteredWfhRecord = [];
      },
    });
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
  parseDate(date: any): Date {
    return date instanceof Date ? date : new Date(date);
  }

  WfhtoggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  WfhfilterEmployees() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredWfhEmployees = [...this.uniqueEmployees];
      return;
    }

    this.filteredWfhEmployees = this.uniqueEmployees.filter(
      (emp) =>
        emp.fusionEmpId.toString().includes(term) ||
        emp.employeeName.toLowerCase().includes(term)
    );
  }

  getFullName(manager: any): string {
    return `${manager.firstName} ${
      manager.middleName ? manager.middleName + ' ' : ''
    }${manager.lastName}`;
  }
  exportToExcelWfh(): void {
    // Define header mappings
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      shift: 'SHIFT',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      worked_Date: 'WFH DATE',
      duration: 'DURATION',
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
      'WFH DATE',
      'DURATION',
    ];

    // Modify data with renamed headers and new sequence
    const modifiedData = this.filteredWfhRecord.map((record) => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach((columnName) => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(
          (key) => HEADER_MAPPINGS[key] === columnName
        );
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (record[originalColumnName] === null) {
            modifiedRecord[columnName] = '-';
          } else if (originalColumnName === 'worked_Date') {
            const date = new Date(record[originalColumnName]);
            modifiedRecord[
              columnName
            ] = `${date.getDate()}-${date.toLocaleString('default', {
              month: 'short',
            })}-${date.getFullYear()}`;
          } else {
            modifiedRecord[columnName] = record[originalColumnName];
          }
        } else {
          modifiedRecord[columnName] = '-';
        }
      });
      return modifiedRecord;
    });

    // Create a new empty worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]]);

    // Merge cells for WFH Report row from A1 to I1
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } },
    ];

    // Add WFH Report row
    XLSX.utils.sheet_add_aoa(ws, [['WFH REPORT']], { origin: 'A1' });

    // Add header row
    const headerRow = NEW_SEQUENCE.map(
      (columnName) => HEADER_MAPPINGS[columnName]
    );
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3' });

    // Apply styles to WFH Report row
    const wfhReportCell = ws['A1'] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
    wfhReportCell.s = {
      font: { bold: true },
      alignment: { horizontal: 'center' },
      fill: { bgColor: { rgb: 'FFFF00' } },
    };
    ws['A1'] = wfhReportCell; // Assign the styled cell back to the worksheet

    // Apply styles to column headers
    NEW_SEQUENCE.forEach((columnName, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
      const cell = ws[cellAddress] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
      cell.s = {
        font: { bold: true },
        alignment: { horizontal: 'center' },
        fill: { bgColor: { rgb: '0000FF' } },
        fontColor: { rgb: 'FFFFFF' },
      };
      ws[cellAddress] = cell; // Assign the styled cell back to the worksheet
    });

    // Adjust column width to fit data
    NEW_SEQUENCE.forEach((columnName, index) => {
      let columnWidth = this.getColumnWidth(modifiedData, columnName);

      if (
        columnName === 'EMPLOYEE ID' ||
        columnName === 'DEPARTMENT' ||
        columnName === 'WORKED DATE'
      ) {
        columnWidth += 5; // Increase width by 5
      }
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'][index] = { wch: columnWidth };
    });

    // Generate Excel file and trigger download
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WFH Report');
    XLSX.writeFile(wb, 'WFH_Report.xlsx');
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

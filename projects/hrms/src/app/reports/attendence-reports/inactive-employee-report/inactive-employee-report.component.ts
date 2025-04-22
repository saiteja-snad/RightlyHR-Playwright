import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Form, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { IWfhReportRequest } from '../../../Interfaces/reports.model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { AttandaceReportTabsComponent } from '../../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-inactive-employee-report',
  imports: [CommonModule,
    FormsModule,
    AttandaceReportTabsComponent, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule, NgxDaterangepickerBootstrapDirective,],
  templateUrl: './inactive-employee-report.component.html',
  styleUrl: './inactive-employee-report.component.scss'
})
export class InactiveEmployeeReportComponent {
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
  isFilterGiveninactive: boolean = false;
  filteredInactiveRecord: any[] = [];
  employeeMasterData: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  isDropdownOpenwfh: boolean = false;
  selectedWfhManager: string | null = null;
  selectedMonth: string | null = null;
  inactiveReportForm!: FormGroup
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

  months = [
    { value: 1, name: 'January' },
    { value: 2, name: 'February' },
    { value: 3, name: 'March' },
    { value: 4, name: 'April' },
    { value: 5, name: 'May' },
    { value: 6, name: 'June' },
    { value: 7, name: 'July' },
    { value: 8, name: 'August' },
    { value: 9, name: 'September' },
    { value: 10, name: 'October' },
    { value: 11, name: 'November' },
    { value: 12, name: 'December' }
  ];


  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
  ) {}

  getParsedEmployee(event: Event): any {
    const target = event.target as HTMLSelectElement;
    return JSON.parse(target.value);
  }

  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.getInactiveEmployeeReports();
    this.getEmployeeId();
    this.getTeam();
  }

  initializeForm(){
    this.inactiveReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      month: [''],
      dateRange: [null]
    });
  }
  onEmployeeChange(event: any) {
    const selected = JSON.parse(event.target.value);
    this.selectedEmployeeId = selected.fusionEmployeeId;
    this.isFilterGiveninactive = true;
  }

  canGenerateOrExport(): boolean {
    return !!(
      this.selectedEmployeeId ||
      this.selectedWfhManager ||
      this.selectedDateRange
    );
  }

  selectInactiveManager(manager: { id: string; name: string }): void {
    this.isFilterGiveninactive = true;
    console.log('selectManager method has been called with manager:', manager);
    console.log('selectManager called with:', manager); // Add this line
    this.selectedWfhManager = manager.name;
    console.log('Selected Leave Manager:', this.selectedWfhManager);
    this.closeWfhDropdown(); // Close dropdown after selection
  }
  closeWfhDropdown(): void {
    this.isDropdownOpenwfh = false;
  }

  onMonthChangeInactive(event: Event): void {
    this.isFilterGiveninactive = true;
    this.selectedMonth =(event.target as HTMLSelectElement).value;
    console.log('Selected Date:', this.selectedMonth);
  }

  getEmployeeId() {
    const loggedInUser = this.authService.getToken();
    this.subscription = this.http

      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          // this.employeeiddetails = data as IemployeeDetails[];

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
          this.employeeiddetails = employeedata.filter((element: any) => {
            return element.employeeId != loggedInUser.employeeId;
          });
          // this.employeeiddetailsauthorityName = data as IemployeeDetails[];
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
  getInactiveEmployeeReports() {
    this.isLoading = true;
    const request: IWfhReportRequest = {
      // FusionEmpId: this.selectedEmployeeId,
      // TeamManagerName: this.selectedWfhManager,
      // StartDate: this.wfhDateRange?.startDate,
      // EndDate: this.wfhDateRange?.endDate,
      // Worked_Month: this.selectedMonth
    };
    this.subscription = this.reportsService.getInactiveReports(request).subscribe({
      next: (res: any) => {
        if (res) {
          this.employeeMasterData = res;
          // this.maxPageNumber = res.maxPageNumber;
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {},
    });
  }

  generateInactiveReport(): void {
    const noFilterProvided =
      !this.selectedEmployeeId &&
      this.searchTerm !== 'All Employees' &&
      !this.selectedDate &&
      (!this.selectedDateRange ||
        (!this.selectedDateRange.startDate &&
          !this.selectedDateRange.endDate)) &&
      !this.selectedMonth &&
      !this.selectedWfhManager;

    if (noFilterProvided) {
      const modalElement = document.getElementById('entitled');
      if (modalElement) {
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
      }
      return;
    }
    const params = new URLSearchParams();

    if (this.selectedEmployeeId !== null) {
      params.append('FusionEmpId', this.selectedEmployeeId.toString());
    }

    if (
      this.selectedDateRange &&
      this.selectedDateRange.startDate &&
      this.selectedDateRange.endDate
    ) {
      const startDate = this.parseDate(this.selectedDateRange.startDate);
      const endDate = this.parseDate(this.selectedDateRange.endDate);
      params.append('StartDate', this.formatDate(startDate));
      params.append('EndDate', this.formatDate(endDate));
    }

    if (this.selectedMonth !== null) {
      params.append('Worked_Month', this.selectedMonth.toString());
    }

    if (this.selectedWfhManager) {
      params.append('TeamManagerName', this.selectedWfhManager);
    }

    const endpoint = params.toString()
      ? `Reports/Inactive_Employee_Reports?${params.toString()}`
      : 'Reports/Inactive_Employee_Reports';
    console.log('Fetching data from endpoint:', endpoint);

    this.http.getData(endpoint).subscribe({
      next: (data: any) => {
        this.filteredInactiveRecord = data;
        if (data.length === 0) {
          // Check if the data is empty
          const modalElement = document.getElementById('entitled');
          if (modalElement) {
            modalElement.classList.add('show');
            modalElement.style.display = 'block';
          }
        } else {
          this.filteredInactiveRecord = data;
          console.log(
            'Fetched inactive employee Record for selected parameters:',
            this.filteredInactiveRecord
          );
        }
      },
      error: (error: any) => {
        console.error(
          'Error fetching Inactive employee records for selected parameters',
          error
        );
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

  selectInactiveEmployee(employee: any, event: Event) {
    this.isFilterGiveninactive = true;
    event.stopPropagation();
    if (!employee) {
      this.selectedEmployeeId = null;
      this.searchTerm = 'All Employees';
    } else {
      this.selectedEmployeeId = employee.fusionEmpId;
      this.searchTerm = `${employee.fusionEmpId} - ${employee.employeeName}`;
    }

    this.filteredInactiveRecord = [];
    this.isDropdownOpen = false;

    console.log('Selected Employee:', this.searchTerm);
  }

  getFullName(manager: any): string {
    return `${manager.firstName} ${
      manager.middleName ? manager.middleName + ' ' : ''
    }${manager.lastName}`;
  }
  exportToExcelInactive(): void {
    // Define header mappings
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      appliedDate: 'APPLIED DATE',
      shift: 'SHIFT',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      leaveType: 'LEAVE TYPE',
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
      'APPLIED DATE',
      'LOCATION',
      'SUB LOCATION',
      'SHIFT',
      'LEAVE TYPE',
      'ENTITLED',
      'AVAILED',
      'BALANCED'
    ];

    // Function to format date in dd-MMM-yyyy format
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const options = { day: '2-digit', month: 'short', year: 'numeric' } as const;
      return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
    };

    // Modify data with renamed headers and new sequence
    const modifiedData = this.filteredInactiveRecord.map(record => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach(columnName => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          let value = record[originalColumnName];
          if (originalColumnName === 'appliedDate' && value) {
            value = formatDate(value); // Format the date
          }
          modifiedRecord[columnName] = value ?? '-'; // Use a default value if the property is missing
        } else {
          modifiedRecord[columnName] = '-'; // Use a default value if the column is not found in the record
        }
      });
      return modifiedRecord;
    });

    // Create a new empty worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]]);

    // Merge cells for Inactive Employees Report row from A1 to K1
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];

    // Add Inactive Employees Report row
    XLSX.utils.sheet_add_aoa(ws, [['INACTIVE EMPLOYEES REPORT']], { origin: 'A1' });

    // Add header row
    const headerRow = NEW_SEQUENCE.map(columnName => HEADER_MAPPINGS[columnName]);
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3' });

    // Apply styles to Inactive Employees Report row
    const absentReportCell = ws['A1'] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
    absentReportCell.s = { font: { bold: true }, alignment: { horizontal: 'center' }, fill: { bgColor: { rgb: 'FFFF00' } } };
    ws['A1'] = absentReportCell; // Assign the styled cell back to the worksheet

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
      // Increase the width for 'EMPLOYEE ID', 'DEPARTMENT', 'ENTITLED', 'AVAILED', and 'BALANCED' columns
      if (['EMPLOYEE ID', 'DEPARTMENT', 'ENTITLED', 'APPLIED DATE', 'BALANCED', 'SUB LOCATION'].includes(columnName)) {
        columnWidth += 5; // Increase width by 5
      }
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'][index] = { wch: columnWidth };
    });

    // Generate Excel file and trigger download
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inactive Employees Report');
    XLSX.writeFile(wb, 'Inactive_Employees_Report.xlsx');
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

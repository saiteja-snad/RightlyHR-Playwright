import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment.dev';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { IWfhReportRequest } from '../../../Interfaces/reports.model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import dayjs, { Dayjs } from 'dayjs';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';
import { AttandaceReportTabsComponent } from '../../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-absent-report',
  imports: [
    CommonModule,
    FormsModule,
    NgxDaterangepickerBootstrapDirective,
    AttandaceReportTabsComponent, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './absent-report.component.html',
  styleUrl: './absent-report.component.scss'
})
export class AbsentReportComponent {
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  uniqueEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  filteredAbsentEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  selectedDate: string | null = null;
  selectedDateRange: { startDate: any; endDate: any } | null = null;
  searchTerm: string = '';
  selectedEmployeeId: any = null;
  isDropdownOpen: boolean = false;
  isFilterGivenAbsent: boolean = false;
  filteredAbsentRecord: any[] = [];
  employeeMasterData: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  isDropdownOpenwfh: boolean = false;
  selectedAbsentManager: string | null = null;
  selectedMonth: number | null = null;
  frequency: string = '';
  absentReportForm!: FormGroup;

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

  isFilterGivenabsent = false;
  selectedAbsentMonth: string | null = null;
  isInvalidDate = () => false;

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
    this.getAbsentReports();
    this.getEmployeeId();
    this.getTeam();
    this.initializeForm();
  }

  initializeForm() {
    this.absentReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      frequency: ['', Validators.required],
      dateRange: [null],
      month: ['']
    });
  }

  onEmployeeChange(event: any) {
    const selected = JSON.parse(event.target.value);
    this.selectedEmployeeId = selected.fusionEmployeeId;
    this.isFilterGivenAbsent = true;
  }

  onFrequencyChange(event: any): void {
    this.frequency = event.target.value;
    // Optional: Reset values on switch
    this.selectedDateRange = null;
    this.selectedAbsentMonth = null;
    this.isFilterGivenabsent = false;
  }

  onMonthChangeAbsent(event: any): void {
    this.isFilterGivenabsent = !!event.target.value;
    console.log('Selected Absent Month:', this.selectedAbsentMonth);
  }

  canGenerateOrExport(): boolean {
    return !!(
      this.selectedEmployeeId ||
      this.selectedAbsentManager ||
      this.selectedDateRange
    );
  }
  onDateRangeChangeabsent(dateRange: any): void {
    if (dateRange && dateRange.startDate && dateRange.endDate) {
      this.isFilterGivenabsent = true;
      console.log('Selected Start Date:', dateRange.startDate.toDate());
      console.log('Selected End Date:', dateRange.endDate.toDate());
    }
  }

  selectAbsentManager(manager: { id: string; name: string }): void {
    this.isFilterGivenAbsent = true;
    console.log('selectManager method has been called with manager:', manager);
    console.log('selectManager called with:', manager); // Add this line
    this.selectedAbsentManager = manager.name;
    console.log('Selected Leave Manager:', this.selectedAbsentManager);
    this.closeWfhDropdown(); // Close dropdown after selection
  }
  closeWfhDropdown(): void {
    this.isDropdownOpenwfh = false;
  }

  getEmployeeId() {
    const loggedInUser = this.authService.getToken();
    this.subscription = this.http

      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          // this.employeeiddetails = data as IemployeeDetails[];

          console.log(this.employeeiddetails);
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
  getAbsentReports() {
    this.isLoading = true;
    const request: IWfhReportRequest = {
      // FusionEmpId: this.selectedEmployeeId,
      // TeamManagerName: this.selectedWfhManager,
      // StartDate: this.wfhDateRange?.startDate,
      // EndDate: this.wfhDateRange?.endDate,
      // Worked_Month: this.selectedMonth
    };
    this.subscription = this.reportsService.getAbsentReports(request).subscribe({
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

  generateAbsentReport(): void {
    const noFilterProvided =
      !this.selectedEmployeeId &&
      this.searchTerm !== 'All Employees' &&
      !this.selectedDate &&
      (!this.selectedDateRange ||
        (!this.selectedDateRange.startDate &&
          !this.selectedDateRange.endDate)) &&
      !this.selectedMonth &&
      !this.selectedAbsentManager;

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

    if (this.selectedAbsentManager) {
      params.append('TeamManagerName', this.selectedAbsentManager);
    }

    const endpoint = params.toString()
      ? `Reports/AbsentReports?${params.toString()}`
      : 'Reports/AbsentReports';
    console.log('Fetching data from endpoint:', endpoint);

    this.http.getData(endpoint).subscribe({
      next: (data: any) => {
        this.filteredAbsentRecord = data;
        if (data.length === 0) {
          // Check if the data is empty
          const modalElement = document.getElementById('entitled');
          if (modalElement) {
            modalElement.classList.add('show');
            modalElement.style.display = 'block';
          }
        } else {
          this.filteredAbsentRecord = data;
          console.log(
            'Fetched Absent Record for selected parameters:',
            this.filteredAbsentRecord
          );
        }
      },
      error: (error: any) => {
        console.error(
          'Error fetching absent records for selected parameters',
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
      this.filteredAbsentEmployees = [...this.uniqueEmployees];
      return;
    }

    this.filteredAbsentEmployees = this.uniqueEmployees.filter(
      (emp) =>
        emp.fusionEmpId.toString().includes(term) ||
        emp.employeeName.toLowerCase().includes(term)
    );
  }

  selectAbsentEmployee(employee: any) {
    this.isFilterGivenabsent = true;

    if (employee === null) {
      this.selectedEmployeeId = null; // Set selectedEmployeeId to null for "All Employees"
      this.searchTerm = 'All Employees';
      this.isDropdownOpen = false;

      console.log('Selected Option: All Employees');

    } else {
      this.selectedEmployeeId = employee.fusionEmpId;
      this.searchTerm = `${employee.fusionEmpId} - ${employee.employeeName}`;
      this.isDropdownOpen = false;

      console.log('Selected Option:', this.searchTerm);
      // Reset filteredAbsentRecord to an empty array
      this.filteredAbsentRecord = [];
    }
  }

  getFullName(manager: any): string {
    return `${manager.firstName} ${
      manager.middleName ? manager.middleName + ' ' : ''
    }${manager.lastName}`;
  }
  exportToExcelAbsent(): void {
    // Define header mappings
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      shift: 'SHIFT',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      leaveType: 'LEAVE TYPE',
      startDate: 'START DATE',
      endDate: 'END DATE',
      days: 'DAYS'
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
      'START DATE',
      'END DATE',
      'DAYS'
    ];

    // Function to format date in dd-MMM-yyyy format
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const options = { day: '2-digit', month: 'short', year: 'numeric' } as const;
      return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
    };

    // Modify data with renamed headers and new sequence
    const modifiedData = this.filteredAbsentRecord.map(record => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach(columnName => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (originalColumnName === 'startDate' || originalColumnName === 'endDate') {
            modifiedRecord[columnName] = formatDate(record[originalColumnName]);
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

    // Merge cells for Absent Report row from A1 to J1
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];

    // Add Absent Report row
    XLSX.utils.sheet_add_aoa(ws, [['ABSENT REPORT']], { origin: 'A1' });

    // Add header row
    const headerRow = NEW_SEQUENCE.map(columnName => HEADER_MAPPINGS[columnName]);
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3' });

    // Apply styles to Absent Report row
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
      // Increase the width for 'EMPLOYEE ID' and 'DEPARTMENT' columns
      if (columnName === 'EMPLOYEE ID' || columnName === 'DEPARTMENT') {
        columnWidth += 5; // Increase width by 5
      }
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'][index] = { wch: columnWidth };
    });

    // Generate Excel file and trigger download
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Absent Report');
    XLSX.writeFile(wb, 'Absent_Report.xlsx');
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

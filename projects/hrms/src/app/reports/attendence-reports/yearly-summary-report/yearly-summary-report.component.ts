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
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-yearly-summary-report',
  imports: [
    CommonModule,
    FormsModule,
    AttandaceReportTabsComponent,DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './yearly-summary-report.component.html',
  styleUrl: './yearly-summary-report.component.scss'
})
export class YearlySummaryReportComponent {
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  uniqueEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  filteredWfhEmployees: { fusionEmpId: number; employeeName: string }[] = [];
  currentYear: number = new Date().getFullYear();
  years: number[] = [this.currentYear - 1, this.currentYear, this.currentYear + 1];
  selectedDate: string | null = null;
  selectedDateRange: { startDate: any; endDate: any } | null = null;
  searchTerm: string = '';
  selectedEmployeeId: any = null;
  isDropdownOpen: boolean = false;
  isFilterGivenyearly: boolean = false;
  filteredYearlyRecord: any[] = [];
  employeeMasterData: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  isDropdownOpenwfh: boolean = false;
  selectedWfhManager: string | null = null;
  selectedMonth: number | null = null;
  showYearlyTable: boolean = false;
  selectedYear: string | null = null;
  selectedLeave: string | null = null;
  uniqueLeaveCategory: { leaveType: string }[] = [];
  yearlyReportForm! : FormGroup;
  uniqueYearlyManagers: { id: string, name: string }[] = [];
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

  getParsedEmployee(event: Event): any {
    const target = event.target as HTMLSelectElement;
    return JSON.parse(target.value);
  }

  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.getYearlyReports();
    this.getEmployeeId();
    this.getTeam();
  }

  initializeForm() {
    this.yearlyReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      leaveCategory: [''],
      year: ['']
    });
  }


  onEmployeeChange(event: any) {
    const selected = JSON.parse(event.target.value);
    this.selectedEmployeeId = selected.fusionEmployeeId;
    this.isFilterGivenyearly = true;
  }

  canGenerateOrExport(): boolean {
    return !!(
      this.selectedEmployeeId ||
      this.selectedWfhManager ||
      this.selectedDateRange
    );
  }

  selectYearlyManager(manager: { id: string; name: string }): void {
    this.isFilterGivenyearly = true;
    console.log('selectManager method has been called with manager:', manager);
    console.log('selectManager called with:', manager); // Add this line
    this.selectedWfhManager = manager.name;
    console.log('Selected Leave Manager:', this.selectedWfhManager);
    this.closeYearlyDropdown(); // Close dropdown after selection
  }
  closeYearlyDropdown(): void {
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
  getYearlyReports() {
    this.isLoading = true;
    const request: IWfhReportRequest = {
      // FusionEmpId: this.selectedEmployeeId,
      // TeamManagerName: this.selectedWfhManager,
      // StartDate: this.wfhDateRange?.startDate,
      // EndDate: this.wfhDateRange?.endDate,
      // Worked_Month: this.selectedMonth
    };
    this.subscription = this.reportsService.getYearlyReports(request).subscribe({
      next: (res: any) => {
        if (res) {
          this.employeeMasterData = res;
          this.extractUniqueYearlyFilters(res);
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => {},
    });
  }


  extractUniqueYearlyFilters(data: any[]): void {
    // Unique Employees
    const employeeMap = new Map<number, boolean>();
    this.uniqueEmployees = data
      .filter(record => {
        if (!employeeMap.has(record.fusionEmpId)) {
          employeeMap.set(record.fusionEmpId, true);
          return true;
        }
        return false;
      })
      .map(record => ({
        fusionEmpId: record.fusionEmpId,
        employeeName: record.employeeName
      }));
    this.employeeiddetails = [...this.uniqueEmployees];
  
    // Unique Managers
    const managerSet = new Set<string>();
    this.teamdetails = data
      .filter(record => {
        if (record.teamManagerName && !managerSet.has(record.teamManagerName)) {
          managerSet.add(record.teamManagerName);
          return true;
        }
        return false;
      })
      .map(record => ({
        id: record.teamManagerEmpID,
        name: record.teamManagerName
      }));
    this.teamdetails = [...this.uniqueYearlyManagers];
  
    // Unique Leave Categories
    const categorySet = new Set<string>();
    this.uniqueLeaveCategory = data
      .filter(record => {
        if (record.leaveType && !categorySet.has(record.leaveType)) {
          categorySet.add(record.leaveType);
          return true;
        }
        return false;
      })
      .map(record => record.leaveType);
  }

  onYearChange(event: Event): void {
    this.isFilterGivenyearly = true;
    this.selectedYear = (event.target as HTMLSelectElement).value;
    console.log('Selected Year:', this.selectedYear);
  }

  onLeaveChangeYearly(event: Event): void {
    this.isFilterGivenyearly = true;
    this.selectedLeave = (event.target as HTMLSelectElement).value;
    console.log('Selected Leave Category:', this.selectedLeave);
  }

  generateYearlyReport(): void {
    // Check if any filter is selected or "All Employees" is selected

    if ((this.selectedEmployeeId === null || this.selectedEmployeeId === '') &&
      (this.searchTerm === null || this.searchTerm === '') &&
      (this.selectedYear === null || this.selectedYear === '') && (this.selectedLeave === null || this.selectedLeave === '') &&
      (this.selectedWfhManager === null || this.selectedWfhManager === '')) {
      // Show the popup


      // const modalElement = document.getElementById('entitled');
      // if (modalElement) {
      //   modalElement.classList.add('show');
      //   modalElement.style.display = 'block';
      //   this.StatusMsg = 'Please provide at least one input filter before generating the report';
      // }
      return;
    }
    const params = new URLSearchParams();

    if (this.selectedEmployeeId !== null) {
      params.append('FusionEmpId', this.selectedEmployeeId.toString());
    }

    if (this.selectedYear !== null) {
      params.append('Year', this.selectedYear.toString());
    }

    if (this.selectedWfhManager) {
      params.append('TeamManagerName', this.selectedWfhManager);
    }

    if (this.selectedLeave !== null) {
      params.append('LeaveName', this.selectedLeave.toString());
    }

    const endpoint = params.toString() ? `Reports/YearSummaryReports?${params.toString()}` : 'Reports/YearSummaryReports';
    console.log('Fetching data from endpoint:', endpoint);

    this.http.getData(endpoint).subscribe({
      next: (data: any) => {
        this.filteredYearlyRecord = data;
        this.showYearlyTable = true;
        if (data.length === 0) { // Check if the data is empty
          // const modalElement = document.getElementById('entitled');
          // if (modalElement) {
          //   modalElement.classList.add('show');
          //   modalElement.style.display = 'block';
          //   this.StatusMsg = 'No data available for the selected filters'
          // }
        } else {
          this.filteredYearlyRecord = data;
          console.log('Fetched Yearly Record for selected parameters:', this.filteredYearlyRecord);
        }
      },
      error: (error: any) => {
        console.error('Error fetching Yearly records for selected parameters', error);
      }
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

  selectYearlyEmployee(employee: any, event: Event) {
    this.isFilterGivenyearly = true;
    event.stopPropagation();

    if (!employee) {
      this.selectedEmployeeId = null;
      this.searchTerm = 'All Employees';
    } else {
      this.selectedEmployeeId = employee.fusionEmpId;
      this.searchTerm = `${employee.fusionEmpId} - ${employee.employeeName}`;
    }

    this.filteredYearlyRecord = [];
    this.isDropdownOpen = false;

    console.log('Selected Employee:', this.searchTerm);
  }

  getFullName(manager: any): string {
    return `${manager.firstName} ${
      manager.middleName ? manager.middleName + ' ' : ''
    }${manager.lastName}`;
  }
  exportToExcelYearly(): void {
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

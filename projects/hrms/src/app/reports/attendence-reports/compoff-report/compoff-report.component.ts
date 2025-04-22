import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { NgxDaterangepickerBootstrapDirective } from "ngx-daterangepicker-bootstrap";
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { IemployeeDetails } from '../../../Interfaces/job-model';
import { ReportsService } from '../../../services/reports/reports.service';
import { ICompoffDetails } from '../../../Interfaces/reports.model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { AttandaceReportTabsComponent } from "../../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component";
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-compoff-report',
  imports: [NgxDaterangepickerBootstrapDirective, FormsModule, DateformatPipe, AttandaceReportTabsComponent],
  templateUrl: './compoff-report.component.html',
  styleUrl: './compoff-report.component.scss'
})
export class CompoffReportComponent implements OnInit, OnDestroy {
  @ViewChild('compoffdropdown') compoffDropdown!: ElementRef;
  @ViewChild('dropdown') dropdown!: ElementRef;
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  subscription!: Subscription
  loggedInUser = {} as IemployeeDetails
  isLoading: boolean = false;
  selectedLeaveEmployeeId: any;
  //selectedLeaveManager: string | undefined = undefined;
  selectedDateRange: any;
  selectedJobLocation: string | undefined = undefined;
  selectedMonth: any;
  selectedLeave: any;
  selectedLeaveManager: any;
  filteredLeaveEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  uniqueLeaveEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  uniqueLeaveCategory: { leaveType: string }[] = [];
  uniqueYearCategory: { leaveType: string }[] = [];
  filteredLeaveRecord: any[] = [];
  filteredLeaveManagers: { id: string, name: string }[] = [];
  uniqueLeaveManagers: { id: string, name: string }[] = [];
  employeeMasterData = [] as any[];
  selectedEmployeeId: string | null = null;
  isCompOffTabActive: boolean = false;
  searchTerm: string = '';
  isDropdownOpencompoff: boolean = false;
  isDropdownOpen: boolean = false;
  compoffRecord: any;
  uniqueEmployees: { fusionEmpId: number, employeeName: string }[] = [];
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

  // months = [
  //   { value: 1, name: 'January' },
  //   { value: 2, name: 'February' },
  //   { value: 3, name: 'March' },
  //   { value: 4, name: 'April' },
  //   { value: 5, name: 'May' },
  //   { value: 6, name: 'June' },
  //   { value: 7, name: 'July' },
  //   { value: 8, name: 'August' },
  //   { value: 9, name: 'September' },
  //   { value: 10, name: 'October' },
  //   { value: 11, name: 'November' },
  //   { value: 12, name: 'December' }
  // ];
  localeOptions: any = {
    applyLabel: 'ok',
    format: environment.dateformat.toUpperCase(),
    direction: 'ltr',
    clearLabel: 'Clear', // could be rtl
  };
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.compoffDropdown && !this.compoffDropdown.nativeElement.contains(event.target)) {
      this.isDropdownOpencompoff = false;
      this.cdr.detectChanges();
    }

  }
  //constructor
  constructor(private authService: AuthService, private reportsService: ReportsService, private renderer: Renderer2, private cdr: ChangeDetectorRef) { }


  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.activateLeaveTab();
    this.getcompOffReports()
  }

  //method to get All the reports
  activateLeaveTab(): void {
    this.isCompOffTabActive = true;
  }

  filteredCompOffEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  filteredCompOffRecord: any[] = [];
  showCompOffTable: boolean = false;
  selectedCompoffManager: string = '';
  filteredCompoffManagers: { id: string, name: string }[] = [];
  uniqueCompoffManagers: { id: string, name: string }[] = [];
//search employee
  CompOfftoggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('Toggling dropdown. New state:', this.isDropdownOpen);
    if (this.isDropdownOpen) {
      this.renderer.addClass(this.dropdown.nativeElement, 'show');
    } else {
      this.renderer.removeClass(this.dropdown.nativeElement, 'show');
      this.searchTerm = ''; // Clear search term when closing dropdown
      this.CompOfffilterEmployees();
    }
  }

  CompOfffilterEmployees() {
    console.log('Typed text:', this.searchTerm);
    if (this.searchTerm.trim() === '') {
      this.filteredCompOffEmployees = [...this.uniqueEmployees];
    } else {
      const searchTermLowerCase = this.searchTerm.toLowerCase();
      this.filteredCompOffEmployees = this.uniqueEmployees.filter(employee =>
        employee.fusionEmpId.toString().toLowerCase().includes(searchTermLowerCase) ||
        employee.employeeName.toLowerCase().includes(searchTermLowerCase)
      );
    }
    console.log('Filtered employees:', this.filteredCompOffEmployees);
  }
  // onMonthChangeCompOff(event: Event): void {
  //   this.selectedMonth = (event.target as HTMLSelectElement).value;
  //   console.log('Selected Date:', this.selectedMonth);
  // }
  selectCompOffEmployee(employee: any, event: Event) {
    event.stopPropagation(); // Stop the click event from bubbling up

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
      // Reset filteredCompOffRecord to an empty array
      this.filteredCompOffRecord = [];
    }
  }
//select team manager
  filterCompoffManagers(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    console.log('Search Term:', searchTerm);

    // Create a new array by filtering the uniqueCompoffManagers
    this.filteredCompoffManagers = [...this.uniqueCompoffManagers.filter(manager =>
      manager.name.toLowerCase().includes(searchTerm) || manager.id.toLowerCase().includes(searchTerm)
    )];

    console.log('Filtered Managers:', this.filteredCompoffManagers);
  }

  toggleCompoffManagerDropdown(): void {
    this.isDropdownOpencompoff = !this.isDropdownOpencompoff; // Toggle dropdown visibility
    console.log('Dropdown clicked. Current state:', this.isDropdownOpencompoff ? 'Open' : 'Closed');
    if (this.isDropdownOpencompoff) {
      // Log the current state of filteredCompoffManagers
      console.log('Team Managers in dropdown:', this.filteredCompoffManagers);
    }
  }



  selectCompoffManager(manager: { id: string, name: string }): void {
    console.log('selectManager method has been called with manager:', manager);
    console.log('selectManager called with:', manager); // Add this line
    this.selectedCompoffManager = manager.name;
    console.log('Selected Leave Manager:', this.selectedCompoffManager);
    this.closecompoffDropdown(); // Close dropdown after selection
  }
  closecompoffDropdown(): void {
    this.isDropdownOpencompoff = false;
  }
  //comoff data get
  getcompOffReports() {
    // Check if any filter is selected or "All Employees" is selected
    if ((this.selectedEmployeeId === null || this.selectedEmployeeId === '') &&
      (this.searchTerm === null || this.searchTerm === '') &&
      (this.selectedDateRange === undefined || (this.selectedDateRange.startDate === null && this.selectedDateRange.endDate === null)) &&
      (this.selectedMonth === null || this.selectedMonth === '') &&
      (this.selectedCompoffManager === null || this.selectedCompoffManager === '')) {

      const modalElement = document.getElementById('entitled');
      if (modalElement) {
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        // this.StatusMsg = 'Please provide at least one input filter before generating the report';
      }
      return;
    }

    this.isLoading = true;
    const request: ICompoffDetails = {
      selectedEmployeeId: this.selectedEmployeeId,
      selectedDateRange: this.empMasterDataDOJDateRange ? this.empMasterDataDOJDateRange : undefined,
      selectedMonth: this.selectedMonth,
      selectedCompoffManager: this.selectedCompoffManager
    };
    this.subscription = this.reportsService.getcompOffReports(request).subscribe({
      next: (res: any) => {
        if (res) {
          this.employeeMasterData = res;
          this.filteredCompOffRecord = res;
          console.log('Fetched CompOff Record for selected parameters:', this.filteredCompOffRecord);
          // this.maxPageNumber = res.maxPageNumber;
          this.isLoading = false;
          this.compoffRecord = res;
          console.log(this.compoffRecord);

          // Extract unique employee IDs and names directly
          const employeeMap = new Map<number, boolean>();
          this.uniqueEmployees = res.filter((record: { fusionEmpId: number; }) => {
            if (!employeeMap.has(record.fusionEmpId)) {
              employeeMap.set(record.fusionEmpId, true);
              return true;
            }
            return false;
          }).map((record: { fusionEmpId: any; employeeName: any; }) => ({
            fusionEmpId: record.fusionEmpId,
            employeeName: record.employeeName
          }));

          this.filteredCompOffEmployees = this.uniqueEmployees; // Initialize filteredEmployees
          console.log('Unique Employees:', this.uniqueEmployees);

          // Extract unique team managers and filter out null values
          const managerSet = new Set<string>();
          this.uniqueCompoffManagers = res.filter((record: { teamManagerName: string | null; teamManagerEmpID: string | null; }) => {
            if (record.teamManagerName && !managerSet.has(record.teamManagerName)) {
              managerSet.add(record.teamManagerName);
              return true;
            }
            return false;
          }).map((record: { teamManagerName: string; teamManagerEmpID: string; }) => ({
            id: record.teamManagerEmpID,
            name: record.teamManagerName
          }));

          this.filteredCompoffManagers = [...this.uniqueCompoffManagers];
          console.log('Unique Managers:', this.uniqueCompoffManagers);
          // },
          // error: (error: any) => {
          //   console.error('Error fetching CompOff records', error);
          // }
        }
      },
      error: (err: any) => {
        console.log(err);
      },
      complete: () => { },
    });
  }

  //export data

  getColumnWidth(data: any[], columnName: string): number {
    // Find the maximum width of data in the column
    const maxWidth = data.reduce((max: number, record: any) => {
      const value = record[columnName]?.toString().length || 0;
      return value > max ? value : max;
    }, 0);

    // Set minimum width to 10
    return Math.max(10, maxWidth);
  }
  exportToExcelCompOff(): void {
    // Define header mappings
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      shift: 'SHIFT',
      worked_Date: 'WORKED DATE',
      entitlementDays: 'ENTITLEMENT DAYS',
      duration: 'DURATION'

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
      'WORKED DATE',
      'ENTITLEMENT DAYS',
      'DURATION'

    ];

    // Modify data with renamed headers and new sequence
    const modifiedData = this.filteredCompOffRecord.map(record => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach(columnName => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (record[originalColumnName] === null) {
            modifiedRecord[columnName] = '-';
          } else if (originalColumnName === 'utilizationDate' || originalColumnName === 'worked_Date') {
            const date = new Date(record[originalColumnName]);
            modifiedRecord[columnName] = `${date.getDate()}-${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;
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

    // Merge cells for CompOff Report row from A1 to K1
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];

    // Add CompOff Report row
    XLSX.utils.sheet_add_aoa(ws, [['COMPOFF REPORT']], { origin: 'A1' });

    // Add header row
    const headerRow = NEW_SEQUENCE.map(columnName => HEADER_MAPPINGS[columnName]);
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3' });

    // Apply styles to CompOff Report row
    const compOffReportCell = ws['A1'] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
    compOffReportCell.s = { font: { bold: true }, alignment: { horizontal: 'center' }, fill: { bgColor: { rgb: 'FFFF00' } } };
    ws['A1'] = compOffReportCell; // Assign the styled cell back to the worksheet

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
      // Increase the width for 'EMPLOYEE ID', 'DEPARTMENT', and 'ENTITLEMENT DAYS' columns
      if (columnName === 'EMPLOYEE ID' || columnName === 'DEPARTMENT' || columnName === 'ENTITLEMENT DAYS' || columnName === 'WORKED DATE') {
        columnWidth += 7; // Increase width by 7
      }
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'][index] = { wch: columnWidth };
    });

    // Generate Excel file and trigger download
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CompOff Report');
    XLSX.writeFile(wb, 'CompOff_Report.xlsx');
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}

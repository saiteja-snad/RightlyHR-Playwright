import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { NgxDaterangepickerBootstrapDirective } from "ngx-daterangepicker-bootstrap";
import { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { environment } from '../../../../environments/environment';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { IemployeeDetails } from '../../../Interfaces/job-model';
import { ReportsService } from '../../../services/reports/reports.service';
import { IAttendanceDetails, IStandardReportRequest } from '../../../Interfaces/reports.model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { AttandaceReportTabsComponent } from '../../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component';
import { HttpService } from '../../../services/http.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-leave-report',
  imports: [NgxDaterangepickerBootstrapDirective, FormsModule, DateformatPipe, AttandaceReportTabsComponent],
  templateUrl: './leave-report.component.html',
  styleUrl: './leave-report.component.scss'
})
export class LeaveReportComponent implements OnInit, OnDestroy {
  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('compoffdropdown') compoffDropdown!: ElementRef;
  @ViewChild('leaveDropdown') leaveDropdown!: ElementRef;
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  subscription!: Subscription
  loggedInUser = {} as IemployeeDetails
  isLoading: boolean = false;
  //attendance module
  searchTerm: string = '';
  selectedLeaveEmployeeId: any;
  selectedDateRange: any;
  selectedJobLocation: string | undefined = undefined;
  selectedMonth: any;
  selectedLeave: any;
  filteredLeaveEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  uniqueLeaveEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  uniqueLeaveCategory: { leaveType: string }[] = [];
  uniqueYearCategory: { leaveType: string }[] = [];
  filteredLeaveRecord: any[] = [];
  filteredLeaveManagers: { id: string, name: string }[] = [];
  uniqueLeaveManagers: { id: string, name: string }[] = [];
  showLeaveTable: boolean = false;
  isDropdownOpen = false;
  leaverecord: any;
  selectedLeaveManager: any;
  isLeaveTabActive: boolean = false;
  uniqueManagers: { teamManagerName: string }[] = [];
  uniqueEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  selectedEmployeeId: string | null = null;
  isDropdownOpenleave: boolean = false;
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


  //contructor
  constructor(private authService: AuthService, private http: HttpService, private reportsService: ReportsService, private renderer: Renderer2, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loggedInUser = this.authService.getToken();
    this.activateLeaveTab();
    this.getAttendanceReports();

  }

  activateLeaveTab(): void {
    this.isLeaveTabActive = true;
  }

  onEmployeeChangeLeave(event: Event) {
    this.selectedEmployeeId = (event.target as HTMLSelectElement).value;
    if (this.selectedEmployeeId) {
      // this.getLeaveReport();
    }
  }
  //method to get All the reports
  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if (this.leaveDropdown && !this.leaveDropdown.nativeElement.contains(event.target)) {
      this.isDropdownOpenleave = false;
      this.cdr.detectChanges();
    }

  }

  //search employee id
  LeavetoggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('Toggling dropdown. New state:', this.isDropdownOpen);
    if (this.isDropdownOpen) {
      this.renderer.addClass(this.dropdown.nativeElement, 'show');
    } else {
      this.renderer.removeClass(this.dropdown.nativeElement, 'show');
      this.searchTerm = ''; // Clear search term when closing dropdown
      this.LeavefilterEmployees();
    }
  }
  LeavefilterEmployees() {
    console.log('Typed text:', this.searchTerm);
    if (this.searchTerm.trim() === '') {
      this.filteredLeaveEmployees = [...this.uniqueLeaveEmployees];
    } else {
      const searchTermLowerCase = this.searchTerm.toLowerCase();
      this.filteredLeaveEmployees = this.uniqueLeaveEmployees.filter(employee =>
        employee.fusionEmpId.toString().toLowerCase().includes(searchTermLowerCase) ||
        employee.employeeName.toLowerCase().includes(searchTermLowerCase)
      );
    }
    console.log('Filtered employees:', this.filteredLeaveEmployees);
  }

  selectLeaveEmployee(employee: any, event: Event) {
    event.stopPropagation(); // Stop the click event from bubbling up

    if (employee === null) {
      this.selectedLeaveEmployeeId = null; // Set selectedEmployeeId to null for "All Employees"
      this.searchTerm = 'All Employees';
      this.isDropdownOpen = false;

      console.log('Selected Option: All Employees');

    } else {
      this.selectedLeaveEmployeeId = employee.fusionEmpId;
      this.searchTerm = `${employee.fusionEmpId} - ${employee.employeeName}`;
      this.isDropdownOpen = false;

      console.log('Selected Option:', this.searchTerm);
      // Reset filteredLeaveRecord to an empty array
      this.filteredLeaveRecord = [];
    }

  }
//select leave categeory
onLeaveChangeLeave(event: Event): void {
  this.selectedLeave = (event.target as HTMLSelectElement).value;
  console.log('Selected Leave Category:', this.selectedLeave);
}
// search team
filterleaveManagers(event: Event): void {
  const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
  console.log('Search Term:', searchTerm);
  this.filteredLeaveManagers = [...this.uniqueLeaveManagers.filter(manager =>
    manager.name.toLowerCase().includes(searchTerm) || manager.id.toLowerCase().includes(searchTerm)
  )];
  console.log('Filtered Managers:', this.filteredLeaveManagers);
}

toggleLeaveManagerDropdown(): void {
  this.isDropdownOpenleave = !this.isDropdownOpenleave; 
  console.log('Dropdown clicked. Current state:', this.isDropdownOpenleave ? 'Open' : 'Closed');
  if (this.isDropdownOpenleave) {
    console.log('Team Managers in dropdown:', this.filteredLeaveManagers);
  }
}

selectLeaveManager(manager: { id: string, name: string }): void {
  console.log('selectManager method has been called with manager:', manager);
  console.log('selectManager called with:', manager); // Add this line
  this.selectedLeaveManager = manager.name;
  console.log('Selected Leave Manager:', this.selectedLeaveManager);
  this.closeDropdown(); // Close dropdown after selection
}

closeDropdown(): void {
  this.isDropdownOpenleave = false;
}

//get leave data
  getAttendanceReports() {
    if ((this.selectedEmployeeId === null || this.selectedEmployeeId === '') &&
      (this.searchTerm === null || this.searchTerm === '') &&
      (this.selectedLeave === null || this.selectedLeave === '') &&
      (this.selectedDateRange === undefined || (this.selectedDateRange.startDate === null && this.selectedDateRange.endDate === null)) &&
      (this.selectedMonth === null || this.selectedMonth === '') &&
      (this.selectedLeaveManager === null || this.selectedLeaveManager === '')) {
      const modalElement = document.getElementById('entitled');
      if (modalElement) {
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        // this.StatusMsg = 'Please provide at least one input filter before generating the report';
      }
      return;
    }
    this.isLoading = true;
    const request: IAttendanceDetails = {
      selectedLeaveEmployeeId: this.selectedLeaveEmployeeId,
      selectedDateRange: this.empMasterDataDOJDateRange ? this.empMasterDataDOJDateRange : undefined,
      selectedMonth: this.selectedMonth,
      selectedLeave: this.selectedLeave,
      selectedLeaveManager: this.selectedLeaveManager

    };
    this.subscription = this.reportsService.getAttendanceReports(request).subscribe({
      next: (data: any) => {
        this.leaverecord = data;
        console.log(this.leaverecord);

        // Extract unique employee IDs and names directly
        const employeeMap = new Map<number, boolean>();
        this.uniqueLeaveEmployees = data.filter((record: { fusionEmpId: number; }) => {
          if (!employeeMap.has(record.fusionEmpId)) {
            employeeMap.set(record.fusionEmpId, true);
            return true;
          }
          return false;
        }).map((record: { fusionEmpId: any; employeeName: any; }) => ({
          fusionEmpId: record.fusionEmpId,
          employeeName: record.employeeName
        }));

        this.filteredLeaveEmployees = this.uniqueLeaveEmployees;
        console.log('Unique Employees:', this.uniqueLeaveEmployees);

        // Extract unique team managers and filter out null values
        const managerSet = new Set<string>();
        this.uniqueLeaveManagers = data.filter((record: { teamManagerName: string | null; teamManagerEmpID: string | null; }) => {
          if (record.teamManagerName && !managerSet.has(record.teamManagerName)) {
            managerSet.add(record.teamManagerName);
            return true;
          }
          return false;
        }).map((record: { teamManagerName: string; teamManagerEmpID: string; }) => ({
          id: record.teamManagerEmpID,
          name: record.teamManagerName
        }));

        // Initialize filteredLeaveManagers with the full list of managers
        this.filteredLeaveManagers = [...this.uniqueLeaveManagers];

        console.log('Unique Managers:', this.uniqueLeaveManagers);

        const categorySet = new Set<string>();
        this.uniqueLeaveCategory = data.filter((record: { leaveType: string | null; }) => {
          if (record.leaveType && !categorySet.has(record.leaveType)) {
            categorySet.add(record.leaveType);
            return true;
          }
          return false;
        }).map((record: { leaveType: string; }) => record.leaveType);
        console.log('Unique Leave Category:', this.uniqueLeaveCategory);
        this.filteredLeaveRecord = data;
        // this.employeeMasterData = data.standardReports;
        console.log('Fetched Inactive Record for selected parameters:', this.filteredLeaveRecord);
        this.showLeaveTable = true;
        if (data.length === 0) { // Check if the data is empty
          const modalElement = document.getElementById('entitled');
          if (modalElement) {
            modalElement.classList.add('show');
            modalElement.style.display = 'block';
            // this.StatusMsg = 'No data available for the selected filters'
          }
        } else {
          this.filteredLeaveRecord = data;
          console.log('Fetched Leave Record for selected parameters:', this.filteredLeaveRecord);
        }
      },
      error: (error: any) => {
        console.error('Error fetching leave records for selected parameters', error);
      }
    });
  }
 
 
  //export leave data
  getColumnWidth(data: any[], columnName: string): number {
    // Find the maximum width of data in the column
    const maxWidth = data.reduce((max: number, record: any) => {
      const value = record[columnName]?.toString().length || 0;
      return value > max ? value : max;
    }, 0);

    // Set minimum width to 10
    return Math.max(10, maxWidth);
  }

  exportToExcelLeave(): void {
    // Define header mappings
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      shift: 'SHIFT',
      leaveType: 'LEAVE TYPE',
      startdate: 'LEAVE START DATE',
      enddate: 'LEAVE END DATE',
      days: 'DAYS',
      availed: 'AVAILED',
      appliedDate: 'APPLIED DATE',
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
      'LEAVE START DATE',
      'LEAVE END DATE',
      'DAYS',
      'AVAILED',
      'APPLIED DATE',
    ];

    // Modify data with renamed headers and new sequence

    const modifiedData = this.filteredLeaveRecord.map(record => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach(columnName => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (['startdate', 'enddate', 'appliedDate'].includes(originalColumnName) && record[originalColumnName]) {
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
    XLSX.utils.sheet_add_aoa(ws, [['LEAVE REPORT']], { origin: 'A1' });

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
      if (columnName === 'EMPLOYEE ID' || columnName === 'DEPARTMENT' || columnName === 'SUB LOCATION' ||
        columnName === 'LEAVE START DATE' || columnName === 'LEAVE END DATE') {
        columnWidth += 5; // Increase width by 5
      }
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'][index] = { wch: columnWidth };
    });

    // Generate Excel file and trigger download
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Report');
    XLSX.writeFile(wb, 'Leave_Report.xlsx');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}

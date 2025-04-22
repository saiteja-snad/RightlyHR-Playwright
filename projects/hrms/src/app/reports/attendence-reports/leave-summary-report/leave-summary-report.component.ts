import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit, Renderer2,ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { IemployeeDetails } from '../../../Interfaces/job-model';
import { ReportsService } from '../../../services/reports/reports.service';
import {ILeavesummery} from '../../../Interfaces/reports.model';
import { AttandaceReportTabsComponent } from "../../../shared/reports-tabs/attandace-report-tabs/attandace-report-tabs.component";
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-leave-summary-report',
  imports: [FormsModule, AttandaceReportTabsComponent],
  templateUrl: './leave-summary-report.component.html',
  styleUrl: './leave-summary-report.component.scss'
})
export class LeaveSummaryReportComponent {
  loggedInUser = {} as IemployeeDetails
  @ViewChild('dropdown') dropdown!: ElementRef;
  @ViewChild('leavesummarydropdown') leavesummaryDropdown!: ElementRef;
  filteredLeaveSummaryEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  uniqueLeaveSummaryEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  uniqueLeaveSummaryCategory: { leaveType: string }[] = [];
  filteredLeaveSummaryRecord: any[] = [];
  showLeaveSummaryTable: boolean = false;
  filteredLeaveSummaryManagers: { id: string, name: string }[] = [];
  uniqueLeaveSummaryManagers: { id: string, name: string }[] = [];
  selectedLeaveSummaryManager: string = '';
  isDropdownOpen: boolean = false;
  searchTerm: string = '';
  uniqueManagers: { teamManagerName: string }[] = [];
  uniqueEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  selectedEmployeeId: string | null = null;
  selectedLeaveEmployeeId: string | null = null;
  filteredLeaveEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  isDropdownOpenleavesummary: boolean = false;
  selectedLeave:any;
  subscription!: Subscription
  uniqueLeaveEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  uniqueLeaveCategory: { leaveType: string }[] = [];
  uniqueYearCategory: { leaveType: string }[] = [];
  leaverecord: any;
  leavesummaryrecord: any;
  isLeaveSummaryTabActive: boolean = false;

// consturctor
  constructor( private authService: AuthService, private reportsService: ReportsService,private renderer: Renderer2, private cdr: ChangeDetectorRef
  ) { }

  @HostListener('document:click', ['$event'])
   clickout(event: Event) {
    if (this.leavesummaryDropdown && !this.leavesummaryDropdown.nativeElement.contains(event.target)) {
      this.isDropdownOpenleavesummary = false;
      this.cdr.detectChanges();
    }
  }

  ngOnInit(): void {
     this.loggedInUser = this.authService.getToken();
     this.activateLeaveTab();
    this.getLeaveSummaryReport();
  }
  activateLeaveTab(): void {
    this.isLeaveSummaryTabActive = true;
  }

  // it is calling for employee id
  LeaveSummarytoggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('Toggling dropdown. New state:', this.isDropdownOpen);
    if (this.isDropdownOpen) {
      this.renderer.addClass(this.dropdown.nativeElement, 'show');
    } else {
      this.renderer.removeClass(this.dropdown.nativeElement, 'show');
      this.searchTerm = ''; // Clear search term when closing dropdown
      this.LeaveSummaryfilterEmployees();
    }
  }

  LeaveSummaryfilterEmployees() {
    console.log('Typed text:', this.searchTerm);
     if (this.searchTerm.trim() === '') {
      this.filteredLeaveSummaryEmployees = [...this.uniqueEmployees];
     } else {
      const searchTermLowerCase = this.searchTerm.toLowerCase();
      this.filteredLeaveSummaryEmployees = this.uniqueEmployees.filter(employee =>
        employee.fusionEmpId.toString().toLowerCase().includes(searchTermLowerCase) ||
        employee.employeeName.toLowerCase().includes(searchTermLowerCase)
      );
     }
    console.log('Filtered employees:', this.filteredLeaveEmployees);
  }
 

  selectLeaveSummaryEmployee(employee: any, event: Event) {
    event.stopPropagation(); 

    if (employee === null) {
      this.selectedEmployeeId = null; 
      this.searchTerm = 'All Employees';
      this.isDropdownOpen = false;

      console.log('Selected Option: All Employees');

    } else {
      this.selectedEmployeeId = employee.fusionEmpId;
      this.searchTerm = `${employee.fusionEmpId} - ${employee.employeeName}`;
      this.isDropdownOpen = false;

      console.log('Selected Option:', this.searchTerm);
      this.filteredLeaveSummaryRecord = [];
    }
  }

  //it is calling for leave catageory changes
  onLeaveChangeLeave(event: Event): void {
    this.selectedLeave = (event.target as HTMLSelectElement).value;
    console.log('Selected Leave Category:', this.selectedLeave);
  }

  //it is calling for team manager
  filterLeaveSummaryManagers(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    console.log('Search Term:', searchTerm);
    this.filteredLeaveSummaryManagers = [...this.uniqueLeaveSummaryManagers.filter(manager =>
      manager.name.toLowerCase().includes(searchTerm) || manager.id.toLowerCase().includes(searchTerm)
    )];
    console.log('Filtered Managers:', this.filteredLeaveSummaryManagers);
  }

  toggleLeaveSummaryManagerDropdown(): void {
    this.isDropdownOpenleavesummary = !this.isDropdownOpenleavesummary; // Toggle dropdown visibility
    console.log('Dropdown clicked. Current state:', this.isDropdownOpenleavesummary ? 'Open' : 'Closed');
    if (this.isDropdownOpenleavesummary) {
      console.log('Team Managers in dropdown:', this.filteredLeaveSummaryManagers);
    }
  }

  selectLeaveSummaryManager(manager: { id: string, name: string }): void {
    console.log('selectManager method has been called with manager:', manager);
    this.selectedLeaveSummaryManager = manager.name;
    console.log('Selected Leave Manager:', this.selectedLeaveSummaryManager);
    this.closeleavesummaryDropdown(); 
  }
  //close the dropdown after selection
  closeleavesummaryDropdown(): void {
    this.isDropdownOpenleavesummary = false;
  }


// get leavesummery data

  getLeaveSummaryReport() {
    if ((this.selectedEmployeeId === null || this.selectedEmployeeId === '') &&
    (this.searchTerm === null || this.searchTerm === '') &&
    (this.selectedLeave === null || this.selectedLeave === '') &&
    (this.selectedLeaveSummaryManager === null || this.selectedLeaveSummaryManager === '')) {

    const modalElement = document.getElementById('entitled');
    if (modalElement) {
      modalElement.classList.add('show');
      modalElement.style.display = 'block';
      // this.StatusMsg = 'Please provide at least one input filter before generating the report';
    }
    return;
  }

  // this.isLoading = true;
  const request: ILeavesummery = {
    selectedEmployeeId: this.selectedEmployeeId,
    selectedLeave:this.selectedLeave,
    selectedLeaveSummaryManager:this.selectedLeaveSummaryManager
  };
  this.subscription = this.reportsService.getLeaveSummaryReport(request).subscribe({
    next: (res: any) => {
      if (res) {
        this.leavesummaryrecord = res;
        console.log(this.leavesummaryrecord);

        // Extract unique employee IDs and names directly
        const employeeMap = new Map<number, boolean>();
        this.uniqueEmployees = res.filter((record: { fusionEmpId: number; }) => {
          if (!employeeMap.has(record.fusionEmpId)) {
            employeeMap.set(record.fusionEmpId, true);
            return true;
            console.log("array",this.uniqueEmployees);
          }
          return false;
        }).map((record: { fusionEmpId: any; employeeName: any; }) => ({
          fusionEmpId: record.fusionEmpId,
          employeeName: record.employeeName
        }));

        this.filteredLeaveSummaryEmployees = this.uniqueEmployees;
        console.log('Unique Employees:', this.uniqueEmployees);

        // Extract unique team managers and filter out null values
        const managerSet = new Set<string>();
        this.uniqueLeaveSummaryManagers = res.filter((record: { teamManagerName: string | null; teamManagerEmpID: string | null; }) => {
          if (record.teamManagerName && !managerSet.has(record.teamManagerName)) {
            managerSet.add(record.teamManagerName);
            return true;
          }
          return false;
        }).map((record: { teamManagerName: string; teamManagerEmpID: string; }) => ({
          id: record.teamManagerEmpID,
          name: record.teamManagerName
        }));

        this.filteredLeaveSummaryManagers = [...this.uniqueLeaveSummaryManagers];
        console.log('Unique Managers:', this.uniqueLeaveSummaryManagers);

        const categorySet = new Set<string>();
        this.uniqueLeaveCategory = res.filter((record: { leaveType: string | null; }) => {
          if (record.leaveType && !categorySet.has(record.leaveType)) {
            categorySet.add(record.leaveType);
            return true;
          }
          return false;
        }).map((record: { leaveType: string; }) => record.leaveType);
        console.log('Unique Leave Category:', this.uniqueLeaveCategory);

        this.filteredLeaveSummaryRecord = res;
        console.log('Fetched Leave Summary Record for selected parameters:', this.filteredLeaveSummaryRecord);
        this.showLeaveSummaryTable = true;
        if (res.length === 0) { 
          const modalElement = document.getElementById('entitled');
          if (modalElement) {
            modalElement.classList.add('show');
            modalElement.style.display = 'block';        
          }
        } else {
          this.filteredLeaveSummaryRecord = res;
          console.log('Fetched Leave Summary Record for selected parameters:', this.filteredLeaveSummaryRecord);
        }
      }
   },
    error: (err: any) => {
      console.log(err);
    },
    complete: () => { },
  });
}
//this method use for export perpose
getColumnWidth(data: any[], columnName: string): number {
  // Find the maximum width of data in the column
  const maxWidth = data.reduce((max: number, record: any) => {
    const value = record[columnName]?.toString().length || 0;
    return value > max ? value : max;
  }, 0);

  // Set minimum width to 10
  return Math.max(10, maxWidth);
}

exportToExcelLeaveSummary(): void {
  // Define header mappings
  const HEADER_MAPPINGS: { [key: string]: string } = {
    fusionEmpId: 'EMPLOYEE ID',
    employeeName: 'EMPLOYEE NAME',
    department: 'DEPARTMENT',
    teamManagerName: 'TEAM MANAGER',
    location: 'LOCATION',
    subLocation: 'SUB LOCATION',
    shift: 'SHIFT',
    monthName: 'MONTH',
    leaveType: 'LEAVE TYPE',
    availed: 'LEAVES AVAILED'

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
    'MONTH',
    'LEAVE TYPE',
    'LEAVES AVAILED'

  ];

  // Modify data with renamed headers and new sequence

  const modifiedData = this.filteredLeaveSummaryRecord.map(record => {
    const modifiedRecord: any = {};
    NEW_SEQUENCE.forEach(columnName => {
      const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
      if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
        if (originalColumnName === 'leavePeriod') {
          // Split the date range into start and end dates
          const [start_date_str, end_date_str] = record[originalColumnName].split(' ');

          // Convert the start and end dates to Date objects
          const start_date = new Date(start_date_str);
          const end_date = new Date(end_date_str);

          // Format the start and end dates to 'dd MMM yyyy'
          const start_date_formatted = `${start_date.getDate()} ${start_date.toLocaleString('default', { month: 'short' })} ${start_date.getFullYear()}`;
          const end_date_formatted = `${end_date.getDate()} ${end_date.toLocaleString('default', { month: 'short' })} ${end_date.getFullYear()}`;

          // Assign the formatted date range with 'to' in between to the modified record
          modifiedRecord[columnName] = `${start_date_formatted} to ${end_date_formatted}`;
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
  XLSX.utils.sheet_add_aoa(ws, [['LEAVE SUMMARY REPORT']], { origin: 'A1' });

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
  XLSX.utils.book_append_sheet(wb, ws, 'Leave Summary Report');
  XLSX.writeFile(wb, 'Leave_Summary_Report.xlsx');
}


}

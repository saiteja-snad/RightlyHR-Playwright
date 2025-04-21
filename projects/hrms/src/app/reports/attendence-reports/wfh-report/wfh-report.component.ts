import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../environments/environment';
import { NgxDaterangepickerBootstrapDirective } from 'ngx-daterangepicker-bootstrap';

@Component({
  selector: 'app-wfh-report',
  imports: [CommonModule, FormsModule, NgxDaterangepickerBootstrapDirective],
  templateUrl: './wfh-report.component.html',
  styleUrl: './wfh-report.component.scss'
})
export class WfhReportComponent {
  subscription!: Subscription;
  @ViewChild('dropdown') dropdown!: ElementRef;
  isDropdownOpen: boolean = false;
  isFilterGivenwfh = false;
  selectedEmployeeId: string | null = null;
  uniqueEmployees: { fusionEmpId: number, employeeName: string, employeeId: number }[] = [];
  filteredWfhEmployees: { fusionEmpId: number, employeeName: string }[] = [];
  filteredWfhRecord: any[] = [];
  selectedWfhManager: string = '';
  showWfhTable: boolean = false;
  isDropdownOpenwfh: boolean = false;
  filteredWfhManagers: { id: string, name: string }[] = [];
  uniqueWfhManagers: { id: string, name: string }[] = [];
  searchTerm = '';
  selectedMonth: string | null = null;
  isFilterGivencompoff = false;
  selectedDate: string | null = null;
  wfhrecord: any;
  selectedDateRange: { startDate: any, endDate: any } | null = null;
  isWfhTabActive = false;

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
  constructor(private renderer: Renderer2, private http: HttpService, private modalService: NgbModal) { }

  WfhtoggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('Toggling dropdown. New state:', this.isDropdownOpen);
    if (this.isDropdownOpen) {
      this.renderer.addClass(this.dropdown.nativeElement, 'show');
    } else {
      this.renderer.removeClass(this.dropdown.nativeElement, 'show');
      this.searchTerm = ''; // Clear search term when closing dropdown
      this.WfhfilterEmployees();
    }
  }

  WfhfilterEmployees() {
    console.log('Typed text:', this.searchTerm);
    if (this.searchTerm.trim() === '') {
      this.filteredWfhEmployees = [...this.uniqueEmployees];
    } else {
      const searchTermLowerCase = this.searchTerm.toLowerCase();
      this.filteredWfhEmployees = this.uniqueEmployees.filter(employee =>
        employee.fusionEmpId.toString().toLowerCase().includes(searchTermLowerCase) ||
        employee.employeeName.toLowerCase().includes(searchTermLowerCase)
      );
    }
    console.log('Filtered employees:', this.filteredWfhEmployees);
  }

  selectWfhEmployee(employee: any, event: Event) {
    this.isFilterGivenwfh = true;
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
      this.filteredWfhRecord = [];
    }
  }

  filterWfhManagers(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    console.log('Search Term:', searchTerm);

    // Create a new array by filtering the uniqueWfhManagers
    this.filteredWfhManagers = [...this.uniqueWfhManagers.filter(manager =>
      manager.name.toLowerCase().includes(searchTerm) || manager.id.toLowerCase().includes(searchTerm)
    )];

    console.log('Filtered Managers:', this.filteredWfhManagers);
  }

  toggleWfhManagerDropdown(): void {
    this.isDropdownOpenwfh = !this.isDropdownOpenwfh; // Toggle dropdown visibility
    console.log('Dropdown clicked. Current state:', this.isDropdownOpenwfh ? 'Open' : 'Closed');
    if (this.isDropdownOpenwfh) {
      // Log the current state of filteredWfhManagers
      console.log('Team Managers in dropdown:', this.filteredWfhManagers);
    }
  }

  closeWfhDropdown(): void {
    this.isDropdownOpenwfh = false;
  }

  selectWfhManager(manager: { id: string, name: string }): void {
    this.isFilterGivenwfh = true;
    console.log('selectManager method has been called with manager:', manager);
    console.log('selectManager called with:', manager); // Add this line
    this.selectedWfhManager = manager.name;
    console.log('Selected Leave Manager:', this.selectedWfhManager);
    this.closeWfhDropdown(); // Close dropdown after selection
  }

  getWfhReport(): void {
    this.subscription = this.http.getData('Reports/WfhReports').subscribe({
      next: (data: any) => {
        this.wfhrecord = data;
        console.log(this.wfhrecord);

        // Extract unique employee IDs and names directly
        const employeeMap = new Map<number, boolean>();
        this.uniqueEmployees = data.filter((record: { fusionEmpId: number; }) => {
          if (!employeeMap.has(record.fusionEmpId)) {
            employeeMap.set(record.fusionEmpId, true);
            return true;
          }
          return false;
        }).map((record: { fusionEmpId: any; employeeName: any; }) => ({
          fusionEmpId: record.fusionEmpId,
          employeeName: record.employeeName
        }));

        this.filteredWfhEmployees = this.uniqueEmployees;
        console.log('Unique Employees:', this.uniqueEmployees);

        // Extract unique team managers and filter out null values
        const managerSet = new Set<string>();
        this.uniqueWfhManagers = data.filter((record: { teamManagerName: string | null; teamManagerEmpID: string | null; }) => {
          if (record.teamManagerName && !managerSet.has(record.teamManagerName)) {
            managerSet.add(record.teamManagerName);
            return true;
          }
          return false;
        }).map((record: { teamManagerName: string; teamManagerEmpID: string; }) => ({
          id: record.teamManagerEmpID,
          name: record.teamManagerName
        }));

        this.filteredWfhManagers = [...this.uniqueWfhManagers];
        console.log('Unique Managers:', this.uniqueWfhManagers);
      },
      error: (error: any) => {
        console.error('Error fetching WFH records', error);
      }
    });
  }

  onEmployeeChangeWfh(event: Event): void {
    this.selectedEmployeeId = (event.target as HTMLSelectElement).value;
    console.log('Selected Employee ID:', this.selectedEmployeeId);
  }

  generateWfhReport(): void {
    const noFilterProvided = !this.selectedEmployeeId && this.searchTerm !== 'All Employees' && !this.selectedDate
      && (!this.selectedDateRange || (!this.selectedDateRange.startDate && !this.selectedDateRange.endDate))
      && !this.selectedMonth && !this.selectedWfhManager;

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

    if (this.selectedDateRange && this.selectedDateRange.startDate && this.selectedDateRange.endDate) {
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

    const endpoint = params.toString() ? `Reports/WfhReports?${params.toString()}` : 'Reports/WfhReports';
    console.log('Fetching data from endpoint:', endpoint);

    this.http.getData(endpoint).subscribe({
      next: (data: any) => {
        this.filteredWfhRecord = data;
        this.showWfhTable = true;
        if (data.length === 0) { // Check if the data is empty
          const modalElement = document.getElementById('entitled');
          if (modalElement) {
            modalElement.classList.add('show');
            modalElement.style.display = 'block';
          }
        } else {
          this.filteredWfhRecord = data;
          console.log('Fetched WFH Record for selected parameters:', this.filteredWfhRecord);
        }
      },
      error: (error: any) => {
        console.error('Error fetching WFH records for selected parameters', error);
      }
    });
  }

  onDateRangeChangewfh(dateRange: any): void {

    if (dateRange && dateRange.startDate && dateRange.endDate) {
      this.isFilterGivencompoff = true;
      console.log('Selected Start Date:', dateRange.startDate.toDate());
      console.log('Selected End Date:', dateRange.endDate.toDate());
    }
  }

  parseDate(date: any): Date {
    return (date instanceof Date) ? date : new Date(date);
  }
  
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
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
      'WFH DATE',
      'DURATION'
    ];

    // Modify data with renamed headers and new sequence
    const modifiedData = this.filteredWfhRecord.map(record => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach(columnName => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (record[originalColumnName] === null) {
            modifiedRecord[columnName] = '-';
          } else if (originalColumnName === 'worked_Date') {
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

    // Merge cells for WFH Report row from A1 to I1
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];

    // Add WFH Report row
    XLSX.utils.sheet_add_aoa(ws, [['WFH REPORT']], { origin: 'A1' });

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

      if (columnName === 'EMPLOYEE ID' || columnName === 'DEPARTMENT' || columnName === 'WORKED DATE') {
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
}

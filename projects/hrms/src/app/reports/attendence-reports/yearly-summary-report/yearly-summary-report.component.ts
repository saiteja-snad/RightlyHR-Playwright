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

@Component({
  selector: 'app-yearly-summary-report',
  imports: [
    CommonModule,
    FormsModule,
    AttandaceReportTabsComponent,
    DropdownModule, 
    SelectModule, 
    TranslateModule, 
    ReactiveFormsModule],
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
uniqueLeaveCategory: string[] = [];
years: number[] = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
yearlyReportForm!: FormGroup;

constructor(
  private authService: AuthService,
  private reportsService: ReportsService,
  private http: HttpService,
  private fb: FormBuilder,
) {}

ngOnInit(): void {
  this.initializeForm();
  this.loggedInUser = this.authService.getToken();
  this.getYearlyReports();
  this.getEmployeeId();
  this.getTeam();
}

initializeForm() {
  this.yearlyReportForm = this.fb.group({
    employee: [null, Validators.required],
    manager: [null, Validators.required],
    leaveCategory: [''],
    year: ['']
  });
}

getEmployeeId() {
  const loggedInUser = this.authService.getToken();
  this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
    next: (data: any) => {
      this.employeeiddetails = data
        .filter((e: any) => e.employeeId !== loggedInUser.employeeId)
        .map((e: any) => ({
          ...e,
          fullName: `${e.fusionEmployeeId ? e.fusionEmployeeId + ' - ' : ''}${e.firstName} ${e.middleName ? e.middleName + ' ' : ''}${e.lastName}`
        }));
    },
    error: (reason: any) => console.log(reason),
  });
}

getTeam() {
  this.subscription = this.http.getData('PendingApprovalsAuthority/getAll').subscribe({
    next: (data: any) => {
      this.teamdetails = data.map((e: any) => ({
        ...e,
        fullName: `${e.fusionEmpId ? e.fusionEmpId + ' - ' : ''}${e.firstName} ${e.middleName ? e.middleName + ' ' : ''}${e.lastName}`
      }));
    },
    error: (reason: any) => console.log(reason),
  });
}

getYearlyReports() {
  this.isLoading = true;
  this.subscription = this.reportsService.getYearlyReports({}).subscribe({
    next: (res: any) => {
      this.extractUniqueYearlyFilters(res);
      this.isLoading = false;
    },
    error: (err: any) => console.log(err)
  });
}

extractUniqueYearlyFilters(data: any[]): void {
  this.employeeiddetails = Array.from(new Map(data.map((item: any) => [item.fusionEmpId, item])).values())
    .map((item: any) => ({
      fusionEmpId: item.fusionEmpId,
      fullName: `${item.fusionEmpId} - ${item.employeeName}`
    }));

  this.teamdetails = Array.from(new Map(data
    .filter(item => item.teamManagerName)
    .map(item => [item.teamManagerName, item])).values())
    .map((item: any) => ({
      id: item.teamManagerEmpID,
      firstName: item.teamManagerName.split(' ')[0],
      middleName: '',
      lastName: item.teamManagerName.split(' ').slice(1).join(' ')
    }));

  this.uniqueLeaveCategory = Array.from(new Set(data.map((item: any) => item.leaveType))).filter(Boolean);
}

selectYearlyEmployee(employee: any, event: Event) {
  event.stopPropagation();
  this.selectedEmployeeId = employee?.fusionEmpId ?? null;
  this.filteredYearlyRecord = [];
}

selectYearlyManager(manager: { id: string; name: string }): void {
  this.selectedWfhManager = manager.name;
}

onYearChange(event: Event): void {
  this.selectedYear = (event.target as HTMLSelectElement).value;
}

onLeaveChangeYearly(event: Event): void {
  this.selectedLeave = (event.target as HTMLSelectElement).value;
}

generateYearlyReport(): void {
  if (!this.selectedEmployeeId && !this.selectedWfhManager && !this.selectedYear && !this.selectedLeave) {
    return;
  }

  const params = new URLSearchParams();
  if (this.selectedEmployeeId) params.append('FusionEmpId', this.selectedEmployeeId);
  if (this.selectedWfhManager) params.append('TeamManagerName', this.selectedWfhManager);
  if (this.selectedLeave) params.append('LeaveName', this.selectedLeave);
  if (this.selectedYear) params.append('Year', this.selectedYear);

  const endpoint = `Reports/YearSummaryReports${params.toString() ? '?' + params.toString() : ''}`;
  this.http.getData(endpoint).subscribe({
    next: (data: any) => {
      this.filteredYearlyRecord = data;
      if (data.length === 0) {
        // show modal: no data
      } else {
        console.log('Fetched Yearly Record:', this.filteredYearlyRecord);
      }
    },
    error: (error: any) => console.error('Error fetching Yearly records:', error)
  });
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

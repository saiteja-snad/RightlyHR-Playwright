import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import * as XLSX from 'xlsx-js-style';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import dayjs from 'dayjs';
import { environment } from '../../../../environments/environment';
import { Dayjs } from 'dayjs';
import { ICompoffDetails } from '../../../Interfaces/reports.model';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { DatePicker } from 'primeng/datepicker';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-compoff-report',
  imports: [
    DatePicker,
    CommonModule,
    FormsModule,
    DropdownModule,
    SelectModule,
    MultiSelectModule,
    TranslateModule,
    ReactiveFormsModule, NoDataFoundComponent,
    DataLoaderContentComponent,
    ReportsHeaderComponent
  ],
  templateUrl: './compoff-report.component.html',
  styleUrl: './compoff-report.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class CompoffReportComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredCompoffRecord: any[] = [];
  employeeiddetails: any[] = [];
  teamdetails = [] as any[];
  compoffReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  getEmployeeInfo = [] as any;
  localeOptions: any;
  today: Date = new Date();
  constructor(
    private authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private offcanvasService: NgbOffcanvas
  ) { }

  ngOnInit(): void {
    this.localeOptions = {
      applyLabel: 'ok',
      format: this.authService.convertAngularDateFormatToJs(environment.dateformat).toUpperCase(),
      direction: 'ltr',
      clearLabel: 'Clear', // could be rtl
    };
    this.initializeForm();
    this.loggedInUser = this.authService.getToken();
    this.getEmployeeId();
    this.getTeam();
    this.getMyTeam();
  }

  initializeForm() {
    this.compoffReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      dateRange: [null],
      team: [null]
    });

    this.compoffReportForm.get('manager')?.valueChanges.subscribe((managers: any[]) => {
      if (managers && managers.length > 0) {
        const managerIds = managers.map(m => m.employeeId).join(',');
        this.getEmployeeId(managerIds);
      } else {
        this.getEmployeeId();
      }
      this.compoffReportForm.get('employee')?.setValue(null);
    });

    this.compoffReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  isAnyFilterApplied(): boolean {
    const form = this.compoffReportForm;
    const value = form.value;
    const hasEmployee = !!value.employee;
    const hasManager = !!value.manager;
    const hasTeam = !!value.team;
    const range = value.dateRange;
    const hasDateRange = !!(range && (range[0] || range[1] || range.startDate || range.endDate));
    return hasEmployee || hasManager || hasTeam || hasDateRange;
  }

  clearAllFilters(): void {
    this.compoffReportForm.reset();
    this.filteredCompoffRecord = [];
    this.isFilterIndicatorActive = false;
  }

  toggleFilters(content: any) {
    this.offcanvasService.open(content, {
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  onGenerate(): void {
    this.isFilterIndicatorActive = this.isFilterApplied();
    this.generateCompoffReport();
  }

  isFilterApplied(): boolean {
    const { employee, manager, dateRange, team } = this.compoffReportForm.value;
    return (employee && employee.length > 0) || 
           (manager && manager.length > 0) || 
           (dateRange && (dateRange[0] || dateRange[1])) || 
           (team && team.length > 0);
  }

  get isCompOffGenerateDisabled(): boolean {
    const { employee, manager, dateRange, team } = this.compoffReportForm.value;
    // Check if any field has a value
    return !((employee && employee.length > 0) || 
             (manager && manager.length > 0) || 
             (dateRange && (dateRange[0] || dateRange[1])) || 
             (team && team.length > 0));
  }

  getEmployeeId(managerIds?: string) {
    let url = 'Employeedata/employees/by-managers';
    if (managerIds) {
      url += `?managerIds=${managerIds}`;
    }

    this.subscription = this.http.getData(url).subscribe({
      next: (data: any) => {
        const loggedInEmployee = {
          ...this.loggedInUser,
          fullName: `${this.loggedInUser.fusionEmpId ? this.loggedInUser.fusionEmpId + ' - ' : ''}${this.loggedInUser.firstName} ${this.loggedInUser.middleName ? this.loggedInUser.middleName + ' ' : ''}${this.loggedInUser.lastName}`.trim(),
        };

        const mappedData = data.map((employee: any) => {
          const firstName = employee.firstName ? employee.firstName.trim() : '';
          const middleName = employee.middleName ? employee.middleName.trim() : '';
          const lastName = employee.lastName ? employee.lastName.trim() : '';

          return {
            ...employee,
            firstName,
            fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
          };
        });

        const combinedData = [loggedInEmployee, ...mappedData];

        // Filter unique by employeeId and sort by firstName
        this.employeeiddetails = combinedData
          .filter((employee, index, self) =>
            index === self.findIndex((e) => e.employeeId === employee.employeeId)
          )
          .sort((a: any, b: any) => (a.firstName ?? '').toLowerCase().localeCompare((b.firstName ?? '').toLowerCase()));
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getTeam() {
    const statuses = 'Active';
    this.subscription = this.http.getData(`PendingApprovalsAuthority/getAll?statuses=${encodeURIComponent(statuses)}`).subscribe({
      next: (data: any) => {
        if (data) {
          const loggedInEmployee = {
            ...this.loggedInUser,
            fusionEmployeeId: this.loggedInUser.fusionEmpId,
            fullName: `${this.loggedInUser.fusionEmpId ? this.loggedInUser.fusionEmpId + ' - ' : ''}${this.loggedInUser.firstName} ${this.loggedInUser.middleName ? this.loggedInUser.middleName + ' ' : ''}${this.loggedInUser.lastName}`.trim(),
          };

          const mappedData = data.map((employee: any) => {
            const firstName = employee.firstName ? employee.firstName.trim() : '';
            const middleName = employee.middleName ? employee.middleName.trim() : '';
            const lastName = employee.lastName ? employee.lastName.trim() : '';

            return {
              ...employee,
              firstName,
              fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
            };
          });

          const combinedData = [loggedInEmployee, ...mappedData];

          // Filter unique by employeeId and sort by firstName
          this.teamdetails = combinedData
            .filter((employee, index, self) =>
              index === self.findIndex((e) => e.employeeId === employee.employeeId)
            )
            .sort((a: any, b: any) => (a.firstName ?? '').toLowerCase().localeCompare((b.firstName ?? '').toLowerCase()));
        }
      },
      error: (reason: any) => console.log(reason),
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`; // Format as 'YYYY-MM-DD'
  }

  parseDate(date: any): Date {
    return date instanceof Date ? date : new Date(date);
  }

  generateCompoffReport(): void {
    this.spinnerLoader1 = true;
    this.isLoading = true;
    const formValue = this.compoffReportForm.value;
    const dateRangeArray = formValue.dateRange || [];
    const startDate: Dayjs | null = dateRangeArray[0] ? dayjs(dateRangeArray[0]) : null;
    const endDate: Dayjs | null = dateRangeArray[1] ? dayjs(dateRangeArray[1]) : (startDate ? startDate : null);
    
    // Check if any filter is provided
    const isEmployeeSelected = formValue.employee && formValue.employee.length > 0;
    const isManagerSelected = formValue.manager && formValue.manager.length > 0;
    const isTeamSelected = formValue.team && formValue.team.length > 0;
    const isDateSelected = startDate && endDate;

    const noFilterProvided = !isEmployeeSelected && !isDateSelected && !formValue.month && !isManagerSelected && !isTeamSelected;

    if (noFilterProvided) {
      this.filteredCompoffRecord = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      return;
    }

    const request: ICompoffDetails = {};

    // Check if My Team dropdown is visible
    const isMyTeamVisible = this.rbac.allowedToAccess('My Team Report(Compoff).view') &&
      !this.rbac.allowedToAccess('Attendance All Employees List(Compoff).view') &&
      !this.rbac.allowedToAccess('Attendance Team Manager List(Compoff).view');

    if (isMyTeamVisible) {
      (request as any).ReportingManagerId = this.loggedInUser.employeeId;
    }

    // Handle Employee Multi-Select
    if (isEmployeeSelected) {
      // Check if "All Employees" is selected
      const isAllEmployeesSelected = formValue.employee.some((emp: any) => emp.employeeId === 'all');
      
      if (!isAllEmployeesSelected) {
        const employeeIds = formValue.employee.map((emp: any) => emp.employeeId).join(',');
        request.employeeId = employeeIds;
      }
      // If "All Employees" is selected, we don't send employeeId filter (fetch all)
    }

    // Handle Manager Multi-Select
    if (isManagerSelected) {
      const managerIds = formValue.manager.map((mgr: any) => mgr.employeeId).join(',');
      request.teamManagerID = managerIds;
    }

    // Handle Team Multi-Select
    if (isTeamSelected) {
       const teamMemberIds = formValue.team.map((member: any) => member.employeeId).join(',');
       request.employeeId = teamMemberIds;
    }

    // Apply date range if provided
    if (startDate && endDate) {
      request.StartDate = this.formatDate(this.parseDate(startDate));
      request.EndDate = this.formatDate(this.parseDate(endDate));
    }

    // Single API call
    this.reportsService.getcompOffReports(request).subscribe({
      next: (response: any) => {
        this.filteredCompoffRecord = response ?? [];
      },
      error: (error) => {
        this.spinnerLoader1 = false;
        this.disableBtn = true;
        this.isLoading = false;
        this.filteredCompoffRecord = [];
        this.closeCanvas();
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
        this.closeCanvas();
      }
    });
  }

  exportToExcelYearly(): void {
    this.spinnerLoader2 = true;
    setTimeout(() => {
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
        entitlementDays: 'ENTITLED DAYS',
        duration: 'AVAILED'
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
        'ENTITLED DAYS',
        'AVAILED'
      ];

      // Function to format date in MMM DD YYYY format
      const formatDate = (dateString: string): string => {
        return dayjs(dateString).format('MMM DD, YYYY');
      };

      // Modify data with renamed headers and new sequence
      const modifiedData = this.filteredCompoffRecord.map(record => {
        const modifiedRecord: any = {};
        NEW_SEQUENCE.forEach(columnName => {
          const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
          if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
            if (originalColumnName === 'worked_Date') {
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

      // Merge cells for WFH Report row from A1 to I1
      ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];

      // Add WFH Report row
      XLSX.utils.sheet_add_aoa(ws, [['COMP OFF REPORT']], { origin: 'A1' });

      // Add data rows (Headers will be automatically generated at A2)
      XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A2' });

      // Apply styles to WFH Report row
      const wfhReportCell = ws['A1'] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
      wfhReportCell.s = { 
        font: { bold: true, sz: 14, color: { rgb: "000000" } }, 
        alignment: { horizontal: 'center', vertical: 'center' }
      };
      // Explicitly set row height
      if (!ws['!rows']) ws['!rows'] = [];
      ws['!rows'][0] = { hpt: 25 };
      ws['A1'] = wfhReportCell; // Assign the styled cell back to the worksheet

      // Apply styles to column headers
      NEW_SEQUENCE.forEach((columnName, index) => {
        const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
        const cell = ws[cellAddress] || { t: '', v: '' }; // Get the cell or create a new one if it doesn't exist
        cell.s = { 
          font: { bold: true }, 
          alignment: { horizontal: 'center' }
        };
        ws[cellAddress] = cell; // Assign the styled cell back to the worksheet
      });

      // Apply styles to data rows
      modifiedData.forEach((record, rowIndex) => {
        NEW_SEQUENCE.forEach((columnName, colIndex) => {
          const cellAddress = XLSX.utils.encode_cell({ r: rowIndex + 2, c: colIndex });
          const cell = ws[cellAddress] || { t: '', v: '' };
          cell.s = {
            alignment: { horizontal: 'center', vertical: 'center' }
          };
          ws[cellAddress] = cell;
        });
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
      XLSX.utils.book_append_sheet(wb, ws, 'Comp Off Report');
      const fileName = `Comp Off Report - ${dayjs().format('MMM DD YYYY')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      this.spinnerLoader2 = false;
    }, 100);
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

  getMyTeam() {
    const EmployeeId = this.loggedInUser?.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
          console.log(response);
          if (response) {
            const myTeam = response.filter((e: any) => e.isAccess);
            this.getEmployeeInfo = myTeam.map((employee: any) => {
              return {
                ...employee,
                fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                  }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
                  }${employee.lastName}`,
              };
            });

            const isUserInList = this.getEmployeeInfo.some((e: any) => e.employeeId === this.loggedInUser.employeeId);
            if (!isUserInList) {
              this.getEmployeeInfo.unshift({
                ...this.loggedInUser,
                fullName: `${this.loggedInUser.fusionEmpId ? this.loggedInUser.fusionEmpId + ' - ' : ''}${this.loggedInUser.firstName} ${this.loggedInUser.middleName ? this.loggedInUser.middleName + ' ' : ''}${this.loggedInUser.lastName}`,
              });
            }

            this.getEmployeeInfo.sort((a: any, b: any) =>
              (a.firstName?.toLowerCase() ?? '').localeCompare(b.firstName?.toLowerCase() ?? '')
            );
          }
        },
      });
  }

  navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}

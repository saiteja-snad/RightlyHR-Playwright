import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Select } from 'primeng/select';
import { IemployeeDetails, ITeamManagerEmployees } from '../reports.modal';
import dayjs, { Dayjs } from 'dayjs';
import { environment } from '../../../../environments/environment';
import { IExitFeedbackReportRequest } from '../../../Interfaces/reports.model';
import * as XLSX from 'xlsx-js-style';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { DatePicker } from 'primeng/datepicker';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { Table, TableModule } from 'primeng/table';

@Component({
  selector: 'app-exit-feedback-reports',
  imports: [CommonModule, ReactiveFormsModule, Select, DatePicker, DataLoaderContentComponent, NoDataFoundComponent, ReportsHeaderComponent, TranslateModule, MultiSelectModule,TableModule],
  templateUrl: './exit-feedback-reports.component.html',
  styleUrl: './exit-feedback-reports.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ExitFeedbackReportsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  exitFeedbackReportForm!: FormGroup;
  loggedInUser = {} as IemployeeDetails;
  employeeDetails: IemployeeDetails[] = [];
  teamManagerDetails: ITeamManagerEmployees[] = [];
  filteredExitFeedbackData: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  isLoading = false;
  getEmployeeInfo = [] as any;
  selectLeaveEmployeeIds: number[] = [];
  filteredleaveRecords = true;
  selectedEmployeeId: any = null;
  localeOptions: any;
  exitTypeOptions = [
  { label: 'Resignation', value: 'Resignation' },
  { label: 'Termination', value: 'Termination' },
  { label: 'Abscond', value: 'Abscond' }
];
 @ViewChild('exitTable') table!: Table;

currentSortField: string = '';
currentSortOrder: number = 0;
originalExitFeedbackData: any[] = [];
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
      clearLabel: 'Clear',
    };
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getAllEmployees();
    this.getTeam();
    this.getMyTeam();
  }

  initializeForm() {
    this.exitFeedbackReportForm = this.fb.group({
      employee: [null],
      manager: [null],
      dateRange: [null],
      team: [null],
      exitType: [null]
    });
    this.exitFeedbackReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  get isExitFeedbackGenerateDisabled(): boolean {
    return !this.isAnyFilterApplied();
  }

  isAnyFilterApplied(): boolean {
    const { employee, manager, dateRange, team, exitType } = this.exitFeedbackReportForm.value;
    const hasEmployee = employee && (Array.isArray(employee) ? employee.length > 0 : !!employee);
    const hasManager = manager && (Array.isArray(manager) ? manager.length > 0 : !!manager);
    const hasDateRange = dateRange && (dateRange.startDate || dateRange.endDate || (Array.isArray(dateRange) && (dateRange[0] || dateRange[1])));
    const hasTeam = team && (Array.isArray(team) ? team.length > 0 : !!team);
    const hasExitType = exitType && (Array.isArray(exitType) ? exitType.length > 0 : !!exitType);

    return hasEmployee || hasManager || hasDateRange || hasTeam || hasExitType;
  }

  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, {  
      position: 'end',
      backdrop: 'static',
      keyboard: false,
    });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }

  getAllEmployees() {
    this.http.getData('Employeedata/InactiveEmployees').pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          const employeedata = data
            .map((employee: any) => {
              const firstName = employee.firstName ? employee.firstName.trim() : '';
              const middleName = employee.middleName ? employee.middleName.trim() : '';
              const lastName = employee.lastName ? employee.lastName.trim() : '';

              return {
                ...employee,
                firstName,
                fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
              };
            })
            .sort((a: any, b: any) =>
              a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase())
            );

          this.employeeDetails = [
            // { fullName: 'All Employees', employeeId: 'all' },
            ...employeedata
          ];
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  getTeam() {
    const statuses = 'Active';
    this.http.getData(`PendingApprovalsAuthority/getAll?statuses=${encodeURIComponent(statuses)}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.teamManagerDetails = data
          .map((employee: any) => {
            const firstName = employee.firstName ? employee.firstName.trim() : '';
            const middleName = employee.middleName ? employee.middleName.trim() : '';
            const lastName = employee.lastName ? employee.lastName.trim() : '';

            return {
              ...employee,
              firstName,
              fullName: `${employee.fusionEmployeeId ? employee.fusionEmployeeId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
            };
          })
          .sort((a: any, b: any) =>
            a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase())
          );
      },
      error: (reason: any) => console.log(reason),
    });
  }

  clearAllFilters() {
    this.exitFeedbackReportForm.reset();
    this.filteredExitFeedbackData = [];
    this.isFilterIndicatorActive = false;
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  parseDate(date: any): Date {
    return date instanceof Date ? date : new Date(date);
  }

  onGenerate(): void {
    this.isFilterIndicatorActive = this.isAnyFilterApplied();
    this.generateExitFeedbackReport();
  }

  generateExitFeedbackReport(): void {
    this.closeCanvas();
    this.spinnerLoader1 = true;
    this.isLoading = true;
    const formValue = this.exitFeedbackReportForm.value;
    const dateRangeArray = formValue.dateRange || [];
    const startDate: Dayjs | null = dateRangeArray[0] ? dayjs(dateRangeArray[0]) : null;
    const endDate: Dayjs | null = dateRangeArray[1] ? dayjs(dateRangeArray[1]) : (startDate ? startDate : null);

    if (!this.isAnyFilterApplied()) {
      this.filteredExitFeedbackData = [];
      this.spinnerLoader1 = false;
      this.isLoading = false;
      return;
    }

    const request: IExitFeedbackReportRequest = {};

    // Handle My Team selection
    if (formValue.team && this.selectLeaveEmployeeIds.length > 0) {
      const ids = this.selectLeaveEmployeeIds.join(',');
      request.employeeId = ids;
    }

    // Handle individual employee selection
    if (formValue.employee) {
       // MultiSelect returns an array
       if(Array.isArray(formValue.employee)){
           const allSelected = formValue.employee.some((e: any) => e.employeeId === 'all');
            if (!allSelected) {
               request.employeeId = formValue.employee.map((e: any) => e.employeeId).join(',');
            }
            // If 'all' is selected, we generally don't send employeeId filter, or handle as per API requirement
       } else if (formValue.employee.employeeId !== 'all') {
            request.employeeId = formValue.employee.employeeId.toString();
       }
    }

    // Handle date range
    if (startDate && endDate) {
      request.StartDate = this.formatDate(this.parseDate(startDate));
      request.EndDate = this.formatDate(this.parseDate(endDate));
    }

    // Handle manager selection
    if (formValue.manager) {
        if(Array.isArray(formValue.manager)){
             request.teamManagerId = formValue.manager.map((m:any) => m.employeeId).join(',');
        } else {
             request.teamManagerId = formValue.manager.employeeId;
        }
    }

    // Handle exittype selection
    if (formValue.exitType) {
        if(Array.isArray(formValue.exitType)){
            request.exitReason = formValue.exitType.map((t:any) => t.value).join(',');
        } else {
             request.exitReason = formValue.exitType;
        }
    }

    console.log('Exit Feedback Report Request:', request);

    this.reportsService.getExitFeedbackReports(request).subscribe({
      next: (response: any) => {
        console.log('Exit Feedback Report Response:', response);
        console.log('Response type:', typeof response);
        console.log('Is Array:', Array.isArray(response));
        
        // Handle different response structures
        if (Array.isArray(response)) {
          this.filteredExitFeedbackData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          this.filteredExitFeedbackData = response.data;
        } else if (response && response.result && Array.isArray(response.result)) {
          this.filteredExitFeedbackData = response.result;
        } else {
          this.filteredExitFeedbackData = response ? [response] : [];
        }
        this.originalExitFeedbackData = [...this.filteredExitFeedbackData];
        this.spinnerLoader1 = false;
        console.log('Final filtered data:', this.filteredExitFeedbackData);
         // Close offcanvas after generating report
      },
      error: (error) => {
        console.error('Exit Feedback Report Error:', error);
        this.spinnerLoader1 = false;
        this.isLoading = false;
        this.filteredExitFeedbackData = [];
      },
      complete: () => {
        this.spinnerLoader1 = false;
        this.disableBtn = false;
        this.isLoading = false;
      }
    });
  }

  exportToExcelExitFeedbackReport(): void {
    this.spinnerLoader2 = true;
    setTimeout(() => {
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManager: 'TEAM MANAGER',
      location: 'LOCATION',
      subLocation: 'SUB LOCATION',
      exitType : 'EXIT TYPE',
      exitReason: 'EXIT REASON',
      lastWorkingDay: 'LAST WORKING DAY',
      feedbackSubmitted: 'FEEDBACK STATUS',
      rehireEligible: 'REHIRE ELIGIBLE'
    };

    const NEW_SEQUENCE: string[] = [
      'EMPLOYEE ID',
      'EMPLOYEE NAME',
      'DEPARTMENT',
      'TEAM MANAGER',
      'LOCATION',
      'SUB LOCATION',
      'EXIT TYPE',
      'EXIT REASON',
      'LAST WORKING DAY',
      'FEEDBACK STATUS',
      'REHIRE ELIGIBLE'
    ];

    const modifiedData = this.filteredExitFeedbackData.map(record => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach(columnName => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (originalColumnName === 'lastWorkingDay' && record[originalColumnName]) {
            const date = new Date(record[originalColumnName]);
            const date_formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            modifiedRecord[columnName] = date_formatted;
          } else if (originalColumnName === 'feedbackSubmitted') {
            modifiedRecord[columnName] = record[originalColumnName] === 'Yes' ? 'Submitted' : 'Pending';
          } else {
            modifiedRecord[columnName] = record[originalColumnName];
          }
        } else {
          modifiedRecord[columnName] = '-';
        }
      });
      return modifiedRecord;
    });

    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet([[]]);

    // Merge cells for Report row
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: NEW_SEQUENCE.length - 1 } }];

    // Add Report row
    XLSX.utils.sheet_add_aoa(ws, [['EMPLOYEE EXIT REPORT']], { origin: 'A1' });

    // Add header row
    const headerRow = NEW_SEQUENCE.map(columnName => columnName);
    XLSX.utils.sheet_add_aoa(ws, [headerRow], { origin: 'A2' });

    // Add data rows
    XLSX.utils.sheet_add_json(ws, modifiedData, { origin: 'A3', skipHeader: true });

    // Apply styles to Report row
    const wfhReportCell = ws['A1'] || { t: '', v: '' }; 
    wfhReportCell.s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };
    ws['A1'] = wfhReportCell;

    // Apply styles to column headers
    NEW_SEQUENCE.forEach((columnName, index) => {
      const cellAddress = XLSX.utils.encode_cell({ r: 1, c: index });
      const cell = ws[cellAddress] || { t: '', v: '' }; 
      cell.s = { font: { bold: true }, alignment: { horizontal: 'center' } };
      ws[cellAddress] = cell; 
    });

     // Apply middle alignment to all data cells
     modifiedData.forEach((_, rowIndex) => {
        NEW_SEQUENCE.forEach((_, colIndex) => {
          const cellRef = XLSX.utils.encode_cell({ r: rowIndex + 2, c: colIndex });
          if (ws[cellRef]) {
            ws[cellRef].s = {
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          }
        });
      });

    NEW_SEQUENCE.forEach((columnName, index) => {
      let columnWidth = this.getColumnWidth(modifiedData, columnName);
      if (columnName === 'EMPLOYEE ID' || columnName === 'SUB LOCATION' || columnName === 'DEPARTMENT') {
        columnWidth += 5;
      }
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'][index] = { wch: columnWidth };
    });

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employee Exit Report');
    const today = new Date();
    const filenameDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).replace(',', '');
    XLSX.writeFile(wb, `Employee Exit Report - ${filenameDate}.xlsx`);
    this.spinnerLoader2 = false;
    }, 100);
  }

  getColumnWidth(data: any[], columnName: string): number {
    const maxWidth = data.reduce((max: number, record: any) => {
      const value = record[columnName]?.toString().length || 0;
      return value > max ? value : max;
    }, 0);
    return Math.max(10, maxWidth);
  }

  onClick(employeeIds: any) {
    if (employeeIds.value) {
      this.filteredleaveRecords = false;
      this.selectLeaveEmployeeIds = [];
      this.selectedEmployeeId = [];
      if (employeeIds.value.employeeId == this.loggedInUser.employeeId) {
        this.selectLeaveEmployeeIds = this.getEmployeeInfo.filter((employee: any) => employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
        this.selectedEmployeeId = this.getEmployeeInfo.filter((employee: any) => employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
      } else {
        this.selectLeaveEmployeeIds.push(employeeIds.value.employeeId);
        this.selectedEmployeeId.push(employeeIds.value.employeeId);
      }
    }
  }

  getMyTeam() {
    const EmployeeId = this.loggedInUser?.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
          if (response) {
            const myTeam = response.filter((e: any) => e.isAccess);

            this.getEmployeeInfo = myTeam
              .map((employee: any) => {
                const firstName = employee.firstName ? employee.firstName.trim() : '';
                const middleName = employee.middleName ? employee.middleName.trim() : '';
                const lastName = employee.lastName ? employee.lastName.trim() : '';

                return {
                  ...employee,
                  firstName,
                  lastName,
                  fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
                };
              })
              .sort((a: any, b: any) => {
                const firstCompare = a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase());
                if (firstCompare !== 0) return firstCompare;
                return a.lastName.toLowerCase().localeCompare(b.lastName.toLowerCase());
              });

            this.getEmployeeInfo.unshift({
              fullName: 'All Employees',
              fusionEmpId: this.loggedInUser.fusionEmpId,
              employeeId: this.loggedInUser.employeeId,
            });
          }
        },
        error: (err) => console.log(err),
      });
  }
  customSort(event: any): void {

    const field = event.field;

    // ASC -> DESC -> RESET
    if (this.currentSortField === field) {

      if (this.currentSortOrder === 1) {

        this.currentSortOrder = -1;
        event.order = -1;

      } else if (this.currentSortOrder === -1) {

        this.currentSortField = '';
        this.currentSortOrder = 0;

        // Restore original data order
        this.filteredExitFeedbackData = [
          ...this.originalExitFeedbackData
        ];

        if (this.table) {
          this.table.reset();
        }

        return;

      }

    } else {

      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;

    }


    event.data.sort((a: any, b: any) => {

      let val1 = a[field];
      let val2 = b[field];


      // Employee ID
      if (field === 'fusionEmpId') {

        const num1 = parseInt(String(val1).replace(/\D/g, ''), 10) || 0;
        const num2 = parseInt(String(val2).replace(/\D/g, ''), 10) || 0;

        return event.order * (num1 - num2);
      }


      // Last Working Day
      if (field === 'lastWorkingDay') {

        const date1 = new Date(val1).getTime();
        const date2 = new Date(val2).getTime();

        return event.order * (date1 - date2);
      }


      // Default string sorting
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();

      return event.order * val1.localeCompare(val2, undefined, {
        sensitivity: 'base'
      });

    });

  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

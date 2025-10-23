import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { AuthService } from '../../../services/auth.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { HttpService } from '../../../services/http.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { DropdownModule } from 'primeng/dropdown';
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import * as XLSX from 'xlsx';
import { IAttendanceDetails } from '../../../Interfaces/reports.model';
import { environment } from '../../../../environments/environment';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { Client } from '../../../clients.model';
import { TimesheetReportTabsComponent } from '../../../shared/reports-tabs/timesheet-report-tabs/timesheet-report-tabs.component';
import { OpenModalService } from '../../../services/open-modal.service';
import { PaginatorModule } from 'primeng/paginator';
@Component({
  selector: 'app-my-timesheet-report',
  imports: [DatePicker, CommonModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent,PaginatorModule, DataLoaderContentComponent, ReportsHeaderComponent],
  templateUrl: './my-timesheet-report.component.html',
  styleUrl: './my-timesheet-report.component.scss'
})
export class MyTimesheetReportComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredmytimesheetRecord: any[] = [];
  projectsData: any[] = [];
  teamdetails = [] as any[];
  selectedEmployeeId: any = null;
  selectedWfhManager: string | null = null;
  selectedMonth: string | null = null;
  selectedLeave: string | null = null;
  selectedYear: string | null = null;
  uniqueLeaveCategory: any[] = [];
  years: number[] = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
  MyTimesheetReportForm!: FormGroup;
  empMasterDataDOJDateRange!: { startDate: Dayjs; endDate: Dayjs } | null;
  selectedDateRange: any;
  wfhReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;
  filteredleaveRecords = false;
  selectLeaveEmployeeIds: number[] = [];
  getEmployeeInfo = [] as any;
  destroy$ = new Subject<boolean>();
  empinfo: any;
  loading: boolean = true;
  clients: Client[] = [];
  projects: TimesheetReportTabsComponent[] = [];
  disableproject = true;
  noclientproject = false;
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
  localeOptions: any;
  BillableOptions = [
    { key: 'Yes', value: 'true' },
    { key: 'No', value: 'false' },
  ];
  TimesheetStatus = [
    { key: 'Waiting for Approval', value: 'Waiting for Approval' },
    { key: 'Approved', value: 'Processed' },
    { key: 'Rejected', value: 'Rejected' },
  ];
  clientDropdownList: { label: string; value: number }[] = [];
  resourcesArrayList: any;
    page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  constructor(
    public authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
     private conformationPopup: OpenModalService,
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.localeOptions = {
      applyLabel: 'ok',
      format: this.authService.convertAngularDateFormatToJs(environment.dateformat).toUpperCase(),
      direction: 'ltr',
      clearLabel: 'Clear', // could be rtl
    };
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getResourceData();
    this.getAttendanceReports();
    this.getMyTeam();
  }

  initializeForm() {
    this.MyTimesheetReportForm = this.fb.group({
      client: [null],
      project: [{ value: null, disabled: true }],
      dateRange: [null],
      status: [null],
      billable: [null]
    });
    this.MyTimesheetReportForm.addControl('projects', this.fb.array([]));
    this.MyTimesheetReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  clearAllFilters(): void {
    this.MyTimesheetReportForm.reset();
    this.filteredmytimesheetRecord = [];
    this.MyTimesheetReportForm.get('project')?.disable(); 
    this.collectionSize = 0;
  }

    // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generatemytimesheetReport(this.page, this.pageSize);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.generatemytimesheetReport(this.page, this.pageSize);
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.generatemytimesheetReport(this.page, this.pageSize);
  }
  //GET CLIENT AND PROJECT
  getResourceData() {
    this.http
      .getDataIncludeParams(`ProjectResource?status=active&employeeId=${this.empinfo.employeeId}&isProjectRequired=true`)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (res.success) {
          const rawData = res.data;

          // Group projects under each client
          this.clients = rawData.reduce((acc: any[], curr: any) => {
            const existingClient = acc.find((c) => c.clientId === curr.client.clientId);

            const projectObj = {
              projectId: curr.project.projectId,
              projectName: curr.project.projectName,
              startDate: curr.startDate,
              endDate: curr.endDate,
              status: curr.status,
              role: curr.role,
              isWeekendAllowed: curr.project.isWeekendAllowed || curr.client.isWeekendAllowed,
              isOverTimeAllowed: curr.project.isOverTimeAllowed || curr.client.isOverTimeAllowed,
              isBillable: curr.project.isbillable || curr.client.isbillable,
            };

            if (existingClient) {
              existingClient.projects.push(projectObj);
            } else {
              acc.push({
                clientId: curr.client.clientId,
                clientName: curr.client.clientName,
                projects: [projectObj],
                shift: curr.shift,
              });
            }
            return acc;
          }, []);

          // Add "No Client/No Project" option
          if (!this.noclientproject) {
            this.clients.unshift({
              clientId: 0,
              clientName: 'No Client',
              projects: [
                {
                  projectId: 0,
                  projectName: 'No Project',
                  isNoClientProject: true,
                },
              ],
              taxId: '',
              websiteUrl: '',
              industryType: '',
              logoPath: '',
              address: '',
              status: '',
              overtimeEligibile: false,
              billable: false,
              weekendWorkAllowed: false,
              createdBy: {
                id: 0,
                name: ''
              },
              updatedBy: {
                id: 0,
                name: ''
              },
              createdAt: '',
              updatedAt: '',
              contact: {
                contactId: 0,
                entityRefId: 0,
                name: '',
                email: '',
                phoneNumber: '',
                phoneCountryCode: '',
                phoneDialCode: '',
                role: '',
                primaryContact: false,
                active: false,
                createdAt: '',
                updatedAt: ''
              }
            });
          }

          // Prepare dropdown data for <p-select>
          this.clientDropdownList = this.clients.map((c) => ({
            label: c.clientName,
            value: c.clientId,
          }));
        }
      });
  }

  // Called on client dropdown change
  // getAllActiveProjects(event: any) {
  //   const selectedClientId = event.value;
  //   const selectedClient = this.clients.find((c) => c.clientId === selectedClientId);
  //   this.projectsData = selectedClient && selectedClient.projects
  //     ? selectedClient.projects.map((p: any) => ({
  //       displayprojectName: p.projectName,
  //       projectId: p.projectId,
  //     }))
  //     : [];
  // }
getAllActiveProjects(event: any) {
  const selectedClientId = event.value;
  const selectedClient = this.clients.find((c) => c.clientId === selectedClientId);

  if (selectedClient && selectedClient.projects) {
    this.projectsData = selectedClient.projects.map((p: any) => ({
      displayprojectName: p.projectName,
      projectId: p.projectId,
    }));

    this.MyTimesheetReportForm.get('project')?.enable(); // enable when client chosen
  } else {
    this.projectsData = [];
    this.MyTimesheetReportForm.get('project')?.reset();
    this.MyTimesheetReportForm.get('project')?.disable(); // disable if no projects or no client
  }
}

  getAttendanceReports() {
    this.subscription = this.reportsService.getAttendanceReports({}).subscribe({
      next: (res: any) => {
        this.extractUniqueYearlyFilters(res);
      }
    });
  }

  extractUniqueYearlyFilters(data: any[]): void {
    const uniqueLeaveCategory = Array.from(new Set(data.map((item: any) => item.leaveType))).filter(Boolean);
    this.uniqueLeaveCategory = uniqueLeaveCategory.map(category => ({
      label: category,
      value: category
    }));
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

  // get isLeaveGenerateDisabled(): boolean {
  //   const { client, project, dateRange, billable, status } = this.MyTimesheetReportForm.value;
  //   // Check if any field has a value
  //   return !(client || project || (dateRange && (dateRange.startDate || dateRange.endDate)) || billable || status);
  // }
get isLeaveGenerateDisabled(): boolean {
  const { client, project, dateRange, billable, status } = this.MyTimesheetReportForm.value;

  const hasClient = client !== null && client !== undefined;
  const hasProject = project !== null && project !== undefined;
  const hasDateRange = dateRange && (dateRange.startDate || dateRange.endDate);
  const hasBillable = billable !== null && billable !== undefined;
  const hasStatus = status !== null && status !== undefined;

  return !(hasClient || hasProject || hasDateRange || hasBillable || hasStatus);
}

  generatemytimesheetReport(page: number, pageSize: number) {
    if (this.MyTimesheetReportForm.invalid) {
      return;
    }
    this.spinnerLoader1 = true;
    const formValue = this.MyTimesheetReportForm.value;
    const employeeId = this.empinfo?.employeeId || 0;
    const startDate = formValue.dateRange?.[0] ? new Date(formValue.dateRange[0]).toISOString() : null;
    const endDate = formValue.dateRange?.[1] ? new Date(formValue.dateRange[1]).toISOString() : null;
    const params: any = {
      ReportType: 'MyTimesheet',
      EmployeeIds: employeeId,
    };
    if (startDate) params.StartDate = startDate;
    if (endDate) params.EndDate = endDate;
    if (formValue.client !== null && formValue.client !== undefined) {
      params.ClientIds = formValue.client;
    }

    if (formValue.project !== null && formValue.project !== undefined) {
      params.ProjectIds = formValue.project;
    }
    if (formValue.billable?.value) params.Billable = formValue.billable.value;
    if (formValue.status?.value) params.Statuses = formValue.status.value;
    const queryString = new URLSearchParams(params).toString();
    this.http.getDataIncludeParams(`TimesheetReport/get?${queryString}&page=${page}&pageSize=${pageSize}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
           this.collectionSize = res.data.totalCount;
        this.spinnerLoader1 = false;
        if (res.success && res.data?.items) {
          this.filteredmytimesheetRecord = res.data.items;
          this.disableBtn = false;
        } else {
          this.filteredmytimesheetRecord = [];
        }
      },
      error: (err) => {
        this.spinnerLoader1 = false;
         this.conformationPopup.openErrorModal(err.error.message);
        console.error('Error fetching report:', err);
        this.filteredmytimesheetRecord = [];
        this.disableBtn = true;
      },
    });
  }


  exportToExcelYearly(): void {
    // Define header mappings
    this.spinnerLoader2 = true;
    const HEADER_MAPPINGS: { [key: string]: string } = {
      fusionEmpId: 'EMPLOYEE ID',
      employeeName: 'EMPLOYEE NAME',
      department: 'DEPARTMENT',
      teamManagerName: 'TEAM MANAGER',
      location: 'LOCATION',
      sublocation: 'SUB LOCATION',
      shift: 'SHIFT',
      leaveType: 'LEAVE TYPE',
      startdate: 'LEAVE START DATE',
      enddate: 'LEAVE END DATE',
      availed: 'AVAILED',
      appliedDate: 'APPLIED DATE',
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
      'LEAVE START DATE',
      'LEAVE END DATE',
      'AVAILED',
      'APPLIED DATE',
      'DAYS'
    ];

    // Function to format date in dd-MMM-yyyy format
    const formatDate = (dateString: string): string => {
      const date = new Date(dateString);
      const options = { day: '2-digit', month: 'short', year: 'numeric' } as const;
      return date.toLocaleDateString('en-GB', options).replace(/ /g, '-');
    };

    // Modify data with renamed headers and new sequence
    const modifiedData = this.filteredmytimesheetRecord.map(record => {
      const modifiedRecord: any = {};
      NEW_SEQUENCE.forEach(columnName => {
        const originalColumnName = Object.keys(HEADER_MAPPINGS).find(key => HEADER_MAPPINGS[key] === columnName);
        if (originalColumnName && record.hasOwnProperty(originalColumnName)) {
          if (originalColumnName === 'startdate' || originalColumnName === 'enddate' || originalColumnName === 'appliedDate') {
            // Extract the year part from the date
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
    XLSX.utils.sheet_add_aoa(ws, [['LEAVE REPORT']], { origin: 'A1' });

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
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Report');
    XLSX.writeFile(wb, 'Leave_Report.xlsx');
    this.spinnerLoader2 = false;
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

  onClick(employeeIds: any) {
    if (employeeIds.value) {
      this.filteredleaveRecords = true;
      this.selectLeaveEmployeeIds = [];
      this.selectedEmployeeId = [];
      if (employeeIds.value.employeeId == this.loggedInUser.employeeId) {
        this.selectLeaveEmployeeIds = this.getEmployeeInfo.filter((employee: any) =>
          employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
        this.selectedEmployeeId = this.getEmployeeInfo.filter((employee: any) =>
          employee.employeeId !== this.loggedInUser.employeeId).map((employee: any) => employee.employeeId);
      } else {
        this.selectLeaveEmployeeIds.push(employeeIds.value.employeeId);
        this.selectedEmployeeId.push(employeeIds.value.employeeId);
      }
    }
  }

  getMyTeam() {
    const EmployeeId = this.loggedInUser?.employeeId;
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
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
                firstName, //  trimmed
                fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
              };
            })
            .sort((a: any, b: any) =>
              a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase()) //  Alphabetical by first name
            );

          // Insert "All Employees" at the top
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


  // isAnyFilterApplied(): boolean {
  //   const form = this.LeaveReportForm.value;
  //   return !!(form.dateRange || form.employee || form.manager || form.team || form.leaveCategory);
  // }

  navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}

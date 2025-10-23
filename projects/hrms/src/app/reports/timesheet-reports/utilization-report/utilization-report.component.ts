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
import { OpenModalService } from '../../../services/open-modal.service';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-utilization-report',
imports: [DatePicker, CommonModule, MultiSelectModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, ReportsHeaderComponent],
  templateUrl: './utilization-report.component.html',
  styleUrl: './utilization-report.component.scss'
})
export class UtilizationReportComponent {
  moduleinfo: string = '';
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredpendingapprovalRecord: any[] = [];
  projectsData: any[] = [];
  teamdetails = [] as any[];
  selectedEmployeeId: any = null;
  selectedWfhManager: string | null = null;
  selectedMonth: string | null = null;
  selectedLeave: string | null = null;
  selectedYear: string | null = null;
  uniqueLeaveCategory: any[] = [];
  years: number[] = [new Date().getFullYear() - 1, new Date().getFullYear(), new Date().getFullYear() + 1];
  UtilizationReportForm!: FormGroup;
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
  clientsData: any[] = [];
  clientDropdownList: { label: string; value: number }[] = [];
  projectsList: any[] = [];
  projectId: any;
  isDistinct = true;
  employeeData: any[] = [];
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
    this.getClientsData();
  }

  initializeForm() {
    this.UtilizationReportForm = this.fb.group({
      clientId: [null],
      projectId: [{ value: null, disabled: true }],
      employeid: [{ value: null, disabled: true }],
      dateRange: [null],
      billable: [null]
    });
    this.UtilizationReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  clearAllFilters(): void {
    this.UtilizationReportForm.reset();
    this.filteredpendingapprovalRecord = [];
    this.UtilizationReportForm.get('projectId')?.disable();
    this.UtilizationReportForm.get('employeid')?.disable();
     this.collectionSize = 0;
  }
  // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generateUtilizationReport(this.page, this.pageSize);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.generateUtilizationReport(this.page, this.pageSize);
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.generateUtilizationReport(this.page, this.pageSize);
  }
  getClientsData(): void {
    this.http.getData(`Client/GetAll?status=Active`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          if (Array.isArray(res?.data)) {
            this.clients = res.data;

            // 🔹 Add "No Client" option only once
            const noClientExists = this.clients.some((c: any) => c.clientId === 0);
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
            // 🔹 Create dropdown list
            this.clientDropdownList = this.clients.map((client: any) => ({
              label: client.clientName,
              value: client.clientId
            }));
          } else {
            this.clients = [];
            this.clientDropdownList = [];
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error fetching clients:', err);
        }
      });
  }

  getProjectsByClientId(clientId: number): void {
    //If "No Client" selected, show only "No Project"
    if (clientId === 0) {
      this.projectsList = [
        { label: 'No Project', value: 0 }
      ];
      return;
    }

    if (!clientId) return;
    this.loading = true;

    this.http.getData(`Project?clientId=${clientId}&status=Active`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          if (Array.isArray(res?.data)) {
            this.projectsList = res.data.map((project: any) => ({
              label: project.projectName,
              value: project.projectId
            }));
          } else {
            this.projectsList = [];
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error fetching projects:', err);
        }
      });
  }



  onClientChange(event: any): void {
    const clientId = event.value;
    this.UtilizationReportForm.patchValue({ projectId: null }); // reset project
    this.UtilizationReportForm.get('projectId')?.enable();
    this.UtilizationReportForm.get('employeid')?.disable();
    this.UtilizationReportForm.get('employeid')?.setValue([]);
    this.getProjectsByClientId(clientId);
  }
  /** When project selected */
  onProjectChange(event: any) {
    const selectedProjectId = event.value;
    this.employeeData = [];
    this.UtilizationReportForm.get('employeid')?.setValue([]);
    if (selectedProjectId && selectedProjectId !== 0) {
      this.projectId = selectedProjectId;
      this.UtilizationReportForm.get('employeid')?.enable();
      this.getAllActiveEmployees();
    } else {
      this.getTeamManagersDetails();
      this.projectId = 0;
      // Wait briefly to ensure getTeamManagersDetails() completes (optional)
      setTimeout(() => {
        if (this.getEmployeeInfo?.length) {
          this.employeeData = this.getEmployeeInfo.map((emp: any) => ({
            id: emp.employeeId,
            name: emp.fullName
          }));
          this.UtilizationReportForm.get('employeid')?.enable();
        }
      }, 300);
    }
  }

  getTeamManagersDetails() {
    const EmployeeId = this.empinfo.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
      .subscribe({
        next: (response: any) => {
          if (response && response.length) {
            const myTeam = response.filter((e: any) => e.isAccess);
            this.getEmployeeInfo = myTeam.map((employee: any) => ({
              employeeId: employee.employeeId,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName}${employee.middleName ? ' ' + employee.middleName : ''}${employee.lastName ? ' ' + employee.lastName : ''}`,
            }));
          } else {
            this.getEmployeeInfo = [];
          }
        },
        error: (err) => {
          console.error('Error fetching team manager details:', err);
          this.getEmployeeInfo = [];
        }
      });
  }
  /** Get all active employees for selected project */
  getAllActiveEmployees() {
    this.http.getData(`ProjectResource?status=Active&entityType=project&entityRefId=${this.projectId}&isDistinct=${this.isDistinct}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.employeeData = res?.data?.map((x: any) => x.employee) ?? [];
          // if (this.employeeData.length > 0) {
          this.UtilizationReportForm.get('employeid')?.enable();
          // }
        },
        error: (err) => {
          console.error('Error fetching employees:', err);
          this.employeeData = [];
        }
      });
  }

  getAllActiveProjects() {
    this.http
      .getData(`Project?status=Active&projectAuthorityId=${this.empinfo.employeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const projects = res?.data || [];

          this.projectsData = projects.map((p: any) => ({
            ...p,
            //  displayName: `${p.client?.clientName || 'Unknown Client'} - ${p.projectName || 'Unnamed Project'}`
            displayName: `${p.client?.clientName || 'Unknown Client'}`,
            displayprojectName: `${p.projectName || 'Unnamed Project'}`
          }));

          this.projectsData.unshift({
            projectId: 0,
            displayName: 'No Client',
            displayprojectName: 'No Project'
          });
        },
        error: (err) => {
          console.error('Error fetching projects:', err);

          this.projectsData = [
            {
              projectId: 0,
              displayName: 'No Client',
              displayprojectName: 'No Project'
            }
          ];
        },
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

  get isLeaveGenerateDisabled(): boolean {
    const { clientId, projectId, employeid, dateRange,billable } = this.UtilizationReportForm.value;

    const hasClient = clientId !== null && clientId !== undefined;
    const hasProject = projectId !== null && projectId !== undefined;
    const hasDateRange = dateRange && (dateRange.startDate || dateRange.endDate);
    const hasBillable = billable !== null && billable !== undefined;
    const hasEmployeid = employeid !== null && employeid !== undefined;

    return !(hasClient || hasProject || hasDateRange || hasBillable || hasEmployeid);
  }

  generateUtilizationReport(page: number, pageSize: number) {
    if (this.UtilizationReportForm.invalid) {
      return;
    }
    this.spinnerLoader1 = true;
    const formValue = this.UtilizationReportForm.value;
    const employeeId = this.empinfo?.employeeId || 0;
    const startDate = formValue.dateRange?.[0] ? new Date(formValue.dateRange[0]).toISOString() : null;
    const endDate = formValue.dateRange?.[1] ? new Date(formValue.dateRange[1]).toISOString() : null;
    const params: any = {
      ReportType: 'Utilization',
      EmployeeIds: employeeId,
    };
    if (startDate) params.StartDate = startDate;
    if (endDate) params.EndDate = endDate;
    if (formValue.clientId !== null && formValue.clientId !== undefined) {
      params.ClientIds = formValue.clientId;
    }

    if (formValue.projectId !== null && formValue.projectId !== undefined) {
      params.ProjectIds = formValue.projectId;
    }
    if (formValue.employeid !== null && formValue.employeid !== undefined) {
      params.EmployeeIds = formValue.employeid;
    }
    if (formValue.billable?.value) params.billable = formValue.billable.value;
    const queryString = new URLSearchParams(params).toString();
    this.http.getDataIncludeParams(`TimesheetReport/get?${queryString}&page=${page}&pageSize=${pageSize}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.collectionSize = res.data.totalCount;
        this.spinnerLoader1 = false;
        if (res.success && res.data?.items) {
          this.filteredpendingapprovalRecord = res.data.items;
          this.disableBtn = false;
        } else {
          this.filteredpendingapprovalRecord = [];
        }
      },
      error: (err) => {
        this.spinnerLoader1 = false;
        this.conformationPopup.openErrorModal(err.error.message);
        console.error('Error fetching report:', err);
        this.filteredpendingapprovalRecord = [];
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
    const modifiedData = this.filteredpendingapprovalRecord.map(record => {
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
      //   this.filteredtimesheetsummeryRecord = true;
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


  navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
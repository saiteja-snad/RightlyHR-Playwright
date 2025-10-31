import { Component, OnDestroy, OnInit } from '@angular/core';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { AuthService } from '../../../services/auth.service';
import { ReportsService } from '../../../services/reports/reports.service';
import { HttpService } from '../../../services/http.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { DropdownModule } from 'primeng/dropdown';
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Client } from '../../../clients.model';
import { OpenModalService } from '../../../services/open-modal.service';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-timesheet-summery-report',
  imports: [DatePicker, CommonModule, MultiSelectModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, ReportsHeaderComponent],
  templateUrl: './timesheet-summery-report.component.html',
  styleUrl: './timesheet-summery-report.component.scss'
})
export class TimesheetSummeryReportComponent {
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredtimesheetsummeryRecord: any[] = [];
  projectsData: any[] = [];
  TimesheetSummeryReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;
  filteredleaveRecords = false;
  destroy$ = new Subject<boolean>();
  empinfo: any;
  clients: Client[] = [];
  clientsData: any[] = [];
  clientDropdownList: { label: string; value: number }[] = [];
  projectsList: any[] = [];
  projectId: any;
  isDistinct = true;
  employeeData: any[] = [];
  loading: boolean = true;
  noclientproject = false;
  getEmployeeInfo = [] as any;
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
  today: Date = new Date();
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
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getClientsData();
  }

  initializeForm() {
    this.TimesheetSummeryReportForm = this.fb.group({
      clientId: [null],
      projectId: [{ value: null, disabled: true }],
      employeid: [{ value: null, disabled: true }],
      dateRange: [null],
      billable: [null]
    });
    this.TimesheetSummeryReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  isFilterApplied(): boolean {
    const formValue = this.TimesheetSummeryReportForm.value;

    return (
      (formValue.clientId !== null && formValue.clientId !== undefined && formValue.clientId !== '') ||
      (formValue.projectId !== null && formValue.projectId !== undefined && formValue.projectId !== '') ||
      (formValue.employeid && formValue.employeid.value !== null && formValue.employeid.value !== undefined) ||
      (formValue.belaible && formValue.belaible.value !== null && formValue.belaible.value !== undefined) ||
      (formValue.dateRange && Array.isArray(formValue.dateRange) && formValue.dateRange.length > 0)
    );
  }

  clearAllFilters(): void {
    this.TimesheetSummeryReportForm.reset();
    this.filteredtimesheetsummeryRecord = [];
    this.TimesheetSummeryReportForm.get('projectId')?.disable();
    this.TimesheetSummeryReportForm.get('employeid')?.disable();
    this.collectionSize = 0;
  }
  // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generatetimesheetSummeryReport(this.page, this.pageSize);
  }
  onGenerate() {
    this.generatetimesheetSummeryReport(this.page, this.pageSize, true, true);
  }
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.generatetimesheetSummeryReport(this.page, this.pageSize, false, false);
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.generatetimesheetSummeryReport(this.page, this.pageSize, false, false);
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
    this.TimesheetSummeryReportForm.patchValue({ projectId: null }); // reset project
    this.TimesheetSummeryReportForm.get('projectId')?.enable();
    this.TimesheetSummeryReportForm.get('employeid')?.disable();
    this.TimesheetSummeryReportForm.get('employeid')?.setValue([]);
    this.getProjectsByClientId(clientId);
  }
  /** When project selected */
  onProjectChange(event: any) {
    const selectedProjectId = event.value;
    this.employeeData = [];
    this.TimesheetSummeryReportForm.get('employeid')?.setValue([]);
    if (selectedProjectId && selectedProjectId !== 0) {
      this.projectId = selectedProjectId;
      this.TimesheetSummeryReportForm.get('employeid')?.enable();
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
          this.TimesheetSummeryReportForm.get('employeid')?.enable();
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
         // this.employeeData = res?.data?.map((x: any) => x.employee) ?? [];
           this.employeeData =
          res?.data?.map((x: any) => ({
            id: x.employee?.id,
            name: x.employee?.fusionEmployeeId
              ? `${x.employee.fusionEmployeeId} - ${x.employee.name}`
              : x.employee?.name || 'Unknown'
          })) ?? [];
          this.TimesheetSummeryReportForm.get('employeid')?.enable();
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

  get isLeaveGenerateDisabled(): boolean {
    const { clientId, projectId, employeid, dateRange, belaible } = this.TimesheetSummeryReportForm.value;

    const hasClient = clientId !== null && clientId !== undefined;
    const hasProject = projectId !== null && projectId !== undefined;
    const hasDateRange = dateRange && (dateRange.startDate || dateRange.endDate);
    const hasBillable = belaible !== null && belaible !== undefined;
    const hasEmployeid = employeid !== null && employeid !== undefined;

    return !(hasClient || hasProject || hasDateRange || hasBillable || hasEmployeid);
  }

  // buildTimesheetReportParams() {
  //   const formValue = this.TimesheetSummeryReportForm.value;
  //   const employeeId = this.empinfo?.employeeId || 0;

  //  // format date as MM/dd/yyyy
  //   const formatDate = (date: Date | null) => {
  //     if (!date) return null;
  //     const d = new Date(date);
  //     const month = String(d.getMonth() + 1).padStart(2, '0');
  //     const day = String(d.getDate()).padStart(2, '0');
  //     const year = d.getFullYear();
  //     return `${month}/${day}/${year}`;
  //   };


  //   const startDate = formValue.dateRange?.[0] ? formatDate(formValue.dateRange[0]) : null;
  //   const endDate = formValue.dateRange?.[1] ? formatDate(formValue.dateRange[1]) : null;
  //   const params: any = {
  //     ReportType: 'TimesheetSummaryMonth',
  //     EmployeeIds: employeeId,
  //   };
  //   if (startDate) params.StartDate = startDate;
  //   if (endDate) params.EndDate = endDate;
  //   if (formValue.clientId !== null && formValue.clientId !== undefined) {
  //     params.ClientIds = formValue.clientId;
  //   }

  //   if (formValue.projectId !== null && formValue.projectId !== undefined) {
  //     params.ProjectIds = formValue.projectId;
  //   }
  //   if (formValue.employeid !== null && formValue.employeid !== undefined) {
  //     params.EmployeeIds = formValue.employeid;
  //   }
  //   if (formValue.belaible?.value) params.Billable = formValue.belaible.value;
  //   return params;
  // }
  buildTimesheetReportParams() {
    const formValue = this.TimesheetSummeryReportForm.value;
    const employeeId = this.empinfo?.employeeId || 0;

    // Helper to format date as MM/dd/yyyy
    const formatDate = (date: Date | null) => {
      if (!date) return null;
      const d = new Date(date);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    };

    // Determine startDate and endDate
    let startDate: string | null = null;
    let endDate: string | null = null;

    if (formValue.dateRange?.[0] && formValue.dateRange?.[1]) {
      // Use selected date range
      startDate = formatDate(formValue.dateRange[0]);
      endDate = formatDate(formValue.dateRange[1]);
    } else {
      // Default to current month's start date and today's date
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startDate = formatDate(firstDayOfMonth);
      endDate = formatDate(today);
    }

    // Build params
    const params: any = {
      ReportType: 'TimesheetSummaryMonth',
      // EmployeeIds: employeeId,
      StartDate: startDate,
      EndDate: endDate
    };

    // Optional filters
    if (formValue.clientId !== null && formValue.clientId !== undefined) {
      params.ClientIds = formValue.clientId;
    }

    if (formValue.projectId !== null && formValue.projectId !== undefined) {
      params.ProjectIds = formValue.projectId;
    }

    if (formValue.employeid !== null && formValue.employeid !== undefined) {
      params.EmployeeIds = formValue.employeid;
    }

    if (formValue.billable?.value) {
      params.Billable = formValue.billable.value;
    }

    return params;
  }

  generatetimesheetSummeryReport(page: number, pageSize: number, showLoader: boolean = true, resetPagination: boolean = false) {
    if (this.TimesheetSummeryReportForm.invalid) return;
    // Only reset pagination when explicitly requested
    if (resetPagination) {
      this.page = 1;
      this.first = 0;
    }

    if (showLoader) this.spinnerLoader1 = true;

    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();

    this.http.getDataIncludeParams(`TimesheetReport/get?${queryString}&page=${this.page}&pageSize=${this.pageSize}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.spinnerLoader1 = false;

          if (res.success && res.data?.items) {
            this.filteredtimesheetsummeryRecord = res.data.items;
            this.collectionSize = res.data.totalCount || 0;

            // If total count smaller than current offset, go back to first
            if (this.first >= this.collectionSize) {
              this.first = 0;
              this.page = 1;
            }

            this.disableBtn = false;
          } else {
            this.filteredtimesheetsummeryRecord = [];
            this.collectionSize = 0;
          }
        },
        error: (err) => {
          this.spinnerLoader1 = false;
          console.error('Error fetching report:', err);
          this.filteredtimesheetsummeryRecord = [];
          this.collectionSize = 0;
          this.disableBtn = true;
        },
      });
  }

  exportTimesheetSummery() {
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();

    this.http.downloadTimesheetReport(
      `TimesheetReport/export-report?${queryString}&page=${this.page}&pageSize=${this.pageSize}`
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        // Extract filename from Content-Disposition
        let filename = 'TimesheetSummery.xlsx';
        const contentDisposition = response.headers.get('content-disposition');

        if (contentDisposition) {
          // Handle both regular and UTF-8 encoded filenames
          const utf8FilenameMatch = contentDisposition.match(/filename\*\=UTF\-8''([^;]+)/);
          const asciiFilenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);

          if (utf8FilenameMatch && utf8FilenameMatch[1]) {
            filename = decodeURIComponent(utf8FilenameMatch[1]);
          } else if (asciiFilenameMatch && asciiFilenameMatch[1]) {
            filename = asciiFilenameMatch[1];
          }
        }

        // Download the blob as before
        const blob = new Blob([response.body!], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        console.log('Downloaded file:', filename);
        this.conformationPopup.openSuccessModal("Report Exported Successfully");
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal('No records found');
      },
      complete: () => { }
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


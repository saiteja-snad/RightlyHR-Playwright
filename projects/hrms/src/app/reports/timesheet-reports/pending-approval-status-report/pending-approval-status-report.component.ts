

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
import { IemployeeDetails } from '../../../Interfaces/letters-model';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { ClientData } from '../../../clients.model';
import { OpenModalService } from '../../../services/open-modal.service';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-pending-approval-status-report',
  imports: [DatePicker, CommonModule, NgbPopoverModule, MultiSelectModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, ReportsHeaderComponent, InfoIconComponent],
  templateUrl: './pending-approval-status-report.component.html',
  styleUrl: './pending-approval-status-report.component.scss'
})
export class PendingApprovalStatusReportComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredpendingapprovalRecord: any[] = [];
  projectsData: any[] = [];
  PendingApprovalReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  disableBtn = false;
  filteredleaveRecords = false;
  destroy$ = new Subject<boolean>();
  empinfo: any;
  clients: ClientData[] = [];
  clientsData: any[] = [];
  clientDropdownList: { label: string; value: number }[] = [];
  projectsList: any[] = [];
  projectId: any;
  isDistinct = true;
  employeeData: any[] = [];
  loading: boolean = true;
  noclientproject = false;
  getEmployeeInfo = [] as any;
    employeeiddetails: any[] = [];
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
     this.getEmployeeData();
  }

  initializeForm() {
    this.PendingApprovalReportForm = this.fb.group({
      clientId: [null],
      projectId: [{ value: null, disabled: true }],
        employeid: [[]],
      dateRange: [null],
      status: [null]
    });
    this.PendingApprovalReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  // clearAllFilters(): void {
  //   this.PendingApprovalReportForm.reset();
  //   this.filteredpendingapprovalRecord = [];
  //   this.PendingApprovalReportForm.get('projectId')?.disable();
  //    this.getEmployeeData();
  //   // this.PendingApprovalReportForm.get('employeid')?.disable();
  //   this.collectionSize = 0;
  // }
clearAllFilters(): void {
  // Reset form
  this.PendingApprovalReportForm.reset();

  // Clear filtered data and pagination
  this.filteredpendingapprovalRecord = [];
  this.collectionSize = 0;
  this.first = 0;
  this.page = 1;

  // Disable dependent dropdowns
  this.PendingApprovalReportForm.get('projectId')?.disable();
   this.PendingApprovalReportForm.get('employeid')?.enable();

  // Clear employee-related data
  this.employeeData = [];
  this.employeeiddetails = [];
  this.getEmployeeInfo = [];

  // Re-fetch all active employees (default state)
  this.getEmployeeData();

  // Optional: Reset project list
  this.projectsList = [];

  // Optional: Reset disable button flag
  this.disableBtn = true;
}

  isFilterApplied(): boolean {
    const formValue = this.PendingApprovalReportForm.value;
    return (
      (formValue.clientId !== null && formValue.clientId !== undefined && formValue.clientId !== '') ||
      (formValue.projectId !== null && formValue.projectId !== undefined && formValue.projectId !== '') ||
       (Array.isArray(formValue.employeid) && formValue.employeid.length > 0) ||
      // (formValue.employeid && formValue.employeid.value !== null && formValue.employeid.value !== undefined) ||
       (formValue.employeid && formValue.employeid.value !== null && formValue.employeid.value !== undefined) ||
      (formValue.status && formValue.status.value !== null && formValue.status.value !== undefined) ||
      (formValue.dateRange && Array.isArray(formValue.dateRange) && formValue.dateRange.length > 0)
    );
  }
  onGenerate() {
    this.generatependingapprovalReport(this.page, this.pageSize, true, true);
  }

  // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generatependingapprovalReport(this.page, this.pageSize);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.generatependingapprovalReport(this.page, this.pageSize, false, false);
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.generatependingapprovalReport(this.page, this.pageSize, true, true);
  }
  // get all client
  getClientsData(): void {
    this.http.getData(`Client/GetAll?status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (Array.isArray(res?.data)) {
          this.clients = res.data;
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
    // admin access all employee
  getEmployeeData() {
    const loggedInUser = this.authService.getToken();
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        const employeedata = (data || [])
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
          .filter((employee: any) => employee.employeeId !== loggedInUser.employeeId).sort((a: any, b: any) =>
            a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase())
          );
        // Store all employees (including “All Employees” at the top)
        this.employeeiddetails = [
          ...employeedata
        ];

        // Step 2: Map for the dropdown component
        this.employeeData = this.employeeiddetails.map((e: any) => ({
          id: e.employeeId,
          name: e.fullName
        }));
        // (Optional) log to verify
        console.log('Employee dropdown data:', this.employeeData);
      },
      error: (reason: any) => {
        console.error('Error fetching employees:', reason);
        this.employeeData = [];
      },
    });
  }
  // on client change
  onClientChange(event: any): void {
    const clientId = event.value;
    this.PendingApprovalReportForm.patchValue({ projectId: null }); // reset project
    this.PendingApprovalReportForm.get('projectId')?.enable();
    this.PendingApprovalReportForm.get('employeid')?.disable();
    this.PendingApprovalReportForm.get('employeid')?.setValue([]);
    this.getProjectsByClientId(clientId);
  }
  // client change get project
  getProjectsByClientId(clientId: number): void {
    //If "No Client" selected, show only "No Project"
    if (clientId === 0) {
      this.projectsList = [
        { label: 'No Project', value: 0 }
      ]; return;
    }
    if (!clientId) return;
    this.loading = true;
    this.http.getData(`Project?clientId=${clientId}&status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
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
  /** When project selected */
  onProjectChange(event: any) {
    const selectedProjectId = event.value;
    this.employeeData = [];
    this.PendingApprovalReportForm.get('employeid')?.setValue([]);
    if (selectedProjectId && selectedProjectId !== 0) {
      this.projectId = selectedProjectId;
      this.PendingApprovalReportForm.get('employeid')?.enable();
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
          this.PendingApprovalReportForm.get('employeid')?.enable();
        }
      }, 300);
    }
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
          // if (this.employeeData.length > 0) {
          this.PendingApprovalReportForm.get('employeid')?.enable();
          // }
        },
        error: (err) => {
          console.error('Error fetching employees:', err);
          this.employeeData = [];
        }
      });
  }

  // if no project select get resouces name
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

  // generate,export button show,hide
  get isLeaveGenerateDisabled(): boolean {
    const { clientId, projectId, employeid, dateRange, status } = this.PendingApprovalReportForm.value;
    const hasClient = clientId !== null && clientId !== undefined;
    const hasProject = projectId !== null && projectId !== undefined;
    const hasDateRange = dateRange && (dateRange.startDate || dateRange.endDate);
    const hasStatus = status !== null && status !== undefined;
    const hasEmployeid = employeid !== null && employeid !== undefined;
    return !(hasClient || hasProject || hasDateRange || hasStatus || hasEmployeid);
  }
  // payload for pending approval
  buildTimesheetReportParams() {
    const formValue = this.PendingApprovalReportForm.value;
    const employeeId = this.empinfo?.employeeId || 0;
    // format date as MM/dd/yyyy
    const formatDate = (date: Date | null) => {
      if (!date) return null;
      const d = new Date(date);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const year = d.getFullYear();
      return `${month}/${day}/${year}`;
    };
    const startDate = formValue.dateRange?.[0] ? formatDate(formValue.dateRange[0]) : null;
    const endDate = formValue.dateRange?.[1] ? formatDate(formValue.dateRange[1]) : null;
    const params: any = {
      ReportType: 'PendingApproval',
      // EmployeeIds: employeeId,
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
    if (formValue.status?.value) params.Statuses = formValue.status.value;
    return params;
  }
  // generate the report
  generatependingapprovalReport(page: number, pageSize: number, showLoader: boolean = true, resetPagination: boolean = false) {
    if (this.PendingApprovalReportForm.invalid) return;
    // Only reset pagination when explicitly requested
    if (resetPagination) {
      this.page = 1;
      this.first = 0;
    }
    if (showLoader) this.spinnerLoader1 = true;
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();
    this.http.getDataIncludeParams(`TimesheetReport/get?${queryString}&page=${this.page}&pageSize=${this.pageSize}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.spinnerLoader1 = false;
        if (res.success && res.data?.items) {
          this.filteredpendingapprovalRecord = res.data.items;
          this.collectionSize = res.data.totalCount || 0;
          // If total count smaller than current offset, go back to first
          if (this.first >= this.collectionSize) {
            this.first = 0;
            this.page = 1;
          }
          this.disableBtn = false;
        } else {
          this.filteredpendingapprovalRecord = [];
          this.collectionSize = 0;
        }
      },
      error: (err) => {
        this.spinnerLoader1 = false;
        console.error('Error fetching report:', err);
        this.filteredpendingapprovalRecord = [];
        this.collectionSize = 0;
        this.disableBtn = true;
      },
    });
  }
  // export the report
  exportPendingApprovalReport() {
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();
    this.http.downloadTimesheetReport(
      `TimesheetReport/export-report?${queryString}&page=${this.page}&pageSize=${this.pageSize}`
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        // Extract filename from Content-Disposition
        let filename = 'PendingApprovalReport.xlsx';
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
        //  Download the blob as before
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
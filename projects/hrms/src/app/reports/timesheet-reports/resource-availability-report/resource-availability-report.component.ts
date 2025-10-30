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
import { Client } from '../../../clients.model';
import { OpenModalService } from '../../../services/open-modal.service';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { HttpResponse } from '@angular/common/http';
@Component({
  selector: 'app-resource-availability-report',
  imports: [DatePicker, CommonModule, MultiSelectModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, ReportsHeaderComponent],
  templateUrl: './resource-availability-report.component.html',
  styleUrl: './resource-availability-report.component.scss'
})
export class ResourceAvailabilityReportComponent {
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredResourceAvailabilityRecord: any[] = [];
  projectsData: any[] = [];
  ResourceAvailabilityReportForm!: FormGroup;
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
    this.getProjectsData();
  }

  initializeForm() {
    this.ResourceAvailabilityReportForm = this.fb.group({
      projectId: [null],
      employeid: [{ value: null, disabled: true }],
      dateRange: [null]
    });
    this.ResourceAvailabilityReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

  isFilterApplied(): boolean {
    const formValue = this.ResourceAvailabilityReportForm.value;

    return (
      (formValue.projectId !== null && formValue.projectId !== undefined && formValue.projectId !== '') ||
      (formValue.employeid && formValue.employeid.value !== null && formValue.employeid.value !== undefined) ||
      (formValue.dateRange && Array.isArray(formValue.dateRange) && formValue.dateRange.length > 0)
    );
  }
  clearAllFilters(): void {
    this.ResourceAvailabilityReportForm.reset();
    this.filteredResourceAvailabilityRecord = [];
    this.ResourceAvailabilityReportForm.get('employeid')?.disable();
    this.collectionSize = 0;
  }
  // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generateResourceAvailabilityReport(this.page, this.pageSize);
  }

  onGenerate() {
    this.generateResourceAvailabilityReport(this.page, this.pageSize, true, true);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.generateResourceAvailabilityReport(this.page, this.pageSize, false, false);
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.generateResourceAvailabilityReport(this.page, this.pageSize, true, true);
  }

  getProjectsData(): void {
    this.loading = true;
    this.http.getData(`Project?status=Active`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loading = false;

          if (Array.isArray(res?.data)) {
            // Store the raw project data
            this.projectsList = res.data.map((project: any) => ({
              label: project.projectName + (project.client?.clientName ? ` (${project.client.clientName})` : ''),
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
    this.ResourceAvailabilityReportForm.patchValue({ projectId: null }); // reset project
    this.ResourceAvailabilityReportForm.get('projectId')?.enable();
    this.ResourceAvailabilityReportForm.get('employeid')?.disable();
    this.ResourceAvailabilityReportForm.get('employeid')?.setValue([]);
  }

  /** When project selected */
  onProjectChange(event: any) {
    const selectedProjectId = event.value;
    this.employeeData = [];
    this.ResourceAvailabilityReportForm.get('employeid')?.setValue([]);
    if (selectedProjectId && selectedProjectId !== 0) {
      this.projectId = selectedProjectId;
      this.ResourceAvailabilityReportForm.get('employeid')?.enable();
      this.getAllActiveEmployees();
    } else {
      this.projectId = 0;
      // Wait briefly to ensure getTeamManagersDetails() completes (optional)
      setTimeout(() => {
        if (this.getEmployeeInfo?.length) {
          this.employeeData = this.getEmployeeInfo.map((emp: any) => ({
            id: emp.employeeId,
            name: emp.fullName
          }));
          this.ResourceAvailabilityReportForm.get('employeid')?.enable();
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
          this.ResourceAvailabilityReportForm.get('employeid')?.enable();
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
    const { projectId, employeid, dateRange } = this.ResourceAvailabilityReportForm.value;

    const hasProject = projectId !== null && projectId !== undefined;
    const hasDateRange = dateRange && (dateRange.startDate || dateRange.endDate);
    const hasEmployeid = employeid !== null && employeid !== undefined;

    return !(hasProject || hasDateRange || hasEmployeid);
  }

  buildTimesheetReportParams() {
    const formValue = this.ResourceAvailabilityReportForm.value;
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
      ReportType: 'ResourceAvailability',
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
    if (formValue.billable?.value) params.billable = formValue.billable.value;
    return params;
  }

  generateResourceAvailabilityReport(page: number, pageSize: number, showLoader: boolean = true, resetPagination: boolean = false) {
    if (this.ResourceAvailabilityReportForm.invalid) return;
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
            this.filteredResourceAvailabilityRecord = res.data.items;
            this.collectionSize = res.data.totalCount || 0;
            // If total count smaller than current offset, go back to first
            if (this.first >= this.collectionSize) {
              this.first = 0;
              this.page = 1;
            }

            this.disableBtn = false;
          } else {
            this.filteredResourceAvailabilityRecord = [];
            this.collectionSize = 0;
          }
        },
        error: (err) => {
          this.spinnerLoader1 = false;
          console.error('Error fetching report:', err);
          this.filteredResourceAvailabilityRecord = [];
          this.collectionSize = 0;
          this.disableBtn = true;
        },
      });
  }

  exportResourceAvailabilityReport() {
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();

    this.http.downloadTimesheetReport(
      `TimesheetReport/export-report?${queryString}&page=${this.page}&pageSize=${this.pageSize}`
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        // Extract filename from Content-Disposition
        let filename = 'ResourceAvailabilityReport.xlsx';
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
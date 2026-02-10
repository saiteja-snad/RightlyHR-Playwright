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
  phasesData:any =[];
  today: Date = new Date();
  employeeiddetails: any[] = [];
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
    this.getEmployeeData();
  }

  initializeForm() {
    this.ResourceAvailabilityReportForm = this.fb.group({
      projectId: [null],
      employeid: [null],
      dateRange: [null],
      phases: [{ value: null, disabled: true }]
    });
    this.ResourceAvailabilityReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }
  isFilterApplied(): boolean {
    const formValue = this.ResourceAvailabilityReportForm.value;
    const isProjectSelected = Array.isArray(formValue.projectId) ? formValue.projectId.length > 0 : !!formValue.projectId;
    const isEmployeeSelected = Array.isArray(formValue.employeid) ? formValue.employeid.length > 0 : !!formValue.employeid;
    const isDateRangeSelected = Array.isArray(formValue.dateRange) ? formValue.dateRange.length > 0 : !!formValue.dateRange;
    const isPhaseSelected = formValue.phases != null && formValue.phases.value != null;
    return (isProjectSelected ||isEmployeeSelected ||isDateRangeSelected ||isPhaseSelected);
  }
  filteredProjects: any[] | undefined | null;
  clearAllFilters(): void {
    this.filteredProjects = null;
    this.phasesData = [];
    this.ResourceAvailabilityReportForm.reset();
    this.filteredResourceAvailabilityRecord = [];
    // this.ResourceAvailabilityReportForm.get('employeid')?.disable();
    this.ResourceAvailabilityReportForm.get('phases')?.setValue(null);
    // reset specific controls properly
    this.ResourceAvailabilityReportForm.get('employeid')?.setValue([]);
    this.ResourceAvailabilityReportForm.get('projectId')?.setValue(null);
    this.ResourceAvailabilityReportForm.get('dateRange')?.setValue(null);
    this.ResourceAvailabilityReportForm.get('phases')?.setValue(null);
    this.collectionSize = 0;
    this.ResourceAvailabilityReportForm.get('phases')?.disable();
    this.getEmployeeData();
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
  // project data will show 
  getProjectsData() {
    this.loading = true;
    this.http.getData('v2/Project?status=Active').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsData = res?.data ?? [];
        // Add "No Project" only if not already present
        const noProjectExists = this.projectsData?.some((p: any) => p.projectId === 0);
        if (!noProjectExists) {
          this.projectsData.unshift({
            projectId: 0,
            projectName: 'No Project',
            clientId: 0,
            isNoClientProject: true,
          });
        }
        // Map for dropdown
        this.projectsList = this.projectsData.map((project: any) => ({
          label: project.projectName,
          value: project.projectId,
        }));
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.loading = false;
        this.projectsData = [];
        this.projectsList = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
  // admin access all employee
  getEmployeeData() {
    const loggedInUser = this.authService.getToken();
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({next: (data: any) => {
        const employeedata = (data || []).map((employee: any) => {
            const firstName = employee.firstName ? employee.firstName.trim() : '';
            const middleName = employee.middleName ? employee.middleName.trim() : '';
            const lastName = employee.lastName ? employee.lastName.trim() : '';
            return {
              ...employee,firstName,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
            };
          }).filter((employee: any) => employee.employeeId !== loggedInUser.employeeId).sort((a: any, b: any) =>
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
  /** When project selected */
  onProjectChange(event: any) {
    const selectedProjectIds = event.value;
    const selectedProjects: number[] = this.ResourceAvailabilityReportForm.get('projectId')?.value || [];
    // ---- CASE 1: No project selected ----
    if (selectedProjects.length === 0) {
      this.disablePhaseDropdown();
      this.ResourceAvailabilityReportForm.get('phases')?.setValue([]);
      this.getEmployeeData();   // ← CALL THIS METHOD
      return;
    }
    // ---- CASE 2: Only "No Project" selected (value = 0) ----
    if (selectedProjects.length === 1 && selectedProjects[0] === 0) {
      this.employeeData = [];
      this.ResourceAvailabilityReportForm.get('employeid')?.setValue([]);
      this.phasesData = []; 
      this.ResourceAvailabilityReportForm.get('phases')?.setValue([]);
      this.enablePhaseDropdown();
      this.getTeamManagersDetails();
      // Load fresh employee list ONLY from getTeamManagersDetails()
      setTimeout(() => {
        if (this.getEmployeeInfo?.length) {
          this.employeeData = this.getEmployeeInfo.map((emp: any) => ({
            id: emp.employeeId,
            name: emp.fullName
          }));
        }
      }, 300);
      return;
    }
    // ---- CASE 3: Real projects selected ----
    this.enablePhaseDropdown();
    this.projectId = selectedProjectIds;
      this.getPhaseData();
    this.getAllActiveEmployees();
  }

  enablePhaseDropdown() {
    this.ResourceAvailabilityReportForm.get('phases')?.enable();
  }

  disablePhaseDropdown() {
    this.ResourceAvailabilityReportForm.get('phases')?.disable();
  }

  getAllActiveEmployees() {
    const previousSelected = this.ResourceAvailabilityReportForm.get('phases')?.value || [];
    this.http.getData(`v2/ProjectResource?status=Active&entityType=project&entityRefId=${this.projectId}&isDistinct=${this.isDistinct}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Employee List
        this.employeeData = res?.data?.map((x: any) => ({
            id: x.employee?.id,
            name: x.employee?.fusionEmployeeId? `${x.employee.fusionEmployeeId} - ${x.employee.name}`: x.employee?.name || 'Unknown'
          })) ?? [];
        // keep only employees that still exist in new employee list
        const validEmployeeSelections = this.ResourceAvailabilityReportForm.get('employeid')?.value?.filter((selectedId: any) =>
          this.employeeData.some((emp: any) => emp.id === selectedId)
        ) || [];

        // update employee selection
        this.ResourceAvailabilityReportForm.get('employeid')?.setValue(validEmployeeSelections);
      },
      error: (err) => {
        console.error("Error fetching employees:", err);
        this.employeeData = [];
        this.phasesData = [];

        this.ResourceAvailabilityReportForm.get('phases')?.setValue([]);
      }
    });
  }
  removeDuplicatePhases(list: any[]) {
    const map = new Map();
    list.forEach(item => map.set(item.phaseId, item));
    return Array.from(map.values());
  }
  // if no project selected to get resouces
  getTeamManagersDetails() {
    const EmployeeId = this.empinfo.employeeId;
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
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
    getPhaseData() {
  const previousSelected = this.ResourceAvailabilityReportForm.get('phases')?.value || [];
  const params = {
    projectId: this.projectId.join(','), 
    status: 'yet to start,in progress,extended'
  };
  this.subscription = this.http.getDataIncludeParams('ProjectPhases/list', params).subscribe({
      next: (data: any) => {
        // Extract all phases
        this.phasesData = data?.data?.map((x: any) => ({
          phaseId: x.phaseId,
          projectId: x.project?.projectId,      // if you want project-wise grouping
          phaseName: x.phaseName,
          code: x.project?.meta?.graphData?.code ?? ''
        })) ?? [];
        // Remove duplicate phases
        this.phasesData = this.removeDuplicatePhases(this.phasesData);
        this.phasesData = this.phasesData.map((p: any) => ({
        ...p,label: p.code ? `${p.phaseName} (${p.code})` : p.phaseName
      }));
        // Keep previously selected phases if still present
        const validSelections = previousSelected.filter((selectedId: any) =>
          this.phasesData.some((p: any) => p.phaseId === selectedId)
        );
        this.ResourceAvailabilityReportForm.get('phases')?.setValue(validSelections);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.phasesData = [];
        this.ResourceAvailabilityReportForm.get('phases')?.setValue([]);
      }
    });
}
  // generate,export button click call method for shoe,hide
  get isLeaveGenerateDisabled(): boolean {
    const { projectId, employeid, dateRange, phases } = this.ResourceAvailabilityReportForm.value;
    const hasProject = projectId !== null && projectId !== undefined;
    // const hasDateRange = dateRange && (dateRange.startDate || dateRange.endDate);
    const hasDateRange = Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1];
    const hasEmployeid = employeid !== null && employeid !== undefined;
    const hasphase = phases !== null && phases !== undefined;
    return !(hasProject || hasDateRange || hasEmployeid || hasphase);
  }
  // payload for resouce availability
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
    if (formValue.phases !== null && formValue.phases !== undefined) {
      params.PhaseIds = formValue.phases;
    }
    return params;
  }


  // generate ther report
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
    this.http.getDataIncludeParams(`TimesheetReport/get?${queryString}&page=${this.page}&pageSize=${this.pageSize}`).pipe(takeUntil(this.destroy$)).subscribe({
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
  // export the report
  exportResourceAvailabilityReport() {
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();
    this.http.downloadTimesheetReport(`TimesheetReport/export-report?${queryString}&page=${this.page}&pageSize=${this.pageSize}`).subscribe({
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
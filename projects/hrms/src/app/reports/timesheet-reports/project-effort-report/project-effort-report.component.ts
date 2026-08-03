
import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation, ViewChild } from '@angular/core';
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
import { HttpResponse } from '@angular/common/http';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Table, TableModule } from 'primeng/table';
@Component({
  selector: 'app-project-effort-report',
  imports: [DatePicker, CommonModule, MultiSelectModule, TableModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, ReportsHeaderComponent],
  templateUrl: './project-effort-report.component.html',
  styleUrl: './project-effort-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ProjectEffortReportComponent implements OnInit, OnDestroy {
  @ViewChild('dt') table!: Table;
  
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredpendingapprovalRecord: any[] = [];
  projectsData: any[] = [];
  ProjectEffortReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
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
  phasesData: any[] = [];
  getEmployeeInfo = [] as any;
  BillableOptions = [
    { key: 'Yes', value: 'true' },
    { key: 'No', value: 'false' }
  ];
  TimesheetStatus = [
    { key: 'Waiting for Approval', value: 'Waiting for Approval' },
    { key: 'Approved', value: 'Processed' },
    { key: 'Rejected', value: 'Rejected' },
  ];
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize!: number;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];
  today: Date = new Date();
  
  // Sorting properties
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  currentUIField: string | null = null; // Track the UI field name for visual state
  suppressNextPageChange = false;
  
  // Sort field mapping for server-side sorting
  readonly sortFieldMap: Record<string, string> = {
    client: 'client',
    project: 'project',
    phase: 'phase',
    projectAllocatedHours: 'projectAllocatedHours',
    billableHours: 'billableHours',
    nonBillableHours: 'nonBillableHours',
    totalHours: 'totalHours'
  };

  // Method to handle column header clicks
  onColumnSort(field: string): void {
    const backendField = this.sortFieldMap[field] || field;

    // Handle the three-state sorting: none → asc → desc → none
    if (this.currentUIField === field) {
      // Same field clicked - cycle through states
      if (this.currentSortOrder === 0) {
        // Currently no sort, set to ascending
        this.currentSortOrder = 1;
        this.currentSortField = backendField;
        this.currentUIField = field;
      } else if (this.currentSortOrder === 1) {
        // Currently ascending, set to descending
        this.currentSortOrder = -1;
        this.currentSortField = backendField;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to no sort
        this.currentSortField = '';
        this.currentUIField = null;
        this.currentSortOrder = 0;
        
        // Manually reset PrimeNG table sort state
        if (this.table) {
          this.table.reset();
        }
        
        // Reset to first page and reload data without sorting
        this.page = 1;
        this.first = 0;
        this.generateProjectEffortReport(this.page, this.pageSize, true, true);
        return;
      }
    } else {
      // Different field clicked - start with ascending
      this.currentUIField = field;
      this.currentSortField = backendField;
      this.currentSortOrder = 1; // Always start with ascending for new field
    }

    // Reset to first page when sorting changes
    this.page = 1;
    this.first = 0;
    
    // Call generate to refresh data with new sorting
    this.generateProjectEffortReport(this.page, this.pageSize, true, true);
  }
  constructor(
    public authService: AuthService,
    private reportsService: ReportsService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private conformationPopup: OpenModalService,
    private offcanvasService: NgbOffcanvas,
  ) { }

  customSort(event: any): void {
    // This method is kept for compatibility but does nothing
    // We handle sorting through onColumnSort instead
    return;
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getClientsData();
    this.getProjectsData();
  }

  initializeForm() {
    this.ProjectEffortReportForm = this.fb.group({
      clientId: [null],
      projectId: [null],
      // employeid: [{ value: null, disabled: true }],
      dateRange: [null],
      billable: [null],
      phases: [{ value: null, disabled: true }]
    });
    this.ProjectEffortReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }


  isFilterApplied(): boolean {
    const formValue = this.ProjectEffortReportForm.value;
    const isClientSelected = Array.isArray(formValue.clientId) ? formValue.clientId.length > 0 : !!formValue.clientId;
    const isProjectSelected = Array.isArray(formValue.projectId) ? formValue.projectId.length > 0 : !!formValue.projectId;
    const isBillableSelected = formValue.billable != null;
    const isDateRangeSelected = Array.isArray(formValue.dateRange) ? formValue.dateRange.length > 0 : !!formValue.dateRange;
    const isPhaseSelected = formValue.phases != null && formValue.phases.value != null;
    return (isClientSelected ||isProjectSelected ||isBillableSelected ||isDateRangeSelected ||isPhaseSelected);
  }
  filteredProjects: any[] | undefined | null = null;
  clearAllFilters(): void {
    this.filteredProjects = null;
    this.phasesData = [];
    this.ProjectEffortReportForm.reset();
    this.filteredpendingapprovalRecord = [];
    this.isFilterIndicatorActive = false;
    this.ProjectEffortReportForm.get('phases')?.setValue(null);
    // reset specific controls properly
    this.ProjectEffortReportForm.get('employeid')?.setValue([]);
    this.ProjectEffortReportForm.get('projectId')?.setValue(null);
    this.ProjectEffortReportForm.get('clientId')?.setValue(null);
    this.ProjectEffortReportForm.get('billable')?.setValue(null);
    this.ProjectEffortReportForm.get('status')?.setValue(null);
    this.ProjectEffortReportForm.get('dateRange')?.setValue(null);
    this.ProjectEffortReportForm.get('phases')?.setValue(null);
    this.collectionSize = 0;
    this.ProjectEffortReportForm.get('phases')?.disable();

    // Reset sorting arrows and pagination - use null and 0 for proper reset
    this.currentSortField = '';
    this.currentUIField = null;
    this.currentSortOrder = 0;
    
    // Reset pagination to first page
    this.page = 1;
    this.first = 0;
    
    // Reset the table sort state
    if (this.table) {
      this.table.reset();
    }
    
    // Prevent suppression of next page change to ensure proper reset
    this.suppressNextPageChange = false;
    
    // Close the offcanvas after clearing
    this.closeCanvas();
  }
  // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generateProjectEffortReport(this.page, this.pageSize);
  }
  onGenerate() {
    this.isFilterIndicatorActive = this.isFilterApplied();
    this.generateProjectEffortReport(this.page, this.pageSize, true, true);
  }
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.generateProjectEffortReport(this.page, this.pageSize, false, false);
  }
  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.generateProjectEffortReport(this.page, this.pageSize, true, true);
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

  // get client data
  getClientsData(): void {
    this.http.getData(`Client/GetAll?status=Active`).pipe(takeUntil(this.destroy$)).subscribe({next: (res: any) => {
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

  // adin access all project
  getProjectsData() {
    this.loading = true;
    this.http.getData('v2/Project?status=Active').pipe(takeUntil(this.destroy$)).subscribe({next: (res: any) => {
        this.projectsData = res?.data ?? [];


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
  /** When project selected to get resources */
  onProjectChange(event: any) {
    const selectedProjectIds = event.value;
    // CASE 1: No project is selected
    if (!selectedProjectIds || selectedProjectIds.length === 0) {
      this.projectId = [];
      this.phasesData = [];
      this.employeeData = [];
      this.ProjectEffortReportForm.get('phases')?.setValue([]);
      this.ProjectEffortReportForm.get('phases')?.disable();
      this.getTeamManagersDetails();
      this.projectId = 0;
      // Wait briefly to ensure getTeamManagersDetails() completes (optional)
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
    // CASE 2: Project(s) selected
    this.projectId = selectedProjectIds;
    this.ProjectEffortReportForm.get('phases')?.enable();
    this.getPhaseData();
    this.getAllActiveEmployees();
  }
  getAllActiveEmployees() {
    const previousSelected = this.ProjectEffortReportForm.get('phases')?.value || [];
    this.http.getData(`v2/ProjectResource?status=Active&entityType=project&entityRefId=${this.projectId}&isDistinct=${this.isDistinct}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Employee List
        this.employeeData = res?.data?.map((x: any) => ({
            id: x.employee?.id,
            name: x.employee?.fusionEmployeeId? `${x.employee.fusionEmployeeId} - ${x.employee.name}` : x.employee?.name || 'Unknown'})) ?? [];
        // PHASE LIST extraction
        // this.phasesData = res?.data?.filter((x: any) => x.phase).map((x: any) => ({
        //       phaseId: x.phase.phaseId,
        //       phaseName: x.phase.phaseName
        //     })) ?? [];
        // Remove duplicate phases
        // this.phasesData = this.removeDuplicatePhases(this.phasesData);
        // const validSelections = previousSelected.filter((selectedId: any) =>
        //   this.phasesData.some((p: any) => p.phaseId === selectedId)
        // );
        // assign valid phases only
       // this.ProjectEffortReportForm.get('phases')?.setValue(validSelections);
      },
      error: (err) => {
        console.error("Error fetching employees:", err);
        this.employeeData = [];
        this.phasesData = [];

        this.ProjectEffortReportForm.get('phases')?.setValue([]);
      }
    });
  }

  removeDuplicatePhases(list: any[]) {
    const map = new Map();
    list.forEach(item => map.set(item.phaseId, item));
    return Array.from(map.values());
  }
    getPhaseData() {
  const previousSelected = this.ProjectEffortReportForm.get('phases')?.value || [];
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
        this.ProjectEffortReportForm.get('phases')?.setValue(validSelections);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.phasesData = [];
        this.ProjectEffortReportForm.get('phases')?.setValue([]);
      }
    });
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
  // generate,export button show,hide
  get isLeaveGenerateDisabled(): boolean {
    const { clientId, projectId, dateRange, billable, phases } = this.ProjectEffortReportForm.value;
    const hasClient = clientId !== null && clientId !== undefined;
    const hasProject = projectId !== null && projectId !== undefined;
    const hasDateRange = Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1];
    const hasbillable = billable !== null && billable !== undefined;
    const hasphase = phases !== null && phases !== undefined;
    return !(hasClient || hasProject || hasDateRange || hasbillable || hasphase);
  }
  // payload for report
  buildTimesheetReportParams() {
    const formValue = this.ProjectEffortReportForm.value;
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
      ReportType: 'ProjectEffort'
    };
    if (startDate) params.StartDate = startDate;
    if (endDate) params.EndDate = endDate;
    if (formValue.clientId !== null && formValue.clientId !== undefined) {
      params.ClientIds = formValue.clientId;
    }
    if (formValue.projectId !== null && formValue.projectId !== undefined) {
      params.ProjectIds = formValue.projectId;
    }
    if (formValue.billable?.value) params.billable = formValue.billable.value;
    if (formValue.phases !== null && formValue.phases !== undefined) {
      params.PhaseIds = formValue.phases;
    }
    return params;
  }
  // generate button for method calling
  generateProjectEffortReport(page: number, pageSize: number, showLoader: boolean = true, resetPagination: boolean = false) {
    if (this.ProjectEffortReportForm.invalid) return;
    // Only reset pagination when explicitly requested
    if (resetPagination) {
      this.page = 1;
      this.first = 0;
    }
    if (showLoader) this.spinnerLoader1 = true;
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();
    
    // Add sorting to the query string
    const sortQuery = this.currentSortField && this.currentSortOrder !== 0 ? `&Sorts=${this.currentSortField}:${this.currentSortOrder === 1 ? 'asc' : 'desc'}` : '';
    
    this.http.getDataIncludeParams(`TimesheetReport/get?${queryString}&page=${this.page}&pageSize=${this.pageSize}${sortQuery}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.spinnerLoader1 = false;
        this.offcanvasService.dismiss();
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
        this.offcanvasService.dismiss();
      },
    });
  }
  // export button calling method
  exportProjectEffortReport() {
    if (this.ProjectEffortReportForm.invalid) return;
    this.spinnerLoader2 = true;
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();
    
    // Add sorting to export as well
    const sortQuery = this.currentSortField && this.currentSortOrder !== 0 ? `&Sorts=${this.currentSortField}:${this.currentSortOrder === 1 ? 'asc' : 'desc'}` : '';
    
    this.http.downloadTimesheetReport(`TimesheetReport/export-report?${queryString}&page=${this.page}&pageSize=${this.pageSize}${sortQuery}`).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.spinnerLoader2 = false;
        // Extract filename from Content-Disposition
        let filename = `Project Effort Report - ${this.http.formattedDate}.xlsx`;
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
        this.conformationPopup.openSuccessModal("Project Effort Report exported successfully");
      },
      error: (err: any) => {
        this.spinnerLoader2 = false;
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

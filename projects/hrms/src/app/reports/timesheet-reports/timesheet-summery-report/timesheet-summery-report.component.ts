import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
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
import { ClientData } from '../../../clients.model';
import { OpenModalService } from '../../../services/open-modal.service';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { HttpResponse } from '@angular/common/http';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-timesheet-summery-report',
  imports: [DatePicker, CommonModule, MultiSelectModule, TableModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, ReportsHeaderComponent],
  templateUrl: './timesheet-summery-report.component.html',
  styleUrl: './timesheet-summery-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TimesheetSummeryReportComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredtimesheetsummeryRecord: any[] = [];
  projectsData: any[] = [];
  TimesheetSummeryReportForm!: FormGroup;
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
    { key: 'Billable', value: 'true' },
    { key: 'Non-Billable', value: 'false' },
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
  employeeiddetails: any[] | undefined;
  
  // Sorting properties
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  currentUIField: string = ''; // Track the UI field name for visual state
  suppressNextPageChange = false;
  
  // Sort field mapping for server-side sorting
  readonly sortFieldMap: Record<string, string> = {
    month: 'month',
    fusionEmpId: 'fusionEmpId',
    employeeName: 'employeeName',
    department: 'department',
    clientName: 'clientName',
    projectName: 'projectName',
    phaseName: 'phaseName',
    allocatedHours: 'allocatedHours',
    totalLoggedHours: 'totalLoggedHours',
    billableHours: 'billableHours',
    nonBillableHours: 'nonBillableHours'
  };
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
    const field = event.field;
    const order = event.order;

    // Map UI field to backend field
    const backendFieldMap: { [key: string]: string } = {
      month: 'month',
      fusionEmpId: 'fusionEmpId',
      employeeName: 'employeeName',
      department: 'department',
      clientName: 'clientName',
      projectName: 'projectName',
      phaseName: 'phaseName',
      allocatedHours: 'allocatedHours',
      totalLoggedHours: 'totalLoggedHours',
      billableHours: 'billableHours',
      nonBillableHours: 'nonBillableHours'
    };

    const nextSortField = backendFieldMap[field] || field;
    const nextSortOrder = order === 1 ? 'asc' : 'desc';

    // Prevent duplicate API calls
    if (
      this.currentSortField === nextSortField &&
      ((this.currentSortOrder === 1 && nextSortOrder === 'asc') ||
        (this.currentSortOrder === -1 && nextSortOrder === 'desc'))
    ) {
      return;
    }

    // Handle the three-state sorting: none → asc → desc → none
    if (this.currentUIField === field) {
      // Same field clicked - cycle through states
      if (this.currentSortOrder === -1) {
        // Currently descending, reset to no sort
        this.currentSortField = '';
        this.currentUIField = '';
        this.currentSortOrder = 0;
        // Reset to first page and reload data without sorting
        this.page = 1;
        this.first = 0;
        this.generatetimesheetSummeryReport(this.page, this.pageSize, true, true);
        return;
      }
    }

    // Set new sort state
    this.currentUIField = field;
    this.currentSortField = nextSortField;
    this.currentSortOrder = order;

    // Reset to first page when sorting changes
    this.page = 1;
    this.first = 0;
    
    // Call generate to refresh data with new sorting
    this.generatetimesheetSummeryReport(this.page, this.pageSize, true, true);
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.initializeForm();
    this.getClientsData();
    this.getProjectsData();
    this.getEmployeeData();
  }

  initializeForm() {
    this.TimesheetSummeryReportForm = this.fb.group({
      clientId: [null],
      projectId: [null],
      employeid: [[]],
      dateRange: [null],
      billable: [null],
      phases: [{ value: null, disabled: true }],
    });
    this.TimesheetSummeryReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }
  // clear all button show hide

  isFilterApplied(): boolean {
    const formValue = this.TimesheetSummeryReportForm.value;
    const isClientSelected = Array.isArray(formValue.clientId) ? formValue.clientId.length > 0 : !!formValue.clientId;
    const isProjectSelected = Array.isArray(formValue.projectId) ? formValue.projectId.length > 0 : !!formValue.projectId;
    const isEmployeeSelected = Array.isArray(formValue.employeid) ? formValue.employeid.length > 0 : !!formValue.employeid;
    const isBillableSelected = formValue.billable != null;
    const isDateRangeSelected = Array.isArray(formValue.dateRange) ? formValue.dateRange.length > 0 : !!formValue.dateRange;
    const isPhaseSelected = formValue.phases != null && formValue.phases.value != null;
    return (isClientSelected ||isProjectSelected ||isEmployeeSelected ||isBillableSelected ||isDateRangeSelected ||isPhaseSelected);
  }
  // clear all button method
  filteredProjects: any[] | undefined | null;
  clearAllFilters(): void {
    this.filteredProjects = null;
    //  Reset dropdown data (VERY IMPORTANT)
    this.projectsList = [];
    this.phasesData = [];
    this.employeeData = [];
    this.isFilterIndicatorActive = false;
    
    //  Reset pagination and data
    this.filteredtimesheetsummeryRecord = [];
    this.collectionSize = 0;
    this.page = 1;
    this.first = 0;
    this.pageSize = 50;
    this.rows = 50;

    // reset specific controls properly
    this.TimesheetSummeryReportForm.get('employeid')?.setValue([]);
    this.TimesheetSummeryReportForm.get('projectId')?.setValue(null);
    this.TimesheetSummeryReportForm.get('clientId')?.setValue(null);
    this.TimesheetSummeryReportForm.get('billable')?.setValue(null);
    this.TimesheetSummeryReportForm.get('status')?.setValue(null);
    this.TimesheetSummeryReportForm.get('dateRange')?.setValue(null);
    this.TimesheetSummeryReportForm.get('phases')?.setValue(null);

    // Reset internal state
    this.projectId = [];

    this.getClientsData();
    this.getProjectsData();
    this.getEmployeeData();
    this.TimesheetSummeryReportForm.get('phases')?.disable();
    
    // Reset sorting arrows and pagination
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    
    // Reset disabled button state
    this.disableBtn = false;
    
    // Close the offcanvas after clearing
    this.closeCanvas();
  }
  // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generatetimesheetSummeryReport(this.page, this.pageSize);
  }
  onGenerate() {
    this.isFilterIndicatorActive = this.isFilterApplied();
    this.generatetimesheetSummeryReport(this.page, this.pageSize, true, true);
  }
  onPageChange(event: any) {
    if (this.suppressNextPageChange && event?.page === 0 && event?.first === 0) {
      this.suppressNextPageChange = false;
      return;
    }
    this.suppressNextPageChange = false;
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


  // get all client data
  getClientsData(): void {
    this.http.getData(`Client/GetAll?status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (Array.isArray(res?.data)) {
          this.clients = res.data;
          // Add "No Client/No Project" option
          if (!this.noclientproject) {
            this.clients.unshift({
              clientId: 0, clientName: 'No Client',
              projects: [{
                  projectId: 0,projectName: 'No Project', isNoClientProject: true,
                },]
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
// onclient changes
  onClientChange(event: any): void {
    const clientIds = Array.isArray(event.value) ? event.value : [];
    const oldProjectIdsRaw = this.TimesheetSummeryReportForm.get('projectId')?.value;
    const oldProjectIds = Array.isArray(oldProjectIdsRaw) ? oldProjectIdsRaw : oldProjectIdsRaw ? [oldProjectIdsRaw] : [];
    this.TimesheetSummeryReportForm.get('employeid')?.setValue([]);
    this.getProjectsByClientId(clientIds, oldProjectIds);
    if (!clientIds || clientIds.length === 0) {
      this.projectsList = [];
           this.TimesheetSummeryReportForm.get('phases')?.setValue([]);
      this.TimesheetSummeryReportForm.get('phases')?.disable();
      this.TimesheetSummeryReportForm.patchValue({ projectId: [] }); // Clear selected projects
      return;
    }
  }
// fetch project by client id
  getProjectsByClientId(clientIds: number[], oldProjectIds?: number[]): void {
    // after this.projectsList is filled
    if (!clientIds || clientIds.length === 0) {
      this.loadAllProjects();  // <-- New helper function
      return;
    }
    const hasNoClient = clientIds.includes(0);
    const realClientIds = clientIds.filter(id => id !== 0);
    //  CASE 1: ONLY "No Client"
    if (hasNoClient && realClientIds.length === 0) {
      this.projectsList = [
        { label: "No Project", value: 0 }
      ];
      return;
    }
    //  CASE 2 & 3: Fetch all real client project
    this.loading = true;
    this.http.getData(`v2/Project?clientId=${realClientIds.join(',')}&status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.loading = false;
          let projectList = [];
          if (Array.isArray(res?.data)) {
            projectList = res.data.map((p: any) => ({
              label: p.projectName,
              value: p.projectId
            }));
          }
          //  CASE 3: Include No Project if 0 was selected WITH others
          if (hasNoClient) {
            projectList.unshift({ label: "No Project", value: 0 });
          }
          this.projectsList = projectList;
          //  restore selected project AFTER list updated
          const validSelectedProjects = (oldProjectIds || []).filter(id =>
            this.projectsList.some(p => p.value === id)
          );
          this.TimesheetSummeryReportForm.patchValue({
            projectId: validSelectedProjects.length ? validSelectedProjects : []
          });
        },
        error: () => {
          this.loading = false;
        }
      });
  }
  loadAllProjects() {
    this.loading = true;
      this.http.getData(`v2/Project?status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.loading = false;
          if (Array.isArray(res?.data)) {
            this.projectsList = res.data.map((p: any) => ({
              label: p.projectName,
              value: p.projectId
            }));
          } else {
            this.projectsList = [];
          }
        },
        error: () => {
          this.loading = false;
        }
      });
  }
  /** When project selected call this function */
  // onProjectChange(event: any) {
  //   const selectedProjectIds = event.value;
  //   // CASE 1: No project is selected
  //   if (!selectedProjectIds || selectedProjectIds.length === 0) {
  //      this.projectId = [];
  //     this.phasesData = [];  
  //      this.employeeData = [];                                    
  //     this.TimesheetSummeryReportForm.get('phases')?.setValue([]);    
  //     this.TimesheetSummeryReportForm.get('phases')?.disable();   
  //      this.getTeamManagersDetails();
  //       this.projectId = 0;   
  //         // Wait briefly to ensure getTeamManagersDetails() completes (optional)
  //       setTimeout(() => {
  //         if (this.getEmployeeInfo?.length) {
  //           this.employeeData = this.getEmployeeInfo.map((emp: any) => ({
  //             id: emp.employeeId,
  //             name: emp.fullName
  //           }));
  //         }
  //       }, 300); 
  //     return;
  //   }
  //   // CASE 2: Project(s) selected
  //    this.projectId = selectedProjectIds;
  //   this.TimesheetSummeryReportForm.get('phases')?.enable();          
  //   this.getAllActiveEmployees();                                
  // }

  onProjectChange(event: any) {
    const selectedProjectIds = event.value;
    const selectedProjects: number[] = this.TimesheetSummeryReportForm.get('projectId')?.value || [];
    // ---- CASE 1: No project selected ----
    if (selectedProjects.length === 0) {
      this.disablePhaseDropdown();
      this.TimesheetSummeryReportForm.get('phases')?.setValue([]);
      this.getEmployeeData();   // ← CALL THIS METHOD
      return;
    }
    // ---- CASE 2: Only "No Project" selected (value = 0) ----
    if (selectedProjects.length === 1 && selectedProjects[0] === 0) {
      // Clear previous employee list + selected employees
      this.employeeData = [];
      this.TimesheetSummeryReportForm.get('employeid')?.setValue([]);
      // Clear phases also + disable
      this.phasesData = []; 
      this.TimesheetSummeryReportForm.get('phases')?.setValue([]);
      this.enablePhaseDropdown();
     
      // Fetch team manager details
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
    this.TimesheetSummeryReportForm.get('phases')?.enable();
  }
  disablePhaseDropdown() {
    this.TimesheetSummeryReportForm.get('phases')?.disable();
  }

  getPhaseData() {
  const previousSelected = this.TimesheetSummeryReportForm.get('phases')?.value || [];
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
        this.TimesheetSummeryReportForm.get('phases')?.setValue(validSelections);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.phasesData = [];
        this.TimesheetSummeryReportForm.get('phases')?.setValue([]);
      }
    });
}
  /** Get all employees for selected project */
  getAllActiveEmployees() {
  //  const previousSelected = this.TimesheetSummeryReportForm.get('phases')?.value || [];
    this.http.getData(`v2/ProjectResource?status=Active&entityType=project&entityRefId=${this.projectId}&isDistinct=${this.isDistinct}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        // Employee List
        this.employeeData = res?.data?.map((x: any) => ({
            id: x.employee?.id,
            name: x.employee?.fusionEmployeeId ? `${x.employee.fusionEmployeeId} - ${x.employee.name}`: x.employee?.name || 'Unknown'
          })) ?? [];
        const validEmployeeSelections = this.TimesheetSummeryReportForm.get('employeid')?.value?.filter((selectedId: any) =>
          this.employeeData.some((emp: any) => emp.id === selectedId)
        ) || [];
        // update employee selection
        this.TimesheetSummeryReportForm.get('employeid')?.setValue(validEmployeeSelections);
      },
      error: (err) => {
        console.error("Error fetching employees:", err);
        this.employeeData = [];
        this.phasesData = [];
        this.TimesheetSummeryReportForm.get('phases')?.setValue([]);
      }
    });
  }
  getEmployeeData() {
    const loggedInUser = this.authService.getToken();
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        const employeedata = (data || []).map((employee: any) => {
            const firstName = employee.firstName ? employee.firstName.trim() : '';
            const middleName = employee.middleName ? employee.middleName.trim() : '';
            const lastName = employee.lastName ? employee.lastName.trim() : '';
            return {
              ...employee,
              firstName,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`.trim(),
            };
          })
          // .filter((employee: any) => employee.employeeId !== loggedInUser.employeeId).sort((a: any, b: any) =>
          //   a.firstName.toLowerCase().localeCompare(b.firstName.toLowerCase())
          // );
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


  removeDuplicatePhases(list: any[]) {
    const map = new Map();
    list.forEach(item => map.set(item.phaseId, item));
    return Array.from(map.values());
  }

  // no project selected show employee
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

  // Disable ,enable the generate,export button
  get isLeaveGenerateDisabled(): boolean {
    const { clientId, projectId, employeid, dateRange, belaible, phases } = this.TimesheetSummeryReportForm.value;
    const hasClient = clientId !== null && clientId !== undefined;
    const hasProject = projectId !== null && projectId !== undefined;
    const hasDateRange = dateRange && (dateRange.startDate || dateRange.endDate);
    const hasBillable = belaible !== null && belaible !== undefined;
    const hasEmployeid = employeid !== null && employeid !== undefined;
    const hasphase = phases !== null && phases !== undefined;

    return !(hasClient || hasProject || hasDateRange || hasBillable || hasEmployeid || hasphase);
  }
  // Timesheet Summery payload
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
    if (formValue.employeid !== null && formValue.employeid !== undefined && !formValue.employeid.includes(0)) {
      params.EmployeeIds = formValue.employeid;
    }
    if (formValue.billable?.value) {
      params.Billable = formValue.billable.value;
    }
    if (formValue.phases) {
      params.PhaseIds = formValue.phases;
    }
    return params;
  }
  // Generate the timesheet summery report
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
    
    // Add sorting to the query string
    const sortQuery = this.currentSortField && this.currentSortOrder !== 0 ? `&Sorts=${this.currentSortField}:${this.currentSortOrder === 1 ? 'asc' : 'desc'}` : '';
    
    this.http.getDataIncludeParams(`TimesheetReport/get?${queryString}&page=${this.page}&pageSize=${this.pageSize}${sortQuery}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.spinnerLoader1 = false;
        this.offcanvasService.dismiss();
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
        this.offcanvasService.dismiss();
      },
    });
  }
  // Export the timesheet summery report
  exportTimesheetSummery() {
    if (this.TimesheetSummeryReportForm.invalid) return;
    this.spinnerLoader2 = true;
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();
    
    // Add sorting to export as well
    const sortQuery = this.currentSortField && this.currentSortOrder !== 0 ? `&Sorts=${this.currentSortField}:${this.currentSortOrder === 1 ? 'asc' : 'desc'}` : '';
    
    this.http.downloadTimesheetReport(`TimesheetReport/export-report?${queryString}&page=${this.page}&pageSize=${this.pageSize}${sortQuery}`).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.spinnerLoader2 = false;
        // Extract filename from Content-Disposition
        let filename = `Timesheet Summary Report - ${this.http.formattedDate}.xlsx`;
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
        const blob = new Blob([response.body!],
      {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);
        console.log('Downloaded file:', filename);
        this.conformationPopup.openSuccessModal("Timesheet Summary Report exported successfully");
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


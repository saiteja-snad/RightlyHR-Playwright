

import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
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
import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpResponse } from '@angular/common/http';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-pending-approval-status-report',
  imports: [DatePicker, CommonModule, NgbPopoverModule, MultiSelectModule, TableModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, ReportsHeaderComponent, InfoIconComponent],
  templateUrl: './pending-approval-status-report.component.html',
  styleUrl: './pending-approval-status-report.component.scss',
  encapsulation: ViewEncapsulation.None
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
  getEmployeeInfo = [] as any;
    employeeiddetails: any[] = [];
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
    tastType: any[] = [];

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
  currentUIField: string = ''; // Track the UI field name for visual state
  suppressNextPageChange = false;
  
  // Sort field mapping for server-side sorting
  readonly sortFieldMap: Record<string, string> = {
    entryDate: 'entryDate',
    fusionEmpId: 'fusionEmpId',
    employee: 'employee',
    client: 'client',
    project: 'project',
    phaseName: 'phaseName',
    billable: 'billable',
    taskType: 'taskType',
    status: 'status',
    timeSheetSubmittedDate: 'timeSheetSubmittedDate'
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
      entryDate: 'entryDate',
      fusionEmpId: 'fusionEmpId',
      employee: 'employee',
      client: 'client',
      project: 'project',
      phaseName: 'phaseName',
      billable: 'billable',
      taskType: 'taskType',
      status: 'status',
      timeSheetSubmittedDate: 'timeSheetSubmittedDate'
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
        this.generatependingapprovalReport(this.page, this.pageSize, true, true);
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
    this.generatependingapprovalReport(this.page, this.pageSize, true, true);
  }


  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getClientsData();
     this.getEmployeeData();
    this.getProjectsData();
        this.getTaskType();

  }

   getTaskType() {
  this.subscription = this.http.getData('TaskType').subscribe({
    next: (res: any) => {
      this.tastType =res
    },
    error: (error:any) => {
      console.log(error);
    }
  });
}

 
  initializeForm() {
    this.PendingApprovalReportForm = this.fb.group({
      clientId: [null],
      projectId: [null],
        employeid: [[]],
      dateRange: [null],
        phases: [{ value: null, disabled: true }],
      status: [null],
      billable: [null],
      taskId:[null]
    });
    this.PendingApprovalReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }

    isFilterApplied(): boolean {
    const formValue = this.PendingApprovalReportForm.value;
    const isClientSelected = Array.isArray(formValue.clientId) ? formValue.clientId.length > 0 : !!formValue.clientId;
    const isProjectSelected = Array.isArray(formValue.projectId) ? formValue.projectId.length > 0 : !!formValue.projectId;
    const isEmployeeSelected = Array.isArray(formValue.employeid) ? formValue.employeid.length > 0 : !!formValue.employeid;
    const isBillableSelected = Array.isArray(formValue.billable) ? formValue.billable.length > 0 : !!formValue.billable;
    const isStatusSelected = Array.isArray(formValue.status) ? formValue.status.length > 0 : !!formValue.status;
    const isDateRangeSelected = Array.isArray(formValue.dateRange) ? formValue.dateRange.length > 0 : !!formValue.dateRange;
    const isPhaseSelected = Array.isArray(formValue.phases) ? formValue.phases.length > 0 : (formValue.phases != null && formValue.phases.value != null);
        const isTaskSelected = formValue.taskId != null && formValue.taskId != '';

    return (isClientSelected || isProjectSelected || isEmployeeSelected || isDateRangeSelected || isPhaseSelected || isStatusSelected || isBillableSelected ||isTaskSelected);
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
  filteredProjects: any[] | undefined | null;
 clearAllFilters(): void {
  this.filteredProjects = null;
  this.phasesData = [];
  this.isFilterIndicatorActive = false;

  this.PendingApprovalReportForm.reset({
    clientId: null,
    projectId: null,
    employeid: [],
    dateRange: null,
    phases: null,
    status: null,
    billable: null,
    taskId:null,
  }, { emitEvent: false });

  this.PendingApprovalReportForm.get('phases')?.disable({ emitEvent: false });

  this.filteredpendingapprovalRecord = [];
  this.collectionSize = 0;
  this.disableBtn = false;

  // Reset sorting arrows and pagination - use null and 0 for proper reset
  this.currentSortField = '';
  this.currentUIField = '';
  this.currentSortOrder = 0;
  
  // Reset pagination to first page
  this.page = 1;
  this.first = 0;
  
  // Prevent suppression of next page change to ensure proper reset
  this.suppressNextPageChange = false;

  // Refresh dropdowns
  if (this.rbac.allowedToAccess('Team Timesheet Report - Admin-Approval.view')) {
    this.getClientsData();
    this.getProjectsData();
    this.getEmployeeData();
  } else {
    this.getManagerDropdownData(this.empinfo.employeeId);
    this.getResourceDetailsByManagerId();
  }

  // Mark clean
  this.PendingApprovalReportForm.markAsPristine();
  this.PendingApprovalReportForm.markAsUntouched();

  // Close the offcanvas after clearing
  this.closeCanvas();
}


  onGenerate() {
    this.isFilterIndicatorActive = this.isFilterApplied();
    this.generatependingapprovalReport(this.page, this.pageSize, true, true);
  }

  // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generatependingapprovalReport(this.page, this.pageSize);
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

    // manager access client,project data
  getManagerDropdownData(managerId: number): void {
    this.http.getData(`Project?status=Active&projectAuthorityId=${managerId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.success && Array.isArray(res.data)) {
          const projectData = res.data;
          // Extract and map clients from project data
          const clients = projectData.filter((p: any) => p.client).map((p: any) => ({
            clientId: p.client.clientId,
            clientName: p.client.clientName,
            projects: [
              {
                projectId: p.projectId,
                projectName: p.projectName,
              },
            ],
          }));

          // Group projects under the same clientId
          const mergedClients: any[] = [];
          clients.forEach((c: { clientId: any; projects: any; }) => {
            const existing = mergedClients.find((x) => x.clientId === c.clientId);
            if (existing) {
              existing.projects.push(...c.projects);
            } else {
              mergedClients.push({ ...c });
            }
          });

          // Add "No Client" entry with "No Project"
          const noClientEntry = {
            clientId: 0,
            clientName: 'No Client',
            projects: [
              {
                projectId: 0,
                projectName: 'No Project',
                isNoClientProject: true,
              },
            ],
          };

          // Final client list
          this.clients = [noClientEntry, ...mergedClients];
          // Build dropdowns for p-select
          this.clientDropdownList = this.clients.map((client: any) => ({
            label: client.clientName,
            value: client.clientId,
          }));

          // For initial project dropdown (all projects combined)
          const allProjects = this.clients.flatMap((c: any) => c.projects);
          this.projectsList = allProjects.map((p: any) => ({
            label: p.projectName,
            value: p.projectId,
          }));
        } else {
          // 🔹 Add "No Client" option only once
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
              ]
            });
          }

          this.clientDropdownList = [
            { label: 'No Client', value: 0 },
          ];
          this.projectsList = [
            { label: 'No Project', value: 0 },
          ];
        }
      },
      error: (err) => {
        console.error('Error fetching manager dropdown data:', err);
        this.clientDropdownList = [
          { label: 'No Client', value: 0 },
        ];
        this.projectsList = [
          { label: 'No Project', value: 0 },
        ];
      },
    });
  }
  // manager access employee
  getResourceDetailsByManagerId() {
    const EmployeeId = this.empinfo?.employeeId;
    this.subscription = this.http.getData(`Timesheet/get-resources?employeeId=${EmployeeId}`).subscribe({
      next: (res: any) => {
        if (res?.success) {
          this.employeeiddetails = res.data.filter((emp: any) => emp.id !== EmployeeId).map((emp: any) => ({
            ...emp,
            fullName: emp.fusionEmpId ? `${emp.fusionEmpId} - ${emp.name}` : emp.name,
            key: 'team'
          }));
          // Correct key mapping
          this.employeeData = this.employeeiddetails.map((e: any) => ({
            id: e.id,
            name: e.fullName
          }));
        }
      },
      error: (err: any) => console.error(err)
    });
  }

  // get all client
  getClientsData(): void {
    this.http.getData(`Client/GetAll?status=Active,Inactive`).pipe(takeUntil(this.destroy$)).subscribe({
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
    // admin access all employee
  getEmployeeData() {
    const loggedInUser = this.authService.getToken();
    const status = 'Active, Trainee Active, Active Contract'
    this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${status}`).subscribe({
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

 // onclient change method
  onClientChange(event: any): void {
    const clientIds = Array.isArray(event.value) ? event.value : [];
    const oldProjectIdsRaw = this.PendingApprovalReportForm.get('projectId')?.value;
    const oldProjectIds = Array.isArray(oldProjectIdsRaw) ? oldProjectIdsRaw : oldProjectIdsRaw ? [oldProjectIdsRaw] : [];
    this.PendingApprovalReportForm.get('employeid')?.setValue([]);
    this.getProjectsByClientId(clientIds, oldProjectIds);
    if (!clientIds || clientIds.length === 0) {
      this.projectsList = [];
      this.PendingApprovalReportForm.get('phases')?.setValue([]);
      this.PendingApprovalReportForm.get('phases')?.disable();
      this.PendingApprovalReportForm.patchValue({ projectId: [] }); // Clear selected projects
      return;
    }
  }
  // client onchange get project
  getProjectsByClientId(clientIds: number[], oldProjectIds?: number[]): void {
    // after this.projectsList is filled
    //  CASE 4: ALL deselected → show ALL projects
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
          this.PendingApprovalReportForm.patchValue({
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
    this.http.getData(`v2/Project?status=Active`).pipe(takeUntil(this.destroy$)).subscribe({ next: (res: any) => {
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

  /** When project selected */
   onProjectChange(event: any) {
    const selectedProjectIds = event.value;
    const selectedProjects: number[] = this.PendingApprovalReportForm.get('projectId')?.value || [];
    // ---- CASE 1: No project selected ----
    if (selectedProjects.length === 0) {
      this.disablePhaseDropdown();
      this.PendingApprovalReportForm.get('phases')?.setValue([]);
      this.getEmployeeData();   // ← CALL THIS METHOD
      return;
    }
    // ---- CASE 2: Only "No Project" selected (value = 0) ----
    if (selectedProjects.length === 1 && selectedProjects[0] === 0) {
      // Clear previous employee list + selected employees
      this.employeeData = [];
      this.PendingApprovalReportForm.get('employeid')?.setValue([]);
      // Clear phases also + disable
        this.phasesData = []; 
      this.PendingApprovalReportForm.get('phases')?.setValue([]);
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
    this.PendingApprovalReportForm.get('phases')?.enable();
  }
  disablePhaseDropdown() {
    this.PendingApprovalReportForm.get('phases')?.disable();
  }
  /** Get all active employees for selected project */
  getAllActiveEmployees() {
    this.http.getData(`v2/ProjectResource?status=Active&entityType=project&entityRefId=${this.projectId}&isDistinct=${this.isDistinct}`)
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
  // getTeamManagersDetails() {
  //   const EmployeeId = this.empinfo.employeeId;
  //   this.subscription = this.http
  //     .getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`)
  //     .subscribe({
  //       next: (response: any) => {
  //         if (response && response.length) {
  //           const myTeam = response.filter((e: any) => e.isAccess);
  //           this.getEmployeeInfo = myTeam.map((employee: any) => ({
  //             employeeId: employee.employeeId,
  //             fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName}${employee.middleName ? ' ' + employee.middleName : ''}${employee.lastName ? ' ' + employee.lastName : ''}`,
  //           }));
  //         } else {
  //           this.getEmployeeInfo = [];
  //         }
  //       },
  //       error: (err) => {
  //         console.error('Error fetching team manager details:', err);
  //         this.getEmployeeInfo = [];
  //       }
  //     });
  // }
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
    phasesData: any[] = [];
      getPhaseData() {
  const previousSelected = this.PendingApprovalReportForm.get('phases')?.value || [];
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
        this.PendingApprovalReportForm.get('phases')?.setValue(validSelections);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.phasesData = [];
        this.PendingApprovalReportForm.get('phases')?.setValue([]);
      }
    });
}
removeDuplicatePhases(list: any[]) {
    const map = new Map();
    list.forEach(item => map.set(item.phaseId, item));
    return Array.from(map.values());
  }
  // generate,export button show,hide
  get isLeaveGenerateDisabled(): boolean {
    const { clientId, projectId, employeid, dateRange, status, phases, billable, taskId } = this.PendingApprovalReportForm.value;
    const hasClient = clientId !== null && clientId !== undefined;
    const hasProject = projectId !== null && projectId !== undefined;
    const hasDateRange = dateRange && (dateRange.startDate || dateRange.endDate);
    const hasStatus = status !== null && status !== undefined;
    const hasEmployeid = employeid !== null && employeid !== undefined;
    const hasPhase = phases !== null && phases !== undefined;
    const hasBillable = billable !== null && billable !== undefined;
        const isTaskSelected = taskId != null && taskId != '';

    return !(hasClient || hasProject || hasDateRange || hasStatus || hasEmployeid || hasPhase || hasBillable || isTaskSelected);
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
     if (formValue.phases) {
      params.PhaseIds = formValue.phases;
    }
    if (formValue.status) params.Statuses = formValue.status.join(',');
    if (formValue.billable?.value) params.Billable = formValue.billable.value;
    if(formValue.taskId!= null && formValue.taskId !== undefined && formValue.taskId !== ''  )
    {
      params.TaskIds = formValue.taskId?.map((x: any) => x.id)?.join(',');;
    }
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
  // export the report
  exportPendingApprovalReport() {
    if (this.PendingApprovalReportForm.invalid) return;
    this.spinnerLoader2 = true;
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();
    
    // Add sorting to export as well
    const sortQuery = this.currentSortField && this.currentSortOrder !== 0 ? `&Sorts=${this.currentSortField}:${this.currentSortOrder === 1 ? 'asc' : 'desc'}` : '';
    
    this.http.downloadTimesheetReport(
      `TimesheetReport/export-report?${queryString}&page=${this.page}&pageSize=${this.pageSize}${sortQuery}`
    ).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.spinnerLoader2 = false;
        // Extract filename from Content-Disposition
        let filename = `Pending Approval Status Report - ${this.http.formattedDate}.xlsx`;
        
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
        this.conformationPopup.openSuccessModal("Pending Approval Status Report exported successfully");
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

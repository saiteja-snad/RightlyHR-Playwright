import { Component, OnDestroy, OnInit, TemplateRef, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ReportsHeaderComponent } from "../../../shared/reports-tabs/reports-header/reports-header.component";
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { AuthService } from '../../../services/auth.service';
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
import { TimesheetReportTabsComponent } from '../../../shared/reports-tabs/timesheet-report-tabs/timesheet-report-tabs.component';
import { OpenModalService } from '../../../services/open-modal.service';
import { PaginatorModule } from 'primeng/paginator';
import { NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { HttpResponse } from '@angular/common/http';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-my-timesheet-report',
  imports: [DatePicker, NgbPopoverModule, MultiSelectModule, TableModule, CommonModule, FormsModule, DropdownModule, SelectModule, TranslateModule, ReactiveFormsModule,
    NoDataFoundComponent, PaginatorModule, DataLoaderContentComponent, ReportsHeaderComponent, InfoIconComponent],
  templateUrl: './my-timesheet-report.component.html',
  styleUrl: './my-timesheet-report.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MyTimesheetReportComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  loggedInUser = {} as IemployeeDetails;
  isLoading: boolean = false;
  filteredmytimesheetRecord: any[] = [];
  projectsData: any[] = [];
  MyTimesheetReportForm!: FormGroup;
  spinnerLoader1 = false;
  spinnerLoader2 = false;
  isFilterIndicatorActive = false;
  disableBtn = false;
  destroy$ = new Subject<boolean>();
  empinfo: any;
  clients: ClientData[] = [];
  projects: TimesheetReportTabsComponent[] = [];
  noclientproject = false;
  phasesData: any[] = [];
  BillableOptions = [
    { key: 'Billable', value: 'true' },
    { key: 'Non-Billable', value: 'false' },
  ];
  TimesheetStatus = [
    { key: 'Waiting for Approval', value: 'Waiting for Approval' },
    { key: 'Approved', value: 'Processed' },
    { key: 'Rejected', value: 'Rejected' },
  ];
  clientDropdownList: { label: string; value: number }[] = [];
  resourcesArrayList: any;
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
  filteredProjects: any[] = [];
  employeeData: any;
  getEmployeeInfo = [] as any;
  isDistinct = true;
  tastType: any[] = [];
  
  // Sorting properties
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  currentUIField: string = ''; // Track the UI field name for visual state
  suppressNextPageChange = false;
  
  // Sort field mapping for server-side sorting
  readonly sortFieldMap: Record<string, string> = {
    date: 'date',
    client: 'client',
    project: 'project',
    phase: 'phase',
    taskType: 'taskType',
    hoursWorked: 'hoursWorked',
    billableStatus: 'billableStatus',
    submittedDate: 'submittedDate',
    approvalStatus: 'approvalStatus'
  };


  constructor(
    public authService: AuthService,
    private http: HttpService,
    private fb: FormBuilder,
    public rbac: RbacService,
    public readonly router: Router,
    private conformationPopup: OpenModalService,
    private offcanvasService: NgbOffcanvas,
    private cdr: ChangeDetectorRef,
  ) { }

  customSort(event: any): void {
    const field = event.field;
    const order = event.order;

    // Map UI field to backend field
    const backendFieldMap: { [key: string]: string } = {
      date: 'date',
      client: 'client',
      project: 'project',
      phase: 'phase',
      taskType: 'taskType',
      hoursWorked: 'hoursWorked',
      billableStatus: 'billableStatus',
      submittedDate: 'submittedDate',
      approvalStatus: 'approvalStatus'
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
        this.generatemytimesheetReport(this.page, this.pageSize, true, true);
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
    this.generatemytimesheetReport(this.page, this.pageSize, true, true);
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.loggedInUser = this.authService.getToken();
    this.initializeForm();
    this.getResourceData();
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
    this.MyTimesheetReportForm = this.fb.group({
      client: [null],
      project: [null],
      dateRange: [null],
      status: [null],
      billable: [null],
      phases: [{ value: null, disabled: true }],
      taskId:[null]
    });
    this.MyTimesheetReportForm.addControl('projects', this.fb.array([]));
    this.MyTimesheetReportForm.valueChanges.subscribe(() => {
      this.disableBtn = true;
    })
  }
  // clear all filters
  isFilterApplied(): boolean {
    const formValue = this.MyTimesheetReportForm.value;
    const isClientSelected = Array.isArray(formValue.client) ? formValue.client.length > 0 : !!formValue.client;
    const isProjectSelected = Array.isArray(formValue.project) ? formValue.project.length > 0 : !!formValue.project;
    const isBillableSelected = formValue.billable != null;
    const isStatusSelected = formValue.status != null;
    const isDateRangeSelected = Array.isArray(formValue.dateRange) ? formValue.dateRange.length > 0 : !!formValue.dateRange;
    const isPhaseSelected = formValue.phases != null && formValue.phases.value != null;
    const isTaskSelected = formValue.taskId != null && formValue.taskId != '';
    return (isClientSelected ||isProjectSelected ||isStatusSelected ||isBillableSelected ||isDateRangeSelected ||isPhaseSelected|| isTaskSelected);
  }
  phasesList: any[] = [];
  clearAllFilters(): void {
    //Reset dropdown data
    this.filteredProjects = [];
    this.phasesData = [];
    this.MyTimesheetReportForm.reset();
    this.filteredmytimesheetRecord = [];
    this.isFilterIndicatorActive = false;
    this.MyTimesheetReportForm.get('project')?.setValue(null);
    this.MyTimesheetReportForm.get('client')?.setValue(null);
    this.MyTimesheetReportForm.get('billable')?.setValue(null);
    this.MyTimesheetReportForm.get('status')?.setValue(null);
    this.MyTimesheetReportForm.get('dateRange')?.setValue(null);
    this.MyTimesheetReportForm.get('phases')?.setValue(null);
    this.MyTimesheetReportForm.get('phases')?.disable();
    this.MyTimesheetReportForm.get('taskId')?.setValue(null);
    this.collectionSize = 0;
    
    // Reset sorting arrows and pagination - use null and 0 for proper reset
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    
    // Reset pagination to first page
    this.page = 1;
    this.first = 0;
    
    // Prevent suppression of next page change to ensure proper reset
    this.suppressNextPageChange = false;
    
    // Reset disabled button state
    this.disableBtn = false;
    
    // Close the offcanvas after clearing
    this.closeCanvas();
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

  onGenerate() {
    this.isFilterIndicatorActive = this.isFilterApplied();
    this.generatemytimesheetReport(this.page, this.pageSize, true, true);
  }
  // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.generatemytimesheetReport(this.page, this.pageSize);
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
    this.generatemytimesheetReport(this.page, this.pageSize, false, false);
  }
  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.generatemytimesheetReport(this.page, this.pageSize, true, true);
  }
  //GET CLIENT AND PROJECT
  getResourceData() {
    this.clientDropdownList = [];   // reset
    this.projectsData = [];         
    this.filteredProjects = [];    
    this.http.getDataIncludeParams( `v2/ProjectResource?status=active&employeeId=${this.empinfo.employeeId}&isProjectRequired=true`).pipe(takeUntil(this.destroy$)).subscribe((res: any) => {
        if (!res.success) return;
        const rawData = res.data;
        /** 1️ Prepare clients */
        this.clients = rawData.reduce((acc: any[], curr: any) => {
          const existingClient = acc.find(c => c.clientId === curr.client.clientId);
          const projectObj = {
            projectId: curr.project.projectId,
            projectName: curr.project.projectName
          };
          if (existingClient) {
            existingClient.projects.push(projectObj);
          } else {
            acc.push({
              clientId: curr.client.clientId,
              clientName: curr.client.clientName,
              projects: [projectObj]
            });
          }
          return acc;
        }, []);

        // Add "No Client" if needed
        if (!this.noclientproject) {
          this.clients.unshift({
            clientId: 0,
            clientName: "No Client",
            projects: [{ projectId: 0, projectName: "No Project" }]
          });
        }

        /** Final dropdown list */
        this.clientDropdownList = this.clients.map(c => ({
          label: c.clientName,
          value: c.clientId
        }));

        /** 2️ Prepare project dropdown */
        const projectList = rawData.map((x: { project: { projectId: any; projectName: any; }; client: { clientId: any; }; }) => ({
          projectId: x.project.projectId,
          displayprojectName: x.project.projectName,
          clientId: x.client.clientId
        }));

        // Deduplicate real projects
        this.projectsData = Array.from(new Map(projectList.map((p: any) => [p.projectId, p])).values());
        //  ADD THIS — ensure "No Project" appears
        if (!this.noclientproject) {
          this.projectsData.unshift({
            projectId: 0,
            displayprojectName: "No Project",
            clientId: 0
          });
        }
      });
  }
  // client onchanges event works
  getAllActiveProjects(event: any) {
    const selectedClientIds = event.value || [];
    const projectControl = this.MyTimesheetReportForm.get('project');
    // CASE 4 → No client selected → show all
    if (selectedClientIds.length === 0) {
      this.filteredProjects = this.projectsData;
      projectControl?.setValue(null);
        this.MyTimesheetReportForm.get('phases')?.setValue([]);
      this.MyTimesheetReportForm.get('phases')?.disable();
      return;
    }
    const hasNoClient = selectedClientIds.includes(0);
    const realClientIds = selectedClientIds.filter((id: number) => id !== 0);
    // CASE 3 → 0 + real clients → No Project + ONLY real projects of selected clients
    if (hasNoClient && realClientIds.length > 0) {
      this.filteredProjects = [
        { projectId: 0, displayprojectName: "No Project", clientId: 0 },
         ...this.projectsData.filter(p =>realClientIds.includes(p.clientId)
        )
      ];
    }
    // CASE 2 → Only real clients
    if (!hasNoClient) {
      this.filteredProjects = this.projectsData.filter(
        p => realClientIds.includes(p.clientId)
      );
    }
    // CASE 1 → ONLY "No Client"
    if (hasNoClient && realClientIds.length === 0) {
      this.filteredProjects = [
        { projectId: 0, displayprojectName: "No Project", clientId: 0 }
      ];
      projectControl?.setValue(null);
      return;
    }
    // remove invalid selected project ids
    const prev = projectControl?.value || [];
    const valid = prev.filter((pid: number) =>
    this.filteredProjects.some(p => p.projectId === pid)
    );
    projectControl?.setValue(valid.length ? valid : null);
  }
  
 
  onProjectChange(event: any) {
    const selectedProjectIds = event.value;
    // CASE 1: No project is selected
    if (!selectedProjectIds || selectedProjectIds.length === 0) {
      this.projects = [];
      this.phasesData = [];
      this.MyTimesheetReportForm.get('phases')?.setValue([]);
      this.MyTimesheetReportForm.get('phases')?.disable();
      return;
    }
    // CASE 2: Project(s) selected
    this.projects = selectedProjectIds;
    this.MyTimesheetReportForm.get('phases')?.enable();
    this.getPhaseData();
   // this.getAllActiveEmployees();
  }
// all active employee based on project
  // getAllActiveEmployees() {
  //   const previousSelected = this.MyTimesheetReportForm.get('phases')?.value || [];
  //   this.http.getData(`v2/ProjectResource?status=Active&entityType=project&entityRefId=${this.projects}&isDistinct=${this.isDistinct}`).pipe(takeUntil(this.destroy$)).subscribe({
  //       next: (res: any) => {
  //         const newPhases = res?.data ?.filter((x: any) => x.phase).map((x: any) => ({
  //             phaseId: x.phase.phaseId,
  //             phaseName: x.phase.phaseName
  //           })) ?? [];
  //         this.phasesData = this.removeDuplicatePhases(newPhases);
  //         // keep only phases matching current projects
  //         const validSelections = previousSelected.filter((selectedId: any) =>
  //         this.phasesData.some((p: any) => p.phaseId === selectedId)
  //         );
  //         // assign valid phases only
  //         this.MyTimesheetReportForm.get('phases')?.setValue(validSelections);
  //       },
  //       error: () => {
  //         this.phasesData = [];
  //         this.MyTimesheetReportForm.get('phases')?.setValue([]);
  //       }
  //     });
  // }
  removeDuplicatePhases(list: any[]) {
    const map = new Map();
    list.forEach(item => map.set(item.phaseId, item));
    return Array.from(map.values());
  }
    getPhaseData() {
  const previousSelected = this.MyTimesheetReportForm.get('phases')?.value || [];
  const params = {
    projectId: this.projects.join(','), 
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
        this.MyTimesheetReportForm.get('phases')?.setValue(validSelections);
   
      },
      error: () => {
       
        this.phasesData = [];
        this.MyTimesheetReportForm.get('phases')?.setValue([]);
      }
    });
}
  get isLeaveGenerateDisabled(): boolean {
    const { client, project, dateRange, billable, status, phases, taskId } = this.MyTimesheetReportForm.value;
    const hasClient = client !== null && client !== undefined;
    const hasProject = project !== null && project !== undefined;
    const hasDateRange = Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1];
    const hasBillable = billable !== null && billable !== undefined;
    const hasStatus = status !== null && status !== undefined;
    const hasphase = phases !== null && phases !== undefined;
    const isTaskSelected = taskId != null && taskId != '';
    return !(hasClient || hasProject || hasDateRange || hasBillable || hasStatus || hasphase || isTaskSelected);
  }
  // payload for generate the data
  buildTimesheetReportParams() {
    const formValue = this.MyTimesheetReportForm.value;
    console.log(formValue);
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
      ReportType: 'MyTimesheet',
      EmployeeIds: this.empinfo.employeeId
    };
    if (formValue.client !== null && formValue.client !== undefined) {
      params.ClientIds = formValue.client ? formValue.client : 0;
    }
    if (formValue.project !== null && formValue.project !== undefined) {
      params.ProjectIds = formValue.project ? formValue.project : 0;
    }
    if (startDate) params.StartDate = startDate;
    if (endDate) params.EndDate = endDate;
    if (formValue.billable?.value) params.Billable = formValue.billable?.value;
    if (formValue.status){
      console.log(formValue.status);
       params.Statuses = formValue.status?.map((x: any) => x.value)?.join(',');
    }
    if (formValue.phases !== null && formValue.phases !== undefined) {
      params.PhaseIds = formValue.phases;
    }
    if(formValue.taskId!= null && formValue.taskId !== undefined && formValue.taskId !== ''  )
    {
      params.TaskIds = formValue.taskId?.map((x: any) => x.id)?.join(',');;
    }
    return params;
  }
  // generate api
  generatemytimesheetReport(page: number, pageSize: number, showLoader: boolean = true, resetPagination: boolean = false) {
    if (this.MyTimesheetReportForm.invalid) return;
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
          this.filteredmytimesheetRecord = res.data.items;
          this.collectionSize = res.data.totalCount || 0;
          // If total count smaller than current offset, go back to first
          if (this.first >= this.collectionSize) {
            this.first = 0;
            this.page = 1;
          }
          this.disableBtn = false;
        } else {
          this.filteredmytimesheetRecord = [];
          this.collectionSize = 0;
        }
      },
      error: (err) => {
        this.spinnerLoader1 = false;
        console.error('Error fetching report:', err);
        this.filteredmytimesheetRecord = [];
        this.collectionSize = 0;
        this.disableBtn = true;
        this.offcanvasService.dismiss();
      },
    });
  }
  // export api
  exportmytimesheetreport() {
    if (this.MyTimesheetReportForm.invalid) return;
    this.spinnerLoader2 = true;
    const params = this.buildTimesheetReportParams();
    const queryString = new URLSearchParams(params).toString();
    
    // Add sorting to export as well
    const sortQuery = this.currentSortField && this.currentSortOrder !== 0 ? `&Sorts=${this.currentSortField}:${this.currentSortOrder === 1 ? 'asc' : 'desc'}` : '';
    
    this.http.downloadTimesheetReport(`TimesheetReport/export-report?${queryString}&page=${this.page}&pageSize=${this.pageSize}${sortQuery}`).subscribe({
      next: (response: HttpResponse<Blob>) => {
        this.spinnerLoader2 = false;
        // Extract filename from Content-Disposition
        let filename = `My Timesheet Report - ${this.http.formattedDate}.xlsx`;
        
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
        this.conformationPopup.openSuccessModal("My Timesheet Report exported successfully");
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

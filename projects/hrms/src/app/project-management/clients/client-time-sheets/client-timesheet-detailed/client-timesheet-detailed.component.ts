import { Component, OnInit, ViewChildren, ViewEncapsulation, QueryList } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { DateformatPipe } from "../../../../pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { SkeletonModule } from 'primeng/skeleton';
@Component({
  selector: 'app-client-timesheet-detailed',
  imports: [CommonModule, AccordionModule, PaginatorModule, TranslateModule, TableModule, ChipModule,
    DateformatPipe, NoDataFoundComponent, SkeletonModule],
  templateUrl: './client-timesheet-detailed.component.html',
  styleUrl: './client-timesheet-detailed.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ClientTimesheetDetailedComponent implements OnInit {
  @ViewChildren('resourceTable') resourceTables!: QueryList<Table>;
  projectDetails: any;
  originalProjectDetails: any[] = [];
  resourceDetails: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  clientId: any;
  projectId: any;
  contentLoader = false;

  employeeName: any
  selectedEntries: any
  selectedProject: any

  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  currentProjectIndex: number = -1; // Track which project's table is being sorted

  constructor(public modalService: NgbModal, public readonly router: Router, private http: HttpService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const clientID = params['id'];
      if (clientID) {
        this.clientId = clientID;
        this.getResourceDetails(clientID);
      }
    });

    this.http.requestclienttimesheetdata$.pipe(takeUntil(this.destroy$)).subscribe(request => {
      if (request) {
        this.getResourceDetails(this.clientId, request);
      }
    });
  }
  getResourceDetails(clientID: any, filters?: any): void {
    this.contentLoader = true;
    let url = `ProjectResource/getClientProjectResourceSummary?clientId=${clientID}`;

    if (filters) {
      if (filters.dateRange?.startDate && filters.dateRange?.endDate) {
        url += `&startDate=${filters.dateRange.startDate}&endDate=${filters.dateRange.endDate}`;
      }
      if (filters.departmentIds?.length > 0) {
        url += `&departmentIds=${filters.departmentIds.join(',')}`;
      }
      if (filters.roleIds?.length > 0) {
        url += `&roleIds=${filters.roleIds.join(',')}`;
      }
      if (filters.phaseIds?.length > 0) {
        url += `&phaseId=${filters.phaseIds.join(',')}`;
      }
    }

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const rawProjects = res?.data || [];

        this.projectDetails = rawProjects.map((item: any) => ({
          ...item,
          groupedResources: item.project.resources,
          originalGroupedResources: [...item.project.resources] // Store original order
        }));

        this.originalProjectDetails = JSON.parse(JSON.stringify(this.projectDetails));
        this.contentLoader = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.contentLoader = false;
        this.projectDetails = [];
        this.originalProjectDetails = [];
      }
    });
  }



  openModal(entry: any, project: any, content: any) {
    this.employeeName = {
      id: entry.employee.id,
      fusionEmployeeId: entry.employee.fusionEmployeeId,
      name: entry.employee.name,
      workMail: entry.employee.workMail
    };
    this.selectedProject = {
      projectName: project.project.projectName
    };
    // Convert the entry.phases into popup format
    this.selectedEntries = entry.phases.map((phase: any) => ({

      phaseName: phase.phaseName,
      resourceStartDate: phase.resourceStartDate,
      resourceEndDate: phase.resourceEndDate,
      resourceRole: phase.resourceRole,
      loggedHoursHHMM: phase.loggedHoursHHMM,
      resourceStatus: phase.resourceStatus,
          allocatedHours:phase.allocatedHours
    }));

    this.modalService.open(content, { size: 'lg', backdrop: 'static', centered: true });
  }
  navigateView(projectdata: any, employeeId: any): void {
    console.log(projectdata);
    const resourceData = {
      employeeId: employeeId,
      clientId: parseInt(this.clientId),
      projectId: projectdata.projectId
    };
    localStorage.setItem('resourceData', JSON.stringify(resourceData))
    localStorage.setItem('clientProjectId', this.clientId.toString());
    this.router.navigate(['/project-management/clients/details/timesheet/resource-summary'], {
      queryParams: {
        id: parseInt(this.clientId),
      }
    }).then(() => {
      this.http.notifyresource();
    });
  }

  customSort(event: any, projectIndex: number): void {
    const field = event.field;
    
    // If sorting a different project's table, reset sort state
    if (this.currentProjectIndex !== projectIndex) {
      this.currentProjectIndex = projectIndex;
      this.currentSortField = field;
      this.currentSortOrder = event.order; // Use PrimeNG's order
    } else if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.projectDetails[projectIndex].groupedResources = [...this.projectDetails[projectIndex].originalGroupedResources];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        this.currentProjectIndex = -1;
        
        // Reset the specific table
        const tables = this.resourceTables?.toArray();
        if (tables && tables[projectIndex]) {
          tables[projectIndex].reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = event.order; // Use PrimeNG's order
      }
    } else {
      // New field clicked - use PrimeNG's default order
      this.currentSortField = field;
      this.currentSortOrder = event.order; // Use PrimeNG's order
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      if (field === 'employee.name') {
        // Handle nested employee name
        val1 = String(a?.employee?.name ?? '').trim();
        val2 = String(b?.employee?.name ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      } else if (field === 'roles') {
        // Handle roles (comma-separated string)
        val1 = String(a?.roles ?? '').trim();
        val2 = String(b?.roles ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      } else if (field === 'departments') {
        // Handle departments (comma-separated string)
        val1 = String(a?.departments ?? '').trim();
        val2 = String(b?.departments ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      } else if (field === 'phasesCount') {
        // Handle numeric phases count
        val1 = parseInt(a?.phasesCount ?? 0);
        val2 = parseInt(b?.phasesCount ?? 0);
        return event.order * (val1 - val2);
      } else if (field === 'totalLoggedHoursHHMM') {
        // Handle time format HH:MM - convert to minutes for proper sorting
        const parseTime = (time: string): number => {
          if (!time) return 0;
          const parts = time.split(':');
          if (parts.length !== 2) return 0;
          return parseInt(parts[0]) * 60 + parseInt(parts[1]);
        };
        val1 = parseTime(a?.totalLoggedHoursHHMM ?? '0:00');
        val2 = parseTime(b?.totalLoggedHoursHHMM ?? '0:00');
        return event.order * (val1 - val2);
      } else {
        // Default string comparison
        val1 = String(a[field] ?? '').trim();
        val2 = String(b[field] ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { DateformatPipe } from "../../../../pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { ChipModule } from 'primeng/chip';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-project-timesheet-detailed',
  imports: [CommonModule, DateformatPipe, NoDataFoundComponent, ChipModule, DataLoaderContentComponent, TableModule],
  templateUrl: './project-timesheet-detailed.component.html',
  styleUrl: './project-timesheet-detailed.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ProjectTimesheetDetailedComponent {
  @ViewChild('detailedTimesheetTable') detailedTimesheetTable!: Table;
  @ViewChild('modalTimesheetTable') modalTimesheetTable!: Table;
  
  projectEmployeeDetails: any;
  filteredProjectEmployeeDetails: any[] = [];
  projectId: any;
  clientId: any;
  employeeName: any;
  selectedEntries: any;
  filteredSelectedEntries: any[] = [];
  selectedProject: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  loading = false;

  // Main table sorting properties
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  // Modal table sorting properties
  modalSortField: string = '';
  modalSortOrder: number = 0;

  constructor(public modalService: NgbModal, public readonly router: Router, private http: HttpService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: { [x: string]: any; }) => {
      const projectid = params['id'];
      if (projectid) {
        this.projectId = projectid
        this.getResourceDetails(projectid)
      }
    });
  }

  getResourceDetails(clientID: any): void {
    let url = `ProjectResource/getClientProjectResourceSummary?projectId=${clientID}`;
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const rawProjects = res?.data || [];
        this.selectedProject= rawProjects[0]?.project?.projectName
       this.clientId = rawProjects[0]?.client?.clientId;
        this.projectEmployeeDetails = rawProjects.flatMap((item: any) =>
          item.project.resources.map((resource: any) => ({
            employee: resource.employee,
            roles: resource.roles,
            departments: resource.departments,
            phasesCount: resource.phases.length,
            phases: resource.phases,
            totalLoggedHoursHHMM: resource.totalLoggedHoursHHMM ?? 0
          }))
        );
        this.filteredProjectEmployeeDetails = [...this.projectEmployeeDetails];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.loading = false;
        this.projectEmployeeDetails = [];
        this.filteredProjectEmployeeDetails = [];
      }
    });
  }

  customSort(event: any): void {
    const field = event.field;
    const order = event.order;

    // Map UI fields to data fields
    const fieldMap: { [key: string]: string } = {
      employeeName: 'employee.name',
      roles: 'roles',
      departments: 'departments',
      phasesCount: 'phasesCount',
      totalLoggedHoursHHMM: 'totalLoggedHoursHHMM'
    };

    const sortField = fieldMap[field] || field;

    // Handle three-state sorting: none → asc → desc → none
    if (this.currentSortField === sortField) {
      if (this.currentSortOrder === -1) {
        // Currently descending, reset to no sort
        this.currentSortField = '';
        this.currentSortOrder = 0;
        this.filteredProjectEmployeeDetails = [...this.projectEmployeeDetails];
        if (this.detailedTimesheetTable) {
          this.detailedTimesheetTable.sortField = '';
          this.detailedTimesheetTable.sortOrder = 0;
        }
        return;
      }
    }

    // Set new sort state
    this.currentSortField = sortField;
    this.currentSortOrder = order;

    // Perform client-side sorting
    this.filteredProjectEmployeeDetails.sort((a: any, b: any) => {
      let aValue = this.getNestedProperty(a, sortField);
      let bValue = this.getNestedProperty(b, sortField);

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });
  }

  customSortModal(event: any): void {
    const field = event.field;
    const order = event.order;

    // Map UI fields to data fields for modal
    const fieldMap: { [key: string]: string } = {
      phaseName: 'phaseName',
      resourceRole: 'resourceRole',
      resourceStartDate: 'resourceStartDate',
      resourceEndDate: 'resourceEndDate',
      loggedHoursHHMM: 'loggedHoursHHMM',
      resourceStatus: 'resourceStatus'
    };

    const sortField = fieldMap[field] || field;

    // Handle three-state sorting: none → asc → desc → none
    if (this.modalSortField === sortField) {
      if (this.modalSortOrder === -1) {
        // Currently descending, reset to no sort
        this.modalSortField = '';
        this.modalSortOrder = 0;
        this.filteredSelectedEntries = [...this.selectedEntries];
        if (this.modalTimesheetTable) {
          this.modalTimesheetTable.sortField = '';
          this.modalTimesheetTable.sortOrder = 0;
        }
        return;
      }
    }

    // Set new sort state
    this.modalSortField = sortField;
    this.modalSortOrder = order;

    // Perform client-side sorting
    this.filteredSelectedEntries.sort((a: any, b: any) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Handle different data types
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return -1 * order;
      if (aValue > bValue) return 1 * order;
      return 0;
    });
  }

  // Helper method to get nested property values
  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  getFilteredEmployeeDetails(): any[] {
    return this.filteredProjectEmployeeDetails;
  }

  getFilteredModalEntries(): any[] {
    return this.filteredSelectedEntries;
  }

  openModal(entry: any, content: any) {
    this.employeeName = {
      id: entry.employee.id,
      fusionEmployeeId: entry.employee.fusionEmployeeId,
      name: entry.employee.name,
      workMail: entry.employee.workMail
    };
    // Convert the entry.phases into popup format
    this.selectedEntries = entry.phases.map((phase: any) => ({
      phaseName: phase.phaseName,
      resourceStartDate: phase.resourceStartDate,
      resourceEndDate: phase.resourceEndDate,
      resourceRole: phase.resourceRole,
      loggedHoursHHMM: phase.loggedHoursHHMM,
      resourceStatus: phase.resourceStatus,
      allocatedHours: phase.allocatedHours
    }));
    this.filteredSelectedEntries = [...this.selectedEntries];
    // Reset modal sorting when opening
    this.modalSortField = '';
    this.modalSortOrder = 0;
    this.modalService.open(content, { size: 'lg', backdrop: 'static', centered: true });
  }

  navigateView(employeeId: any): void {
    const resourceData = {
      employeeId: employeeId,
      clientId: this.clientId,
      projectId: this.projectId
    };
    localStorage.setItem('resourceData', JSON.stringify(resourceData));
    this.router.navigate(['/project-management/projects/details/timesheet/resource-summary'], {
      queryParams: { id: this.projectId }
    }).then(() => {
      this.http.notifyresource();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

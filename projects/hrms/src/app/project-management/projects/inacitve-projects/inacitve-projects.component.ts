import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProjectManagementModuleInfoComponent } from '../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component';
import { HttpService } from '../../../services/http.service';
import { Subject, takeUntil } from 'rxjs';
import { Project } from '../../../Interfaces/projects.model';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { FormsModule } from '@angular/forms';
import { ActiveprojectsPipe } from '../../../Pipes/activeprojects.pipe';
import { ProjectsSideTabsComponent } from '../../../shared/project-management-tabs/projects-side-tabs/projects-side-tabs.component';
import { ProjectsSideTabsForClientsComponent } from '../../../shared/project-management-tabs/projects-side-tabs-for-clients/projects-side-tabs-for-clients.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { combineLatest } from 'rxjs';
import { Chip } from 'primeng/chip';

@Component({
  selector: 'app-inacitve-projects',
  imports: [
    NoDataFoundComponent,
    DataLoaderContentComponent,
    FormsModule,
    TranslateModule,
    CommonModule,
    RouterModule,
    ProjectManagementModuleInfoComponent,
    ConfirmationIconComponent,
    ActiveprojectsPipe,
    ProjectsSideTabsComponent,
    ProjectsSideTabsForClientsComponent,
    MultiSelectModule,
    Chip,
  ],
  templateUrl: './inacitve-projects.component.html',
  styleUrl: './inacitve-projects.component.scss',
})
export class InacitveProjectsComponent implements OnInit, OnDestroy {
  selectedProject: any;
  loading: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  projectsData: Project[] = [];
  empinfo: any = {};
  searchValue: any;
  inactiveClientStatus: any;
  departmentlist: any[] = [];
  clientDetails: any[] = [];
  projecttypes: any[] = [];
  selectedDepartmentIds: any[] = [];
  selectedProjectTypes: any[] = [];
  selectedClients: any[] = [];

  constructor(
    private router: Router,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    public rbac: RbacService,
    private offcanvasService: NgbOffcanvas
  ) {}

  ngOnInit() {
    this.http.setDepartmentIds([]);
    this.selectedDepartmentIds = [];
    this.selectedProjectTypes = [];
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.DepartmentList();
    this.getprojecttypesData();

    // Listen to department filter changes from service (shared across tabs)
    combineLatest([
      this.http.selectedDepartmentIds$,
      this.http.projectTypeFilter$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([deptIds, projectTypes]) => {
        this.selectedDepartmentIds = deptIds || [];
        this.selectedProjectTypes = projectTypes || [];

        this.getdatabaedonRoute();
      });
    this.getdatabaedonRoute();
    this.clientList();
  }

  // Load Departments
  DepartmentList() {
    this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.departmentlist = data || [];
      },
      error: () => {
        this.departmentlist = [];
      },
    });
  }
  //get clients
  clientList() {
    this.http.getData('Client/GetAll').subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.clientDetails = data
          .map((client: any) => ({
            clientId: client.clientId,
            clientName: client.clientName,
          }))
          .sort((a: any, b: any) => a.clientName.localeCompare(b.clientName));
      },
      error: () => {
        this.clientDetails = [];
      },
    });
  }
  // Load Project Types
  getprojecttypesData(): void {
    this.http
      .getData(`entityAttributeValues?entity=Project&attribute=Project Type`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projecttypes = Array.isArray(res) ? res : res?.data || [];
        },
        error: () => {
          this.projecttypes = [];
        },
      });
  }

  // Department filter change
  onDepartmentChangelist(event: any) {
    const selectedIds = event.value || [];
    this.http.setDepartmentIds(selectedIds.length > 0 ? selectedIds : null);
  }

  // Project Type filter change
  onProjectTypeChange() {
    this.getdatabaedonRoute(); // Re-fetch with new filters
  }

  getdatabaedonRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/project-management/projects')) {
      this.getAllInactiveProjects();
      this.http.projectDetailesadded$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.getAllInactiveProjects();
        });
    } else if (fullPath.startsWith('/project-management/clients')) {
      this.route.queryParams.subscribe((params) => {
        const clientID = params['id'];
        if (clientID) {
          this.getprojectbyid(parseInt(clientID));
          this.http.projectDetailesadded$
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => {
              this.getprojectbyid(parseInt(clientID));
            });
        }
      });
    }
  }

  navigateView(projectId: number) {
    localStorage.setItem('projectProjectId', projectId.toString());
    this.router.navigate(['project-management/projects/details'], {
      queryParams: { id: projectId },
    });
  }

  getDepartmentNames(project: Project): string {
    if (!project.departments || project.departments.length === 0) {
      return '-';
    }
    return project.departments.map((d) => d.departmentName).join(', ');
  }

  getAllInactiveProjects() {
    this.loading = true;
    let url = 'Project?status=Inactive';

    // Apply Department Filter
    if (this.selectedDepartmentIds && this.selectedDepartmentIds.length > 0) {
      url += `&departmentIds=${this.selectedDepartmentIds.join(',')}`;
    }

    // Apply Project Type Filter (optional)
    if (this.selectedProjectTypes && this.selectedProjectTypes.length > 0) {
      url += `&projectTypes=${this.selectedProjectTypes.join(',')}`;
    }

    const clientIds = this.selectedClients
      .map((c: any) => c?.clientId)
      .filter((id): id is number => id != null);

    if (clientIds.length > 0) {
      url += `&clientId=${clientIds.join(',')}`; // ← Now correctly sends "57,56"
    }

    this.http
      .getData(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projectsData = res?.data ?? [];
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching inactive projects:', err);
          this.projectsData = [];
          this.loading = false;
        },
      });
  }

  getprojectbyid(clientID: any): void {
    this.loading = true;
    let url = `Project?clientId=${clientID}&status=Inactive`;

    if (this.selectedDepartmentIds && this.selectedDepartmentIds.length > 0) {
      url += `&departmentIds=${this.selectedDepartmentIds.join(',')}`;
    }
    if (this.selectedProjectTypes && this.selectedProjectTypes.length > 0) {
      url += `&projectTypes=${this.selectedProjectTypes.join(',')}`;
    }
    const clientIds = this.selectedClients
      .map((c: any) => c?.clientId)
      .filter((id): id is number => id != null);

    if (clientIds.length > 0) {
      url += `&clientId=${clientIds.join(',')}`; // ← Now correctly sends "57,56"
    }

    this.http
      .getData(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projectsData = res?.data ?? [];
          this.inactiveClientStatus =
            res?.data?.[0]?.client?.status?.toLowerCase();
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching projects for client:', err);
          this.loading = false;
        },
      });
  }

  openModalstatus(modal: any, project: Project) {
    this.modalService.open(modal, { centered: true, backdrop: 'static' });
    this.selectedProject = { ...project }; // store project details
  }

  confirmStatusChange(modal: any) {
    if (!this.selectedProject) return;
    const updatedProject = {
      ...this.selectedProject,
      status: 'Active',
      updatedBy: parseInt(this.empinfo.employeeId),
    };
    this.http
      .putData(`Project/${this.selectedProject.projectId}`, updatedProject)
      .subscribe({
        next: (res) => {
          this.http.setnewcountDetailsfornewprojectcount();
          this.conformationPopup.openSuccessModal(
            'Project marked as Active successfully'
          );
          modal.close(); // close modal only after success
          const fullPath = this.router.url;
          if (fullPath.startsWith('/project-management/projects')) {
            this.getAllInactiveProjects();
          } else if (fullPath.startsWith('/project-management/clients')) {
            const clientID = this.route.snapshot.queryParams['id'];
            if (clientID) {
              this.getprojectbyid(parseInt(clientID));
            }
          }
        },
        error: (err) => {
          console.error('Error updating project status:', err);
          this.conformationPopup.openErrorModal(
            err.error?.message || 'Failed to update status'
          );
        },
      });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  clearAllFilters() {
    this.selectedDepartmentIds = [];
    this.selectedProjectTypes = [];
    this.selectedClients = [];

    // Force UI update
    this.selectedDepartmentIds = [...this.selectedDepartmentIds];
    this.selectedProjectTypes = [...this.selectedProjectTypes];
    this.selectedClients = [...this.selectedClients];

    this.getdatabaedonRoute();
  }

  onClientChange() {
    this.getdatabaedonRoute();
  }

  getLighterColor(color: any, amount: number = 0.9): string {
    if (!color) return color || '#d8d8daff'; // Default color if none provided;

    // Remove # if present
    const hex = color.replace('#', '');

    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate lighter values
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG
      .toString(16)
      .padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
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

  // 1. Show red dot on Filters button
  isFilterApplied(): boolean {
    return (
      this.selectedClients.length > 0 ||
      this.selectedDepartmentIds.length > 0 ||
      this.selectedProjectTypes.length > 0
    );
  }

  // 2. Build chips list
  getSelectedFilters(): any[] {
    const filters: any[] = [];

    // Clients
    this.selectedClients.forEach((client: any) => {
      filters.push({ type: 'client', label: client.clientName, value: client });
    });

    // Departments
    this.selectedDepartmentIds.forEach((id: any) => {
      const dept = this.departmentlist.find((d: any) => d.sno === id);
      if (dept) {
        filters.push({
          type: 'department',
          label: dept.departmentName,
          value: id,
        });
      }
    });

    // Project Types
    this.selectedProjectTypes.forEach((type: string) => {
      filters.push({ type: 'projectType', label: type, value: type });
    });

    return filters;
  }

  // 3. Remove single chip
  removeFilter(filter: any) {
    if (filter.type === 'client') {
      this.selectedClients = this.selectedClients.filter(
        (c: any) => c !== filter.value
      );
    } else if (filter.type === 'department') {
      this.selectedDepartmentIds = this.selectedDepartmentIds.filter(
        (id: any) => id !== filter.value
      );
      this.http.setDepartmentIds(
        this.selectedDepartmentIds.length > 0 ? this.selectedDepartmentIds : []
      );
    } else if (filter.type === 'projectType') {
      this.selectedProjectTypes = this.selectedProjectTypes.filter(
        (t: string) => t !== filter.value
      );
    }

    this.getdatabaedonRoute(); // Reload data
  }
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

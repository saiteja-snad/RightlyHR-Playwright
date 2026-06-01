import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { ProjectManagementModuleInfoComponent } from '../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { Project } from '../../../Interfaces/projects.model';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { ActiveclientsPipe } from '../../../Pipes/activeclients.pipe';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ProjectsSideTabsComponent } from '../../../shared/project-management-tabs/projects-side-tabs/projects-side-tabs.component';
import { ActiveprojectsPipe } from '../../../Pipes/activeprojects.pipe';
import { ProjectsSideTabsForClientsComponent } from '../../../shared/project-management-tabs/projects-side-tabs-for-clients/projects-side-tabs-for-clients.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { combineLatest } from 'rxjs';
import { Chip } from 'primeng/chip';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-hold-projects',
  imports: [
    ProjectManagementModuleInfoComponent,
    DataLoaderContentComponent,
    CommonModule,
    FormsModule,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    TranslateModule,
    ConfirmationIconComponent,
    ProjectsSideTabsComponent,
    ActiveprojectsPipe,
    ProjectsSideTabsForClientsComponent,
    MultiSelectModule,
    Chip,
    PaginatorModule,
  ],
  templateUrl: './hold-projects.component.html',
  styleUrl: './hold-projects.component.scss',
})
export class HoldProjectsComponent implements OnInit, OnDestroy {
  selectedProject: any;
  loading: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  projectsData: Project[] = [];
  empinfo: any = {};
  searchValue: any;
  searchSubject = new Subject<string>();
  inactiveClientStatus: any;
  departmentlist: any[] = [];
  projecttypes: any[] = [];
  selectedDepartmentIds: any[] = [];
  selectedProjectTypes: any[] = [];
  selectedClients: any[] = [];
  clientDetails: any[] = [];

  // Pagination
  // Pagination
  page = 1;
  pageSize = 25;
  rows = 25;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 25, value: 25 },
    { label: 50, value: 50 },
    { label: 75, value: 75 },
    { label: 100, value: 100 },

  ];
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

    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.first = 0;
      this.getdatabaedonRoute();
    });

    this.getdatabaedonRoute();
    this.DepartmentList();
    this.getprojecttypesData();
    this.clientList();

    // Listen to department filter changes from service (shared across tabs)
    combineLatest([
      this.http.selectedDepartmentIds$,
      this.http.projectTypeFilter$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([deptIds, projectTypes]) => {
        this.selectedDepartmentIds = deptIds || [];
        this.selectedProjectTypes = projectTypes || [];
        this.page = 1;
        this.first = 0;
        this.getdatabaedonRoute();
      });
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
    this.page = 1;
    this.first = 0;
  }

  // Project Type filter change
  onProjectTypeChange() {
    this.page = 1;
    this.first = 0;
    this.getdatabaedonRoute();
  }

  getdatabaedonRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/project-management/projects')) {
      this.getAllHoldProjects();
      this.http.projectDetailesadded$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.getAllHoldProjects();
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
    this.router.navigate(
      ['project-management/projects/details'],
      { queryParams: { id: projectId } } // using query params
    );
  }

  getDepartmentNames(project: Project): string {
    if (!project.departments || project.departments.length === 0) {
      return '-';
    }
    return project.departments.map((d) => d.departmentName).join(', ');
  }

  getAllHoldProjects() {
    this.loading = true;
    let url = `Project?status=hold&pageNumber=${this.page}&pageSize=${this.pageSize}`;

    if (this.searchValue?.trim()) {
      url += `&searchTerm=${encodeURIComponent(this.searchValue.trim())}`;
    }

    if (this.selectedDepartmentIds.length > 0) {
      url += `&departmentIds=${this.selectedDepartmentIds.join(',')}`;
    }
    if (this.selectedProjectTypes.length > 0) {
      url += `&projectTypes=${this.selectedProjectTypes.join(',')}`;
    }
    const clientIds = this.selectedClients
      .map((c: any) => c?.clientId)
      .filter((id): id is number => id != null);

    if (clientIds.length > 0) {
      url += `&clientId=${clientIds.join(',')}`;
    }

    this.http
      .getData(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projectsData = res?.data ?? [];
          this.collectionSize = res?.pagination?.totalRecords || 0;
          this.loading = false;
        },
        error: () => {
          this.projectsData = [];
          this.collectionSize = 0;
          this.loading = false;
        },
      });
  }

  getprojectbyid(clientID: any): void {
    this.loading = true;
    let url = `Project?clientId=${clientID}&status=hold&pageNumber=${this.page}&pageSize=${this.pageSize}`;

    if (this.searchValue?.trim()) {
      url += `&searchTerm=${encodeURIComponent(this.searchValue.trim())}`;
    }

    if (this.selectedDepartmentIds.length > 0) {
      url += `&departmentIds=${this.selectedDepartmentIds.join(',')}`;
    }
    if (this.selectedProjectTypes.length > 0) {
      url += `&projectTypes=${this.selectedProjectTypes.join(',')}`;
    }

    const clientIds = this.selectedClients
      .map((c: any) => c?.clientId)
      .filter((id): id is number => id != null);

    if (clientIds.length > 0) {
      url += `&clientId=${clientIds.join(',')}`;
    }

    this.http
      .getData(url)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projectsData = res?.data ?? [];
          this.collectionSize = res?.pagination?.totalRecords || 0;
          this.inactiveClientStatus =
            res?.data?.[0]?.client?.status?.toLowerCase();
          this.loading = false;
        },
        error: () => {
          this.projectsData = [];
          this.collectionSize = 0;
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
            this.getAllHoldProjects();
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

  confirmStatusChangetohold(modal: any) {
    if (!this.selectedProject) return;
    const updatedProject = {
      ...this.selectedProject,
      status: 'Inactive',
      updatedBy: parseInt(this.empinfo.employeeId),
    };
    this.http
      .putData(`Project/${this.selectedProject.projectId}`, updatedProject)
      .subscribe({
        next: (res) => {
          this.http.setnewcountDetailsfornewprojectcount();
          this.conformationPopup.openSuccessModal(
            'Project marked as Inactive successfully'
          );
          modal.close(); // close modal only after success
          const fullPath = this.router.url;
          if (fullPath.startsWith('/project-management/projects')) {
            this.getAllHoldProjects();
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

  onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  clearAllFilters() {
    this.selectedDepartmentIds = [];
    this.selectedProjectTypes = [];
    this.selectedClients = [];
    this.page = 1;
    this.first = 0;
    this.selectedDepartmentIds = [...this.selectedDepartmentIds];
    this.selectedProjectTypes = [...this.selectedProjectTypes];
    this.selectedClients = [...this.selectedClients];

    this.getdatabaedonRoute();
  }

  onClientChange() {
    this.page = 1;
    this.first = 0;
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

    this.page = 1;
    this.first = 0;
    this.getdatabaedonRoute();
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getdatabaedonRoute();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getdatabaedonRoute();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

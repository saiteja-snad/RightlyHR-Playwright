import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectManagementModuleInfoComponent } from '../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { Project } from '../../../Interfaces/projects.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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
  inactiveClientStatus: any;
  departmentlist: any[] = [];
  projecttypes: any[] = [];
  selectedDepartmentIds: any[] = [];
  selectedProjectTypes: any[] = [];
  selectedClients: any[] = [];
  clientDetails: any[] = [];


  constructor(
    private router: Router,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    private route: ActivatedRoute,
    public rbac: RbacService
  ) {}

  ngOnInit() {
    this.http.setDepartmentIds([]);
  this.selectedDepartmentIds = [];
  this.selectedProjectTypes = [];
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getdatabaedonRoute();
    this.DepartmentList();
    this.getprojecttypesData();
    this.clientList()

    // Listen to department filter changes from service (shared across tabs)
    this.http.selectedDepartmentIds$
      .pipe(takeUntil(this.destroy$))
      .subscribe((deptIds) => {
        this.selectedDepartmentIds = deptIds || [];
        this.getdatabaedonRoute(); // Re-fetch projects when department filter changes
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
  }

  // Project Type filter change
  onProjectTypeChange() {
    this.getdatabaedonRoute(); // Re-fetch with new filters
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
    let url = 'Project?status=hold';

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
      url += `&clientIds=${clientIds.join(',')}`; // ← Now correctly sends "57,56"
    }

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsData = res?.data ?? [];
        this.loading = false;
      },
      error: () => {
        this.projectsData = [];
        this.loading = false;
      }
    });
  }

  getprojectbyid(clientID: any): void {
    this.loading = true;
    let url = `Project?clientId=${clientID}&status=hold`;

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
      url += `&clientIds=${clientIds.join(',')}`; // ← Now correctly sends "57,56"
    }

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsData = res?.data ?? [];
        this.inactiveClientStatus = res?.data?.[0]?.client?.status?.toLowerCase();
        this.loading = false;
      },
      error: () => this.loading = false
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

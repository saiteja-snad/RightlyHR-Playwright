

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProjectManagementModuleInfoComponent } from "../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component";
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { Project } from '../../../Interfaces/projects.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { ActiveclientsPipe } from '../../../Pipes/activeclients.pipe';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ProjectsSideTabsComponent } from "../../../shared/project-management-tabs/projects-side-tabs/projects-side-tabs.component";
import { ActiveprojectsPipe } from "../../../Pipes/activeprojects.pipe";
import { ProjectsSideTabsForClientsComponent } from "../../../shared/project-management-tabs/projects-side-tabs-for-clients/projects-side-tabs-for-clients.component";

@Component({
  selector: 'app-hold-projects',
  imports: [ProjectManagementModuleInfoComponent, DataLoaderContentComponent, CommonModule, FormsModule, NoDataFoundComponent,
    DataLoaderContentComponent, TranslateModule, ConfirmationIconComponent, ProjectsSideTabsComponent, ActiveprojectsPipe, ProjectsSideTabsForClientsComponent],
  templateUrl: './hold-projects.component.html',
  styleUrl: './hold-projects.component.scss'
})
export class HoldProjectsComponent implements OnInit, OnDestroy {
  selectedProject: any
  loading: boolean = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  projectsData: Project[] = [];
  empinfo: any = {};
  searchValue: any;
  inactiveClientStatus: any;

  constructor(private router: Router, private http: HttpService, private conformationPopup: OpenModalService,
    private modalService: NgbModal, private route: ActivatedRoute, public rbac: RbacService) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getdatabaedonRoute();
  }

  getdatabaedonRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/project-management/projects')) {
      this.getAllInactiveProjects();
      this.http.projectDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.getAllInactiveProjects();;
      });
    } else if (fullPath.startsWith('/project-management/clients')) {
      this.route.queryParams.subscribe(params => {
        const clientID = params['id'];
        if (clientID) {
          this.getprojectbyid(parseInt(clientID));
          this.http.projectDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
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
    return project.departments.map(d => d.departmentName).join(', ');
  }

  getAllInactiveProjects() {
    this.loading = true;
    this.http.getData('Project?status=hold').pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsData = res?.data ?? []; // Extract "data" array
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.loading = false;
        this.projectsData = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getprojectbyid(clientID: any): void {
    this.loading = true;
    this.http.getData(`Project?clientId=${clientID}&status=hold`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsData = res?.data ?? []; // Extract "data" array
        this.inactiveClientStatus = res?.data?.[0]?.client?.status.toLowerCase();
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching clients:', err);
      }
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
      updatedBy: parseInt(this.empinfo.employeeId)
    };
    this.http.putData(`Project/${this.selectedProject.projectId}`, updatedProject).subscribe({
      next: (res) => {
          this.http.setnewcountDetailsfornewprojectcount()
        this.conformationPopup.openSuccessModal('Project marked as Active successfully');
        modal.close();   // close modal only after success
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
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update status');
      }
    });
  }


  confirmStatusChangetohold(modal: any) {
    if (!this.selectedProject) return;
    const updatedProject = {
      ...this.selectedProject,
      status: 'Inactive',
      updatedBy: parseInt(this.empinfo.employeeId)
    };
    this.http.putData(`Project/${this.selectedProject.projectId}`, updatedProject).subscribe({
      next: (res) => {
          this.http.setnewcountDetailsfornewprojectcount()
        this.conformationPopup.openSuccessModal('Project marked as Inactive successfully');
        modal.close();   // close modal only after success
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
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update status');
      }
    });
  }
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}

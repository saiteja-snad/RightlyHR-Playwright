import { Component, OnDestroy, OnInit, TemplateRef } from '@angular/core';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { ProjectManagementModuleInfoComponent } from '../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component';
import { FormValidationsService } from '../../../services/form-validations.service';
import { Subject, Subscription, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { Project } from '../../../Interfaces/projects.model';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { ProjcetCreationComponent } from '../../shared-project-management-componenets/projcet-creation/projcet-creation.component';
import { RbacService } from '../../../services/rbac.service';
import { IProjectAuthority } from '../../../settings/project-management-configurations/models/project-authority.modal';
import { ActiveprojectsPipe } from '../../../Pipes/activeprojects.pipe';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProjectsSideTabsComponent } from '../../../shared/project-management-tabs/projects-side-tabs/projects-side-tabs.component';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { ProjectsSideTabsForClientsComponent } from '../../../shared/project-management-tabs/projects-side-tabs-for-clients/projects-side-tabs-for-clients.component';
import { combineLatest } from 'rxjs';
import { Chip } from 'primeng/chip';
import { PaginatorModule } from 'primeng/paginator';
@Component({
  selector: 'app-active-projects',
  imports: [NoDataFoundComponent, MultiSelectModule, CommonModule, FormsModule, DataLoaderContentComponent,
    TranslateModule, RouterModule, ConfirmationIconComponent, ReactiveFormsModule, Select, ProjectManagementModuleInfoComponent,
    ProjcetCreationComponent, ActiveprojectsPipe, ProjectsSideTabsForClientsComponent, ProjectsSideTabsComponent, Chip, PaginatorModule],
  templateUrl: './active-projects.component.html',
  styleUrl: './active-projects.component.scss',
})

export class ActiveProjectsComponent implements OnInit, OnDestroy {
  selectedProject: any;
  searchValue: any;
  searchSubject = new Subject<string>();
  projecttypes: any[] = [];
  loading: boolean = false;
  selectedProjectId: number | null = null;
  destroy$: Subject<boolean> = new Subject<boolean>();
  projectsData: Project[] = [];
  clients: any[] = [];
  getallprojectdetails: any;
  addprojectform!: FormGroup;
  subscription!: Subscription;
  updateprojectform!: FormGroup;
  empinfo: any = {};
  manager: any = [];
  spinnerLoader = false;
  startDatevalidate: any;
  endDatevalidate: any;
  startndEndDateValid: boolean = true;
  effectivendEndDateValid: boolean = true;
  kickoffDateValid: boolean = true;
  authorityList: IProjectAuthority[] = [];
  kickoffBeforeEffectiveValid: boolean = true; // kickoff <= effective
  effectiveDateValidRange: boolean = true; // effective between start & end
  effectiveAfterKickoffValid: boolean = true;
  resourcesData = [] as IResource[];
  departmentlist = [] as any;
  inactiveClientStatus: any;
  selectedDepartmentIds: any;
  selectedProjectTypes: any[] = [];
  selectedClients: any[] = [];
  clientDetails: any[] = [];

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
  constructor(private fb: FormBuilder, private modalService: NgbModal, private router: Router,
    public formValidation: FormValidationsService, private http: HttpService, private conformationPopup: OpenModalService,
    private route: ActivatedRoute, public rbac: RbacService, private offcanvasService: NgbOffcanvas) { }

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
      this.getProjectsBasedOnRoute();
    });

    combineLatest([this.http.selectedDepartmentIds$, this.http.projectTypeFilter$]).pipe(takeUntil(this.destroy$))
      .subscribe(([deptIds, projectTypes]) => {
        this.selectedDepartmentIds = deptIds || [];
        this.selectedProjectTypes = projectTypes || [];
        this.page = 1;
        this.first = 0;
        this.getProjectsBasedOnRoute();
      });
    this.editProjectForm();
    this.getClientsData();
    this.getprojecttypesData();
    this.getProjectsBasedOnRoute();
    this.DepartmentList();
    this.clientList();
    // this.getAuthorityList();
    this.updateprojectform.get('updatestartDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
    });
    this.updateprojectform.get('updateendDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
    });
    this.updateprojectform.valueChanges.subscribe(() => {
      this.validateUpdateDateRange();
    });
  }

  DepartmentList() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        this.departmentlist = data;
      },
    });
  }

  //get clients
  clientList() {
    this.http.getData('Client/GetAll').subscribe({
      next: (res: any) => {
        const data = res?.data || res || [];
        this.clientDetails = data.map((client: any) => ({
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

  onDepartmentChangelist(event: any) {
    const selectedIds = event.value;
    if (Array.isArray(selectedIds)) {
      this.http.setDepartmentIds(selectedIds);
    } else {
      this.http.setDepartmentIds([selectedIds]);
    }
    this.page = 1;
    this.first = 0;
    this.getProjectsBasedOnRoute();
  }

  onProjectTypeChange() {
    this.page = 1;
    this.first = 0;
    this.getProjectsBasedOnRoute();
  }

  // Optional: Clear project type filter when needed
  clearProjectTypeFilter() {
    this.selectedProjectTypes = [];
    this.page = 1;
    this.first = 0;
    this.onProjectTypeChange();
  }

  getProjectsBasedOnRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/project-management/projects')) {
      this.getAllActiveProjects();
      this.http.projectDetailesadded$
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.getAllActiveProjects();
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
          this.updateprojectform?.get('updateclientName')?.disable();
        }
      });
    }
  }

  getDepartmentNames(project: Project): string {
    if (!project.departments || project.departments.length === 0) {
      return '-';
    }
    return project.departments.map((d) => d.departmentName).join(', ');
  }

  getAuthorityList() {
    this.http
      .getData(`ProjectManagementAuthority?status=active&entity=Project`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.authorityList = (res?.data || []).map((item: any) => ({
            value: item.authority.id,
            name: `${item.authority.fusionEmployeeId ?? ''} - ${item.authority.name
              }`.trim(),
            email: item.authority.workMail,
            recordId: item.id,
          }));
        },
        error: (err) => {
          console.error('Error fetching authorities:', err);
          this.authorityList = [];
        },
      });
  }

  getResourceData(id: any, project: Project) {
    const projectId = id;
    const params = {
      status: 'Active',
      entityType: 'project',
      entityRefId: projectId,
      isDistinct: true,
    };
    this.http
      .getDataIncludeParams('ProjectResource', params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.resourcesData = res.data;
          this.loading = false;
          if (this.resourcesData?.length > 0) {
            this.authorityList = (res?.data || []).map((item: IResource) => ({
              value: item.employee?.id ?? 0,
              name: `${item.employee?.fusionEmployeeId ?? ''} - ${item.employee?.name ?? ''
                }`.trim(),
              email: item.employee?.workMail ?? '',
              recordId: item.resourceId ?? 0,
            }));
            if (this.authorityList?.length > 0) {
              this.updateprojectform.get('approvalidAuthority')?.enable();
              this.updateprojectform
                .get('approvalidAuthority')
                ?.setValidators([Validators.required]);
              this.updateprojectform.patchValue({
                approvalidAuthority:
                  project.pendingApprovalAuthority?.id ?? null,
              });
            }
          } else {
            this.authorityList = [];
          }
        },
        error: (reason: any) => {
          this.loading = false;
        },
      });
  }

  editProjectForm() {
    this.updateprojectform = this.fb.group({
      updateprojectName: [
        null,
        [
          Validators.required,
          this.formValidation.minCharactersValidator(2),
          this.formValidation.maxCharactersValidator(100),
        ],
      ],
      updateclientName: [null, Validators.required],
      updatecode: [null, [Validators.required, Validators.maxLength(12)]],
      updatestartDate: [null, Validators.required],
      updateendDate: [null, Validators.required],
      // updateeffectiveDate: [null, Validators.required],
      // updatekickoffDate: [null, Validators.required],
      updateprojectType: [null, Validators.required],
      updatedepartment: [[], [Validators.required]],
      updateprojectDescription: [null],
      updateovertimeEligible: [false],
      updatebillable: [false],
      updateallowweekendWork: [false],
      // updateallocatedHours: [null, [Validators.required, Validators.min(1), this.formValidation.maxCharactersValidator(11)]],
      // approvalidAuthority: [{value:null,disabled:true}],
      updatecolor: ['', Validators.required],
    });
    this.updateprojectform.get('updateendDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateUpdateDateRange();
    });
    this.updateprojectform.get('updateendDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateUpdateDateRange();
    });
    this.updateprojectform
      .get('updatekickoffDate')
      ?.valueChanges.subscribe(() => this.validateUpdateDateRange());
    this.updateprojectform
      .get('updatekickoffDate')
      ?.valueChanges.subscribe(() => this.validateUpdateDateRange());
  }

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }

  getAllActiveProjects() {
    this.loading = true;
    let url = `Project?status=Active&pageNumber=${this.page}&pageSize=${this.pageSize}`;
    if(this.rbac.allowedToAccess('View Assigned Projects.view') && !this.rbac.allowedToAccess('View All Projects.view')) {
       url = `Project?status=Active&employeeId=${this.empinfo.employeeId}&pageNumber=${this.page}&pageSize=${this.pageSize}`;

      if (this.searchValue?.trim()) {
        url += `&searchTerm=${encodeURIComponent(this.searchValue.trim())}`;
      }

      if (this.selectedDepartmentIds) {
        url += `&departmentIds=${this.selectedDepartmentIds}`;
      }

      if (this.selectedProjectTypes && this.selectedProjectTypes.length > 0) {
        url += `&projectTypes=${this.selectedProjectTypes.join(',')}`;
      }
    }

    else {
       url = `Project?status=Active&pageNumber=${this.page}&pageSize=${this.pageSize}`;

      if (this.searchValue?.trim()) {
        url += `&searchTerm=${encodeURIComponent(this.searchValue.trim())}`;
      }

      if (this.selectedDepartmentIds) {
        url += `&departmentIds=${this.selectedDepartmentIds}`;
      }

      if (this.selectedProjectTypes && this.selectedProjectTypes.length > 0) {
        url += `&projectTypes=${this.selectedProjectTypes.join(',')}`;
      }
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
        },
        error: (err) => {
          console.error('Error fetching projects data:', err);
          this.loading = false;
          this.projectsData = [];
          this.collectionSize = 0;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  getprojectbyid(clientID: any): void {
    this.loading = true;
    let url = `Project?clientId=${clientID}&status=Active&pageNumber=${this.page}&pageSize=${this.pageSize}`;

    if (this.searchValue?.trim()) {
      url += `&searchTerm=${encodeURIComponent(this.searchValue.trim())}`;
    }

    if (this.selectedDepartmentIds) {
      url += `&departmentIds=${this.selectedDepartmentIds}`;
    }
    if (this.selectedProjectTypes && this.selectedProjectTypes.length > 0) {
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
          this.loading = false;
          this.projectsData = res?.data ?? [];
          this.collectionSize = res?.pagination?.totalRecords || 0;
          this.inactiveClientStatus =
            res?.data?.[0]?.client?.status.toLowerCase();
        },
        error: (err) => {
          this.loading = false;
          this.projectsData = [];
          this.collectionSize = 0;
          console.error('Error fetching clients:', err);
        },
      });
  }

  getClientsData(): void {
    this.http
      .getData(`Client/GetAll?status=Active`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.clients = Array.isArray(res?.data) ? res.data : [];
        },
        error: (err) => {
          console.error('Error fetching clients:', err);
          this.clients = [];
        },
      });
  }

  formatDateToLocal(dateString: string) {
    if (dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null;
  }
  getClientByIdForUpdate(clientId: number): void {
    this.http.getData(`Client/${clientId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const client = res.data;
          this.updateClientDependentFieldsForUpdate(client);
        }
      },
      error: (err) => {
        console.error('Error fetching client:', err);
      }
    });
  }

  private updateClientDependentFieldsForUpdate(client: any): void {
    if (!client.overtimeEligibile) {
      this.updateprojectform.get('updateovertimeEligible')?.disable();
    } else {
      this.updateprojectform.get('updateovertimeEligible')?.enable();
    }

    if (!client.billable) {
      this.updateprojectform.get('updatebillable')?.disable();
    } else {
      this.updateprojectform.get('updatebillable')?.enable();
    }

    if (!client.weekendWorkAllowed) {
      this.updateprojectform.get('updateallowweekendWork')?.disable();
    } else {
      this.updateprojectform.get('updateallowweekendWork')?.enable();
    }
  }

  onUpdateClientChange(event: any): void {
    const clientId = event.value;
    if (clientId) {
      this.getClientByIdForUpdate(clientId);
    }
  }

  openUpdateModal(modal: any, project: Project) {
    // this.getAuthorityList();
    // this.getResourceData(project.projectId,project);
    const selectedDepartmentIds =
      project.departments?.map((d: any) => d.departmentId) || [];
    // Patch form values
    if (project.client?.clientId) {
      this.getClientByIdForUpdate(project.client.clientId);
    }
    this.updateprojectform.patchValue({
      updateprojectName: project.projectName,
      updateclientName: project.client?.clientId, // ensure p-select has clientId
      updatecode: project?.meta?.graphData?.code,
      updatestartDate: this.formatDateToLocal(project.startDate),
      updateendDate: this.formatDateToLocal(project.endDate),
      // updateeffectiveDate: this.formatDateToLocal(project.effectiveDate),
      // updatekickoffDate: this.formatDateToLocal(project.kickoffDate),
      updateprojectType: project.projectType, // ensure p-select has id
      updateprojectDescription: project.description,
      updateovertimeEligible: project.isOvertimeEligibile,
      updatebillable: project.isBillable,
      // updateallocatedHours: project.allocatedHours,
      updateallowweekendWork: project.isWeekendWorkAllowed,
      updatedepartment: selectedDepartmentIds,
      updatecolor: project?.meta?.graphData?.color || '#000000'
    });
    // Store selected projectId for PUT request
    this.selectedProjectId = project.projectId;
    this.modalService.open(modal, {
      size: 'lg',
      centered: true,
      backdrop: 'static',
    });
  }

  saveUpdatedProject() {
    if (this.updateprojectform.invalid) {
      this.updateprojectform.markAllAsTouched();
      return;
    }
    this.spinnerLoader = true;
    const formValue = this.updateprojectform.value;
    const departmentIds = Array.isArray(formValue.updatedepartment)
      ? formValue.updatedepartment.join(',')
      : formValue.updatedepartment;
    const payload = {
      projectId: this.selectedProjectId,
      clientId: formValue.updateclientName,
      projectName: formValue.updateprojectName,
      description: formValue.updateprojectDescription,
      projectType: formValue.updateprojectType,
      allocatedHours: formValue.updateallocatedHours,
      isOvertimeEligibile: formValue.updateovertimeEligible,
      isBillable: formValue.updatebillable,
      isWeekendWorkAllowed: formValue.updateallowweekendWork,
      startDate: formValue.updatestartDate,
      endDate: formValue.updateendDate,
      effectiveDate: formValue.updateeffectiveDate,
      kickoffDate: formValue.updatekickoffDate,
      status: 'Active',
      pendingApprovalAuthorityId: formValue.approvalidAuthority,
      departmentIds: departmentIds,
      updatedBy: parseInt(this.empinfo.employeeId),
      meta: {
        graphData: {
          color: formValue?.updatecolor || '#000000',
          code: formValue?.updatecode
        }
      }
    };
    this.loading = true;
    this.http.putData(`Project/${this.selectedProjectId}`, payload).subscribe({
      next: (res) => {
        this.loading = false;
        this.spinnerLoader = false;
        this.modalService.dismissAll();
        const fullPath = this.router.url;
        if (fullPath.startsWith('/project-management/projects')) {
          this.getAllActiveProjects();
        } else if (fullPath.startsWith('/project-management/clients')) {
          const clientID = this.route.snapshot.queryParams['id'];
          if (clientID) {
            this.getprojectbyid(parseInt(clientID));
          }
        }
        this.conformationPopup.openSuccessModal('Project updated successfully');
        this.http.setnewcountDetailsfornewprojectcount();
      },
      error: (err) => {
        this.loading = false;
        this.spinnerLoader = false;
        console.error('Error updating project:', err);
        this.conformationPopup.openErrorModal(
          err?.error?.message || 'Failed to update project'
        );
      },
    });
  }

  getprojecttypesData(): void {
    this.http
      .getData(`entityAttributeValues?entity=Project&attribute=Project Type`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projecttypes = Array.isArray(res) ? res : [];
        },
        error: (err) => {
          console.error('Error fetching clients:', err);
        },
      });
  }

  openModalstatus(modal: any, project: Project) {
    this.modalService.open(modal, { centered: true, backdrop: 'static' });
    this.selectedProject = { ...project }; // store project details
  }

  closeall() {
    this.modalService.dismissAll();
  }

  confirmStatusChange(modal: any) {
    if (!this.selectedProject) return;
    const updatedProject = {
      ...this.selectedProject,
      status: 'Inactive',
      updatedBy: parseInt(this.empinfo?.employeeId),
    };
    this.http
      .putData(`Project/${this.selectedProject?.projectId}`, updatedProject)
      .subscribe({
        next: (res) => {
          this.http.setnewcountDetailsfornewprojectcount();
          this.conformationPopup.openSuccessModal(
            'Project marked as Inactive successfully'
          );
          modal.close();
          const fullPath = this.router.url;
          if (fullPath.startsWith('/project-management/projects')) {
            this.getAllActiveProjects();
          } else if (fullPath.startsWith('/project-management/clients')) {
            const clientID = this.route.snapshot.queryParams['id'];
            if (clientID) {
              this.getprojectbyid(parseInt(clientID));
            }
          }
          this.close();
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
      status: 'hold',
      updatedBy: parseInt(this.empinfo.employeeId),
    };
    this.http
      .putData(`Project/${this.selectedProject.projectId}`, updatedProject)
      .subscribe({
        next: (res) => {
          this.http.setnewcountDetailsfornewprojectcount();
          this.conformationPopup.openSuccessModal(
            'Project marked as hold successfully'
          );
          modal.close();
          const fullPath = this.router.url;
          if (fullPath.startsWith('/project-management/projects')) {
            this.getAllActiveProjects();
          } else if (fullPath.startsWith('/project-management/clients')) {
            const clientID = this.route.snapshot.queryParams['id'];
            if (clientID) {
              this.getprojectbyid(parseInt(clientID));
            }
          }
          this.close();
        },
        error: (err) => {
          console.error('Error updating project status:', err);
          this.conformationPopup.openErrorModal(
            err.error?.message || 'Failed to update status'
          );
        },
      });
  }

  navigateView(projectId: number) {
    localStorage.setItem('projectProjectId', projectId.toString());
    this.router.navigate(['project-management/projects/details'], {
      queryParams: { id: projectId },
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  StartndendDateValidation() {
    const StartDate = this.updateprojectform.get('updatestartDate')?.value;
    const EndDate = this.updateprojectform.get('updateendDate')?.value;
    if (StartDate && EndDate) {
      const startedDate = new Date(StartDate);
      const endedDate = new Date(EndDate);
      this.startndEndDateValid = endedDate > startedDate;
    } else {
      this.startndEndDateValid = true;
    }
  }

  validateUpdateDateRange(): void {
    const startDate = this.updateprojectform.get('updatestartDate')?.value;
    const endDate = this.updateprojectform.get('updateendDate')?.value;
    const kickoffDate = this.updateprojectform.get('updatekickoffDate')?.value;
    const effectiveDate = this.updateprojectform.get(
      'updateeffectiveDate'
    )?.value;

    this.kickoffDateValid = true;
    this.kickoffBeforeEffectiveValid = true;
    this.effectiveDateValidRange = true;
    this.effectiveAfterKickoffValid = true;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (kickoffDate) {
        const kickoff = new Date(kickoffDate);
        //  Kickoff must be within Start and End
        this.kickoffDateValid = kickoff >= start && kickoff <= end;
        if (effectiveDate) {
          const effective = new Date(effectiveDate);
          //  Kickoff must be <= Effective
          this.kickoffBeforeEffectiveValid = kickoff <= effective;
        }
      }

      if (effectiveDate) {
        const effective = new Date(effectiveDate);
        //  Effective must be within Start and End
        this.effectiveDateValidRange = effective >= start && effective <= end;
        if (kickoffDate) {
          const kickoff = new Date(kickoffDate);
          //  Effective must be >= Kickoff
          this.effectiveAfterKickoffValid = effective >= kickoff;
        }
      }
    }
  }

  get isFormInvalid(): boolean {
    return (
      this.updateprojectform.invalid ||
      !this.startndEndDateValid ||
      !this.kickoffDateValid ||
      !this.kickoffBeforeEffectiveValid ||
      !this.effectiveDateValidRange ||
      !this.effectiveAfterKickoffValid ||
      this.loading
    );
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.updateprojectform.reset();
    this.authorityList = [];
    this.updateprojectform.get('approvalidAuthority')?.reset();
    this.updateprojectform.get('approvalidAuthority')?.setValidators(null);
    this.updateprojectform.get('approvalidAuthority')?.disable();
    // this.modalService.dismissAll();
  }

  get minEffectiveDate(): string | null {
    const startDate = this.updateprojectform.get('updatestartDate')?.value;
    if (startDate) {
      const date = new Date(startDate);
      date.setDate(date.getDate()); // +1 day
      return date.toISOString().split('T')[0]; // format YYYY-MM-DD
    }
    return null;
  }

  get maxEffectiveDate(): string | null {
    const endDate = this.updateprojectform.get('updateendDate')?.value;
    if (endDate) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - 1); // No change, use endDate as max
      return date.toISOString().split('T')[0]; // format YYYY-MM-DD
    }
    return null;
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
    this.getProjectsBasedOnRoute();
  }

  onClientChange() {
    this.page = 1;
    this.first = 0;
    this.getProjectsBasedOnRoute();
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
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  // isFilterApplied(): boolean {
  //   const formValue = this.datepickerForm?.value;
  //   // Check if any filter (except date & employee) has value
  //   return (
  //     (formValue?.projectId && formValue?.projectId?.length > 0) ||
  //     (formValue?.clientId && formValue?.clientId?.length > 0) ||
  //     (formValue?.departmentId && formValue?.departmentId?.length > 0) ||
  //     (formValue?.tmorrmId && formValue?.tmorrmId?.length > 0)
  //   );
  // }

  toggleFilters(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end', backdrop: 'static', keyboard: false });
  }

  closeCanvas() {
    this.offcanvasService.dismiss();
  }


  // 1. Show red dot on Filters button
  isFilterApplied(): boolean {
    return this.selectedClients.length > 0 ||
      this.selectedDepartmentIds.length > 0 ||
      this.selectedProjectTypes.length > 0;
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
        filters.push({ type: 'department', label: dept.departmentName, value: id });
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
      this.selectedClients = this.selectedClients.filter((c: any) => c !== filter.value);
    } else if (filter.type === 'department') {
      this.selectedDepartmentIds = this.selectedDepartmentIds.filter((id: any) => id !== filter.value);
      this.http.setDepartmentIds(this.selectedDepartmentIds);
    } else if (filter.type === 'projectType') {
      this.selectedProjectTypes = this.selectedProjectTypes.filter((t: string) => t !== filter.value);
    }

    this.page = 1;
    this.first = 0;
    this.getProjectsBasedOnRoute();
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getProjectsBasedOnRoute();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getProjectsBasedOnRoute();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

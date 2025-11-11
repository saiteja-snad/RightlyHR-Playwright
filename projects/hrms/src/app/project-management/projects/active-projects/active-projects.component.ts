import { Component, OnDestroy, OnInit } from '@angular/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { CommonModule } from '@angular/common';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ProjectManagementModuleInfoComponent } from "../../../shared/project-management-tabs/project-management-module-info/project-management-module-info.component";
import { FormValidationsService } from '../../../services/form-validations.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Project } from '../../../Interfaces/projects.model';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { ProjcetCreationComponent } from '../../shared-project-management-componenets/projcet-creation/projcet-creation.component';
import { RbacService } from '../../../services/rbac.service';
import { IProjectAuthority } from '../../../settings/project-management-configurations/models/project-authority.modal';
import { ActiveprojectsPipe } from "../../../Pipes/activeprojects.pipe";
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProjectsSideTabsComponent } from "../../../shared/project-management-tabs/projects-side-tabs/projects-side-tabs.component";
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
@Component({
  selector: 'app-active-projects',
  imports: [NoDataFoundComponent, MultiSelectModule, CommonModule, FormsModule, DataLoaderContentComponent,
    TranslateModule, RouterModule, ConfirmationIconComponent, ReactiveFormsModule, Select, ProjectManagementModuleInfoComponent,
    ProjcetCreationComponent, ActiveprojectsPipe, ProjectsSideTabsComponent],
  templateUrl: './active-projects.component.html',
  styleUrl: './active-projects.component.scss'
})

export class ActiveProjectsComponent implements OnInit, OnDestroy {
  selectedProject: any;
  searchValue: any;
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

  constructor(private fb: FormBuilder, private modalService: NgbModal, private router: Router,
    public formValidation: FormValidationsService, private http: HttpService,
    private conformationPopup: OpenModalService, private route: ActivatedRoute, public rbac: RbacService) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.http.selectedDepartmentIds$.pipe(takeUntil(this.destroy$)).subscribe((deptIds) => {
      this.selectedDepartmentIds = deptIds || [];
      this.getProjectsBasedOnRoute();
    });
    this.editProjectForm();
    this.getClientsData();
    this.getprojecttypesData();
    // this.getProjectsBasedOnRoute();
    this.DepartmentList();
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

  onDepartmentChangelist(event: any) {
    const selectedIds = event.value; // This gives an array when multiple departments selected
    if (Array.isArray(selectedIds)) {
      this.http.setDepartmentIds(selectedIds);
    } else {
      this.http.setDepartmentIds([selectedIds]);
    }
  }

  getProjectsBasedOnRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/project-management/projects')) {
      this.getAllActiveProjects();
      this.http.projectDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.getAllActiveProjects();
      });
    } else if (fullPath.startsWith('/project-management/clients')) {
      this.route.queryParams.subscribe(params => {
        const clientID = params['id'];
        if (clientID) {
          this.getprojectbyid(parseInt(clientID));
          this.http.projectDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
            this.getprojectbyid(parseInt(clientID));
          });
          this.updateprojectform.get('updateclientName')?.disable();
        }
      });
    }
  }

  getDepartmentNames(project: Project): string {
    if (!project.departments || project.departments.length === 0) {
      return '-';
    }
    return project.departments.map(d => d.departmentName).join(', ');
  }

  getAuthorityList() {
    this.http.getData(`ProjectManagementAuthority?status=active&entity=Project`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.authorityList = (res?.data || []).map((item: any) => ({
          value: item.authority.id,
          name: `${item.authority.fusionEmployeeId ?? ''} - ${item.authority.name}`.trim(),
          email: item.authority.workMail,
          recordId: item.id
        }));
      },
      error: (err) => {
        console.error('Error fetching authorities:', err);
        this.authorityList = [];
      }
    });
  }

  getResourceData(id: any, project: Project) {
    const projectId = id;
    const params = {
      status: 'Active',
      entityType: 'project',
      entityRefId: projectId,
      isDistinct: true
    };
    this.http.getDataIncludeParams('ProjectResource', params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.resourcesData = res.data;
        this.loading = false;
        if (this.resourcesData?.length > 0) {
          this.authorityList = (res?.data || []).map((item: IResource) => ({
            value: item.employee?.id ?? 0,
            name: `${item.employee?.fusionEmployeeId ?? ''} - ${item.employee?.name ?? ''}`.trim(),
            email: item.employee?.workMail ?? '',
            recordId: item.resourceId ?? 0
          }));
          if (this.authorityList?.length > 0) {
            this.updateprojectform.get('approvalidAuthority')?.enable();
            this.updateprojectform.get('approvalidAuthority')?.setValidators([Validators.required]);
            this.updateprojectform.patchValue({
              approvalidAuthority: project.pendingApprovalAuthority?.id ?? null
            });
          }
        } else {
          this.authorityList = [];
        }
      },
      error: (reason: any) => {
        this.loading = false;
      }
    });
  }

  editProjectForm() {
    this.updateprojectform = this.fb.group({
      updateprojectName: [null, [Validators.required, this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(100)]],
      updateclientName: [null, Validators.required],
      updatestartDate: [null, Validators.required],
      updateendDate: [null, Validators.required],
      // updateeffectiveDate: [null, Validators.required],
      // updatekickoffDate: [null, Validators.required],
      updateprojectType: [null, Validators.required],
      updatedepartment: [[], Validators.required],
      updateprojectDescription: [null],
      updateovertimeEligible: [false],
      updatebillable: [false],
      updateallowweekendWork: [false],
      // updateallocatedHours: [null, [Validators.required, Validators.min(1), this.formValidation.maxCharactersValidator(11)]],
      // approvalidAuthority: [{value:null,disabled:true}],
      updatecolor: ['']
    });
    this.updateprojectform.get('updateendDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateUpdateDateRange();
    });
    this.updateprojectform.get('updateendDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateUpdateDateRange();
    });
    this.updateprojectform.get('updatekickoffDate')?.valueChanges.subscribe(() => this.validateUpdateDateRange());
    this.updateprojectform.get('updatekickoffDate')?.valueChanges.subscribe(() => this.validateUpdateDateRange());
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  getAllActiveProjects() {
    this.loading = true;
    let url = 'Project?status=Active';
    if (this.selectedDepartmentIds) {
      url += `&departmentIds=${this.selectedDepartmentIds}`;
    }
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
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
    this.loading = true
    let url = `Project?clientId=${clientID}&status=Active`;
    if (this.selectedDepartmentIds) {
      url += `&departmentIds=${this.selectedDepartmentIds}`;
    }
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false
        this.projectsData = res?.data ?? [];
        this.inactiveClientStatus = res?.data?.[0]?.client?.status.toLowerCase();
      },
      error: (err) => {
        this.loading = false
        console.error('Error fetching clients:', err);
      }
    });
  }

  getClientsData(): void {
    this.http.getData(`Client/GetAll?status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.clients = Array.isArray(res?.data) ? res.data : [];
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
        this.clients = []
      }
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

  openUpdateModal(modal: any, project: Project) {
    // this.getAuthorityList();
    // this.getResourceData(project.projectId,project);
    const selectedDepartmentIds = project.departments?.map((d: any) => d.departmentId) || [];
    // Patch form values
    this.updateprojectform.patchValue({
      updateprojectName: project.projectName,
      updateclientName: project.client?.clientId,  // ensure p-select has clientId
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
      updatecolor: project?.meta?.graphData?.color
    });
    // Store selected projectId for PUT request
    this.selectedProjectId = project.projectId;
    this.modalService.open(modal, { size: 'lg', centered: true, backdrop: 'static' });
  }

  saveUpdatedProject() {
    if (this.updateprojectform.invalid) {
      this.updateprojectform.markAllAsTouched();
      return;
    }
    this.spinnerLoader = true;
    const formValue = this.updateprojectform.value;
    const departmentIds = Array.isArray(formValue.updatedepartment)
      ? formValue.updatedepartment.join(',') : formValue.updatedepartment;
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
          color: formValue?.updatecolor
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
        this.http.setnewcountDetailsfornewprojectcount()
      },
      error: (err) => {
        this.loading = false;
        this.spinnerLoader = false;
        console.error('Error updating project:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to update project');
      }
    });
  }

  getprojecttypesData(): void {
    this.http.getData(`entityAttributeValues?entity=Project&attribute=Project Type`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projecttypes = Array.isArray(res) ? res : [];
      },
      error: (err) => {
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
      status: 'Inactive',
      updatedBy: parseInt(this.empinfo.employeeId)
    };
    this.http.putData(`Project/${this.selectedProject.projectId}`, updatedProject).subscribe({
      next: (res) => {
        this.http.setnewcountDetailsfornewprojectcount()
        this.conformationPopup.openSuccessModal('Project marked as Inactive successfully');
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
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update status');
      }
    });
  }

  confirmStatusChangetohold(modal: any) {
    if (!this.selectedProject) return;
    const updatedProject = {
      ...this.selectedProject,
      status: 'hold',
      updatedBy: parseInt(this.empinfo.employeeId)
    };
    this.http.putData(`Project/${this.selectedProject.projectId}`, updatedProject).subscribe({
      next: (res) => {
        this.http.setnewcountDetailsfornewprojectcount()
        this.conformationPopup.openSuccessModal('Project marked as hold successfully');
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
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to update status');
      }
    });
  }

  navigateView(projectId: number) {
    this.router.navigate(['project-management/projects/details'], { queryParams: { id: projectId } });
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
    const effectiveDate = this.updateprojectform.get('updateeffectiveDate')?.value;

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
    return this.updateprojectform.invalid || !this.startndEndDateValid || !this.kickoffDateValid ||
      !this.kickoffBeforeEffectiveValid || !this.effectiveDateValidRange || !this.effectiveAfterKickoffValid || this.loading;
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
    this.modalService.dismissAll();
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
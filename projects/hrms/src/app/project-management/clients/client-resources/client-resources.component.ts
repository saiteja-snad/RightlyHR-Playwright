import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';
import {
  combineLatest,
  Subject,
  Subscription,
  takeUntil,
  debounceTime,
  distinctUntilChanged,
} from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { Project } from '../../../Interfaces/projects.model';
import { IEmployeeDetails } from '../../../letters/letters.modal';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { FormValidationsService } from '../../../services/form-validations.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { Select } from 'primeng/select';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { IPhases } from '../../../Interfaces/project-management/phases.model';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { ClientResourceTabComponent } from '../../../shared/project-management-tabs/client-resource-tab/client-resource-tab.component';
import { ProfileIconComponent } from "../../../icons/profile-icon/profile-icon.component";
import { environment } from '../../../../environments/environment';
import { PaginatorModule } from 'primeng/paginator';

@Component({
  selector: 'app-client-resources',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ClientResourceTabComponent,
    TranslateModule,
    NgbPopover,
    DataLoaderContentComponent,
    Select,
    DateformatPipe,
    NoDataFoundComponent,
    ConfirmationIconComponent,
    InfoIconComponent,
    ProfileIconComponent,
    PaginatorModule
  ],
  templateUrl: './client-resources.component.html',
  styleUrl: './client-resources.component.scss',
})
export class ClientResourcesComponent implements OnInit, OnDestroy {
  searchValue: string = '';
  resourcestartdate: any;
  resourcesData = [] as IResource[];
  filteredResourcesData = [] as IResource[];
  resourcesDataByPhase = [] as IResource[];

  subscription!: Subscription;
  updateResourceForm!: FormGroup;
  reasonForm!: FormGroup;
  extendForm!: FormGroup;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployee: any;
  employeeFullname!: string;
  projectsDataDrown: Project[] = [];
  loading: boolean = false;
  frequencyTypes = [
    { label: 'Per month', value: 'Per month' },
    { label: 'Per week', value: 'Per week' },
    { label: 'Per project', value: 'Per project' },
  ];
  clientID: any;
  ResourceId: any;
  projectId: any;
  empinfo: any = {};
  projectsData: Project[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  inactiveClientStatus: any;
  projectRoleDropdown: any[] = [];
  resoucesDropDownData = [] as any[];
  phaseDropdown: any[] = [];
  phaseData = [] as IPhases[];
  projectStartDate!: string | null;
  projectEndDate!: string | null;
  selectedPhaseId: any;
  startndEndDateValid: any;
  startDatevalidate: any;
  endDatevalidate: any;
  loader: boolean | undefined;
  departmentIds: number[] = [];
  defaultPendingAuthorityId: any;
  pendingAuthorityIdForUpdate: any = null;
  modalData: { title?: string; data?: any } = {};
  @ViewChild('reasonModal') reasonModal!: any;
  @ViewChild('extendModal') extendModal!: any;
  @ViewChild('updateResourcemodal') updateResourcemodal!: any;
  @ViewChild('deleteconformation') deleteconformation!: any;
  projectMinStartDate!: string;
  projectMaxEndDate!: string;
  selectedResource: any;
  selectedRoleId: number = 0;
  selectedEntityRefId: number = 0;
  spinnerLoader = false;
  isReleasing = false;
  // Pagination
  page = 1;
  pageSize = 50;
  rows = 50;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 50, value: 50 },
    { label: 100, value: 100 },
    { label: 150, value: 150 },
    { label: 200, value: 200 }
  ];
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    public formValidation: FormValidationsService,
    private http: HttpService,
    public rbac: RbacService,
    private router: Router,
    private route: ActivatedRoute,
    private conformationPopup: OpenModalService,
  ) { }

  selectedRoleIds: number[] = [];
  selectedPhaseIds: number[] = [];
  selectedAuthorityIds: number[] = [];
  selectedProjectIds: number[] = [];

  ngOnInit() {
    this.initializeForms();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllActiveEmployees();
    this.route.queryParams.subscribe((params) => {
      const clientID = params['id'];
      if (clientID) {
        this.clientID = parseInt(clientID);
        // this.getResourceData(this.clientID, this.searchValue);
        this.getclientProjects(this.clientID);
        this.getClientsData(clientID);
      }
    });

    combineLatest([
      this.http.resourceRoleFilter$,
      this.http.resourcePhaseFilter$,
      this.http.resourceAuthorityFilter$,
      this.http.resourceProjectFilter$,
    ])
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(100),
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
      )
      .subscribe(([roleIds, phaseIds, authorityIds, projectIds]) => {
        this.selectedRoleIds = roleIds || [];
        this.selectedPhaseIds = phaseIds || [];
        this.selectedAuthorityIds = authorityIds || [];
        this.selectedProjectIds = projectIds || [];
        if (this.clientID) {
          this.getResourceData(this.clientID, this.searchValue);
        }
      });

    this.http.resourceDetailesadded$
      .pipe(takeUntil(this.destroy$), debounceTime(50))
      .subscribe(() => {
        if (this.clientID) {
          this.getResourceData(this.clientID, this.searchValue);
        }
      });
    this.updateResourceForm.get('startDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
    });
    this.updateResourceForm.get('endDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
    });
    this.ExtendDateForm();
  }

  getClientsData(clientID: any): void {
    this.http
      .getData(`Client/${clientID}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.inactiveClientStatus = res.data.status.toLowerCase();
        },
        error: (err) => {
          console.error('Error fetching clients:', err);
        },
      });
  }

  initializeForms() {
    this.updateResourceForm = this.fb.group(
      {
        resourceName: [null, Validators.required],
        resourceEmail: [null, [Validators.required, Validators.email]],
        resourcePhone: [null],
        designation: [null, Validators.required],
        projectName: [null, Validators.required],
        projectType: [null, Validators.required],
        startDate: [null, Validators.required],
        endDate: [null, Validators.required],
        resourceAllocationhrs: [null, Validators.required],
        overtimeEligible: [false],
        billable: [false],
        allowweekendWork: [false],
        color: ['#FFFFFF', Validators.required],
        resourceRole: [null, Validators.required],
        resourcePhase: [null, Validators.required],
        resourceAuthority: [null],
      },
      { validators: [this.DateValidator()] },
    );
  }

  ExtendDateForm() {
    this.reasonForm = this.fb.group({
      reason: [
        '',
        [
          Validators.required,
          Validators.maxLength(250),
          Validators.pattern(/^(?!\s).*$/),
        ],
      ],
      statusEffectiveDate: [''],
    });

    this.extendForm = this.fb.group({
      newStartDate: ['', Validators.required],
      newEndDate: ['', Validators.required],
      extendReason: [
        '',
        [
          Validators.required,
          Validators.maxLength(250),
          Validators.pattern(/^(?!\s).*$/),
        ],
      ],
    });
  }

  updateStatusEffectiveDateValidation() {
    const statusEffectiveDateControl = this.reasonForm.get(
      'statusEffectiveDate',
    );
    if (this.modalData?.title?.includes('release')) {
      statusEffectiveDateControl?.setValidators([Validators.required]);
    } else {
      statusEffectiveDateControl?.clearValidators();
    }
    statusEffectiveDateControl?.updateValueAndValidity();
  }
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.selectedResources = [];
    this.getResourceData(this.clientID, this.searchValue);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.selectedResources = [];
    this.getResourceData(this.clientID, this.searchValue);
  }
  getResourceData(id: any, searchTerm?: string) {
    let url = `ProjectResource?status=Active,assigned&entityType=Client&entityRefId=${id}&isProjectRequired=true&isGroupedByProject=true&pageNumber=${this.page}&pageSize=${this.pageSize}`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    if (this.selectedRoleIds?.length > 0) {
      url += `&roleIds=${this.selectedRoleIds.join(',')}`;
    }
    if (this.selectedPhaseIds?.length > 0) {
      url += `&phaseId=${this.selectedPhaseIds.join(',')}`;
    }
    if (this.selectedAuthorityIds?.length > 0) {
      url += `&timesheetApprovalAuthorityIds=${this.selectedAuthorityIds.join(',')}`;
    }
    if (this.selectedProjectIds?.length > 0) {
      url += `&projectIds=${this.selectedProjectIds.join(',')}`;
    }
    this.loading = true;
    this.subscription = this.http.getDataIncludeParams(url).subscribe({
      next: (data: any) => {
        if (data?.data?.length > 0) {
          this.loading = false;
          this.resourcesData = Array.isArray(data?.data) ? data.data : [];
          this.collectionSize = data.pagination.totalRecords || 0;
          this.resourcesData = this.resourcesData.map((item: any) => ({
            ...item,
            employee: {
              ...item.employee,
              profileUrl: this.getImageUrl(item.employee?.profileUrl)
            }
          }));
          this.filteredResourcesData = data.data;
        } else {
          this.resourcesData = [];
          this.filteredResourcesData = [];
        }
        this.loading = false;
      },
      error: (reason: any) => {
        this.loading = false;
      },
    });
  }


  getImageUrl(imagePath: string): string | null {
    if (!imagePath) return null;
    // If it's already a full URL
    if (imagePath.startsWith('http')) return imagePath;
    // If logoPath is from FusionDocuments
    if (imagePath.startsWith('Profilepics/')) {
      return `${environment.viewUrl}${imagePath}`;
    }
    // Fallback
    return `${environment.viewUrl}${imagePath}`;
  }

  getResourceDataByPhaseId(
    projectId: number,
    phaseId: number,
    isPopupCall: boolean = false,
  ) {
    const params: any = { entityType: 'project', entityRefId: projectId };
    if (phaseId) params.phaseId = phaseId;

    this.subscription = this.http
      .getDataIncludeParams('ProjectResource', params)
      .subscribe({
        next: (data: any) => {
          const popupData = data.data ?? [];
          const uniqueEmployees = Array.from(
            new Map(popupData.map((r: any) => [r.employee.id, r])).values(),
          );
          this.resoucesDropDownData = (uniqueEmployees as any[]).map((r: any) => ({
            label: `${r.employee.fusionEmployeeId} - ${r.employee.name}`,
            value: r.employee.id,
          }));
          this.defaultPendingAuthorityId = popupData[0]?.pendingApprovalAuthority?.id ?? null;

          const authorityControl = this.updateResourceForm.get('resourceAuthority');
          if (this.resoucesDropDownData.length === 0) {
            authorityControl?.disable();
            authorityControl?.reset();
          } else {
            const authorityToPatch = this.pendingAuthorityIdForUpdate ?? this.defaultPendingAuthorityId ?? null;
            const isInDropdown = this.resoucesDropDownData.some((r: any) => r.value === authorityToPatch);
            authorityControl?.patchValue(isInDropdown ? authorityToPatch : null);
            authorityControl?.enable();
          }
        },
        error: (reason: any) => {
          console.error(reason);
          this.updateResourceForm.get('resourceAuthority')?.disable();
        },
      });
  }

  getclientProjects(clientId: any) {
    this.http
      .getData(`Project?clientId=${clientId}&status=Active`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.projectsDataDrown = res?.data ?? [];
          this.getPhaseData();
        },
        error: (err) => {
          console.error('Error fetching projects data:', err);
          this.projectsDataDrown = [];
        },
      });
  }

  onPhaseChange(event: any) {
    if (!event?.value) return;
    const selectedPhase = this.phaseDropdown.find((p) => p.value === event.value);
    if (selectedPhase) {
      this.selectedPhaseId = selectedPhase.value;
      this.projectStartDate = selectedPhase.startDate ?? null;
      this.projectEndDate = selectedPhase.endDate ?? null;
      this.pendingAuthorityIdForUpdate = selectedPhase?.pendingApprovalAuthority ?? null;
      this.updateResourceForm.get('startDate')?.updateValueAndValidity();
      this.updateResourceForm.get('endDate')?.updateValueAndValidity();
      this.getResourceDataByPhaseId(this.projectId, this.selectedPhaseId, true);
    }
  }

  onRoleChange(selectedValue: any) {
    if (selectedValue) {
      this.selectedRoleId = selectedValue.roleId;
      this.selectedEntityRefId = selectedValue.entityReferenceId;
    }
  }

  selectProject(projectId: any) {
    this.projectId = projectId;
    const selectedProject = this.projectsDataDrown.find(
      (p) => p.projectId === projectId,
    );
    if (selectedProject) {
      this.departmentIds =
        selectedProject?.departments?.map((d: any) => d.departmentId) || [];
      this.projectStartDate = this.formatDateToLocal(selectedProject.startDate);
      this.projectEndDate = this.formatDateToLocal(selectedProject.endDate);
      this.updateResourceForm.patchValue({
        projectType: selectedProject.projectType,
      });
      this.getProjects(projectId);
      this.getJobrole();
      this.getPhaseDataByProject(projectId);
    }
  }
  getProjects(projectId: string) {
    this.http
      .getData(`Project?projectId=${projectId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.updateProjectDependentFields(res?.data[0]);
        },
        error: (err) => {
          console.error('Error fetching projects data:', err);
          this.projectsDataDrown = [];
        },
      });
  }

  private updateProjectDependentFields(project: any): void {
    if (!project.isOvertimeEligibile) {
      this.updateResourceForm.get('overtimeEligible')?.disable();
    } else {
      this.updateResourceForm.get('overtimeEligible')?.enable();
    }

    if (!project.isBillable) {
      this.updateResourceForm.get('billable')?.disable();
    } else {
      this.updateResourceForm.get('billable')?.enable();
    }

    if (!project.isWeekendWorkAllowed) {
      this.updateResourceForm.get('allowweekendWork')?.disable();
    } else {
      this.updateResourceForm.get('allowweekendWork')?.enable();
    }
  }
  getJobrole() {
    this.loader = true;
    const departmentParam = this.departmentIds?.join(',') || '';
    this.subscription = this.http
      .getData(`ProjectRoles?isActive=true&departmentIds=${departmentParam}`)
      .subscribe({
        next: (response: any) => {
          this.loader = false;
          if (response && response.success && Array.isArray(response.data)) {
            this.projectRoleDropdown = response.data.map((item: any) => ({
              label: `${item.roleName}`,
              value: {
                roleId: item.id,
                entityReferenceId: item.entity?.entityReferenceId || 0,
              },
            }));
          } else {
            this.projectRoleDropdown = [];
          }
        },
        error: () => {
          this.loader = false;
        },
      });
  }

  formatDateToLocal(dateString: string) {
    if (dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return null;
  }

  DateValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const startDate = group.get('startDate')?.value;
      const endDate = group.get('endDate')?.value;
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (end < start) {
          return { endBeforeStart: true };
        }
      }
      return null;
    };
  }

  StartndendDateValidation() {
    const StartDate = this.updateResourceForm.get('startDate')?.value;
    const EndDate = this.updateResourceForm.get('endDate')?.value;
    if (StartDate && EndDate) {
      const startedDate = new Date(StartDate);
      const endedDate = new Date(EndDate);
      this.startndEndDateValid = endedDate > startedDate;
    } else {
      this.startndEndDateValid = true;
    }
  }

  oncheckdates(value: any) {
    if (value) {
      this.startDatevalidate = value;
    }
  }

  getPhaseData() {
    if (!this.clientID) return;
    const params = {
      clientId: this.clientID,
    };
    this.subscription = this.http
      .getDataIncludeParams('ProjectPhases/list', params)
      .subscribe({
        next: (data: any) => {
          this.phaseData = (data?.data || []).filter(
            (p: any) =>
              p?.status?.toLowerCase() === 'in progress' ||
              p?.status?.toLowerCase() === 'extended',
          );
          this.phaseDropdown = this.phaseData.map((p) => ({
            label: p.phaseName,
            value: p.phaseId,
            projectId: p?.project?.projectId,
            clientId: p?.project?.clientId,
            startDate: p?.startDate,
            endDate: p?.endDate,
            pendingApprovalAuthority: p?.pendingApprovalAuthority?.id,
          }));
        },
        error: (reason: any) => {
          console.error(reason);
        },
      });
  }

  getPhaseDataByProject(projectId: any) {
    const params = {
      projectId: projectId,
    };
    this.subscription = this.http
      .getDataIncludeParams('ProjectPhases/list', params)
      .subscribe({
        next: (data: any) => {
          this.phaseData = (data?.data || []).filter(
            (p: any) =>
              p?.status?.toLowerCase() === 'in progress' ||
              p?.status?.toLowerCase() === 'extended',
          );
          this.phaseDropdown = this.phaseData.map((p) => ({
            label: p.phaseName,
            value: p.phaseId,
            projectId: p?.project?.projectId,
            clientId: p?.project?.clientId,
            startDate: p?.startDate,
            endDate: p?.endDate,
            pendingApprovalAuthority: p?.pendingApprovalAuthority?.id,
          }));
        },
        error: (reason: any) => {
          console.error(reason);
        },
      });
  }

  openModal(content: any, size: any, data: any) {
    this.selectedResource = data;
    this.ResourceId = data?.resourceId;
    this.modalService.open(content, { centered: true, size, backdrop: 'static' });

    this.projectId = data?.project?.projectId;
    const selectedProject = this.projectsDataDrown.find((p) => p.projectId === this.projectId);
    if (selectedProject) {
      this.departmentIds = selectedProject?.departments?.map((d: any) => d.departmentId) || [];
      this.projectStartDate = this.formatDateToLocal(selectedProject.startDate);
      this.projectEndDate = this.formatDateToLocal(selectedProject.endDate);
    }
    this.getJobrole();
    this.getPhaseDataByProject(this.projectId);
    if (data?.project?.projectId) this.getProjects(data.project.projectId);

    const selectedPhase = this.phaseDropdown.find((r: any) => r.value === data?.phase?.phaseId);

    // Store authority to pre-select after async dropdown population
    this.pendingAuthorityIdForUpdate = data?.pendingApprovalAuthority?.id
      ?? selectedPhase?.pendingApprovalAuthority
      ?? null;

    if (selectedPhase) {
      this.selectedPhaseId = selectedPhase.value;
      this.getResourceDataByPhaseId(this.projectId, this.selectedPhaseId, true);
    }

    const selectedRole = this.projectRoleDropdown.find((r: any) => r.value.roleId === data.projectRoleId);
    this.updateResourceForm.patchValue({
      resourceName: data?.employee?.id,
      resourceEmail: data?.employee?.workMail,
      overtimeEligible: data.overtimeEligibile,
      resourcePhone: data?.employee
        ? `${data.employee.mobilePhoneCountryCode ?? ''} ${data.employee.mobilePhoneNumber ?? ''}`.trim() || '-'
        : '-',
      designation: data?.employee?.designation,
      resourceAllocationhrs: data.allocatedHours || null,
      projectName: data?.project?.projectId,
      projectType: data?.project?.projectType,
      startDate: this.formatDateToLocal(data?.startDate),
      endDate: this.formatDateToLocal(data?.endDate),
      billable: data.billable,
      allowweekendWork: data.weekendWorkAllowed,
      resourceRole: selectedRole ? selectedRole.value : null,
      color: data?.meta?.graphData?.color,
      resourcePhase: selectedPhase ? selectedPhase.value : null,
      resourceAuthority: null,
    });
  }

  updateResources() {
    if (this.updateResourceForm.invalid) {
      this.updateResourceForm.markAllAsTouched();
      return;
    }
    this.loader = true;
    const formValue = this.updateResourceForm.getRawValue();
    const projectRoleId = formValue.resourceRole?.roleId;
    const projectDepartmentId = formValue.resourceRole?.entityReferenceId;
    const currentStatus = this.selectedResource?.status?.toLowerCase();
    const finalStatus = currentStatus === 'assigned' ? 'Assigned' : 'Active';
    const payload = {
      entityType: 'project',
      entityRefId: this.projectId,
      employeeId: formValue.resourceName,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      allocatedHours: formValue.resourceAllocationhrs || null,
      overtimeEligibile: formValue.overtimeEligible || false,
      billable: formValue.billable || false,
      weekendWorkAllowed: formValue.allowweekendWork || false,
      status: finalStatus,
      allocatedBy: this.empinfo.employeeId,
      projectRoleId,
      projectDepartmentId,
      pendingApprovalAuthority: formValue.resourceAuthority || null,
      phaseId:
        typeof formValue.resourcePhase === 'number'
          ? formValue.resourcePhase
          : null,
      projectId: formValue.projectName,
      meta: {
        graphData: {
          color: formValue.color,
        },
      },
    };
    this.updateResourceStatus(payload, null, 'Resource updated successfully');
  }

  updateResourceStatus(payload: any, modal?: any, successMessage?: string) {
    const resourceId = payload.resourceId || this.ResourceId;
    if (!resourceId) {
      console.error('Resource ID missing.');
      return;
    }
    this.http.putData(`ProjectResource/${resourceId}`, payload).subscribe({
      next: (res) => {
        this.loader = false;
        this.modalService.dismissAll();
        this.http.setnewcountfornewresourcecount();
        this.conformationPopup.openSuccessModal(
          successMessage || 'Resource updated successfully',
        );
        this.getResourceData(this.clientID, this.searchValue);
      },
      error: (err) => {
        this.loader = false;
        console.error('Error occurred:', err);
        this.conformationPopup.openErrorModal(
          err?.error?.message || 'Failed to update resource',
        );
      },
    });
  }

  deleteResources() {
    const formValue = this.updateResourceForm.value;
    const payload = {
      entityType: 'Client',
      entityRefId: this.clientID,
      employeeId: formValue.resourceName,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      allocatedHours: formValue.resourceAllocationhrs || null,
      overtimeEligibile: formValue.overtimeEligible,
      billable: formValue.billable,
      weekendWorkAllowed: formValue.allowweekendWork,
      status: 'Inactive',
      allocatedBy: this.empinfo.employeeId,
    };
    this.http.putData(`ProjectResource/${this.ResourceId}`, payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal(
          'Resource deleted successfully',
        );
        this.getResourceData(this.clientID, this.searchValue);
      },
      error: (err) => {
        console.error('Error occurred:', err);
        this.conformationPopup.openErrorModal(
          err?.error?.message || 'Failed to delete resource',
        );
      },
    });
  }

  statusActionsMap: Record<string, string[]> = {
    assigned: ['Active', 'Release', 'Update'],
    active: ['Update', 'Release'],
  };

  confirmationMessages: Record<
    string,
    { title: string; nextStatus: string; successMessage: string }
  > = {
      Active: {
        title: 'Are you sure you want to activate this resource?',
        nextStatus: 'Active',
        successMessage: 'Resource activated successfully',
      },
      Release: {
        title: 'Are you sure you want to release this resource?',
        nextStatus: 'Released',
        successMessage: 'Resource released successfully',
      },
      'Release Resource': {
        title: 'Are you sure you want to release this resource?',
        nextStatus: 'Released',
        successMessage: 'Resource released successfully',
      },
      Update: {
        title: 'Are you sure you want to update this resource?',
        nextStatus: 'Active',
        successMessage: 'Resource updated successfully',
      },
    };

  getActionIcon(action: string) {
    return (
      {
        Active: 'bi-play-circle',
        Release: 'bi-x-circle',
        'Release Resource': 'bi-x-circle',
        Update: 'bi-pencil',
      }[action] || 'bi-question-circle'
    );
  }

  getActionsByStatus(status: string): string[] {
    if (!status) return [];
    const normalized = status.trim().toLowerCase();
    return this.statusActionsMap[normalized] ?? [];
  }

  formatDateToLocalforresource(dateString: string | null): Date | null {
    if (!dateString) return null;
    return new Date(dateString); // Converts ISO string to Date object
  }

  private readonly ACTIVE_STATUSES = ['active', 'assigned', 'waiting for approval'];

  isApprovalAuthority(employeeId: number): boolean {
    return this.resourcesData.some(
      (r: any) =>
        r.pendingApprovalAuthority?.id === employeeId &&
        this.ACTIVE_STATUSES.includes(r.status?.toLowerCase())
    );
  }

  handleAction(action: string, data: any) {
    const config = this.confirmationMessages[action];
    if (!config) return;
    if (action === 'Update') {
      this.openModal(this.updateResourcemodal, 'lg', data);
      const phaseDate = data?.phase;
      console.log(phaseDate);
      if (phaseDate) {
        this.projectStartDate = phaseDate.startDate ?? null;
        this.projectEndDate = phaseDate.endDate ?? null;
      }
    } else if (action === 'Release' || action === 'Release Resource') {
      if (this.isApprovalAuthority(data?.employee?.id)) {
        this.conformationPopup.openErrorModal(
          'The selected resource is currently assigned as an Approval Authority. Before releasing this resource, please reassign the Approval Authority for all resources reporting to them.'
        );
        return;
      }
      this.openReasonModal(config.title, data);
      this.resourcestartdate = this.formatDateToLocalforresource(data?.startDate);
    } else {
      this.openReasonModal(config.title, data);
      this.resourcestartdate = this.formatDateToLocalforresource(
        data?.startDate,
      );
    }
  }

  openReasonModal(title: string, data: any) {
    this.projectId = data?.project?.projectId;
    this.modalData = { title, data };
    this.reasonForm.reset();
    this.updateStatusEffectiveDateValidation();
    this.modalService.open(this.reasonModal, {
      centered: true,
      backdrop: 'static',
    });
  }

  get newStartDate() {
    return this.extendForm.get('newStartDate')?.value;
  }
  get newEndDate() {
    return this.extendForm.get('newEndDate')?.value;
  }

  openExtendModal(data: any) {
    this.modalData = { data };
    this.extendForm.reset();
    const today = new Date().toISOString().split('T')[0];
    const phaseStart = data.startDate?.substring(0, 10);
    this.extendForm.patchValue({
      newStartDate: phaseStart,
      newEndDate: data.endDate?.substring(0, 10),
      extendReason: '',
    });
    if (phaseStart && phaseStart < today) {
      this.extendForm.get('newStartDate')?.disable();
    } else {
      this.extendForm.get('newStartDate')?.enable();
    }
    this.startndEndDateValid = true;
    this.modalService.open(this.extendModal, {
      centered: true,
      size: 'md',
      backdrop: 'static',
    });
  }

  submitReason(modal: any) {
    if (this.reasonForm.invalid) {
      this.reasonForm.markAllAsTouched();
      return;
    }
    const reason = this.reasonForm.value.reason;
    const statusEffectiveDate = this.reasonForm.value.statusEffectiveDate;
    const title = this.modalData?.title ?? '';
    const data = this.modalData?.data;
    // const resourceId = data?.resourceId;
    // if (!resourceId) {
    //   console.error('Resource ID missing.');
    //   return;
    // }
    if (this.selectedResources && this.selectedResources.length > 0) {
      const blockedResources = this.selectedResources.filter((item: any) =>
        this.isApprovalAuthority(item.employee?.id)
      );
      if (blockedResources.length > 0) {
        const names = blockedResources.map((r: any) => r.employee?.name).join(', ');
        this.conformationPopup.openErrorModal(
          `The following resource(s) are currently assigned as an Approval Authority: ${names}. Before releasing, please reassign the Approval Authority for all resources reporting to them.`
        );
        return;
      }
      let errorShown = false;
      let completed = 0;
      this.spinnerLoader = true;
      this.isReleasing = true;
      this.reasonForm.disable();
      this.selectedResources.forEach((item: any) => {
        const payload: any = {
          resourceId: item.resourceId,
          entityType: 'project',
          entityRefId: item.project?.projectId,
          employeeId: item.employee?.id,
          startDate: item.startDate,
          endDate: item.endDate,
          allocatedHours: item.allocatedHours,
          overtimeEligibile: item.overtimeEligibile,
          billable: item.billable,
          weekendWorkAllowed: item.weekendWorkAllowed,
          status: 'Released',
          reason: this.reasonForm.value.reason,
          statusEffectiveDate: this.reasonForm.value.statusEffectiveDate,
          allocatedBy: this.empinfo.employeeId,
          projectRoleId: item.projectRoleId || null,
          projectDepartmentId: item.projectDepartmentId,
          pendingApprovalAuthority: item.pendingApprovalAuthority?.id,
          phaseId: item.phase?.phaseId,
          meta: item.meta,
        };

        this.http
          .putData(`ProjectResource/${item.resourceId}`, payload)
          .subscribe({
            next: () => {
              completed++;

              if (completed === this.selectedResources.length) {
                this.isReleasing = false;
                this.reasonForm.enable();
                this.modalService.dismissAll();

                this.conformationPopup.openSuccessModal(
                  'Resources released successfully',
                );

                this.http.setnewresourceDetails();
                this.http.setnewcountfornewresourcecount();

                this.getResourceData(this.clientID, this.searchValue);
                this.selectedResources = [];
              }
            },
            error: (err) => {
              console.error('Release failed', err);

              completed++;

              if (!errorShown) {
                errorShown = true;

                this.conformationPopup.openErrorModal(
                  err?.error?.message || 'Failed to release resource',
                );
              }

              if (completed === this.selectedResources.length) {
                this.isReleasing = false;
                this.reasonForm.enable();
                this.spinnerLoader = false; // 🔥 STOP LOADER
              }
            },
          });
      });

      return;
    }
    const resourceId = data?.resourceId;
    const config = Object.values(this.confirmationMessages).find(
      (c) => c.title === title,
    );
    const status = config?.nextStatus || 'Active';

    const payload: any = {
      resourceId,
      entityType: 'project',
      entityRefId: this.projectId,
      employeeId: data.employee?.id,
      startDate: data.startDate,
      endDate: data.endDate,
      allocatedHours: data.allocatedHours,
      overtimeEligibile: data.overtimeEligibile,
      billable: data.billable,
      weekendWorkAllowed: data.weekendWorkAllowed,
      status,
      reason,
      allocatedBy: this.empinfo.employeeId,
      projectRoleId: data?.projectRoleId,
      projectDepartmentId: data?.projectDepartmentId,
      pendingApprovalAuthority: data?.pendingApprovalAuthority?.id,
      phaseId: data.phase?.phaseId,
      projectId: data.project?.projectId,
      meta: data.meta || {
        graphData: { color: data.meta?.graphData?.color || '' },
      },
    };

    if (status === 'Released' && statusEffectiveDate) {
      payload.statusEffectiveDate = new Date(statusEffectiveDate).toISOString();
    }

    this.updateResourceStatus(payload, modal, config?.successMessage);
  }

  submitExtend(modal: any) {
    if (this.extendForm.invalid) {
      this.extendForm.markAllAsTouched();
      return;
    }
    const { newStartDate, newEndDate, extendReason } = this.extendForm.value;
    const resource = this.modalData?.data;
    if (!resource?.resourceId) {
      console.error('Resource ID missing for extension');
      return;
    }
    const payload = {
      entityType: 'Client',
      entityRefId: this.clientID,
      employeeId: resource.employee?.id,
      startDate: newStartDate,
      endDate: newEndDate,
      allocatedHours: resource.allocatedHours,
      overtimeEligibile: resource.overtimeEligibile,
      billable: resource.billable,
      weekendWorkAllowed: resource.weekendWorkAllowed,
      status: 'Extended',
      reason: extendReason,
      allocatedBy: resource.allocatedBy,
      projectRoleId: resource.projectRoleId,
      projectDepartmentId: resource.projectDepartmentId,
      pendingApprovalAuthority: resource.pendingApprovalAuthority,
      phaseId: resource.phase?.phaseId,
      projectId: resource.project?.projectId,
      meta: resource.meta || {
        graphData: {
          color: resource.meta?.graphData?.color || '',
        },
      },
    };
    this.updateResourceStatus(payload, modal);
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close(dismiss?: boolean) {
    if (dismiss) {
      this.modalService.dismissAll();
    }
  }

  getAllActiveEmployees() {
    this.subscription = this.http
      .getData('Employeedata/ActiveEmployees')
      .subscribe({
        next: (data: any) => {
          this.employeeDetails = data.map((employee: any) => {
            return {
              ...employee,
              id: employee.employeeId,
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName}
            ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName}`,
            };
          });
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  onClickEmployee(event: any) {
    const employeeId = event.value;
    this.selectedEmployee = this.employeeDetails?.find(
      (emp) => emp.employeeId === employeeId,
    );
    this.updateResourceForm.patchValue({
      resourceEmail: this.selectedEmployee?.workMail,
      resourcePhone: this.selectedEmployee
        ? `${this.selectedEmployee.mobilePhoneCountryCode ?? ''}
      ${this.selectedEmployee.contactnumber ?? ''}`.trim() || '-'
        : '-',
    });
    this.getJobdetails(this.selectedEmployee?.employeeId);
  }

  getJobdetails(Employee: any) {
    this.subscription = this.http
      .getData(`JobDetails/Empname/${Employee}`)
      .subscribe({
        next: (data: any) => {
          const jobRole = Array.isArray(data)
            ? data[0]?.jobRole
            : data?.jobRole;
          this.updateResourceForm.patchValue({
            designation: jobRole,
          });
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  closePopup() {
    this.modalService.dismissAll();
    this.updateResourceForm.reset();
  }

  watchSearchValue() {
    let timeout: any;
    const originalSearchValue = this.searchValue;

    const checkSearch = () => {
      if (this.searchValue !== originalSearchValue) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.getResourceData(this.clientID, this.searchValue);
        }, 300);
      }
    };

    setInterval(() => {
      if (this.searchValue !== originalSearchValue) {
        checkSearch();
      }
    }, 100);
  }

  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.getResourceData(this.clientID, this.searchValue);
    }, 300);
  }

  isSelected(data: any): boolean {
    return this.selectedResources.some(
      (item: any) => item.resourceId === data.resourceId,
    );
  }
  selectedResources: any[] = [];

  toggleAll(event: any) {
    if (event.target.checked) {
      this.selectedResources = [...this.resourcesData];
    } else {
      this.selectedResources = [];
    }

    this.multiSelect = this.selectedResources.length > 0;
    this.reorderRows();
  }

  multiSelect: boolean = false;
  onRowSelect(data: any, event: any) {
    if (event.target.checked) {
      this.selectedResources.push(data);
    } else {
      this.selectedResources = this.selectedResources.filter(
        (item) => item !== data,
      );
    }

    // ✅ Important line
    this.multiSelect = this.selectedResources.length > 0;
    this.reorderRows();
  }

  reorderRows() {
    this.resourcesData.sort((a: any, b: any) => {
      const aSelected = this.selectedResources.some(
        (item: any) => item.resourceId === a.resourceId,
      );
      const bSelected = this.selectedResources.some(
        (item: any) => item.resourceId === b.resourceId,
      );

      return (bSelected ? 1 : 0) - (aSelected ? 1 : 0);
    });
  }

  releaseSelectedResources() {
    if (!this.selectedResources.length) return;

    this.openReasonModal(
      'Are you sure you want to release this resource?',
      null,
    );
  }
  private searchTimeout: any;

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    clearTimeout(this.searchTimeout);
  }
}

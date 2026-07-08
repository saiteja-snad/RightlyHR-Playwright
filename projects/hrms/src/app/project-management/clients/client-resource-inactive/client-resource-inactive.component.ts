import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, ValidationErrors, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { combineLatest, debounceTime, distinctUntilChanged, Subscription, Subject, takeUntil } from 'rxjs';
import { IPhases } from '../../../Interfaces/project-management/phases.model';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { IEmployeeDetails } from '../../../letters/letters.modal';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { Project } from '../../../Interfaces/projects.model';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ClientResourceTabComponent } from '../../../shared/project-management-tabs/client-resource-tab/client-resource-tab.component';
import { ProfileIconComponent } from "../../../icons/profile-icon/profile-icon.component";
import { environment } from '../../../../environments/environment';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
@Component({
  selector: 'app-client-resource-inactive',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ClientResourceTabComponent, TranslateModule, NgbPopover, DataLoaderContentComponent, PaginatorModule,
    Select, DateformatPipe, NoDataFoundComponent, ConfirmationIconComponent, InfoIconComponent, ProfileIconComponent, TableModule],
  templateUrl: './client-resource-inactive.component.html',
  styleUrl: './client-resource-inactive.component.scss'
})

export class ClientResourceInactiveComponent {
  @ViewChild('clientResourceInactiveTable') clientResourceInactiveTable!: Table;
  searchValue: string = '';
  resourcesData = [] as IResource[];

  selectedRoleIds: number[] = [];
  selectedPhaseIds: number[] = [];
  selectedAuthorityIds: number[] = [];
  selectedProjectIds: number[] = [];
  resourcesDataByPhase = [] as IResource[];
  subscription!: Subscription;
  updateResourceForm!: FormGroup;
  reasonForm!: FormGroup;
  extendForm!: FormGroup;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployee: any;
  employeeFullname!: string;
  projectsDataDrown: Project[] = [];
  loading: boolean = true;
  frequencyTypes = [
    { label: 'Per month', value: 'Per month' },
    { label: 'Per week', value: 'Per week' },
    { label: 'Per project', value: 'Per project' }
  ];
  clientID: any;
  ResourceId: any;
  projectId: any
  empinfo: any = {};
  projectsData: Project[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  inactiveClientStatus: any;
  projectRoleDropdown: any[] = [];
  resoucesDropDownData = [] as any[];
  phaseDropdown: any[] = [];
  phaseData = [] as IPhases[];
  selectedPhaseId: any;
  startndEndDateValid: any;
  startDatevalidate: any;
  endDatevalidate: any;
  loader: boolean | undefined;
  departmentIds: number[] = [];
  defaultPendingAuthorityId: any;
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
  
  // Sorting
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  currentUIField: string = ''; // Track the UI field name for visual state
  
  constructor(private fb: FormBuilder, private modalService: NgbModal, public formValidation: FormValidationsService,
    private http: HttpService, public rbac: RbacService, private router: Router, private route: ActivatedRoute,
    private conformationPopup: OpenModalService) { }

  ngOnInit() {
    this.initializeForms();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllActiveEmployees();
    this.route.queryParams.subscribe(params => {
      const clientID = params['id'];
      if (clientID) {
        this.clientID = parseInt(clientID);
        // this.getResourceData(this.clientID);
        this.getclientProjects(this.clientID);
        this.getClientsData(clientID);
      }
    });

    combineLatest([
      this.http.resourceRoleFilter$,
      this.http.resourcePhaseFilter$,
      this.http.resourceAuthorityFilter$,
      this.http.resourceProjectFilter$
    ]).pipe(
      takeUntil(this.destroy$),
      debounceTime(100),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    ).subscribe(([roleIds, phaseIds, authorityIds, projectIds]) => {
      this.selectedRoleIds = roleIds || [];
      this.selectedPhaseIds = phaseIds || [];
      this.selectedAuthorityIds = authorityIds || [];
      this.selectedProjectIds = projectIds || [];
      if (this.clientID) {
        this.getResourceData(this.clientID, this.searchValue);
      }
    });

    this.http.resourceDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getResourceData(parseInt(this.clientID), this.searchValue);
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
    this.http.getData(`Client/${clientID}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.inactiveClientStatus = res.data.status.toLowerCase();
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }

  initializeForms() {
    this.updateResourceForm = this.fb.group({
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
      color: ['#FFFFFF'],
      resourceRole: [null, Validators.required],
      resourcePhase: [null, Validators.required],
      resourceAuthority: [null]
    }, { validators: [this.DateValidator()] });
  }

  ExtendDateForm() {
    this.reasonForm = this.fb.group({
      reason: ['', [Validators.required, Validators.maxLength(250), Validators.pattern(/^(?!\s).*$/)]],
      statusEffectiveDate: ['', Validators.required]
    });

    this.extendForm = this.fb.group({
      newStartDate: ['', Validators.required],
      newEndDate: ['', Validators.required],
      extendReason: ['', [Validators.required, Validators.maxLength(250), Validators.pattern(/^(?!\s).*$/)]]
    });
  }


  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getResourceData(this.clientID, this.searchValue);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getResourceData(this.clientID, this.searchValue);
  }
  getResourceData(id: any, searchTerm?: string) {
    let url = `ProjectResource?status=Released&entityType=Client&entityRefId=${id}&isProjectRequired=true&isGroupedByProject=true&pageNumber=${this.page}&pageSize=${this.pageSize}`;
    if (searchTerm) {
      url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }
    if (this.selectedRoleIds.length > 0) {
      url += `&roleIds=${this.selectedRoleIds.join(',')}`;
    }
    if (this.selectedPhaseIds.length > 0) {
      url += `&phaseId=${this.selectedPhaseIds.join(',')}`;
    }
    if (this.selectedProjectIds.length > 0) {
      url += `&projectIds=${this.selectedProjectIds.join(',')}`;
    }
    if (this.selectedAuthorityIds.length > 0) {
      url += `&timesheetApprovalAuthorityIds=${this.selectedAuthorityIds.join(',')}`;
    }
    
    // Add sorting parameters
    if (this.currentSortField && this.currentSortOrder !== 0) {
      const sortOrder = this.currentSortOrder === 1 ? 'asc' : 'desc';
      url += `&sortBy=${this.currentSortField}&sortOrder=${sortOrder}`;
    }

    this.subscription = this.http.getDataIncludeParams(url).subscribe({
      next: (data: any) => {
        this.collectionSize = data?.pagination?.totalRecords || 0;
        if (data?.data?.length > 0) {
          this.loading = false;

          this.resourcesData = Array.isArray(data?.data) ? data.data : [];
          this.resourcesData = this.resourcesData.map((item: any) => ({
            ...item,
            employee: {
              ...item.employee,
              profileUrl: this.getImageUrl(item.employee?.profileUrl)
            }
          }));
        } else {
          this.resourcesData = [];
          this.loading = false;
        }
      },
      error: (reason: any) => {
        this.loading = false;
      }
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
  getResourceDataByPhaseId(projectId: number, phaseId: number, isPopupCall: boolean = false) {
    const params: any = {
      entityType: 'project',
      entityRefId: projectId
    };

    if (phaseId) {
      params.phaseId = phaseId;
    }

    this.subscription = this.http.getDataIncludeParams('ProjectResource', params).subscribe({
      next: (data: any) => {
        if (isPopupCall) {
          const popupData = data.data ?? [];
          this.resoucesDropDownData = popupData
            .filter((r: any) => r.employee)
            .map((r: any) => ({
              label: `${r.employee.fusionEmployeeId} - ${r.employee.name}`,
              value: r.employee.id
            }));
          this.defaultPendingAuthorityId = popupData[0]?.pendingApprovalAuthority?.id ?? null;
        } else {
          this.resourcesDataByPhase = data.data ?? [];
          this.resoucesDropDownData = this.resourcesDataByPhase
            .filter(r => r.employee)
            .map(r => ({
              label: `${r.employee.fusionEmployeeId} - ${r.employee.name}`,
              value: r.employee.id
            }));
          this.defaultPendingAuthorityId = this.resourcesDataByPhase[0]?.pendingApprovalAuthority?.id ?? null;
        }

        const authorityControl = this.updateResourceForm.get('resourceAuthority');
        if (this.resoucesDropDownData.length === 0) {
          authorityControl?.disable();
          authorityControl?.reset();
        } else {
          authorityControl?.enable();
          const hasExistingValue = authorityControl?.value;
          if (!hasExistingValue && this.defaultPendingAuthorityId) {
            authorityControl?.patchValue(this.defaultPendingAuthorityId);
          }
        }
      },
      error: (reason: any) => {
        console.error(reason);
        this.updateResourceForm.get('resourceAuthority')?.disable();
      }
    });
  }

  projectStartDate!: string | null;
  projectEndDate!: string | null;
  getclientProjects(clientId: any) {
    this.http.getData(`Project?clientId=${clientId}&status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
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

    const selectedPhaseId = event.value;
    const selectedPhase = this.phaseDropdown.find(p => p.value === selectedPhaseId);

    if (selectedPhase) {
      this.selectedPhaseId = selectedPhase.value;
      this.projectStartDate = selectedPhase.startDate ?? null;
      this.projectEndDate = selectedPhase.endDate ?? null;

      const phaseAuthority = selectedPhase?.pendingApprovalAuthority ?? null;
      const authorityControl = this.updateResourceForm.get('resourceAuthority');
      if (authorityControl) {
        authorityControl.patchValue(phaseAuthority);
        if (phaseAuthority) {
          authorityControl.disable();
        } else {
          authorityControl.enable();
        }
      }

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
    const selectedProject = this.projectsDataDrown.find(p => p.projectId === projectId);
    if (selectedProject) {
      this.departmentIds = selectedProject?.departments?.map((d: any) => d.departmentId) || [];
      this.projectStartDate = this.formatDateToLocal(selectedProject.startDate);
      this.projectEndDate = this.formatDateToLocal(selectedProject.endDate);
      this.updateResourceForm.patchValue({
        projectType: selectedProject.projectType
      });
      this.getJobrole();
      this.getPhaseDataByProject(projectId);
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
                entityReferenceId: item.entity?.entityReferenceId || 0
              }
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
      clientId: this.clientID
    };
    this.subscription = this.http.getDataIncludeParams('ProjectPhases/list', params).subscribe({
      next: (data: any) => {
        this.phaseData = (data?.data || []).filter(
          (p: any) =>
            p?.status?.toLowerCase() === 'in progress' ||
            p?.status?.toLowerCase() === 'extended'
        );
        this.phaseDropdown = this.phaseData.map(p => ({
          label: p.phaseName,
          value: p.phaseId,
          projectId: p?.project?.projectId,
          clientId: p?.project?.clientId,
          startDate: p?.startDate,
          endDate: p?.endDate,
          pendingApprovalAuthority: p?.pendingApprovalAuthority?.id
        }));
      },
      error: (reason: any) => {
        console.error(reason);
      }
    });
  }

  getPhaseDataByProject(projectId: any) {
    const params = {
      projectId: projectId
    };
    this.subscription = this.http.getDataIncludeParams('ProjectPhases/list', params).subscribe({
      next: (data: any) => {
        this.phaseData = (data?.data || []).filter(
          (p: any) =>
            p?.status?.toLowerCase() === 'in progress' ||
            p?.status?.toLowerCase() === 'extended'
        );
        this.phaseDropdown = this.phaseData.map(p => ({
          label: p.phaseName,
          value: p.phaseId,
          projectId: p?.project?.projectId,
          clientId: p?.project?.clientId,
          startDate: p?.startDate,
          endDate: p?.endDate,
          pendingApprovalAuthority: p?.pendingApprovalAuthority?.id
        }));
      },
      error: (reason: any) => {
        console.error(reason);
      }
    });
  }

  openModal(content: any, size: any, data: any) {
    this.selectedResource = data;
    this.modalService.open(content, { centered: true, size: size, backdrop: 'static' });

    const selectedRole = this.projectRoleDropdown.find(
      (r: any) => r.value.roleId === data.projectRoleId
    );
    const selectedPhase = this.phaseDropdown.find(
      (r: any) => r.value === data?.phase?.phaseId
    );

    if (selectedPhase) {
      this.selectedPhaseId = selectedPhase.value;
      this.projectId = selectedPhase.projectId;
      this.getResourceDataByPhaseId(this.projectId, this.selectedPhaseId, true);
    }

    const authorityFromResource = this.resoucesDropDownData.find(
      (r: any) => r.value === data?.pendingApprovalAuthority?.id
    );
    let authorityValueToPatch = authorityFromResource?.value ?? null;

    if (!authorityValueToPatch && selectedPhase?.pendingApprovalAuthority) {
      authorityValueToPatch = selectedPhase.pendingApprovalAuthority;
    }

    this.ResourceId = data?.resourceId;
    this.updateResourceForm.patchValue({
      resourceName: data?.employee?.id,
      resourceEmail: data?.employee?.workMail,
      overtimeEligible: data.overtimeEligibile,
      resourcePhone:
        data?.employee
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
      resourceAuthority: authorityValueToPatch
    });
  }

  updateResources() {
    if (this.updateResourceForm.invalid) {
      this.updateResourceForm.markAllAsTouched();
      return;
    }

    this.loader = true;
    const formValue = this.updateResourceForm.value;

    const projectRoleId = formValue.resourceRole.roleId;
    const projectDepartmentId = formValue.resourceRole.entityReferenceId;

    const currentStatus = this.selectedResource?.status?.toLowerCase();
    const finalStatus = currentStatus === 'assigned' ? 'Assigned' : 'Active';

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
      status: finalStatus,
      allocatedBy: this.empinfo.employeeId,
      projectRoleId,
      projectDepartmentId,
      pendingApprovalAuthority: formValue.resourceAuthority,
      phaseId: formValue.resourcePhase,
      projectId: formValue.projectName,
      meta: {
        graphData: {
          color: formValue.color
        }
      }
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
        this.conformationPopup.openSuccessModal(successMessage || 'Resource updated successfully');
        this.getResourceData(this.clientID, this.searchValue);
      },
      error: (err) => {
        this.loader = false;
        console.error('Error occurred:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to update resource');
      }
    });
  }

  deleteResources() {
    const formValue = this.updateResourceForm.value;
    const payload = {
      entityType: "Client",
      entityRefId: this.clientID,
      employeeId: formValue.resourceName,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      allocatedHours: formValue.resourceAllocationhrs || null,
      overtimeEligibile: formValue.overtimeEligible,
      billable: formValue.billable,
      weekendWorkAllowed: formValue.allowweekendWork,
      status: "Inactive",
      allocatedBy: this.empinfo.employeeId,
    };
    this.http.putData(`ProjectResource/${this.ResourceId}`, payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Resource deleted successfully');
        this.getResourceData(this.clientID, this.searchValue);
      },
      error: (err) => {
        console.error('Error occurred:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to delete resource');
      }
    });
  }

  statusActionsMap: Record<string, string[]> = {
    'assigned': ['Active', 'Release', 'Update'],
    'active': ['Update', 'Release'],
  };

  confirmationMessages: Record<string, { title: string, nextStatus: string, successMessage: string }> = {
    'Active': {
      title: 'Are you sure you want to activate this resource?',
      nextStatus: 'Active',
      successMessage: 'Resource activated successfully'
    },
    'Release': {
      title: 'Are you sure you want to release this resource?',
      nextStatus: 'Released',
      successMessage: 'Resource released successfully'
    },
    'Release Resource': {
      title: 'Are you sure you want to release this resource?',
      nextStatus: 'Released',
      successMessage: 'Resource released successfully'
    },
    'Update': {
      title: 'Are you sure you want to update this resource?',
      nextStatus: 'Active',
      successMessage: 'Resource updated successfully'
    }
  };

  getActionIcon(action: string) {
    return {
      'Active': 'bi-play-circle',
      'Release': 'bi-x-circle',
      'Release Resource': 'bi-x-circle',
      'Update': 'bi-pencil',
    }[action] || 'bi-question-circle';
  }

  getActionsByStatus(status: string): string[] {
    if (!status) return [];
    const normalized = status.trim().toLowerCase();
    return this.statusActionsMap[normalized] ?? [];
  }

  handleAction(action: string, data: any) {
    const config = this.confirmationMessages[action];

    if (!config) return;

    if (action === 'Update') {
      this.openModal(this.updateResourcemodal, 'lg', data);
    } else {
      this.openReasonModal(config.title, data);
    }
  }

  openReasonModal(title: string, data: any) {
    this.modalData = { title, data };
    this.reasonForm.reset();
    this.modalService.open(this.reasonModal, { centered: true, backdrop: 'static' });
  }

  get newStartDate() { return this.extendForm.get('newStartDate')?.value; }
  get newEndDate() { return this.extendForm.get('newEndDate')?.value; }

  openExtendModal(data: any) {
    this.modalData = { data };
    this.extendForm.reset();
    const today = new Date().toISOString().split('T')[0];
    const phaseStart = data.startDate?.substring(0, 10);

    this.extendForm.patchValue({
      newStartDate: phaseStart,
      newEndDate: data.endDate?.substring(0, 10),
      extendReason: ''
    });

    if (phaseStart && phaseStart < today) {
      this.extendForm.get('newStartDate')?.disable();
    } else {
      this.extendForm.get('newStartDate')?.enable();
    }

    this.startndEndDateValid = true;
    this.modalService.open(this.extendModal, { centered: true, size: 'md', backdrop: 'static' });
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
    const resourceId = data?.resourceId;

    if (!resourceId) {
      console.error('Resource ID missing.');
      return;
    }

    const config = Object.values(this.confirmationMessages).find(c => c.title === title);
    const status = config?.nextStatus || 'Active';

    const payload: any = {
      resourceId,
      entityType: 'Client',
      entityRefId: this.clientID,
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
      meta: data.meta || { graphData: { color: data.meta?.graphData?.color || '' } }
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
      entityType: "Client",
      entityRefId: this.clientID,
      employeeId: resource.employee?.id,
      startDate: newStartDate,
      endDate: newEndDate,
      allocatedHours: resource.allocatedHours,
      overtimeEligibile: resource.overtimeEligibile,
      billable: resource.billable,
      weekendWorkAllowed: resource.weekendWorkAllowed,
      status: "Extended",
      reason: extendReason,
      allocatedBy: resource.allocatedBy,
      projectRoleId: resource.projectRoleId,
      projectDepartmentId: resource.projectDepartmentId,
      pendingApprovalAuthority: resource.pendingApprovalAuthority,
      phaseId: resource.phase?.phaseId,
      projectId: resource.project?.projectId,
      meta: resource.meta || {
        graphData: {
          color: resource.meta?.graphData?.color || ''
        }
      }
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
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
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
    this.selectedEmployee = this.employeeDetails?.find(emp => emp.employeeId === employeeId);
    this.updateResourceForm.patchValue({
      resourceEmail: this.selectedEmployee?.workMail,
      resourcePhone: this.selectedEmployee
        ? `${this.selectedEmployee.mobilePhoneCountryCode ?? ''} ${this.selectedEmployee.contactnumber ?? ''}`.trim() || '-'
        : '-'
    });
    this.getJobdetails(this.selectedEmployee?.employeeId);
  }

  getJobdetails(Employee: any) {
    this.subscription = this.http.getData(`JobDetails/Empname/${Employee}`).subscribe({
      next: (data: any) => {
        const jobRole = Array.isArray(data) ? data[0]?.jobRole : data?.jobRole;
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

  onSearchChange() {
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Reset sorting when searching
    this.currentSortField = '';
    this.currentUIField = '';
    this.currentSortOrder = 0;
    if (this.clientResourceInactiveTable) {
      this.clientResourceInactiveTable.reset();
    }

    // Debounce search to avoid too many API calls
    this.searchTimeout = setTimeout(() => {
      this.page = 1;
      this.first = 0;
      this.getResourceData(this.clientID, this.searchValue);
    }, 500);
  }

  customSort(event: any): void {
    const field = event.field;
    const order = event.order;

    // Map UI field to backend field
    const backendFieldMap: { [key: string]: string } = {
      employeeName: 'employeeName',
      role: 'role',
      phaseName: 'phaseName',
      projectCode: 'projectCode',
      projectName: 'projectName',
      startDate: 'startDate',
      endDate: 'endDate',
      allocatedHours: 'allocatedHours',
      timesheetApprovalAuthority: 'timesheetApprovalAuthority',
      status: 'status',
      statusEffectiveDate: 'statusEffectiveDate'
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
        if (this.clientResourceInactiveTable) {
          this.clientResourceInactiveTable.sortField = '';
          this.clientResourceInactiveTable.sortOrder = 0;
        }
        this.page = 1;
        this.first = 0;
        this.getResourceData(this.clientID, this.searchValue);
        return;
      }
    }

    // Set new sort state
    this.currentUIField = field;
    this.currentSortField = nextSortField;
    this.currentSortOrder = order;
    this.page = 1;
    this.first = 0;
    this.getResourceData(this.clientID, this.searchValue);
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
  }

}

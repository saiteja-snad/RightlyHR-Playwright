import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { from, Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { IResource } from '../../../Interfaces/project-management/resources.model';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { OpenModalService } from '../../../services/open-modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from '../../../Interfaces/projects.model';
import { IEmployeeDetails } from '../../../letters/letters.modal';
import { Select } from 'primeng/select';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { FormValidationsService } from '../../../services/form-validations.service';
import { IPhases } from '../../../Interfaces/project-management/phases.model';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { ProjectResourceTabComponent } from "../../../shared/project-management-tabs/project-resource-tab/project-resource-tab.component";
@Component({
  selector: 'app-project-resources',
  imports: [CommonModule, ConfirmationIconComponent, TranslateModule, ReactiveFormsModule, DateformatPipe,
    Select, DataLoaderContentComponent, NoDataFoundComponent, InfoIconComponent, NgbPopover, ProjectResourceTabComponent],
  templateUrl: './project-resources.component.html',
  styleUrl: './project-resources.component.scss'
})

export class ProjectResourcesComponent implements OnInit, OnDestroy {
  resourcesData = [] as IResource[];
  subscription!: Subscription;
  updateResourceForm!: FormGroup;
  reasonForm!: FormGroup;
  extendForm!: FormGroup;
  employeeDetails: IEmployeeDetails[] = [];
  selectedEmployee: any;
  employeeFullname!: string;
  loading: boolean = true;
  projectRoleDropdown: any[] = [];
  frequencyTypes = [
    { label: 'Per month', value: 'Per month' },
    { label: 'Per week', value: 'Per week' },
    { label: 'Per project', value: 'Per project' }
  ];
  projectId: any;
  ResourceId: any;
  empinfo: any = {};
  projectsData: Project[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  startndEndDateValid: any;
  startDatevalidate: any;
  endDatevalidate: any;
  inactiveStatus: any;
  loader: boolean | undefined;
  departmentIds: number[] = [];
  phaseData = [] as IPhases[];
  phaseDropdown: any[] = [];
  selectedPhaseId : any;
  resoucesDropDownData = [] as any[];
  defaultPendingAuthorityId : any;
  modalData: { title?: string; data?: any } = {};
  @ViewChild('reasonModal') reasonModal!: any;
  @ViewChild('extendModal') extendModal!: any;
  @ViewChild('updateResourcemodal') updateResourcemodal!: any;
  @ViewChild('deleteconformation') deleteconformation!: any;
  projectMinStartDate!: string;
  projectMaxEndDate!: string;
  selectedResource: any;

  constructor(private router: Router, private fb: FormBuilder, public rbac: RbacService, private modalService: NgbModal,
    private http: HttpService, private route: ActivatedRoute, private conformationPopup: OpenModalService,
    public formValidation: FormValidationsService,) { }

  ngOnInit() {
    this.initializeForms();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllActiveEmployees();
    this.route.queryParams.subscribe(params => {
      const projectId = params['id'];
      if (projectId) {
        this.projectId = parseInt(projectId);
        this.getProjects(this.projectId)
        this.getResourceData(this.projectId);
      }
    });
    this.getPhaseData();
    this.http.resourceDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getResourceData(parseInt(this.projectId));
    });
    this.updateResourceForm.get('startDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
    });
    this.updateResourceForm.get('endDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
    });
    this.ExtendDateForm();
  }
  selectedRoleId: number = 0;
  selectedEntityRefId: number = 0;

  onRoleChange(selectedValue: any) {
    if (selectedValue) {
      this.selectedRoleId = selectedValue.roleId;
      this.selectedEntityRefId = selectedValue.entityReferenceId;
    }
  }

  onPhaseChange(event: any) {
    if (!event?.value) return;

    const selectedPhaseId = event.value;
    const selectedPhase = this.phaseDropdown.find(p => p.value === selectedPhaseId);

    if (selectedPhase) {
      this.selectedPhaseId = selectedPhase.value;
      this.projectStartDate = selectedPhase.startDate ?? null;
      this.projectEndDate = selectedPhase.endDate ?? null;

      // Automatically patch authority from phase if available
      const phaseAuthority = selectedPhase?.pendingApprovalAuthority ?? null;

      const authorityControl = this.updateResourceForm.get('resourceAuthority');
      if (authorityControl) {
        authorityControl.patchValue(phaseAuthority);
        // Disable the control if the authority is auto-set from phase
        if (phaseAuthority) {
          authorityControl.disable();
        } else {
          authorityControl.enable();
        }
      }

      // Update validators for date fields
      this.updateResourceForm.get('startDate')?.updateValueAndValidity();
      this.updateResourceForm.get('endDate')?.updateValueAndValidity();

      // Fetch resources related to the selected phase
      this.getResourceData(this.projectId, this.selectedPhaseId, true);
    }
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
      // allocatedFrequencyType: [null, Validators.required],
      overtimeEligible: [false],
      billable: [false],
      allowweekendWork: [false],
      color : [''],
      resourceRole: [null,Validators.required],
      resourcePhase : [null, Validators.required],
      resourceAuthority : [null]
    }, { validators: [this.DateValidator()] },);
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

    // // ✅ subscribe to correct controls
    // this.extendForm.get('newStartDate')?.valueChanges.subscribe(() => {
    //   this.validateExtendDateRange();
    // });

    // this.extendForm.get('newEndDate')?.valueChanges.subscribe(() => {
    //   this.validateExtendDateRange();
    // });
  }

  projectStartDate!: string | null;
  projectEndDate!: string | null;
  getProjects(projectId: string) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsData = res?.data ?? [];
        this.departmentIds = this.projectsData[0]?.departments?.map((d: any) => d.departmentId) || [];
        const project = this.projectsData[0];
        if (project) {
          this.projectStartDate = this.formatDateToLocal(project.startDate);
          this.projectEndDate = this.formatDateToLocal(project.endDate);
          // this.updateResourceForm.setValidators(this.validateAllocationHours(project));
          // this.updateResourceForm.updateValueAndValidity();
        }
        this.getJobrole();
        this.inactiveStatus = (res?.data ?? []).some((p: any) =>
          p.status?.toLowerCase() === 'inactive' || p.client?.status?.toLowerCase() === 'inactive'
        ) ? 'inactive' : 'active';
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.projectsData = [];
      },
    });
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

  getWorkingDays(startDate: Date, endDate: Date, allowWeekend: boolean): number {
    let workingDays = 0;
    let current = new Date(startDate);
    while (current <= endDate) {
      const isWeekend = current.getDay() === 0 || current.getDay() === 6; // Sun / Sat
      if (allowWeekend || !isWeekend) {
        workingDays++;
      }
      current.setDate(current.getDate() + 1); // move to next day
    }
    return workingDays;
  }

  getResourceData(projectId: number, phaseId?: number, isPopupCall: boolean = false) {
    const params: any = {
      entityType: 'project',
      entityRefId: projectId,
      status:'active,assigned'
    };

    if (phaseId) {
      params.phaseId = phaseId;
    }

    this.subscription = this.http.getDataIncludeParams('ProjectResource', params).subscribe({
      next: (data: any) => {
        this.loading = false;
        if (isPopupCall) {
          // DO NOT TOUCH TABLE DATA
          const popupData = data.data ?? [];

          this.resoucesDropDownData = popupData
            .filter((r: any) => r.employee)
            .map((r: any) => ({
              label: `${r.employee.fusionEmployeeId} - ${r.employee.name}`,
              value: r.employee.id
            }));
          this.defaultPendingAuthorityId = popupData[0]?.pendingApprovalAuthority?.id ?? null;
        } else {
          // NORMAL CALL - UPDATE TABLE DATA
          this.resourcesData = data.data ?? [];

          this.resoucesDropDownData = this.resourcesData
            .filter(r => r.employee)
            .map(r => ({
              label: `${r.employee.fusionEmployeeId} - ${r.employee.name}`,
              value: r.employee.id
            }));
          this.defaultPendingAuthorityId = this.resourcesData[0]?.pendingApprovalAuthority?.id ?? null;
        }
        const authorityControl = this.updateResourceForm.get('resourceAuthority');
        if (this.resoucesDropDownData.length === 0) {
          authorityControl?.disable();
          authorityControl?.reset();
        }
        else {
          authorityControl?.enable();

          // Auto-patch default only if user has not selected anything before
          const hasExistingValue = authorityControl?.value;
          if (!hasExistingValue && this.defaultPendingAuthorityId) {
            authorityControl?.patchValue(this.defaultPendingAuthorityId);
          }
        }

      },
      error: (reason: any) => {
        this.loading = false;
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
    this.getResourceData(this.projectId, this.selectedPhaseId, true);
    }

    const authorityFromResource = this.resoucesDropDownData.find(
      (r: any) => r.value === data?.pendingApprovalAuthority?.id
    );
    let authorityValueToPatch = authorityFromResource?.value ?? null;

    // If not found, fallback to phase-level pending authority
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
      projectName: this.projectsData[0]?.projectName,
      projectType: this.projectsData[0]?.projectType,
      startDate: this.formatDateToLocal(data?.startDate),
      endDate: this.formatDateToLocal(data?.endDate),
      // allocatedFrequencyType: data?.allocatedFrequencyType,
      billable: data.billable,

      allowweekendWork: data.weekendWorkAllowed,
      resourceRole: selectedRole ? selectedRole.value : null,
      color: data?.meta?.graphData?.color,
      resourcePhase: selectedPhase ? selectedPhase.value : null,
      resourceAuthority: authorityValueToPatch
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
    return null; // Return null or handle the case when dateString is empty or invalid
  }

  getAllActiveEmployees() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeDetails = data.map((employee: any) => {
          return {
            ...employee,
            id: employee.employeeId, // force number
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
    const employeeId = event.value; // just the ID
    this.selectedEmployee = this.employeeDetails.find(employeeId);
    this.updateResourceForm.patchValue({
      resourceEmail: this.selectedEmployee?.workMail,
      resourcePhone: this.selectedEmployee ? `${this.selectedEmployee.mobilePhoneCountryCode ?? ''} ${this.selectedEmployee.contactnumber ?? ''}`.trim() || '-' : '-'
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

  isActive(route: string): boolean {
    return this.router.url.includes(route);
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

    // 🟡 Determine final status — if previously assigned, stay assigned
    const currentStatus = this.selectedResource?.status?.toLowerCase();
    const finalStatus = currentStatus === 'assigned' ? 'Assigned' : 'Active';

    const payload = {
      entityType: 'project',
      entityRefId: this.projectId,
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
      this.getResourceData(this.projectId);
    },
    error: (err) => {
      this.loader = false;
      console.error('Error occurred:', err);
      this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to update resource');
    }
  });
}



  oncheckdates(value: any) {
    if (value) {
      this.startDatevalidate = value; // block earlier dates
      // reset end date limit
    }
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

  deleteResources() {
    const formValue = this.updateResourceForm.value;
    const payload = {
      entityType: "project",
      entityRefId: this.projectId,
      employeeId: formValue.resourceName,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      allocatedHours: formValue.resourceAllocationhrs || null,
      // allocatedFrequencyType: formValue.allocatedFrequencyType || null,
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
        this.getResourceData(this.projectId);
      },
      error: (err) => {
        console.error('Error occured:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to delete resource');
      }
    });
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
    // this.router.navigate(['/project-management/clients/active'])
  }

  getPhaseData() {
    const params = {
    projectId: this.projectId
    };
    this.subscription = this.http.getDataIncludeParams('ProjectPhases/list', params).subscribe({
      next: (data: any) => {
        this.loading = false;
         this.phaseData = (data?.data || []).filter(
        (p: any) =>
          p?.status?.toLowerCase() === 'in progress' ||
          p?.status?.toLowerCase() === 'extended'
      );
        this.phaseDropdown = this.phaseData.map(p => ({
        label: p.phaseName,
        value: p.phaseId,
        projectId:p?.project?.projectId,
        clientId:p?.project?.clientId,
        startDate: p?.startDate,
        endDate: p?.endDate,
        pendingApprovalAuthority: p?.pendingApprovalAuthority?.id
      }));
      },
      error: (reason: any) => {
        this.loading = false;
      }
    });
  }

  statusActionsMap: Record<string, string[]> = {
    'assigned': ['Active', 'Release', 'Update'],
    'active': ['Update', 'Release'],
    // 'on hold': ['Resume', 'Release Resource']
  };

  // Titles for confirmation popups
  confirmationMessages: Record<string, { title: string, nextStatus: string, successMessage: string }> = {
    'Active': {
      title: 'Are you sure you want to activate this resource?',
      nextStatus: 'Active',
      successMessage: 'Resource activated successfully'
    },
    // 'On Hold': {
    //   title: 'Are you sure you want to put this resource on hold?',
    //   nextStatus: 'On Hold',
    //   successMessage: 'Resource status changed to On Hold successfully.'
    // },
    // 'Resume': {
    //   title: 'Are you sure you want to resume this resource?',
    //   nextStatus: 'Active',
    //   successMessage: 'Resource resumed successfully'
    // },
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
      // 'On Hold': 'bi-pause-circle',
      // 'Resume': 'bi-arrow-repeat'
    }[action] || 'bi-question-circle';
  }

  getActionsByStatus(status: string): string[] {
    if (!status) return [];
    const normalized = status.trim().toLowerCase();  // ensure clean lower case
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
    // this.phaseId = phase.phaseId;
    const today = new Date().toISOString().split('T')[0];
    const phaseStart = data.startDate?.substring(0, 10);

    this.extendForm.patchValue({
      newStartDate: phaseStart,
      newEndDate: data.endDate?.substring(0, 10),
      extendReason: ''
    });

    // Disable start date if it's in the past
    if (phaseStart && phaseStart < today) {
      this.extendForm.get('newStartDate')?.disable();
    } else {
      this.extendForm.get('newStartDate')?.enable();
    }

    // Set min/max ranges
    // this.projectMinStartDate = phaseStart;
    // this.projectMaxEndDate = phase.endDate?.substring(0, 10);

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

    // Find config dynamically by matching title
    const config = Object.values(this.confirmationMessages).find(c => c.title === title);
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
      entityType: "project",
      entityRefId: this.projectId,
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
      meta: resource.meta || {
        graphData: {
          color: resource.meta?.graphData?.color || ''
        }
      }
    };

    this.updateResourceStatus(payload, modal);
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
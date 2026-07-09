import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ActivatedRoute } from '@angular/router';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { Subject, Subscription, takeUntil, debounceTime, distinctUntilChanged, forkJoin } from 'rxjs';
import { PaginatorModule } from 'primeng/paginator';
import { FormsModule } from '@angular/forms';
import { IPhases } from '../../../Interfaces/project-management/phases.model';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { Project } from '../../../Interfaces/projects.model';
import { ProjectsSideTabsforPhasesComponent } from '../../../shared/project-management-tabs/projects-side-tabsfor-phases/projects-side-tabsfor-phases.component';
import { IEmployeeDetails } from '../../../letters/letters.modal';
@Component({
  selector: 'app-project-phases',
  imports: [CommonModule, ConfirmationIconComponent, TranslateModule, ReactiveFormsModule,
    DateformatPipe, Select, MultiSelectModule, DataLoaderContentComponent, NoDataFoundComponent, NgbPopover, InfoIconComponent,
    ProjectsSideTabsforPhasesComponent, PaginatorModule, FormsModule],
  templateUrl: './project-phases.component.html',
  styleUrl: './project-phases.component.scss',
})

export class ProjectPhasesComponent implements OnInit, OnDestroy {
  searchValue: any;
  searchSubject = new Subject<string>();
  loading: boolean = false;
  inactiveStatus: any;
  subscription!: Subscription;
  phaseData = [] as IPhases[];
  projectId: any;
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize = 0;
  first = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  startndEndDateValid: boolean = true;
  kickoffDateValid: boolean = true;
  kickoffBeforeEffectiveValid: boolean = true;
  effectiveDateValidRange: boolean = true;
  effectiveAfterKickoffValid: boolean = true;
  updatePhaseForm!: FormGroup;
  empinfo: any = {};
  authorityList: any[] = [];
  phaseId: any;
  isAuthorityRequired = false;
  projectsData: Project[] = [];
  projectMinStartDate!: string;
  projectMaxEndDate!: string;
  projectMinEndDate!: string;
  reasonForm!: FormGroup;
  extendForm!: FormGroup;
  modalData: { title?: string; phase?: IPhases } = {};
  selectedPhaseStatuses: string[] = [];
  selectedPhaseDateRange: { startDate: string | null; endDate: string | null } =
    { startDate: null, endDate: null };
  selectedAuthorityIds: number[] = [];
  phaseResources: any[] = [];
  employeeDetails: IEmployeeDetails[] = [];
  availableEmployees: IEmployeeDetails[] = [];
  projectRoleDropdown: any[] = [];
  existingResourceIds: Set<number> = new Set();
  isResourceManagementMode = false;
  currentPhaseName = '';
  currentPhaseColor = '#000000';
  kickoffDateUserModified = false;
  effectiveDateUserModified = false;
  resourceStartDateEdited = new Set<number>();
  @ViewChild('reasonModal') reasonModal!: any;
  @ViewChild('extendModal') extendModal!: any;
  @ViewChild('updateResourcemodal') updateResourcemodal!: any;
  @ViewChild('startconfirmationpopup') startconfirmationpopup!: any;
  @ViewChild('deleteResourceConfirmModal') deleteResourceConfirmModal!: any;
  pendingDeleteIndex: number = -1;
  deletedResources: any[] = [];

  constructor(private fb: FormBuilder, public rbac: RbacService, private modalService: NgbModal,
    private http: HttpService, private route: ActivatedRoute, private conformationPopup: OpenModalService,
    public formValidation: FormValidationsService) { }

  ngOnInit(): void {
    this.updateProjectForm();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllActiveEmployees();
    this.getProjectRoles();
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged(), takeUntil(this.destroy$)).subscribe(() => {
      this.page = 1;
      this.first = 0;
      this.getPhaseData();
    });
    this.route.queryParams.subscribe((params) => {
      const projectId = params['id'];
      if (projectId) {
        this.projectId = parseInt(projectId);
        // this.getProjects(this.projectId)
        this.getPhaseData();
        this.getProjects(this.projectId);
      }
    });
    this.http.phaseDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getPhaseData();
    });
    this.ExtendDateForm();
    this.http.phaseStatusFilter$.pipe(takeUntil(this.destroy$)).subscribe((statuses) => {
      this.selectedPhaseStatuses = statuses;
      this.page = 1;
      this.first = 0;
      this.getPhaseData();
    });
    this.http.phaseDateFilter$.pipe(takeUntil(this.destroy$)).subscribe((dateFilter) => {
      this.selectedPhaseDateRange = dateFilter;
      this.page = 1;
      this.first = 0;
      this.getPhaseData();
    });
    this.http.phaseAuthorityFilter$.pipe(takeUntil(this.destroy$)).subscribe((ids) => {
      this.selectedAuthorityIds = ids || [];
      this.page = 1;
      this.first = 0;
      this.getPhaseData();
    });
  }

  updateProjectForm() {
    this.updatePhaseForm = this.fb.group({
      phaseName: [null,
        [
          Validators.required,
          this.formValidation.minCharactersValidator(2),
          this.formValidation.maxCharactersValidator(101),
        ],
      ],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      effectiveDate: [null],
      kickoffDate: [null],
      phaseDescription: [null, this.formValidation.maxCharactersValidator(501)],
      allocatedHours: [null, [Validators.required, this.formValidation.maxCharactersValidator(6)],],
      approvalidAuthority: [{ value: null, disabled: true }],
      updatecolor: ['', Validators.required],
      addResources: [false],
      selectedResourcesForAdd: [[]],
      resourceRows: this.fb.array([]),
    });
    this.updatePhaseForm.get('startDate')?.valueChanges.subscribe((val) => {
      this.StartndendDateValidation();
      this.syncResourceDates();
      this.syncKickoffAndEffectiveToStartDate(val);
      this.validateDateRange();
    });
    this.updatePhaseForm.get('endDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateDateRange();
    });
    this.updatePhaseForm.get('kickoffDate')?.valueChanges.subscribe(() => {
      this.kickoffDateUserModified = true;
      this.validateDateRange();
    });
    this.updatePhaseForm.get('effectiveDate')?.valueChanges.subscribe(() => {
      this.effectiveDateUserModified = true;
      this.validateDateRange();
    });
  }

  private syncKickoffAndEffectiveToStartDate(startVal: string | null): void {
    if (!startVal) return;
    if (!this.kickoffDateUserModified) {
      this.updatePhaseForm.get('kickoffDate')?.setValue(startVal, { emitEvent: false });
    }
    if (!this.effectiveDateUserModified) {
      this.updatePhaseForm.get('effectiveDate')?.setValue(startVal, { emitEvent: false });
    }
  }

  private syncResourceDates(): void {
    const phaseStart = this.updatePhaseForm.get('startDate')?.value || null;
    this.resourceRows.controls.forEach(row => {
      const empId = row.get('employeeId')?.value;
      if (phaseStart && !this.resourceStartDateEdited.has(empId)) {
        row.get('startDate')?.setValue(phaseStart, { emitEvent: false });
      }
      row.get('startDate')?.updateValueAndValidity();
      row.get('endDate')?.updateValueAndValidity();
    });
  }

  ExtendDateForm() {
    this.reasonForm = this.fb.group({
      reason: ['', [Validators.required, Validators.maxLength(250),]],
      statusEffectiveDate: ['', Validators.required]
    });

    this.extendForm = this.fb.group({
      newStartDate: ['', Validators.required],
      newEndDate: ['', Validators.required],
      extendReason: ['', [Validators.required, Validators.maxLength(250)]]
    });

    // ✅ subscribe to correct controls
    this.extendForm.get('newStartDate')?.valueChanges.subscribe(() => {
      this.validateExtendDateRange();
    });

    this.extendForm.get('newEndDate')?.valueChanges.subscribe(() => {
      this.validateExtendDateRange();
    });
  }

  getPhaseData() {
    this.loading = true;
    const params: any = {
      projectId: this.projectId,
      pageNumber: this.page,
      pageSize: this.pageSize,
    };

    const validStatuses = ['yet to start', 'in progress', 'extended'];
    const filteredStatuses = this.selectedPhaseStatuses.filter(s =>
      validStatuses.includes(s.toLowerCase())
    );

    if (filteredStatuses.length > 0) {
      params.status = filteredStatuses.join(',');
    } else {
      params.status = 'yet to start,in progress,extended';
    }

    if (this.searchValue?.trim()) {
      params.searchTerm = this.searchValue.trim();
    }

    if (this.selectedPhaseDateRange?.startDate) {
      params.startDate = this.selectedPhaseDateRange.startDate;
    }
    if (this.selectedPhaseDateRange?.endDate) {
      params.endDate = this.selectedPhaseDateRange.endDate;
    }

    if (this.selectedAuthorityIds.length > 0) {
      params.timesheetApprovalAuthorityIds =
        this.selectedAuthorityIds.join(',');
    }

    this.subscription = this.http.getDataIncludeParams('ProjectPhases/list', params).subscribe({
      next: (data: any) => {
        this.phaseData = data.data || [];
        this.collectionSize = data?.pagination?.totalRecords || 0;
        this.loading = false;
      },
      error: () => {
        this.phaseData = [];
        this.collectionSize = 0;
        this.loading = false;
      },
    });
  }

  onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getPhaseData();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getPhaseData();
  }

  StartndendDateValidation() {
    const StartDate = this.updatePhaseForm.get('startDate')?.value;
    const EndDate = this.updatePhaseForm.get('endDate')?.value;
    if (StartDate && EndDate) {
      const startedDate = new Date(StartDate);
      const endedDate = new Date(EndDate);
      this.startndEndDateValid = endedDate > startedDate;
    } else {
      this.startndEndDateValid = true;
    }
  }

  validateDateRange(): void {
    const startDate = this.updatePhaseForm.get('startDate')?.value;
    const endDate = this.updatePhaseForm.get('endDate')?.value;
    const kickoffDate = this.updatePhaseForm.get('kickoffDate')?.value;
    const effectiveDate = this.updatePhaseForm.get('effectiveDate')?.value;
    // reset all validations to true
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
          //  Kickoff must be on or before Effective
          this.kickoffBeforeEffectiveValid = kickoff <= effective;
        }
      }
      if (effectiveDate) {
        const effective = new Date(effectiveDate);
        //  Effective must be within Start and End
        this.effectiveDateValidRange = effective >= start && effective <= end;
        if (kickoffDate) {
          const kickoff = new Date(kickoffDate);
          //  Effective must be on or after Kickoff
          this.effectiveAfterKickoffValid = effective >= kickoff;
        }
      }
    }
  }

  get minEffectiveDate(): string | null {
    const startDate = this.updatePhaseForm.get('startDate')?.value;
    if (startDate) {
      const date = new Date(startDate);
      date.setDate(date.getDate()); // +1 day
      return date.toISOString().split('T')[0]; // format YYYY-MM-DD
    }
    return null;
  }

  get maxEffectiveDate(): string | null {
    const endDate = this.updatePhaseForm.get('endDate')?.value;
    if (endDate) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - 1); // subtract 1 day
      return date.toISOString().split('T')[0]; // format YYYY-MM-DD
    }
    return null;
  }

  handleResourceManagement(phase: IPhases) {
    this.isResourceManagementMode = true;
    this.currentPhaseName = phase.phaseName || '';
    this.currentPhaseColor = phase.meta?.graphData?.color || '#000000';
    this.handleUpdateAction(phase);
    // Disable all phase fields — only resource section is editable
    const phaseFields = ['phaseName', 'allocatedHours', 'startDate', 'endDate', 'kickoffDate', 'effectiveDate', 'phaseDescription', 'updatecolor'];
    phaseFields.forEach(f => this.updatePhaseForm.get(f)?.disable());
  }

  saveResourceManagement() {
    this.resourceRows.controls.forEach(row => row.markAllAsTouched());
    this.updatePhaseForm.get('approvalidAuthority')?.markAsTouched();
    if (this.isResourceFormInvalid) return;
    this.loading = true;
    const approvalAuthorityId = this.updatePhaseForm.get('approvalidAuthority')?.value;
    this.saveUpdateResources(this.phaseId, approvalAuthorityId, this.currentPhaseColor);
  }

  get isResourceFormInvalid(): boolean {
    if (this.resourceRows.length === 0) return true;
    if (!this.updatePhaseForm.get('approvalidAuthority')?.value) return true;
    if (this.hoursExceeded) return true;
    return this.resourceRows.controls.some(row => row.invalid || !this.isResourceRowDateValid(row as FormGroup));
  }

  handleUpdateAction(phase: IPhases) {
    this.phaseId = phase.phaseId;
    const existingResources: any[] = (phase as any).projectResources ?? [];

    // Reset resource section
    this.resourceRows.clear();
    this.existingResourceIds = new Set();
    this.authorityList = [];
    this.deletedResources = [];
    this.resourceStartDateEdited.clear();

    // Patch core form values
    this.updatePhaseForm.patchValue({
      phaseName: phase.phaseName,
      allocatedHours: phase.allocatedHours,
      startDate: phase.startDate?.substring(0, 10),
      endDate: phase.endDate?.substring(0, 10),
      kickoffDate: phase.kickoffDate?.substring(0, 10),
      effectiveDate: phase.effectiveDate?.substring(0, 10),
      phaseDescription: phase.description,
      updatecolor: phase.meta?.graphData?.color,
      selectedResourcesForAdd: [],
    });
    // Reset user-modification flags so start date changes sync kickoff/effective
    this.kickoffDateUserModified = false;
    this.effectiveDateUserModified = false;

    const activeStatuses = ['active', 'assigned', 'waiting for approval'];
    const activeResources = existingResources.filter((r: any) =>
      activeStatuses.includes(r.status?.toLowerCase())
    );

    if (activeResources.length > 0) {
      // Populate resourceRows with active resources only
      activeResources.forEach(r => {
        const empId = r.employee?.id ?? r.employeeId;
        const empName = r.employeeName ?? (r.employee ? `${r.employee.fusionEmployeeId ? r.employee.fusionEmployeeId + ' - ' : ''}${r.employee.name}` : '');
        // Match role from dropdown by projectRoleId (flat field on resource)
        const matchedRole = this.projectRoleDropdown.find(
          (opt: any) => opt.value.roleId === r.projectRoleId
        );
        this.resourceRows.push(this.fb.group({
          employeeId: [empId],
          resourceId: [r.id ?? r.resourceId ?? null],
          resourceName: [empName],
          designationId: [matchedRole ? matchedRole.value : null],
          startDate: [r.startDate?.substring(0, 10), Validators.required],
          endDate: [r.endDate?.substring(0, 10), Validators.required],
          allocatedHours: [r.allocatedHours, [Validators.required, Validators.min(1)]],
          status: [r.status ?? null],
          isNew: [false],
        }));
        this.existingResourceIds.add(empId);
      });

      // Build authority list from active resources only
      this.authorityList = activeResources.map(r => ({
        label: r.employeeName ?? r.employee?.name ?? '',
        value: r.employee?.id ?? r.employeeId,
      }));

      // Enable authority control and pre-select
      const control = this.updatePhaseForm.get('approvalidAuthority');
      control?.enable();
      control?.setValidators([Validators.required]);
      control?.setValue(phase.pendingApprovalAuthority?.id ?? null);
      control?.updateValueAndValidity();
      this.isAuthorityRequired = true;

      // Enable toggle and show resource section
      this.updatePhaseForm.patchValue({ addResources: true });
    } else {
      // No active resources — reset authority
      const control = this.updatePhaseForm.get('approvalidAuthority');
      control?.disable();
      control?.clearValidators();
      control?.setValue(null);
      control?.updateValueAndValidity();
      this.isAuthorityRequired = false;
      this.updatePhaseForm.patchValue({ addResources: false });
    }

    this.refreshAvailableEmployees();
    this.modalService.open(this.updateResourcemodal, { centered: true, size: 'xl', backdrop: 'static' });
  }

  udpatePhase() {
    if (this.updatePhaseForm.get('addResources')?.value) {
      this.resourceRows.controls.forEach(row => row.markAllAsTouched());
    }
    if (this.updatePhaseForm.invalid) {
      this.updatePhaseForm.markAllAsTouched();
      return;
    }
    const formValue = this.updatePhaseForm.value;
    const currentPhase = this.phaseData.find((p) => p.phaseId === this.phaseId);
    const currentStatus = currentPhase?.status?.toLowerCase();
    let updatedStatus = 'in progress';
    let actionType = '';
    if (currentStatus === 'yet to start') {
      updatedStatus = 'yet to start';
    } else if (currentStatus === 'extended') {
      updatedStatus = 'extended';
      actionType = 'update';
    } else if (currentStatus === 'in progress') {
      updatedStatus = 'in progress';
      actionType = 'update'; // Added this so it’s treated as an update
    }

    this.updatePhaseStatus({
      phaseId: this.phaseId,
      status: updatedStatus,
      allocatedHours: formValue?.allocatedHours,
      startDate: formValue?.startDate,
      endDate: formValue?.endDate,
      phaseName: formValue?.phaseName,
      timesheetApprovalAuthorityId: formValue?.approvalidAuthority,
      description: formValue?.phaseDescription,
      meta: { graphData: { color: formValue?.updatecolor } },
      effectiveDate: formValue?.effectiveDate,
      kickoffDate: formValue?.kickoffDate,
      actionType,
    }, undefined, formValue?.addResources);
  }

  updatePhaseStatus(
    options: {
      phaseId: number;
      status: string;
      reason?: string;
      startDate?: string;
      endDate?: string;
      phaseName?: string;
      meta?: any;
      timesheetApprovalAuthorityId?: any;
      description?: any;
      allocatedHours?: any;
      actionType?: string;
      statusEffectiveDate?: string;
      effectiveDate?: string;
      kickoffDate?: string;
    },
    modal?: any,
    saveResources: boolean = false) {
    this.loading = true;
    const payload: any = {
      projectId: this.projectId,
      phaseId: options?.phaseId,
      phaseName: options?.phaseName || this.modalData?.phase?.phaseName,
      status: options?.status,
      timesheetApprovalAuthorityId: options?.timesheetApprovalAuthorityId,
      allocatedHours: options?.allocatedHours,
      description: options?.description,
      effectiveDate: options?.effectiveDate,
      kickoffDate: options?.kickoffDate,
      meta: options?.meta,
      updatedBy: parseInt(this.empinfo.employeeId),
    };
    if (options.reason) payload.reason = options.reason;
    if (options.startDate) payload.startDate = options.startDate;
    if (options.endDate) payload.endDate = options.endDate;
    if (options.meta) payload.meta = options.meta;
    if (options.statusEffectiveDate && (options.status === 'hold' ||
      options.status === 'completed' || options.status === 'closed')) {
      payload.statusEffectiveDate = new Date(options.statusEffectiveDate).toISOString();
    }

    this.http.putData(`ProjectPhases/update/${options.phaseId}`, payload).subscribe({
      next: (res) => {
        if (saveResources) {
          this.saveUpdateResources(options.phaseId, options.timesheetApprovalAuthorityId, options.meta?.graphData?.color);
          return;
        }
        if (modal) modal.close();
        this.close();
        this.loading = false;
        this.updatePhaseForm?.reset();
        this.resourceRows.clear();
        this.reasonForm?.reset();
        this.http.setnewcountfornewprojectphasecount();
        this.extendForm?.reset();

        const statusMsgMap: Record<string, string> = {
          'in progress': options.actionType === 'update' ? 'Phase updated successfully' :
            options.actionType === 'resume' ? 'Phase resumed successfully' : 'Phase started successfully',
          hold: 'Phase is kept on hold',
          extended: options.actionType === 'update' ? 'Phase updated successfully' : 'Phase extended successfully',
          completed: 'Phase completed successfully',
          closed: 'Phase closed successfully',
        };

        // Normalize status (to lower case, remove spaces if any)
        const normalizedStatus = options.status?.toLowerCase().trim();
        const successMsg = statusMsgMap[normalizedStatus] || 'Phase updated successfully';

        this.conformationPopup.openSuccessModal(successMsg);
        this.getPhaseData();
        this.http.setnewcountfornewprojectphasecount();
      },
      error: (err) => {
        this.loading = false;
        this.conformationPopup.openErrorModal(err?.error?.message || `Failed to update phase`
        );
      },
    });
  }

  get resourceRows(): FormArray {
    return this.updatePhaseForm.get('resourceRows') as FormArray;
  }

  get totalAllocatedHours(): number {
    return this.resourceRows.controls.reduce((sum, row) => sum + (Number(row.get('allocatedHours')?.value) || 0), 0);
  }

  get hoursExceeded(): boolean {
    const phaseHours = Number(this.updatePhaseForm.get('allocatedHours')?.value) || 0;
    return this.resourceRows.length > 0 && phaseHours > 0 && this.totalAllocatedHours > phaseHours;
  }

  isResourceRowDateValid(row: FormGroup): boolean {
    const start = row.get('startDate')?.value;
    const end = row.get('endDate')?.value;
    if (start && end) return new Date(end) >= new Date(start);
    return true;
  }

  getAllActiveEmployees() {
    const statuses = 'Active,Trainee Active,Active Contract';
    this.http.getData(`Employeedata/v3/Getallemployees?statuses=${statuses}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.employeeDetails = data.map((emp: any) => ({
          ...emp,
          fullName: `${emp.fusionEmpId ? emp.fusionEmpId + ' - ' : ''}${emp.firstName} ${emp.middleName ? emp.middleName + ' ' : ''}${emp.lastName}`,
        }));
        this.availableEmployees = [...this.employeeDetails];
      },
      error: () => { this.employeeDetails = []; this.availableEmployees = []; }
    });
  }

  getProjectRoles() {
    this.http.getData(`ProjectRoles?isActive=true`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response?.success && Array.isArray(response.data)) {
          this.projectRoleDropdown = response.data.map((item: any) => ({
            label: item.roleName,
            value: { roleId: item.id, entityReferenceId: item.entity?.entityReferenceId ?? null },
          }));
        }
      },
      error: () => { this.projectRoleDropdown = []; }
    });
  }

  addResourceRows() {
    const selected: any[] = this.updatePhaseForm.get('selectedResourcesForAdd')?.value || [];
    if (!selected.length) return;
    const existingIds = new Set(this.resourceRows.controls.map(r => r.get('employeeId')?.value));
    const phaseStart = this.updatePhaseForm.get('startDate')?.value || null;
    const phaseEnd = this.updatePhaseForm.get('endDate')?.value || null;
    selected.forEach(emp => {
      if (!existingIds.has(emp.employeeId)) {
        this.resourceRows.push(this.fb.group({
          employeeId: [emp.employeeId],
          resourceName: [emp.fullName],
          designationId: [null, Validators.required],
          startDate: [phaseStart, Validators.required],
          endDate: [phaseEnd, Validators.required],
          allocatedHours: [null, [Validators.required, Validators.min(1)]],
          isNew: [true],
        }));
      }
    });
    if (this.resourceRows.length > 0) {
      this.updatePhaseForm.get('approvalidAuthority')?.enable();
    }
    this.updatePhaseForm.get('selectedResourcesForAdd')?.setValue([]);
    this.refreshAvailableEmployees();
    this.refreshUpdateAuthorityList();
  }

  openDeleteConfirm(index: number): void {
    this.pendingDeleteIndex = index;
    this.modalService.open(this.deleteResourceConfirmModal, { centered: true, backdrop: 'static' });
  }

  confirmDeleteResource(model: any): void {
    this.removeResourceRow(this.pendingDeleteIndex);
    model.dismiss();
  }

  canDeleteResource(row: any): boolean {
    const status = row.get('status')?.value?.toLowerCase();
    if (status === 'active' || status === 'assigned') return false;
    return true;
  }

  removeResourceRow(index: number) {
    const row = this.resourceRows.at(index).getRawValue();
    const empId = this.resourceRows.at(index)?.get('employeeId')?.value;
    if (empId != null) this.resourceStartDateEdited.delete(empId);
    if (!row.isNew && row.resourceId) {
      this.deletedResources.push(row);
    }
    this.resourceRows.removeAt(index);
    this.refreshUpdateAuthorityList();
    this.refreshAvailableEmployees();
  }

  private refreshUpdateAuthorityList(): void {
    this.authorityList = this.resourceRows.controls.map(row => ({
      label: row.get('resourceName')?.value,
      value: row.get('employeeId')?.value,
    }));
    const currentAuthority = this.updatePhaseForm.get('approvalidAuthority')?.value;
    if (!this.authorityList.some(a => a.value === currentAuthority)) {
      this.updatePhaseForm.get('approvalidAuthority')?.setValue(null);
    }
    if (this.authorityList.length > 0) {
      this.updatePhaseForm.get('approvalidAuthority')?.enable();
      this.updatePhaseForm.get('approvalidAuthority')?.setValidators([Validators.required]);
      this.updatePhaseForm.get('approvalidAuthority')?.updateValueAndValidity();
      this.isAuthorityRequired = true;
    } else {
      this.updatePhaseForm.get('approvalidAuthority')?.disable();
      this.updatePhaseForm.get('approvalidAuthority')?.clearValidators();
      this.updatePhaseForm.get('approvalidAuthority')?.updateValueAndValidity();
      this.isAuthorityRequired = false;
    }
  }

  private refreshAvailableEmployees(): void {
    const addedIds = new Set(this.resourceRows.controls.map(r => r.get('employeeId')?.value));
    this.availableEmployees = this.employeeDetails.filter(e => !addedIds.has(e.employeeId));
  }

  private saveUpdateResources(phaseId: number, approvalAuthorityId: any, color: string): void {
    const allRows = this.resourceRows.getRawValue();
    const newRows = allRows.filter((r: any) => r.isNew);
    const existingRows = allRows.filter((r: any) => !r.isNew);

    const deleteCalls = this.deletedResources.map((r: any) =>
      this.http.putData(`ProjectResource/${r.resourceId}`, {
        entityType: 'project',
        entityRefId: this.projectId,
        employeeId: r.employeeId,
        startDate: r.startDate,
        endDate: r.endDate,
        projectRoleId: r.designationId?.roleId ?? null,
        projectDepartmentId: r.designationId?.entityReferenceId ?? null,
        allocatedHours: r.allocatedHours,
        overtimeEligibile: false,
        billable: false,
        weekendWorkAllowed: false,
        status: 'rejected',
        allocatedBy: parseInt(this.empinfo.employeeId),
        pendingApprovalAuthority: approvalAuthorityId ?? null,
        phaseId: phaseId,
        meta: { graphData: { color: color || '#000000' } },
      })
    );

    const updateCalls = existingRows.map((r: any) =>
      this.http.putData(`ProjectResource/${r.resourceId}`, {
        entityType: 'project',
        entityRefId: this.projectId,
        employeeId: r.employeeId,
        startDate: r.startDate,
        endDate: r.endDate,
        projectRoleId: r.designationId?.roleId ?? null,
        projectDepartmentId: r.designationId?.entityReferenceId ?? null,
        allocatedHours: r.allocatedHours,
        overtimeEligibile: false,
        billable: false,
        weekendWorkAllowed: false,
        status: r.status,
        allocatedBy: parseInt(this.empinfo.employeeId),
        pendingApprovalAuthority: approvalAuthorityId ?? null,
        phaseId: phaseId,
        meta: { graphData: { color: color || '#000000' } },
      })
    );

    const doCreate = () => {
      if (!newRows.length) { this.onUpdateSuccess(); return; }
      const resourcePayload = newRows.map((r: any) => ({
        entityType: 'project',
        entityRefId: this.projectId,
        employeeId: r.employeeId,
        startDate: r.startDate,
        endDate: r.endDate,
        projectRoleId: r.designationId?.roleId ?? null,
        projectDepartmentId: r.designationId?.entityReferenceId ?? null,
        allocatedHours: r.allocatedHours,
        overtimeEligibile: false,
        billable: false,
        weekendWorkAllowed: false,
        status: r.employeeId === approvalAuthorityId ? 'active' : 'waiting for approval',
        allocatedBy: parseInt(this.empinfo.employeeId),
        phaseId: phaseId,
        pendingApprovalAuthority: approvalAuthorityId ?? null,
        meta: { graphData: { color: color || '#000000' } },
      }));
      this.http.postdata('ProjectResource/multiple', resourcePayload).subscribe({
        next: () => this.onUpdateSuccess(),
        error: (err) => {
          this.loading = false;
          this.close();
          this.http.setnewcountfornewprojectphasecount();
          this.conformationPopup.openErrorModal(err?.error?.message || 'Phase updated but resource assignment failed.');
          this.getPhaseData();
        }
      });
    };

    const allUpdateCalls = [...deleteCalls, ...updateCalls];
    if (allUpdateCalls.length) {
      forkJoin(allUpdateCalls).subscribe({
        next: () => doCreate(),
        error: (err) => {
          this.loading = false;
          this.close();
          this.http.setnewcountfornewprojectphasecount();
          this.conformationPopup.openErrorModal(err?.error?.message || 'Phase updated but resource update failed.');
          this.getPhaseData();
        }
      });
    } else {
      doCreate();
    }
  }

  private onUpdateSuccess(): void {
    this.deletedResources = [];
    this.resourceStartDateEdited.clear();
    this.close();
    this.loading = false;
    // Re-enable phase fields in case we were in resource management mode
    if (this.isResourceManagementMode) {
      const phaseFields = ['phaseName', 'allocatedHours', 'startDate', 'endDate', 'kickoffDate', 'effectiveDate', 'phaseDescription', 'updatecolor'];
      phaseFields.forEach(f => this.updatePhaseForm.get(f)?.enable());
      this.isResourceManagementMode = false;
    }
    this.updatePhaseForm?.reset();
    this.resourceRows.clear();
    this.reasonForm?.reset();
    this.extendForm?.reset();
    this.conformationPopup.openSuccessModal('Resources updated successfully');
    this.getPhaseData();
    this.http.setnewcountfornewprojectphasecount();
  }

  getProjects(projectId: string) {
    this.loading = true;
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.projectsData = res?.data ?? []; // Extract "data" array
        const authority = this.projectsData[0]?.pendingApprovalAuthority;
        const approvalidAuthority = authority ? `${authority.fusionEmpId} - ${authority.name}` : '';
        const clientid = this.projectsData[0]?.client?.clientId;
        this.http.updateClientId(clientid);
        const project = this.projectsData[0];
        if (project) {
          this.projectMinStartDate = project.startDate?.split('T')[0];
          this.projectMaxEndDate = project.endDate?.split('T')[0];
        }
      },
      error: (err) => {
        this.loading = false;
        console.error('Error fetching projects data:', err);
        (this.http.clientId$ as Subject<any>).next(null);
        this.projectsData = [];
      },
    });
  }

  get isFormInvalid(): boolean {
    if (this.updatePhaseForm.get('addResources')?.value) {
      if (this.hoursExceeded) return true;
      const hasInvalidRow = this.resourceRows.controls.some(row => row.invalid || !this.isResourceRowDateValid(row as FormGroup));
      if (hasInvalidRow) return true;
    }
    return (
      this.updatePhaseForm.invalid ||
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
    if (this.isResourceManagementMode) {
      const phaseFields = ['phaseName', 'allocatedHours', 'startDate', 'endDate', 'kickoffDate', 'effectiveDate', 'phaseDescription', 'updatecolor'];
      phaseFields.forEach(f => this.updatePhaseForm.get(f)?.enable());
      this.isResourceManagementMode = false;
    }
    this.modalService.dismissAll();
  }

  getResourceData(projectId: number, phaseId?: number, isPopupCall: boolean = false) {
    const params: any = {
      status: 'Active',
      entityType: 'project',
      entityRefId: projectId,
    };

    if (phaseId) {
      params.phaseId = phaseId;
    }

    this.subscription = this.http.getDataIncludeParams('ProjectResource', params).subscribe({
      next: (data: any) => {
        this.loading = false;
        const resourceList = data?.data ?? [];
        const uniqueEmployees = Array.from(
          new Map(
            resourceList.filter((r: any) => r?.employee?.id).map((r: any) => [r.employee.id, r.employee])
          ).values()
        );

        // ✅ Build dropdown from unique employees
        const dropdownList = uniqueEmployees.map((emp: any) => ({
          label: `${emp.fusionEmployeeId} - ${emp.name}`,
          value: emp.id,
        }));

        if (isPopupCall) {
          // Track existing resource employee IDs to exclude from multiselect
          this.existingResourceIds = new Set(
            resourceList.filter((r: any) => r?.employee?.id).map((r: any) => r.employee.id)
          );
          this.refreshAvailableEmployees();
          this.authorityList = dropdownList;
          if (dropdownList.length > 0) {
            const control = this.updatePhaseForm.get('approvalidAuthority');
            control?.enable();
            control?.setValidators([Validators.required]); // ✅ Add required
            control?.updateValueAndValidity();
            this.isAuthorityRequired = true; // for * in UI
          } else {
            const control = this.updatePhaseForm.get('approvalidAuthority');
            control?.disable();
            control?.clearValidators(); // ✅ Remove required
            control?.updateValueAndValidity();
            this.isAuthorityRequired = false;
          }
        } else {
          this.authorityList = dropdownList;
        }
      },
      error: (reason: any) => {
        this.loading = false;
        console.error(reason);
      },
    });
  }

  statusActionsMap: Record<string, string[]> = {
    'yet to start': ['Start', 'Update'],
    'in progress': ['Hold', 'Mark as Completed', 'Extend', 'Update'],
    extended: ['Hold', 'Mark as Completed', 'Extend', 'Update'],
    hold: ['Resume', 'Mark as Completed'],
    completed: ['Close Phase', 'Extend'],
    closed: [],
  };

  statusMap: Record<string, string> = {
    'Are you sure you want to start the phase?': 'in progress',
    'Are you sure you want to keep this phase on hold?': 'hold',
    'Are you sure you want to mark this phase as completed?': 'completed',
    'Are you sure you want to resume this phase?': 'in progress',
    'Are you sure you want to close this phase?': 'closed',
    'Are you sure you want to extend this phase?': 'extended',
  };

  getActionsByStatus(status: string): string[] {
    if (!status) return [];
    const normalized = status.trim().toLowerCase(); // ensure clean lower case
    return this.statusActionsMap[normalized] ?? [];
  }

  handleAction(action: string, phase: IPhases) {
    switch (action) {
      case 'Start':
        this.openStartModal(phase);
        break;
      case 'Update':
        this.handleUpdateAction(phase);
        break;
      case 'Hold':
        this.openReasonModal('Are you sure you want to keep this phase on hold?', phase);
        break;
      case 'Mark as Completed':
        this.openReasonModal('Are you sure you want to mark this phase as completed?', phase);
        break;
      case 'Resume':
        this.openReasonModal('Are you sure you want to resume this phase?', phase);
        break;
      case 'Close Phase':
        this.openReasonModal('Are you sure you want to close this phase?', phase);
        break;
      case 'Extend':
        this.openExtendModal(phase);
        break;
    }
  }

  getActionIcon(action: string) {
    return (
      {
        Start: 'bi-play-circle',
        Hold: 'bi-pause-circle',
        'Close Phase': 'bi-x-circle',
        'Mark as Completed': 'bi-check-circle',
        Extend: 'bi-calendar-plus',
        Resume: 'bi-arrow-repeat',
        Reactivate: 'bi-arrow-clockwise',
        Update: 'bi bi-pencil',
      }[action] || 'bi-question-circle'
    );
  }

  openReasonModal(title: string, phase: IPhases) {
    this.modalData = { title, phase };
    this.reasonForm.reset();
    this.modalService.open(this.reasonModal, { centered: true, backdrop: 'static' });
  }

  openStartModal(phase: IPhases) {
    this.modalData = { phase };
    this.modalService.open(this.startconfirmationpopup, { centered: true, backdrop: 'static' });
  }

  openExtendModal(phase: IPhases) {
    this.modalData = { phase };
    this.extendForm.reset();
    this.phaseId = phase.phaseId;
    const today = new Date().toISOString().split('T')[0];
    const phaseStart = phase.startDate?.substring(0, 10);
    const phaseEnd = phase.endDate?.substring(0, 10);

    this.extendForm.patchValue({
      newStartDate: phaseStart,
      newEndDate: phaseEnd,
      extendReason: '',
    });

    // Disable start date if it's in the past
    if (phaseStart && phaseStart < today) {
      this.extendForm.get('newStartDate')?.disable();
    } else {
      this.extendForm.get('newStartDate')?.enable();
    }

    // ✅ Set min date for extension as the current phase end date
    this.projectMinStartDate = phaseStart;
    this.projectMinEndDate = phaseEnd;
    this.startndEndDateValid = true;
    this.modalService.open(this.extendModal, { centered: true, size: 'md', backdrop: 'static' });
  }

  get newStartDate() {
    return this.extendForm.get('newStartDate')?.value;
  }

  get newEndDate() {
    return this.extendForm.get('newEndDate')?.value;
  }

  validateExtendDateRange(): void {
    const start = this.extendForm.get('newStartDate')?.value;
    const end = this.extendForm.get('newEndDate')?.value;
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      this.startndEndDateValid = endDate >= startDate;
    } else {
      this.startndEndDateValid = true;
    }
  }

  shouldShowEffectiveDate(): boolean {
    const title = this.modalData?.title?.toLowerCase() || '';
    return (
      title.includes('hold') ||
      title.includes('completed') ||
      title.includes('close')
    );
  }

  submitReason(modal: any) {
    if (this.reasonForm.invalid) {
      this.reasonForm.markAllAsTouched();
      return;
    }

    const reason = this.reasonForm.value.reason;
    const statusEffectiveDate = this.reasonForm.value.statusEffectiveDate;
    const title = this.modalData?.title ?? '';
    const status = this.statusMap[title];
    const phaseId = this.modalData?.phase?.phaseId;

    if (!phaseId) {
      console.error('Phase ID is missing. Cannot update phase.');
      return;
    }
    const actionType = title.includes('resume') ? 'resume' : 'default';
    this.updatePhaseStatus(
      { phaseId, status, reason, statusEffectiveDate, actionType },
      modal
    );
  }

  submitExtend(modal: any) {
    if (this.extendForm.invalid) {
      this.extendForm.markAllAsTouched();
      return;
    }
    const formValue = this.extendForm.value;
    const phase = this.modalData?.phase;
    const startDate = this.extendForm.get('newStartDate')?.enabled ? formValue.newStartDate : phase?.startDate;
    const endDate = formValue.newEndDate;
    this.updatePhaseStatus(
      {
        phaseId: this.phaseId,
        status: 'extended',
        startDate,
        endDate,
        reason: formValue.extendReason,
      },
      modal
    );
  }

  confirmStart(modal: any) {
    const phase = this.modalData?.phase;
    if (!phase?.phaseId) {
      console.error('Phase ID is missing. Cannot update phase.');
      return;
    }
    const status = 'in progress'; // status to update when phase starts
    const startDate = new Date().toISOString(); // current date in ISO format
    const payload = {
      phaseId: phase.phaseId,
      status,
      startDate,
    };
    this.updatePhaseStatus(payload, modal);
  }

  formatStatus(status: any): any {
    if (!status) return '-';
    const normalized = status.toLowerCase().trim();
    // Only customize "yet to start"
    if (normalized === 'yet to start') {
      return 'Yet to Start';
    }
    // For all other statuses, use default Titlecase behavior
    return normalized.replace(/\b\w/g, (char: any) => char.toUpperCase());
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
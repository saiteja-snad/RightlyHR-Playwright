import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { Router, ActivatedRoute } from '@angular/router';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Project } from '../../../Interfaces/projects.model';
import { IEmployeeDetails } from '../../../letters/letters.modal';
@Component({
  selector: 'app-phases-creation',
  imports: [ReactiveFormsModule, Select, TranslateModule, MultiSelectModule, CommonModule, NgbPopover, InfoIconComponent],
  templateUrl: './phases-creation.component.html',
  styleUrl: './phases-creation.component.scss'
})

export class PhasesCreationComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  empinfo = {} as any;
  addPhaseForm!: FormGroup;
  startndEndDateValid: boolean = true;
  kickoffDateValid: boolean = true;
  kickoffBeforeEffectiveValid: boolean = true;
  effectiveDateValidRange: boolean = true;
  effectiveAfterKickoffValid: boolean = true;
  authorityList: { label: string; value: number }[] = [];
  loading = false;
  projectId: any;
  subscription!: Subscription;
  projectsDataDrown: Project[] = [];
  projectMinStartDate!: string;
  projectMaxEndDate!: string;
  confirmationMessage: string = '';
  employeeDetails: IEmployeeDetails[] = [];
  availableEmployees: IEmployeeDetails[] = [];  // excludes already-added resources
  projectRoleDropdown: any[] = [];
  isPhaseFormValid: boolean = false;
  kickoffDateUserModified = false;
  effectiveDateUserModified = false;
  @ViewChild('dateconfirmatonpopup') dateconfirmatonpopup!: any;
  @ViewChild('deleteResourceConfirmModal') deleteResourceConfirmModal!: any;
  pendingDeleteIndex: number = -1;

  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private router: Router,
    public formValidation: FormValidationsService,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.createProjectForm();
    this.getdatabaedonRoute();
    this.getAllActiveEmployees();
    this.getProjectRoles();
  }

  createProjectForm() {
    this.addPhaseForm = this.fb.group({
      phaseName: [null, [Validators.required, this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(101)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      effectiveDate: [null],
      kickoffDate: [null],
      phaseDescription: [null, this.formValidation.maxCharactersValidator(501)],
      allocatedHours: [null, [Validators.required, this.formValidation.maxCharactersValidator(6)]],
      approvalidAuthority: [{ value: null, disabled: true }],
      color: ['#000000', Validators.required],
      addResources: [false],
      selectedResourcesForAdd: [[]],
      resourceRows: this.fb.array([]),
    });

    this.addPhaseForm.get('startDate')?.valueChanges.subscribe((val) => {
      this.StartndendDateValidation();
      this.validateDateRange();
      this.syncResourceDates();
      this.syncKickoffAndEffectiveToStartDate(val);
    });
    this.addPhaseForm.get('endDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateDateRange();
      this.syncResourceDates();
    });
    this.addPhaseForm.get('kickoffDate')?.valueChanges.subscribe(() => this.validateDateRange());
    this.addPhaseForm.get('effectiveDate')?.valueChanges.subscribe(() => this.validateDateRange());

    // Watch mandatory phase fields to enable/disable the toggle
    const mandatoryFields = ['phaseName', 'allocatedHours', 'startDate', 'endDate', 'color', 'phaseDescription'];
    mandatoryFields.forEach(field => {
      this.addPhaseForm.get(field)?.valueChanges.subscribe(() => this.updateToggleState());
    });
  }

  private get isMandatoryPhaseValid(): boolean {
    const f = this.addPhaseForm;
    return (
      f.get('phaseName')?.valid === true &&
      f.get('allocatedHours')?.valid === true &&
      f.get('startDate')?.valid === true &&
      f.get('endDate')?.valid === true &&
      f.get('color')?.valid === true &&
      f.get('phaseDescription')?.valid === true &&
      this.startndEndDateValid &&
      this.kickoffDateValid &&
      this.kickoffBeforeEffectiveValid &&
      this.effectiveDateValidRange &&
      this.effectiveAfterKickoffValid
    );
  }

  private syncKickoffAndEffectiveToStartDate(startVal: string | null): void {
    if (!startVal) return;
    if (!this.kickoffDateUserModified) {
      this.addPhaseForm.get('kickoffDate')?.setValue(startVal, { emitEvent: false });
    }
    if (!this.effectiveDateUserModified) {
      this.addPhaseForm.get('effectiveDate')?.setValue(startVal, { emitEvent: false });
    }
  }

  private updateToggleState(): void {
    const valid = this.isMandatoryPhaseValid;
    this.isPhaseFormValid = valid;
    const toggleCtrl = this.addPhaseForm.get('addResources');
    if (!valid) {
      if (toggleCtrl?.value) {
        toggleCtrl.setValue(false);
        this.addPhaseForm.get('selectedResourcesForAdd')?.setValue([]);
        this.resourceRows.clear();
        this.addPhaseForm.get('approvalidAuthority')?.disable();
        this.addPhaseForm.get('approvalidAuthority')?.setValue(null);
        this.authorityList = [];
        this.refreshAvailableEmployees();
      }
    }
  }

  get resourceRows(): FormArray {
    return this.addPhaseForm.get('resourceRows') as FormArray;
  }

  get totalAllocatedHours(): number {
    return this.resourceRows.controls.reduce((sum, row) => {
      return sum + (Number(row.get('allocatedHours')?.value) || 0);
    }, 0);
  }

  get hoursExceeded(): boolean {
    const phaseHours = Number(this.addPhaseForm.get('allocatedHours')?.value) || 0;
    return this.resourceRows.length > 0 && phaseHours > 0 && this.totalAllocatedHours > phaseHours;
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

  private refreshAvailableEmployees(): void {
    const addedIds = new Set(this.resourceRows.controls.map(r => r.get('employeeId')?.value));
    this.availableEmployees = this.employeeDetails.filter(e => !addedIds.has(e.employeeId));
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
    const selected: any[] = this.addPhaseForm.get('selectedResourcesForAdd')?.value || [];
    if (!selected.length) return;

    const existingIds = new Set(this.resourceRows.controls.map(r => r.get('employeeId')?.value));
    const phaseStart = this.addPhaseForm.get('startDate')?.value || null;
    const phaseEnd = this.addPhaseForm.get('endDate')?.value || null;

    selected.forEach(emp => {
      if (!existingIds.has(emp.employeeId)) {
        this.resourceRows.push(this.fb.group({
          employeeId: [emp.employeeId],
          resourceName: [emp.fullName],
          designationId: [null, Validators.required],
          startDate: [phaseStart, Validators.required],
          endDate: [phaseEnd, Validators.required],
          allocatedHours: [null, [Validators.required, Validators.min(1)]],
        }));
      }
    });

    if (this.resourceRows.length > 0) {
      this.addPhaseForm.get('approvalidAuthority')?.enable();
    }

    this.addPhaseForm.get('selectedResourcesForAdd')?.setValue([]);
    this.refreshAvailableEmployees();
    this.refreshAuthorityList();
  }

  openDeleteConfirm(index: number) {
    this.pendingDeleteIndex = index;
    this.modalService.open(this.deleteResourceConfirmModal, { centered: true, backdrop: 'static' });
  }

  confirmDeleteResource(model: any) {
    this.removeResourceRow(this.pendingDeleteIndex);
    model.dismiss();
  }

  removeResourceRow(index: number) {
    this.resourceRows.removeAt(index);
    if (this.resourceRows.length === 0) {
      this.addPhaseForm.get('approvalidAuthority')?.disable();
      this.addPhaseForm.get('approvalidAuthority')?.setValue(null);
      this.authorityList = [];
    } else {
      this.refreshAuthorityList();
    }
    this.refreshAvailableEmployees();
  }

  private refreshAuthorityList(): void {
    this.authorityList = this.resourceRows.controls.map(row => ({
      label: row.get('resourceName')?.value,
      value: row.get('employeeId')?.value,
    }));
    const currentAuthority = this.addPhaseForm.get('approvalidAuthority')?.value;
    const stillExists = this.authorityList.some(a => a.value === currentAuthority);
    if (!stillExists) {
      this.addPhaseForm.get('approvalidAuthority')?.setValue(null);
    }
  }

  private syncResourceDates(): void {
    const phaseStart = this.addPhaseForm.get('startDate')?.value || null;
    const phaseEnd = this.addPhaseForm.get('endDate')?.value || null;
    // Only update rows that still hold the previous phase default (not manually edited)
    // We update all rows' min/max via template bindings; no forced override needed here.
    // But we do re-validate existing rows against new phase dates.
    this.resourceRows.controls.forEach(row => {
      row.get('startDate')?.updateValueAndValidity();
      row.get('endDate')?.updateValueAndValidity();
    });
  }

  get minEffectiveDate(): string | null {
    const startDate = this.addPhaseForm.get('startDate')?.value;
    if (startDate) {
      const date = new Date(startDate);
      date.setDate(date.getDate());
      return date.toISOString().split('T')[0];
    }
    return null;
  }

  get maxEffectiveDate(): string | null {
    const endDate = this.addPhaseForm.get('endDate')?.value;
    if (endDate) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - 1);
      return date.toISOString().split('T')[0];
    }
    return null;
  }

  StartndendDateValidation() {
    const StartDate = this.addPhaseForm.get('startDate')?.value;
    const EndDate = this.addPhaseForm.get('endDate')?.value;
    if (StartDate && EndDate) {
      const startedDate = new Date(StartDate);
      const endedDate = new Date(EndDate);
      this.startndEndDateValid = endedDate > startedDate;
    } else {
      this.startndEndDateValid = true;
    }
    this.updateToggleState();
  }

  validateDateRange(): void {
    const startDate = this.addPhaseForm.get('startDate')?.value;
    const endDate = this.addPhaseForm.get('endDate')?.value;
    const kickoffDate = this.addPhaseForm.get('kickoffDate')?.value;
    const effectiveDate = this.addPhaseForm.get('effectiveDate')?.value;
    this.kickoffDateValid = true;
    this.kickoffBeforeEffectiveValid = true;
    this.effectiveDateValidRange = true;
    this.effectiveAfterKickoffValid = true;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (kickoffDate) {
        const kickoff = new Date(kickoffDate);
        this.kickoffDateValid = kickoff >= start && kickoff <= end;
        if (effectiveDate) {
          const effective = new Date(effectiveDate);
          this.kickoffBeforeEffectiveValid = kickoff <= effective;
        }
      }
      if (effectiveDate) {
        const effective = new Date(effectiveDate);
        this.effectiveDateValidRange = effective >= start && effective <= end;
        if (kickoffDate) {
          const kickoff = new Date(kickoffDate);
          this.effectiveAfterKickoffValid = effective >= kickoff;
        }
      }
    }
  }

  isResourceRowDateValid(row: FormGroup): boolean {
    const start = row.get('startDate')?.value;
    const end = row.get('endDate')?.value;
    if (start && end) return new Date(end) >= new Date(start);
    return true;
  }

  get isFormInvalid(): boolean {
    if (this.addPhaseForm.get('addResources')?.value) {
      if (this.resourceRows.length === 0) return true;
      if (!this.addPhaseForm.get('approvalidAuthority')?.value) return true;
      if (this.hoursExceeded) return true;
      const hasInvalidRow = this.resourceRows.controls.some(row => {
        return row.invalid || !this.isResourceRowDateValid(row as FormGroup);
      });
      if (hasInvalidRow) return true;
    }
    return this.addPhaseForm.invalid || !this.startndEndDateValid || !this.kickoffDateValid ||
      !this.kickoffBeforeEffectiveValid || !this.effectiveDateValidRange || !this.effectiveAfterKickoffValid || this.loading;
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
  }

  getdatabaedonRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/project-management/projects')) {
      this.route.queryParams.subscribe(params => {
        const projectId = params['id'];
        if (projectId) {
          this.getProjects(projectId);
          this.projectId = parseInt(projectId);
        }
      });
    } else if (fullPath.startsWith('/project-management/clients')) {
      this.projectId = null;
      this.route.queryParams.subscribe(params => {
        const clientID = params['id'];
        if (clientID) {
          // client flow placeholder
        }
      });
    }
  }

  getProjects(projectId: string) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsDataDrown = res?.data ?? [];
        const project = this.projectsDataDrown[0];
        if (project) {
          this.projectMinStartDate = project.startDate?.split('T')[0];
          this.projectMaxEndDate = project.endDate?.split('T')[0];
        }
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.projectsDataDrown = [];
      },
    });
  }

  savePhase() {
    if (this.addPhaseForm.get('addResources')?.value) {
      this.resourceRows.controls.forEach(row => row.markAllAsTouched());
      this.addPhaseForm.get('approvalidAuthority')?.markAsTouched();
    }
    if (this.isFormInvalid) {
      this.addPhaseForm.markAllAsTouched();
      return;
    }

    const formValue = this.addPhaseForm.getRawValue();
    const today = new Date();
    const startDate = new Date(formValue.startDate);

    if (startDate < today) {
      this.confirmationMessage = 'The start date is in the past. Do you want to continue?';
      this.modalService.open(this.dateconfirmatonpopup, { centered: true });
    } else {
      this.createPhase(formValue, 'yet to start');
    }
  }

  confirmPopupNo(model: any) {
    const formValue = this.addPhaseForm.getRawValue();
    this.createPhase(formValue, 'in progress');
    model.dismiss();
  }

  confirmPopupYes(model: any) {
    const formValue = this.addPhaseForm.getRawValue();
    formValue.startDate = new Date().toISOString().split('T')[0];
    this.createPhase(formValue, 'in progress');
    model.dismiss();
  }

  createPhase(formValue: any, status: string) {
    this.loading = true;
    const payload: any = {
      projectId: this.projectId,
      phaseName: formValue.phaseName,
      description: formValue.phaseDescription,
      allocatedHours: formValue.allocatedHours,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      effectiveDate: formValue.effectiveDate,
      kickoffDate: formValue.kickoffDate,
      timesheetApprovalAuthorityId: formValue.approvalidAuthority,
      createdBy: parseInt(this.empinfo.employeeId),
      updatedBy: parseInt(this.empinfo.employeeId),
      status: status,
      isAddResources: formValue.addResources ?? false,
      meta: {
        graphData: {
          color: formValue.color || '#000000'
        }
      }
    };

    this.http.postdata('ProjectPhases/create', payload).subscribe({
      next: (res: any) => {
        const phaseId = res?.data?.phaseId ?? res?.data?.id ?? null;
        if (formValue.addResources && this.resourceRows.length > 0) {
          this.createResources(phaseId, formValue);
        } else {
          this.onPhaseSuccess();
        }
      },
      error: (err) => {
        console.error('Error creating phase:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to create phase');
        this.loading = false;
      }
    });
  }

  private createResources(phaseId: number | null, formValue: any): void {
    const authorityId = formValue.approvalidAuthority ?? null;
    const resourcePayload = this.resourceRows.getRawValue().map((r: any) => {
      return {
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
        status: r.employeeId === authorityId ? 'active' : 'waiting for approval',
        allocatedBy: parseInt(this.empinfo.employeeId),
        phaseId: phaseId,
        pendingApprovalAuthority: formValue.approvalidAuthority ?? null,
        meta: { graphData: { color: formValue.color || '#000000' } },
      };
    });

    this.http.postdata('ProjectResource/multiple', resourcePayload).subscribe({
      next: () => this.onPhaseSuccess(),
      error: (err) => {
        this.loading = false;
        this.close();
        this.http.setnewPhaseDetails();
        this.http.setnewcountfornewprojectphasecount();
        this.conformationPopup.openErrorModal(err?.error?.message || 'Phase was created but resource assignment failed.');
      }
    });
  }

  private onPhaseSuccess(): void {
    this.close();
    this.loading = false;
    this.addPhaseForm.reset();
    this.resourceRows.clear();
    this.conformationPopup.openSuccessModal('Phase / Milestone created successfully');
    this.http.setnewPhaseDetails();
    this.http.setnewcountfornewprojectphasecount();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
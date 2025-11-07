import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IPhases } from '../../../Interfaces/project-management/phases.model';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { IProjectAuthority } from '../../../settings/project-management-configurations/models/project-authority.modal';
import { Project } from '../../../Interfaces/projects.model';

@Component({
  selector: 'app-project-phases',
  imports: [CommonModule, ConfirmationIconComponent, TranslateModule, ReactiveFormsModule, DateformatPipe,
    Select, DataLoaderContentComponent, NoDataFoundComponent, NgbPopover, InfoIconComponent],
  templateUrl: './project-phases.component.html',
  styleUrl: './project-phases.component.scss'
})
export class ProjectPhasesComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  inactiveStatus: any;
  subscription!: Subscription;
  phaseData = [] as IPhases[];
  projectId: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  startndEndDateValid: boolean = true;
  kickoffDateValid: boolean = true;
  kickoffBeforeEffectiveValid: boolean = true;
  effectiveDateValidRange: boolean = true;
  effectiveAfterKickoffValid: boolean = true;
  updatePhaseForm !: FormGroup
  empinfo: any = {};
  authorityList: IProjectAuthority[] = [];
  phaseId: any;
  isAuthorityRequired = false;
  projectsData: Project[] = [];
  projectMinStartDate!: string;
  projectMaxEndDate!: string;
  reasonForm !: FormGroup
  extendForm !: FormGroup
  modalData: { title?: string; phase?: IPhases } = {};

  @ViewChild('reasonModal') reasonModal!: any;
  @ViewChild('extendModal') extendModal!: any;
  @ViewChild('updateResourcemodal') updateResourcemodal !:any;
  @ViewChild('startconfirmationpopup') startconfirmationpopup !:any;

  constructor(private router: Router, private fb: FormBuilder, public rbac: RbacService, private modalService: NgbModal,
    private http: HttpService, private route: ActivatedRoute, private conformationPopup: OpenModalService, 
    public formValidation: FormValidationsService,) {

  }
  ngOnInit(): void {

    this.updateProjectForm();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.route.queryParams.subscribe(params => {
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
  }

 updateProjectForm() {
    this.updatePhaseForm = this.fb.group({
      phaseName: [null, [Validators.required, this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(101)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      effectiveDate: [null, Validators.required],
      kickoffDate: [null, Validators.required],
      phaseDescription: [null, this.formValidation.maxCharactersValidator(501)],
      allocatedHours: [null, [Validators.required, this.formValidation.maxCharactersValidator(6)]],
      approvalidAuthority: [{ value: null, disabled: true }],
      updatecolor: [''],
    });
    this.updatePhaseForm.get('startDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateDateRange();
    });
    this.updatePhaseForm.get('endDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateDateRange();
    });
    this.updatePhaseForm.get('kickoffDate')?.valueChanges.subscribe(() => this.validateDateRange());
    this.updatePhaseForm.get('effectiveDate')?.valueChanges.subscribe(() => this.validateDateRange());
  }

  ExtendDateForm() {
    this.reasonForm = this.fb.group({
      reason: ['', [Validators.required, Validators.maxLength(250), Validators.pattern(/^(?!\s).*$/)]]
    });

    this.extendForm = this.fb.group({
      newStartDate: ['', Validators.required],
      newEndDate: ['', Validators.required],
      extendReason: ['', [Validators.required, Validators.maxLength(250), Validators.pattern(/^(?!\s).*$/)]]
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
    const params = {
    projectId: this.projectId
    };
    this.subscription = this.http.getDataIncludeParams('ProjectPhases/list', params).subscribe({
      next: (data: any) => {
        this.phaseData = data.data;
        this.loading = false;
      },
      error: (reason: any) => {
        this.loading = false;
      }
    });
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

  handleUpdateAction(phase: IPhases) {
    this.phaseId = phase.phaseId;

    // Patch form values
    this.updatePhaseForm.patchValue({
      phaseName: phase.phaseName,
      allocatedHours: phase.allocatedHours,
      startDate: phase.startDate?.substring(0, 10),
      endDate: phase.endDate?.substring(0, 10),
      kickoffDate: phase.kickoffDate?.substring(0, 10),
      effectiveDate: phase.effectiveDate?.substring(0, 10),
      approvalidAuthority: phase.pendingApprovalAuthority?.id ?? null,
      phaseDescription: phase.description,
      updatecolor: phase.meta?.graphData?.color
    });

    // Load resources THEN open modal
    this.getResourceData(this.projectId, this.phaseId, true);

    // Open modal after everything is ready
    this.modalService.open(this.updateResourcemodal, { centered: true, size: 'lg', backdrop: 'static' });
  }


  udpatePhase() {
    if (this.updatePhaseForm.invalid) {
      this.updatePhaseForm.markAllAsTouched();
      return;
    }
    // this.loading = true

    // const formValue = this.updatePhaseForm.value;
    // // Map form values to API payload
    // const payload = {
    //   projectId: this.projectId,
    //   phaseName: formValue.phaseName,
    //   description: formValue.phaseDescription,
    //   allocatedHours: formValue.allocatedHours,
    //   startDate: formValue.startDate,
    //   endDate: formValue.endDate,
    //   effectiveDate: formValue.effectiveDate,
    //   kickoffDate: formValue.kickoffDate,
    //   timesheetApprovalAuthorityId: formValue.approvalidAuthority,  // adjust as per requirement
    //   createdBy: parseInt(this.empinfo.employeeId),                   // get from logged-in user if needed
    //   status: 'active',
    //   updatedBy: parseInt(this.empinfo.employeeId),
    //   meta: {
    //   graphData: {
    //     color: formValue.updatecolor
    //     } 
    //   }
    // };
    // this.loading = true;
    // this.http.putData(`ProjectPhases/update/${this.phaseId}`, payload).subscribe({
    //   next: (res) => {
    //     this.close();
    //     this.loading = false;
    //     this.updatePhaseForm.reset();
    //     this.conformationPopup.openSuccessModal('Phase / Milestone created successfully');
    //     this.getPhaseData();
    //   },
    //   error: (err) => {
    //     console.error('Error creating project:', err);
    //     this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to create project');
    //     this.loading = false;
    //   }
    // });

  const formValue = this.updatePhaseForm.value;

  this.updatePhaseStatus({
    phaseId: this.phaseId,
    status: 'in progress',
    startDate: formValue.startDate,
    endDate: formValue.endDate,
    phaseName: formValue.phaseName,
    timesheetApprovalAuthorityId: formValue.approvalidAuthority,
    meta: { graphData: { color: formValue.updatecolor } }
  });
  }

  updatePhaseStatus(options: {
  phaseId: number,
  status: string,
  reason?: string,
  startDate?: string,
  endDate?: string,
  phaseName?: string,
  meta?: any,
  timesheetApprovalAuthorityId?:any,
}, modal?: any) {
  this.loading = true;

  const payload: any = {
    projectId: this.projectId,
    phaseId: options?.phaseId,
    phaseName: options?.phaseName || this.modalData?.phase?.phaseName,
    status: options?.status,
    timesheetApprovalAuthorityId: options?.timesheetApprovalAuthorityId,
    updatedBy: parseInt(this.empinfo.employeeId)
  };

  if (options.reason) payload.reason = options.reason;
  if (options.startDate) payload.startDate = options.startDate;
  if (options.endDate) payload.endDate = options.endDate;
  if (options.meta) payload.meta = options.meta;

  this.http.putData(`ProjectPhases/update/${options.phaseId}`, payload).subscribe({
    next: (res) => {
      if (modal) modal.close();
      this.close();
      this.loading = false;
      this.updatePhaseForm?.reset();
      this.reasonForm?.reset();
      this.extendForm?.reset();
      this.conformationPopup.openSuccessModal('Phase / Milestone updated successfully');
      this.getPhaseData();
    },
    error: (err) => {
      this.loading = false;
      this.conformationPopup.openErrorModal(err?.error?.message || `Failed to update phase`);
    }
  });
}


  getProjects(projectId: string) {
    this.loading = true
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
        this.loading = false
        console.error('Error fetching projects data:', err);
        (this.http.clientId$ as Subject<any>).next(null);
        this.projectsData = [];
      },

    });
  }

  get isFormInvalid(): boolean {
    return this.updatePhaseForm.invalid || !this.startndEndDateValid || !this.kickoffDateValid ||
      !this.kickoffBeforeEffectiveValid || !this.effectiveDateValidRange || !this.effectiveAfterKickoffValid || this.loading;
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
  }

  getResourceData(projectId: number, phaseId?: number, isPopupCall: boolean = false) {

    const params: any = {
      status: 'Active',
      entityType: 'project',
      entityRefId: projectId
    };

    if (phaseId) {
      params.phaseId = phaseId;
    }

    this.subscription = this.http.getDataIncludeParams('ProjectResource', params).subscribe({
      next: (data: any) => {
        this.loading = false;

        const resourceList = data?.data ?? [];

        // Build dropdown list
        const dropdownList = resourceList
          .filter((r: any) => r.employee)
          .map((r: any) => ({
            label: `${r.employee.fusionEmployeeId} - ${r.employee.name}`,
            value: r.employee.id
          }));

        if (isPopupCall) {
          this.authorityList = dropdownList;

          if (dropdownList.length > 0) {
            const control = this.updatePhaseForm.get('approvalidAuthority');

            control?.enable();
            control?.setValidators([Validators.required]);   // ✅ Add required
            control?.updateValueAndValidity();

            this.isAuthorityRequired = true; // for * in UI
          } else {
            const control = this.updatePhaseForm.get('approvalidAuthority');

            control?.disable();
            control?.clearValidators();      // ✅ Remove required
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
      }
    });
  }

  statusActionsMap: Record<string, string[]> = {
    'yet to start': ['Start', 'Update'],
    'in progress': ['Hold', 'Mark as Completed', 'Extend', 'Update'],
    'extended': ['Hold', 'Mark as Completed', 'Extend', 'Update'],
    'hold': ['Resume Phase', 'Mark as Completed'],
    'completed': ['Close Phase', 'Extend'],
    'closed': []
  };


  statusMap: Record<string, string> = {
    'Are you sure you want to start?': 'in progress',
    'Are you sure you want to put on hold?': 'hold',
    'Are you sure you want to mark as completed?': 'completed',
    'Are you sure you want to resume?': 'in progress',
    'Are you sure you want to close?': 'closed',
    'Are you sure you want to extend?': 'extended'
  };


  getActionsByStatus(status: string): string[] {
    if (!status) return [];
    const normalized = status.trim().toLowerCase();  // ensure clean lower case
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
        this.openReasonModal('Are you sure you want to put on hold?', phase);
        break;
      case 'Mark as Completed':
        this.openReasonModal('Are you sure you want to mark as completed?', phase);
        break;
      case 'Resume Phase':
        this.openReasonModal('Are you sure you want to resume?', phase);
        break;
      case 'Close Phase':
        this.openReasonModal('Are you sure you want to close?', phase);
        break;
      case 'Extend':
        this.openExtendModal(phase);
        break;
    }
  }

  getActionIcon(action: string) {
    return {
      'Start' : 'bi-play-circle',
      'Hold' : 'bi-pause-circle',
      'Close Phase' : 'bi-x-circle',
      'Mark as Completed' : 'bi-check-circle',
      'Extend' : 'bi-calendar-plus',
      'Resume Phase' : 'bi-arrow-repeat',
      'Reactivate' : 'bi-arrow-clockwise',
      'Update' : 'bi bi-pencil'
    }[action] || 'bi-question-circle';
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

    this.extendForm.patchValue({
      newStartDate: phaseStart,
      newEndDate: phase.endDate?.substring(0, 10),
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

  get newStartDate() { return this.extendForm.get('newStartDate')?.value; }
  get newEndDate() { return this.extendForm.get('newEndDate')?.value; }

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

  // submitReason(modal: any) {
  //   if (this.reasonForm.invalid) {
  //     this.reasonForm.markAllAsTouched();
  //     return;
  //   }

  //   this.loading = true;

  //   const reason = this.reasonForm.value.reason;
  //   const phase = this.modalData?.phase;
  //   const status = this.statusMap[this.modalData?.title ?? '']; // map popup title to status

  //   const payload = {
  //     projectId: this.projectId,
  //     phaseId: phase?.phaseId,
  //     phaseName: phase?.phaseName,
  //     status: status,
  //     reason: reason,
  //     updatedBy: parseInt(this.empinfo.employeeId)
  //   };

  //   this.http.putData(`ProjectPhases/update/${phase?.phaseId}`, payload).subscribe({
  //     next: (res) => {
  //       modal.close();
  //       this.loading = false;
  //       this.reasonForm.reset();
  //       this.conformationPopup.openSuccessModal(`Phase ${status} successfully`);
  //       this.getPhaseData();
  //     },
  //     error: (err) => {
  //       this.loading = false;
  //       this.conformationPopup.openErrorModal(err?.error?.message || `Failed to update phase`);
  //     }
  //   });
  // }

  submitReason(modal: any) {
  if (this.reasonForm.invalid) {
    this.reasonForm.markAllAsTouched();
    return;
  }

  const reason = this.reasonForm.value.reason;
  const status = this.statusMap[this.modalData?.title ?? '']; // map popup title to status
  const phaseId = this.modalData?.phase?.phaseId;

  if (!phaseId) {
    console.error('Phase ID is missing. Cannot update phase.');
    return;
  }

  this.updatePhaseStatus({ phaseId, status, reason }, modal);
}


  // submitExtend(modal: any) {
  //   if (this.extendForm.invalid) {
  //     this.extendForm.markAllAsTouched();
  //     return;
  //   }

  //   this.loading = true;
  //   const formValue = this.extendForm.value;

  //   const payload = {
  //     projectId: this.projectId,
  //     phaseName: this.modalData?.phase?.phaseName,
  //     status: 'extended',
  //     startDate: this.extendForm.get('newStartDate')?.enabled ? formValue.newStartDate : this.modalData?.phase?.startDate,
  //     endDate: formValue.newEndDate,
  //     reason: formValue.extendReason,
  //     updatedBy: parseInt(this.empinfo.employeeId),
  //   };

  //   this.http.putData(`ProjectPhases/update/${this.phaseId}`, payload).subscribe({
  //     next: (res) => {
  //       modal.close();
  //       this.loading = false;
  //       this.extendForm.reset();
  //       this.conformationPopup.openSuccessModal('Phase extended successfully');
  //       this.getPhaseData();
  //     },
  //     error: (err) => {
  //       this.loading = false;
  //       this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to extend phase');
  //     }
  //   });
  // }

  submitExtend(modal: any) {
    if (this.extendForm.invalid) {
      this.extendForm.markAllAsTouched();
      return;
    }

    const formValue = this.extendForm.value;
    const phase = this.modalData?.phase;

    const startDate = this.extendForm.get('newStartDate')?.enabled ? formValue.newStartDate : phase?.startDate;
    const endDate = formValue.newEndDate;

    this.updatePhaseStatus({
      phaseId: this.phaseId,
      status: 'extended',
      startDate,
      endDate,
      reason: formValue.extendReason
    }, modal);
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
      startDate
    };

    this.updatePhaseStatus(payload, modal);
  }


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}

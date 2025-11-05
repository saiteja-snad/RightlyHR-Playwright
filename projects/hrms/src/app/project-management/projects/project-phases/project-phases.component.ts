import { Component, OnDestroy, OnInit } from '@angular/core';
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
          }
        });
        this.http.phaseDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
          this.getPhaseData();
        });
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
      approvalidAuthority: [{ value: null, disabled: true }]
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

  openModal(content: any, size: any, data: IPhases) {
    this.modalService.open(content, { centered: true, size: size, backdrop: 'static' });
    this.phaseId = data.phaseId;
    this.updatePhaseForm.patchValue({
      phaseName: data.phaseName,
      allocatedHours: data.allocatedHours,
    startDate: data.startDate?.substring(0,10),
    endDate: data.endDate?.substring(0,10),
    kickoffDate: data.kickoffDate?.substring(0,10),
    effectiveDate: data.effectiveDate?.substring(0,10),
    approvalidAuthority: data.pendingApprovalAuthority?.id ?? null,
    phaseDescription: data.description
    });
  }

udpatePhase(){
if (this.updatePhaseForm.invalid) {
      this.updatePhaseForm.markAllAsTouched();
      return;
    }
    this.loading = true
    
    const formValue = this.updatePhaseForm.value;
    // Map form values to API payload
    const payload = {
      projectId: this.projectId,
      phaseName: formValue.phaseName,
      description: formValue.phaseDescription,
      allocatedHours: formValue.allocatedHours,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      effectiveDate: formValue.effectiveDate,
      kickoffDate: formValue.kickoffDate,
      timesheetApprovalAuthorityId: formValue.approvalidAuthority,  // adjust as per requirement
      createdBy: parseInt(this.empinfo.employeeId),                   // get from logged-in user if needed
      status: 'active',
      updatedBy: parseInt(this.empinfo.employeeId),
      // meta: {
      // graphData: {
      //   color: formValue.color
      //   } 
      // }
    };
    this.loading = true;
    this.http.putData(`ProjectPhases/update/${this.phaseId}`, payload).subscribe({
      next: (res) => {
        this.close();
        this.loading = false;
        this.updatePhaseForm.reset();
        this.conformationPopup.openSuccessModal('Phase / Milestone created successfully');
        this.getPhaseData();
      },
      error: (err) => {
        console.error('Error creating project:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to create project');
        this.loading = false;
      }
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

  ngOnDestroy(): void {
    
  }
}

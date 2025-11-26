import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { Select } from 'primeng/select';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { Router, ActivatedRoute } from '@angular/router';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { IProjectAuthority } from '../../../settings/project-management-configurations/models/project-authority.modal';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { Project } from '../../../Interfaces/projects.model';

@Component({
  selector: 'app-phases-creation',
  imports: [ReactiveFormsModule, Select, TranslateModule, MultiSelectModule, CommonModule, NgbPopover, InfoIconComponent],
  templateUrl: './phases-creation.component.html',
  styleUrl: './phases-creation.component.scss'
})
export class PhasesCreationComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  empinfo = {} as any;
  addPhaseForm !: FormGroup;
  startndEndDateValid: boolean = true;
  kickoffDateValid: boolean = true;
  kickoffBeforeEffectiveValid: boolean = true;
  effectiveDateValidRange: boolean = true;
  effectiveAfterKickoffValid: boolean = true;
  authorityList: IProjectAuthority[] = [];
  loading = false;
  projectId: any;
  subscription!: Subscription;
  projectsDataDrown: Project[] = [];
  projectMinStartDate!: string;
  projectMaxEndDate!: string;
  confirmationMessage: string = '';
  @ViewChild('dateconfirmatonpopup') dateconfirmatonpopup!: any;

  constructor(private fb: FormBuilder, private modalService: NgbModal, private router: Router,
    public formValidation: FormValidationsService, private http: HttpService,
    private conformationPopup: OpenModalService, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.createProjectForm();
    this.getdatabaedonRoute();
  }

  createProjectForm() {
    this.addPhaseForm = this.fb.group({
      phaseName: [null, [Validators.required, this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(101)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      effectiveDate: [null, Validators.required],
      kickoffDate: [null, Validators.required],
      phaseDescription: [null, this.formValidation.maxCharactersValidator(501)],
      allocatedHours: [null, [Validators.required, this.formValidation.maxCharactersValidator(6)]],
      approvalidAuthority: [{ value: null, disabled: true }],
      color: ['#000000',Validators.required],
    });
    this.addPhaseForm.get('startDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateDateRange();
    });
    this.addPhaseForm.get('endDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateDateRange();
    });
    this.addPhaseForm.get('kickoffDate')?.valueChanges.subscribe(() => this.validateDateRange());
    this.addPhaseForm.get('effectiveDate')?.valueChanges.subscribe(() => this.validateDateRange());
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

  get minEffectiveDate(): string | null {
    const startDate = this.addPhaseForm.get('startDate')?.value;
    if (startDate) {
      const date = new Date(startDate);
      date.setDate(date.getDate()); // +1 day
      return date.toISOString().split('T')[0]; // format YYYY-MM-DD
    }
    return null;
  }

  get maxEffectiveDate(): string | null {
    const endDate = this.addPhaseForm.get('endDate')?.value;
    if (endDate) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - 1); // subtract 1 day
      return date.toISOString().split('T')[0]; // format YYYY-MM-DD
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
      const projectStart = new Date(this.projectMinStartDate);
    const projectEnd = new Date(this.projectMaxEndDate);
    } else {
      this.startndEndDateValid = true;
    }
  }

  validateDateRange(): void {
    const startDate = this.addPhaseForm.get('startDate')?.value;
    const endDate = this.addPhaseForm.get('endDate')?.value;
    const kickoffDate = this.addPhaseForm.get('kickoffDate')?.value;
    const effectiveDate = this.addPhaseForm.get('effectiveDate')?.value;
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

  get isFormInvalid(): boolean {
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
      this.projectId = null
      this.route.queryParams.subscribe(params => {
        const clientID = params['id'];
        if (clientID) {
          // this.addResourceForm.get('projectName')?.enable();
          // this.getclientProjects(clientID);
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
    if (this.addPhaseForm.invalid) {
      this.addPhaseForm.markAllAsTouched();
      return;
    }

    const formValue = this.addPhaseForm.value;
    const today = new Date();
    const startDate = new Date(formValue.startDate);

    // If start date is in the past, show confirmation popup
    if (startDate < today) {
      this.confirmationMessage = 'The start date is in the past. Do you want to continue?';
      this.modalService.open(this.dateconfirmatonpopup, { centered: true });
    } else {
      this.createPhase(formValue, 'yet to start'); // future date => yet to start
    }
  }

  confirmPopupNo(model: any) {
    const formValue = this.addPhaseForm.value;
    // Keep the original start date, status = in progress since start date is past
    this.createPhase(formValue, 'in progress');
    model.dismiss();
  }

  // Triggered when user clicks "Yes" in the confirmation popup
  confirmPopupYes(model: any) {
    const formValue = this.addPhaseForm.value;
    const todayStr = new Date().toISOString().split('T')[0];

    // Update start date to today
    formValue.startDate = todayStr;
    this.createPhase(formValue, 'in progress');
    model.dismiss();
  }

  // Actual API call logic extracted to a separate method
  createPhase(formValue: any, status: string) {
    this.loading = true;
    const payload = {
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
      meta: {
        graphData: {
          color: formValue.color || '#000000'
        }
      }
    };

    this.http.postdata('ProjectPhases/create', payload).subscribe({
      next: (res) => {
        this.close();
        this.loading = false;
        this.addPhaseForm.reset();
        this.conformationPopup.openSuccessModal('Phase / Milestone created successfully');
        this.http.setnewPhaseDetails();
        this.http.setnewcountfornewprojectphasecount()
      },
      error: (err) => {
        console.error('Error creating project:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to create project');
        this.loading = false;
      }
    });
  }


  ngOnDestroy(): void {
  this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}

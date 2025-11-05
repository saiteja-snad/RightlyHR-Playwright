import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Subject, takeUntil } from 'rxjs';

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

  constructor(private fb: FormBuilder, private modalService: NgbModal, private router: Router,
    public formValidation: FormValidationsService, private http: HttpService,
    private conformationPopup: OpenModalService, private route: ActivatedRoute) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.createProjectForm();
  }

  createProjectForm() {
    this.addPhaseForm = this.fb.group({
      phaseName: [null, [Validators.required, this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(101)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      effectiveDate: [null, Validators.required],
      kickoffDate: [null, Validators.required],
      projectType: [null, Validators.required],
      phaseDescription: [null, this.formValidation.maxCharactersValidator(501)],
      allocatedHours: [null, [Validators.required, this.formValidation.maxCharactersValidator(6)]],
      approvalidAuthority: [{ value: null, disabled: true }]
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

  savePhase() { }

  ngOnDestroy(): void {

  }
}

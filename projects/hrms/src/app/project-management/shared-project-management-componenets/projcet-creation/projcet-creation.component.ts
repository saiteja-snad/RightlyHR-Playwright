import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { OpenModalService } from '../../../services/open-modal.service';
import { IProjectAuthority } from '../../../settings/project-management-configurations/models/project-authority.modal';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { MultiSelectModule } from 'primeng/multiselect';
@Component({
  selector: 'app-projcet-creation',
  imports: [ReactiveFormsModule, Select, TranslateModule, MultiSelectModule,CommonModule, NgbPopover, InfoIconComponent],
  templateUrl: './projcet-creation.component.html',
  styleUrl: './projcet-creation.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class ProjcetCreationComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();
  addprojectform!: FormGroup;
  subscription!: Subscription;
  clients: any[] = [];
  loading = false;
  manager: any = [];
  clientID: any
  projecttypes: any[] = [];
  empinfo = {} as any;
  startDatevalidate: any;
  endDatevalidate: any;
  startndEndDateValid: boolean = true;
  effectivendEndDateValid: boolean = true;
  kickoffDateValid: boolean = true;
  authorityList: IProjectAuthority[] = [];
  kickoffBeforeEffectiveValid: boolean = true; // kickoff <= effective
  effectiveDateValidRange: boolean = true; // effective between start & end
  effectiveAfterKickoffValid: boolean = true;
 departmentlist = [] as any;
  constructor(private fb: FormBuilder, private modalService: NgbModal, private router: Router,
    public formValidation: FormValidationsService, private http: HttpService,
    private conformationPopup: OpenModalService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.createProjectForm();
    this.getclientbaedonRoute();
    this.getprojecttypesData();
    this.DepartmentList();
    // this.getAuthorityList();
    this.addprojectform.get('startDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
    });
    this.addprojectform.get('endDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
    });
    this.addprojectform.valueChanges.subscribe(() => {
      this.validateDateRange();
    });
  }
 DepartmentList() {
    this.subscription = this.http.getData('Department').subscribe({
      next: (data: any) => {
        // console.log(data);
        this.departmentlist = data;
      },
    });
  }
  getclientbaedonRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/project-management/projects')) {
      this.getClientsData();
    } else if (fullPath.startsWith('/project-management/clients')) {
      this.route.queryParams.subscribe(params => {
        const clientID = params['id'];
        if (clientID) {
          this.getClientsbyid(clientID);
          this.clientID = clientID;
        }
      });
    }
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

  createProjectForm() {
    this.addprojectform = this.fb.group({
      projectName: [null, [Validators.required, this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(101)]],
      clientName: [{ value: null, disabled: true }, Validators.required],
      code: [null, [Validators.required, Validators.maxLength(12)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      // effectiveDate: [null, Validators.required],
      // kickoffDate: [null, Validators.required],
      projectType: [null, Validators.required],
      projectDescription: [null, this.formValidation.maxCharactersValidator(501)],
      // allocatedHours: [null, [Validators.required, this.formValidation.maxCharactersValidator(6)]],
      overtimeEligible: [false],
      billable: [false],
      allowweekendWork: [false],
      // approvalidAuthority: [{value:null,disabled:true}],
      department:[null, Validators.required],
      color: ['#000000', Validators.required],
    });
    this.addprojectform.get('startDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateDateRange();
    });
    this.addprojectform.get('endDate')?.valueChanges.subscribe(() => {
      this.StartndendDateValidation();
      this.validateDateRange();
    });
    this.addprojectform.get('kickoffDate')?.valueChanges.subscribe(() => this.validateDateRange());
    this.addprojectform.get('effectiveDate')?.valueChanges.subscribe(() => this.validateDateRange());
  }

  getClientsData(): void {
    this.http.getData(`Client/GetAll?status=Active`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.addprojectform.get('clientName')?.enable();
        this.clients = Array.isArray(res?.data) ? res.data : [];
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }

  getClientsbyid(clientID: any): void {
    this.http.getData(`Client/${clientID}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const client = res.data;
          this.clients = [client];
          this.addprojectform.patchValue({
            clientName: client.clientId,
            overtimeEligible: client.overtimeEligibile,
            billable: client.billable,
            allowweekendWork: client.weekendWorkAllowed
          });
        }
      },
      error: (err) => {
        this.clients = [];
        console.error('Error fetching clients:', err);
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

  saveProject() {
    if (this.addprojectform.invalid) {
      this.addprojectform.markAllAsTouched();
      return;
    }
    this.loading = true
    
    const formValue = this.addprojectform.value;
     const departmentIds = Array.isArray(formValue.department)
    ? formValue.department.join(',')
    : formValue.department;
    // Map form values to API payload
    const payload = {
      clientId: formValue.clientName ?? parseInt(this.clientID),
      projectName: formValue.projectName,
      description: formValue.projectDescription,
      projectType: formValue.projectType?.value,
      // allocatedHours: formValue.allocatedHours,
      isOvertimeEligibile: formValue.overtimeEligible,
      isBillable: formValue.billable,
      isWeekendWorkAllowed: formValue.allowweekendWork,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      // effectiveDate: formValue.effectiveDate,
      // kickoffDate: formValue.kickoffDate,
      // pendingApprovalAuthorityId: formValue.approvalidAuthority,  // adjust as per requirement
      createdBy: parseInt(this.empinfo.employeeId),                   // get from logged-in user if needed
      status: 'Active',  
      departmentIds: departmentIds,         // or get from form
      updatedBy: parseInt(this.empinfo.employeeId),
      meta: {
      graphData: {
        color: formValue.color || '#000000',
        code: formValue.code
        }
      }
    };
    this.loading = true;
    this.http.postdata('Project', payload).subscribe({
      next: (res) => {
        this.close();
        this.loading = false;
        this.addprojectform.reset();
        this.conformationPopup.openSuccessModal('Project created successfully');
        this.http.setnewprojectDetails();
        this.http.setnewcountDetailsfornewprojectcount()
      },
      error: (err) => {
        console.error('Error creating project:', err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Failed to create project');
        this.loading = false;
      }
    });
  }

  close() {
    this.modalService.dismissAll();
  }

  get isFormInvalid(): boolean {
    return this.addprojectform.invalid || !this.startndEndDateValid || !this.kickoffDateValid || 
           !this.kickoffBeforeEffectiveValid || !this.effectiveDateValidRange || !this.effectiveAfterKickoffValid || this.loading;
  }

  StartndendDateValidation() {
    const StartDate = this.addprojectform.get('startDate')?.value;
    const EndDate = this.addprojectform.get('endDate')?.value;
    if (StartDate && EndDate) {
      const startedDate = new Date(StartDate);
      const endedDate = new Date(EndDate);
      this.startndEndDateValid = endedDate > startedDate;
    } else {
      this.startndEndDateValid = true;
    }
  }

  validateDateRange(): void {
    const startDate = this.addprojectform.get('startDate')?.value;
    const endDate = this.addprojectform.get('endDate')?.value;
    const kickoffDate = this.addprojectform.get('kickoffDate')?.value;
    const effectiveDate = this.addprojectform.get('effectiveDate')?.value;
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
    const startDate = this.addprojectform.get('startDate')?.value;
    if (startDate) {
      const date = new Date(startDate);
      date.setDate(date.getDate()); // +1 day
      return date.toISOString().split('T')[0]; // format YYYY-MM-DD
    }
    return null;
  }

  get maxEffectiveDate(): string | null {
    const endDate = this.addprojectform.get('endDate')?.value;
    if (endDate) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - 1); // subtract 1 day
      return date.toISOString().split('T')[0]; // format YYYY-MM-DD
    }
    return null;
  }

  // DateValidator(): ValidatorFn {
  //   return (control: AbstractControl): ValidationErrors | null => {
  //     const startDate = control.get('startDate')?.value;
  //     const endDate = control.get('endDate')?.value;
  //     const effectiveDate = control.get('effectiveDate')?.value;
  //     const kickoffDate = control.get('kickoffDate')?.value;
  //     if (startDate && endDate) {
  //       if (moment(endDate).isBefore(moment(startDate))) {
  //         return { endBeforeStart: true };
  //       }
  //     }
  //     if (startDate && endDate && effectiveDate) {
  //       if (
  //         moment(effectiveDate).isBefore(moment(startDate)) ||
  //         !moment(effectiveDate).isBefore(moment(endDate))
  //       ) {
  //         return { effectiveDateOutOfRange: true };
  //       }
  //     }
  //     if (startDate && endDate && kickoffDate) {
  //       if (
  //         moment(kickoffDate).isBefore(moment(startDate)) ||
  //         !moment(kickoffDate).isBefore(moment(endDate))
  //       ) {
  //         return { kickoffDateOutOfRange: true };
  //       }
  //     }
  //     return null;
  //   };
  // }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
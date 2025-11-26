import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { IBackground, INotice, IProbation } from '../../../Interfaces/job-model';
import { IBranchLocation, Ipersonal } from '../../../Interfaces/personal-modal';
import moment from 'moment';
import { RbacService } from '../../../services/rbac.service';
import { Router } from '@angular/router';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { Skeleton } from 'primeng/skeleton';
import { EditIconComponent } from "../../../icons/edit-icon/edit-icon.component";
@Component({
  selector: 'app-onboarding-details',
  imports: [CommonModule, ReactiveFormsModule, Select, Skeleton, EditIconComponent],
  templateUrl: './onboarding-details.component.html',
  styleUrl: './onboarding-details.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class OnboardingDetailsComponent implements OnInit, OnDestroy{
  subscription!: Subscription;
  buttons = false;
  Statusdetails: any;
  probation = [] as IProbation[];
  noticePeriod = [
    { id: 1, name: 'Yes' },
    { id: 2, name: 'No' },
  ];
  empinfo: any = {} as IJob;
  backgroundDetails = [] as IBackground[];
  branchLocations = [] as IBranchLocation[];
  empdata: Ipersonal = {} as Ipersonal;
  previousEmpData: Ipersonal = {} as Ipersonal;
  Manager: any = [];
  noticeDetails: INotice[] = [];
  selectedEmployeeId: any;
  onboardingForm!: FormGroup;
  traineeForm!: FormGroup;
  contractForm!:FormGroup;
  isEditing = false;
  empyployeedata = {} as any;
  employeestatus: any;
  loading: boolean = false;
  offerletttersentdate: any;
  noticePeriodStatus = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  salaryHoldDetails = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  pfdata = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  ptdata = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  esicdata = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];

  wfh = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];

  remoteLoginOptions = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ];
  worklocation = [
    { name: 'Remote/Hybrid', value: 'Remote/Hybrid', allowWFH: false },
    { name: 'Work From Home', value: 'Work From Home', allowWFH: true },
  ];
  filteredRemoteLoginWorkLocations = [
    { name: 'Remote', value: 'Remote' },
    { name: 'Hybrid', value: 'Hybrid' },
  ];
  filteredWorkLocations: any[] = [];
  statustoprint: any;
  remoteLoginManagers: any = [];
  @ViewChild('confirmationpopup') confirmationpopup: any;
  constructor(
    private fb: FormBuilder,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    public rbac: RbacService,
    public permissionRouteService: AccessForEmployeeinfoService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
    this.initializeForm();
    this.wfhChange();
    this.remoteLoginChange();
    this.getBackground();
    this.getBranchLocations();
    this.getprobation();
    this.getWorkfromhomeManager();
    this.getRemoteLoginManagers();

    this.initializeTrainee();
    this.initializeContract();
  }

  canAccess(
    action: 'view' | 'create' | 'update' | 'delete',
    permission: string
  ) {
    return this.permissionRouteService.canAccessField(action, permission);
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
      this.getEmployeeId();
      this.getTraineeOfferLetterEmployeebyId();
      this.getcontractDetailsEmployeebyId();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      this.getEmployeeId();
      this.getTraineeOfferLetterEmployeebyId();
      this.getcontractDetailsEmployeebyId();
    }
  }
  initializeForm(): void {
    this.onboardingForm = this.fb.group(
      {
        status: [{ value: null, disabled: true }],
        dateOfJoining: [{ value: null, disabled: true }],
        branchLocation: [{ value: null, disabled: true }],
        probationEndDate: [{ value: null, disabled: true }],
        probationStatus: [{ value: null, disabled: true }],
        noticePeriodStatus: [{ value: null, disabled: true }],
        backgroundCheckStatus: [{ value: null, disabled: true }],
        salaryHold: [{ value: null, disabled: true }],
        pf: [{ value: null, disabled: true }],
        esic: [{ value: null, disabled: true }],
        pt: [{ value: null, disabled: true }],
        totalExperience: [{ value: null, disabled: true }],
        allowwfh: [{ value: null, disabled: true }],
        allowRemoteLogin: [{ value: null, disabled: true }],
        workLocation: [{ value: null, disabled: true }],
        wfhmanger: [{ value: null, disabled: true }],
        remoteLoginManager: [{ value: null, disabled: true }],
        remoteLoginWorkLocation: [{ value: null, disabled: true }],
      },
      {
        validators: this.wfhOrRemoteLoginValidator,
      }
    );

    this.setupConditionalValidation();
  }

 wfhOrRemoteLoginValidator: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const wfhCtrl = form.get('allowwfh');
  const remoteCtrl = form.get('allowRemoteLogin');

  const allowWFH = wfhCtrl?.value;
  const allowRemoteLogin = remoteCtrl?.value;

  // Reset previous conflict errors
  if (wfhCtrl?.hasError('conflict')) {
    const { conflict, ...other } = wfhCtrl.errors || {};
    wfhCtrl.setErrors(Object.keys(other).length ? other : null);
  }

  if (remoteCtrl?.hasError('conflict')) {
    const { conflict, ...other } = remoteCtrl.errors || {};
    remoteCtrl.setErrors(Object.keys(other).length ? other : null);
  }

  // Apply conditional field-level conflict error
  if (allowWFH && allowRemoteLogin) {
    if (wfhCtrl?.pristine) {
      // Remote was just changed, conflict on remote
      remoteCtrl?.setErrors({
        ...remoteCtrl.errors,
        conflict: `'Work From Home' is already enabled to activate 'Remote Login', please disable Work From Home.`
      });
    } else if (remoteCtrl?.pristine) {
      // WFH was just changed, conflict on WFH
      wfhCtrl?.setErrors({
        ...wfhCtrl.errors,
        conflict: `'Remote Login' is already enabled to activate 'Work From Home', please disable Remote Login.`
      });
    } else {
      // Default: Show conflict on both
      wfhCtrl?.setErrors({
        ...wfhCtrl.errors,
        conflict: `'Remote Login' is already enabled to activate 'Work From Home', please disable Remote Login.`
      });

      remoteCtrl?.setErrors({
        ...remoteCtrl.errors,
        conflict: `'Work From Home' is already enabled to activate 'Remote Login', please disable Work From Home.`
      });
    }
  }

  return null;
};
  initializeTrainee() {
    this.traineeForm = this.fb.group({
      empType: [{ value: null, disabled: true }],
      dateOfJoining: [{ value: null, disabled: true }],
      durationOfTrainee: [{ value: null, disabled: true }],
      trainingEndDate: [{ value: null, disabled: true }],
    });
  }
  initializeContract() {
    this.contractForm = this.fb.group({
      empType: [{ value: null, disabled: true }],
      dateOfJoining: [{ value: null, disabled: true }],
      durationofContracts: [{ value: null, disabled: true }],
      contractEndDate: [{ value: null, disabled: true }],
    });
  }
  wfhChange() {
    // Initialize filteredWorkLocations if allowwfh has a default
    const initialWFH = this.onboardingForm.get('allowwfh')?.value;
    this.filterWorkLocationOptions(initialWFH);
    // Listen to changes
    this.onboardingForm.get('allowwfh')?.valueChanges.subscribe((value) => {
      this.filterWorkLocationOptions(value);
      if (value) {
        this.onboardingForm.patchValue({
          workLocation: null,
          wfhmanger: null,
        });
      }
    });
  }

  remoteLoginChange() {
    // Listen to changes
    this.onboardingForm
      .get('allowRemoteLogin')
      ?.valueChanges.subscribe((value) => {
        if (value) {
          this.onboardingForm.patchValue({
            remoteLoginManager: null,
            remoteLoginWorkLocation: null,
          });
        }
      });
  }

  setupConditionalValidation(): void {
    this.onboardingForm.get('allowwfh')?.valueChanges.subscribe(() => {
      this.updateConditionalValidators();
    });

    this.onboardingForm.get('allowRemoteLogin')?.valueChanges.subscribe(() => {
      this.updateConditionalValidators();
    });
  }

  updateConditionalValidators(): void {
    const allowwfh = this.onboardingForm.get('allowwfh')?.value;
    const allowRemoteLogin = this.onboardingForm.get('allowRemoteLogin')?.value;

    const workLocation = this.onboardingForm.get('workLocation');
    const wfhmanger = this.onboardingForm.get('wfhmanger');
    const remoteLoginManager = this.onboardingForm.get('remoteLoginManager');
    const remoteLoginWorkLocation = this.onboardingForm.get(
      'remoteLoginWorkLocation'
    );

    // Reset validators
    workLocation?.clearValidators();
    wfhmanger?.clearValidators();
    remoteLoginManager?.clearValidators();
    remoteLoginWorkLocation?.clearValidators();

    // Add required validators based on conditions
    if (allowwfh) {
      workLocation?.setValidators(Validators.required);
      wfhmanger?.setValidators(Validators.required);
    }

    if (allowRemoteLogin) {
      remoteLoginManager?.setValidators(Validators.required);
      remoteLoginWorkLocation?.setValidators(Validators.required);
    }

    // Update form controls
    workLocation?.updateValueAndValidity();
    wfhmanger?.updateValueAndValidity();
    remoteLoginManager?.updateValueAndValidity();
    remoteLoginWorkLocation?.updateValueAndValidity();
  }

  filterWorkLocationOptions(allowWFH: boolean) {
    this.filteredWorkLocations = this.worklocation.filter(
      (loc) => loc.allowWFH === allowWFH
    );
  }
  //function to get offer letter data using getbyemployeeid
  getOfferLetterEmployeebyId(): void {
    const EmpId = parseInt(this.empinfo.employeeId);
    console.log(EmpId);

    this.subscription = this.http
      .getData(`OfferLetter/getbyEmpidNames/${EmpId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);

          this.offerletttersentdate = this.formatDate(data.offerSentDate) || '';

          // Patch the form with offer letter details
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getEmployeeId(): void {
    this.loading = true;
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.loading = false;
          console.log(data);
          this.empdata = data;
          this.employeestatus = data?.empstatus?.toLowerCase();
          this.statustoprint = data?.substatus?.toLowerCase();
          console.log('status' + this.employeestatus);
          console.log('status' + this.statustoprint);
          this.getStatus();
          this.patchForm(data);
        },
        error: (err: any) => {
          this.loading = false;
          console.log(err);
        },
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

  patchForm(data: any): void {
    const remoteLoginWorkLocation = this.filteredRemoteLoginWorkLocations.find(
      (item: any) => item.value == data?.remoteLoginWorkLocation
    );
    this.onboardingForm.patchValue({
      dateOfJoining: this.formatDateToLocal(data.dateOfJoining),
      branchLocation: data?.branchCode,
      probationEndDate: this.formatDateToLocal(data.probationEndDate),
      probationStatus: this.probation.find(
        (item: any) => item.probationstatus1 === data?.probationStatus
      ),
      noticePeriodStatus: this.noticePeriod.find(
        (item: any) => item.name === data.noticePeriod
      ),
      backgroundCheckStatus: this.backgroundDetails.find(
        (item: any) =>
          item.backgroundcheckstatus1 === data?.backgroundCheckStatus
      ),
      salaryHold: this.salaryHoldDetails.find(
        (item: any) => item.value === data?.issalaryhold
      ),
      pf: this.pfdata.find((item: any) => item.value === data?.pf),
      esic: this.esicdata.find((item: any) => item.value === data?.esic),
      pt: this.ptdata.find((item: any) => item.value === data?.pt),
      totalExperience: data.totalYearsOfExperience,
      allowwfh: data.allowWFH,
      workLocation: data?.workLocation,
      wfhmanger: data.wfhManagerId,
      trainingEndDate: moment(data.trainingEndDate).format('yyyy-MM-DD'),
      empType: data.empType,
      durationOfTrainee: data.durationOfTrainee,
      allowRemoteLogin: data?.allowRemoteLogin,
      remoteLoginManager: data?.remoteLoginManagerId,
    });
    this.onboardingForm.patchValue({
      remoteLoginWorkLocation: remoteLoginWorkLocation?.value,
    });
      this.traineeForm.patchValue({
            empType: data.empType,
            dateOfJoining: this.formatDateToLocal(data.dateOfJoining),
            durationOfTrainee: data.durationOfTrainee,
            trainingEndDate: this.formatDateToLocal(data.trainingEndDate),
          });
  }

  //function to get traineeofferletter data using getbyemployeeid
  getTraineeOfferLetterEmployeebyId() {
    let Empid = parseInt(this.empinfo.employeeId);
    console.log(Empid);
    this.subscription = this.http
      .getData(`TraineeOfferLetter/getbyEmpidNames/${Empid}`)
      .subscribe({
        next: (data: any) => {
        this.traineeForm.patchValue({
            empType: data.empType,
            dateOfJoining: this.formatDateToLocal(data.dateOfJoining),
            durationOfTrainee: data.durationOfTrainee,
            trainingEndDate: this.formatDateToLocal(data.trainingEndDate),
          });
        },
        error: (Reason) => console.log(Reason),
      });
  }
 //function to get contract details data using getbyemployeeid
  getcontractDetailsEmployeebyId() {
    let Empid = parseInt(this.empinfo.employeeId);
    console.log(Empid);
    this.subscription = this.http
      .getData(`ContractDetails/getbyemployeeId/${Empid}`)
      .subscribe({
        next: (data: any) => {
        // Filter out records with Active status
        
        const filteredData = data.data;
        
        if (filteredData.length > 0) {
          const contract = filteredData[0];
          this.contractForm.patchValue({
            empType: this.empinfo.empType,
            dateOfJoining: this.formatDateToLocal(contract.contractStartDate),
            durationofContracts: contract.contractDuration,
            contractEndDate: this.formatDateToLocal(contract.contractEndDate),
          });
        }
        },
        error: (Reason) => console.log(Reason),
      });
  }
  //function to get employee status dropdown
  getStatus() {
    this.subscription = this.http.getData(`Status`).subscribe({
      next: (data: any) => {
        const empStatus = this.employeestatus?.toLowerCase();
        const statusMapping: { [key: string]: string[] } = {

          prospective: ['active', 'prospective'],
          'prospective contract':['prospective contract','active contract'],
          'active contract':['active contract'],
          active: ['active'],
          inactive: ['inactive'],
          trainee: ['trainee active', 'inactive', 'trainee'],
          'trainee prospective': ['trainee active', 'trainee prospective'],
          'trainee active': ['trainee active'],
          'trainee inactive': ['trainee inactive'],
        };
        const allowedStatuses = (statusMapping[empStatus] || []).map((s) =>
          s.toLowerCase()
        );
        const filteredData = data?.filter(
          (status: any) =>
            allowedStatuses.includes(status?.statusname?.toLowerCase()) // change property if needed
        );

        this.Statusdetails = filteredData;
        console.log('Filtered Statusdetails:', this.Statusdetails);
        const matchedStatus = filteredData.find(
          (s: any) => s.statusname.toLowerCase() === empStatus
        );
        if (matchedStatus) {
          this.onboardingForm.patchValue({ status: matchedStatus }); // Use correct form name
        }
      },

      error: (err: any) => {
        console.error('Error fetching status:', err);
      },
    });
  }

  //function to get probition dropdown
  getprobation() {
    this.subscription = this.http.getData('ProbationStatus').subscribe({
      next: (data: any) => {
        console.log(data);
        if (data) {
          this.probation = data as IProbation[];
        } else {
          this.probation = [] as IProbation[];
        }
      },
    });
  }

  //get all Branch Locations
  getBranchLocations(): void {
    this.subscription = this.http.getData('BranchLocation').subscribe({
      next: (data: any) => {
        this.branchLocations = data as IBranchLocation[];
      },
      error: (err) => console.log(err),
    });
  }

  getBackground() {
    this.subscription = this.http.getData('Background').subscribe({
      next: (data: any) => {
        console.log(data);
        this.backgroundDetails = data as IBackground[];
      },
    });
  }

  getWorkfromhomeManager() {
    this.subscription = this.http
      .getData(
        'FusionRole/getbyNormalizedName?Nname=WORK FROM HOME MANAGER&includeAssignee=true'
      )
      .subscribe({
        next: (data: any) => {
          console.log(data);
          // Assuming IWfh is your interface/model for the Manager data
          this.Manager = data.getUserWithRoleNames.map(
            (user: {
              firstName: any;
              middleName: any;
              lastName: any;
              employeeId: any;
              fusionEmpId: any;
            }) => ({
              ...user,
              name: ` ${user.fusionEmpId ?? ''} -${user.firstName} ${
                user.middleName ?? ''
              } ${user.lastName ?? ''}`.trim(),
              value: user.employeeId,
            })
          );
          console.log(this.Manager);
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        },
      });
  }

  getRemoteLoginManagers() {
    const normalizedName = encodeURIComponent('REMOTE LOGIN MANAGER');
    const includeAssignee = true;
    const url = `FusionRole/getbyNormalizedName?Nname=${normalizedName}&includeAssignee=${includeAssignee}`;
    this.subscription = this.http.getData(url).subscribe({
      next: (data: any) => {
        this.remoteLoginManagers = data.getUserWithRoleNames.map(
          (user: {
            firstName: any;
            middleName: any;
            lastName: any;
            employeeId: any;
            fusionEmpId: any;
          }) => ({
            ...user,
            name: ` ${user.fusionEmpId ?? ''} -${user.firstName} ${
              user.middleName ?? ''
            } ${user.lastName ?? ''}`.trim(),
            value: user.employeeId,
          })
        );
      },
      error: (error) => {
        console.error('Error fetching data:', error);
      },
    });
  }

  //function to get notice dropdown
  getNotice() {
    this.subscription = this.http.getData('Noticeperiod').subscribe({
      next: (data: any) => {
        console.log(data);
        this.noticeDetails = data as INotice[];
      },
    });
  }

  onReportingManagerChange(selectedManager: any): void {
    this.selectedEmployeeId = selectedManager;
    console.log('Selected Employee ID:', this.selectedEmployeeId);
  }
  onSubmit() {
    if (this.onboardingForm.invalid) {
      this.onboardingForm.markAllAsTouched();
      return;
    }
    const probationEndDate = this.onboardingForm.get('probationEndDate')?.value
      ? this.formatDateToLocal(
          this.onboardingForm.get('probationEndDate')?.value
        )
      : this.empdata.probationEndDate
      ? this.formatDateToLocal(this.empdata.probationEndDate)
      : null;
    // Work From Home
    const allowWFH =
      this.onboardingForm.get('allowwfh')?.value ?? this.empdata.allowWFH;
    const wfhData = {
      allowWFH: allowWFH,
      workLocation: allowWFH
        ? this.onboardingForm.get('workLocation')?.value ??
          this.empdata.workLocation
        : null,
      wfhManagerId: allowWFH
        ? this.onboardingForm.get('wfhmanger')?.value ??
          this.empdata.wfhManagerId
        : null,
    };
    // Remote Login
    const allowRemoteLogin =
      this.onboardingForm.get('allowRemoteLogin')?.value ??
      this.empdata.allowRemoteLogin;
    const remoteLoginData = {
      allowRemoteLogin: allowRemoteLogin,
      remoteLoginWorkLocation: allowRemoteLogin
        ? this.onboardingForm.get('remoteLoginWorkLocation')?.value ??
          this.empdata.remoteLoginWorkLocation
        : null,
      remoteLoginManagerId: allowRemoteLogin
        ? this.onboardingForm.get('remoteLoginManager')?.value ??
          this.empdata.remoteLoginManagerId
        : null,
    };

    const payload = {
      ...this.empdata,
      empstatus:
        this.onboardingForm.get('status')?.value?.statusname ??
        this.empdata.empstatus,
      dateOfJoining:
        this.onboardingForm.get('dateOfJoining')?.value ??
        this.empdata.dateOfJoining,
      branchCode:
        this.onboardingForm.get('branchLocation')?.value ??
        this.empdata.branchCode,
      probationEndDate: probationEndDate,
      probationStatus:
        this.empdata.probationStatus ??
        this.onboardingForm.get('probationStatus')?.value?.probationstatus1,
      noticePeriod:
        this.onboardingForm.get('noticePeriodStatus')?.value?.name ??
        this.empdata.noticePeriod,
      backgroundCheckStatus:
        this.onboardingForm.get('backgroundCheckStatus')?.value
          ?.backgroundcheckstatus1 ?? this.empdata.backgroundCheckStatus,
      issalaryhold:
        this.onboardingForm.get('salaryHold')?.value?.value ??
        this.empdata.issalaryhold,
      pf: this.onboardingForm.get('pf')?.value?.value ?? this.empdata.pf,
      esic: this.onboardingForm.get('esic')?.value?.value ?? this.empdata.esic,
      pt: this.onboardingForm.get('pt')?.value?.value ?? this.empdata.pt,
     totalYearsOfExperience:
        parseInt(this.onboardingForm.get('totalExperience')?.value) ??
        parseInt(this.empdata.totalYearsOfExperience),
      ...wfhData,
      ...remoteLoginData,
    };
    if (
      payload.empstatus === 'Active' &&
      payload.substatus === 'Offer Letter Accepted'
    ) {
      payload.substatus = 'Probation';
      payload.empType = 'Probation';
    }
    this.subscription = this.http
      .postdata(`Employeedata/UPDATER`, payload)
      .subscribe({
        next: (data: any) => {
          if (data.statusCode === 200) {
            this.conformationPopup.openSuccessModal(
              'Onboarding Information updated successfully'
            );
            this.getEmployeeId();
            this.buttons = !this.buttons;
            this.onboardingForm.disable();
            console.log('Data updated successfully:', data);
          } else if (data.statusCode === 409) {
            this.conformationPopup.openErrorModal(data.message);
            this.getEmployeeId();
          }
        },
        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal(
            'Onboarding Information Updated failed'
          );
        },
      });
  }

  showButtons(): void {
    this.onboardingForm.reset();
    this.getEmployeeId();
    this.buttons = !this.buttons;

    if (this.buttons) {
      this.onboardingForm.enable();
      this.getEmployeeId();
      this.onboardingForm.get('totalExperience')?.disable();
      this.onboardingForm.get('status')?.disable();
      if(this.statustoprint === 'offer letter accepted' && this.empinfo.empType === 'Contract'){
        this.onboardingForm.get('status')?.disable();
      }
      if ((this.statustoprint === 'nda letter accepted') && this.empinfo.empType === 'Contract') {
        console.log(this.empdata?.substatus);
        this.onboardingForm.get('status')?.enable();
      }
      if ((this.statustoprint === 'offer letter accepted') && this.empinfo.empType !== 'Contract') {
        console.log(this.empdata?.substatus);
        this.onboardingForm.get('status')?.enable();
      }
      
    } else {
      this.getEmployeeId();
      
      this.onboardingForm.disable();
    }
  }

  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122) &&
      charCode !== 32
    ) {
      return false;
    }
    return true;
  }

  ngOnDestroy(): void {
    if(this.subscription){
      this.subscription.unsubscribe();
    }
  }
}
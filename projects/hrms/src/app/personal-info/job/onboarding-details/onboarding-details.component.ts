import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';

import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { IBackground, INotice, IProbation } from '../../../Interfaces/job-model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IBranchLocation, Ipersonal, IStatus } from '../../../Interfaces/personal-modal';
import moment from 'moment';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-onboarding-details',
  imports: [CommonModule,ReactiveFormsModule,Select],
  templateUrl: './onboarding-details.component.html',
  styleUrl: './onboarding-details.component.scss'
})
export class OnboardingDetailsComponent {
  subscription!: Subscription;
  buttons = false;
  Statusdetails: any;
  probation = [] as IProbation[];
  noticePeriod  = [{id : 1, name : 'Yes'}, {id : 2, name : 'No'}]
  empinfo :any = {} as IJob;
  backgroundDetails = [] as IBackground[];
  branchLocations = [] as IBranchLocation[]
  empdata: Ipersonal = {} as Ipersonal;
  previousEmpData: Ipersonal = {} as Ipersonal;
  Manager: any = [];
  noticeDetails: INotice[] = []
  selectedEmployeeId: any;
  onboardingForm!: FormGroup;
  traineeForm!: FormGroup;
  isEditing = false;
  empyployeedata={} as any;
  noticePeriodStatus = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ]

  salaryHoldDetails = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ]
  pfdata = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ]
  ptdata = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ]
  esicdata = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ]

  WorkFromHome = [
    { name: 'Remote/Hybrid', value: true },
    { name: 'Work Location', value: true },
  ]
  remoteLogin = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },

  ]

  worklocation = [
    { name: 'Remote/Hybrid', value: 'Remote/Hybrid', allowWFH: true },
    { name: 'Work From Home', value: 'Work From Home', allowWFH: false }
  ];
  filteredWorkLocations: any[] = [];
  selectedWorkLocation: any = null;
  constructor(private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService, private modalService: NgbModal,public rbac:RbacService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.initializeForm();
    this.getStatus();
    this.getEmployeeId();
    this.getBackground();
    this.getBranchLocations();
    this.getprobation();
    this.remoteLoginChange();
    this.getWorkfromhomeManager();
    this.initializeTrainee();
    this.onboardingForm.get('status')?.setValue(this.empinfo.empstatus);
  }

  initializeForm(): void {
    this.onboardingForm = this.fb.group({
      status: [{ value: null, disabled: true }],
      dateOfJoining: [{ value: null, disabled: true }],
      branchLocation: [{ value: null, disabled: true }],
      probationEndDate: [{ value: null, disabled: true }],
      probationStatus: [{ value: null, disabled: true }],
      noticePeriodStatus: [{ value: '', disable: true },],
      backgroundCheckStatus: [{ value: null, disabled: true }],
      salaryHold: [{ value: null, disabled: true }],
      pf: [{ value: null, disabled: true }],
      esic: [{ value: null, disabled: true }],
      pt: [{ value: null, disabled: true }],
      totalExperience: [{ value: null, disabled: true }],
      remoteLogin: [{ value: null, disabled: true }],
      workLocation: [{ value: null, disabled: true }],
      wfhmanger: [{ value: null, disabled: true }],
    });
  }
  
  initializeTrainee(){
    this.traineeForm = this.fb.group({
      empType: [ { value: null, disabled: true }],
      dateOfJoining: [{ value: null, disabled: true }],
      durationOfTrainee: [{ value: null, disabled: true }],
      trainingEndDate: [{ value: null, disabled: true }]
    });
  }
  
  remoteLoginChange() {
    // Initialize filteredWorkLocations if remoteLogin has a default
    const initialWFH = this.onboardingForm.get('remoteLogin')?.value;
    this.filterWorkLocationOptions(initialWFH);

    // Listen to changes
    this.onboardingForm.get('remoteLogin')?.valueChanges.subscribe(value => {
      this.filterWorkLocationOptions(value);

      // Optionally reset workLocation field
      this.onboardingForm.get('workLocation')?.setValue(null);
    });
  }

  filterWorkLocationOptions(allowWFH: boolean) {
    this.filteredWorkLocations = this.worklocation.filter(loc => loc.allowWFH === allowWFH);
  }


  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    console.log(this.empinfo);

    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.empdata = data;
        this.patchForm(data);
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }
  
  patchForm(data: any): void {
    // Patching values for onboardingForm
    this.onboardingForm.patchValue({
      status: this.Statusdetails?.find((item: any) => item?.statusname === data?.empstatus),
      dateOfJoining: moment(data.dateOfJoining).format('yyyy-MM-DD'),
      branchLocation: this.branchLocations.find((item: any) => item.branchCode === data?.branchCode),
      probationEndDate: data.probationEndDate ? moment(data.probationEndDate).format('yyyy-MM-DD') : null,
      probationStatus: this.probation.find((item: any) => item.probationstatus1 === data?.probationStatus),
      noticePeriodStatus: this.noticePeriod.find((item: any) => item.name === data.noticePeriod),
      backgroundCheckStatus: this.backgroundDetails.find((item: any) => item.backgroundcheckstatus1 === data?.backgroundCheckStatus),
      salaryHold: this.salaryHoldDetails.find((item: any) => item.value === data?.issalaryhold),
      pf: this.pfdata.find((item: any) => item.value === data?.pf),
      esic: this.esicdata.find((item: any) => item.value === data?.esic),
      pt: this.ptdata.find((item: any) => item.value === data?.pt),
      totalExperience: data.totalYearsOfExperience,
      remoteLogin: this.remoteLogin.find((item: any) => item.value === data.allowWFH),
      workLocation: this.worklocation.find((item: any) => item.value === data.workLocation),
      wfhmanger: this.Manager.find((item: any) => item.value === data.wfhManagerId),
      trainingEndDate: moment(data.trainingEndDate).format('yyyy-MM-DD'),
      empType: data.empType,
      durationOfTrainee: data.durationOfTrainee
    });
    
    console.log(this.onboardingForm.value); // Check values in the onboardingForm
  
    // Patching values for traineeForm
    this.traineeForm.patchValue({
      empType: data.empType,
      dateOfJoining: moment(data.dateOfJoining).isValid() ? moment(data.dateOfJoining).format('yyyy-MM-DD') : null,
      durationOfTrainee: data.durationOfTrainee,
      trainingEndDate: moment(data.trainingEndDate).isValid() ? moment(data.trainingEndDate).format('yyyy-MM-DD') : null
    });
    
    console.log(this.traineeForm.value); // Check values in the traineeForm
  }
  

  getStatus() {
    this.subscription = this.http.getData(`Status`).subscribe({
      next: (data: any) => {
        this.Statusdetails = data as IStatus[];
        console.log(this.Statusdetails);
        if (this.empdata?.empstatus == 'Prospective') {
          const filteredData = data?.filter((status: IStatus) => {
            const lowerCaseStatusName = status?.statusname?.toLowerCase();
            return (
              lowerCaseStatusName === 'active' ||
              lowerCaseStatusName === 'inactive' ||
              lowerCaseStatusName === 'prospective'
            );
          });
          console.log(filteredData);
          this.Statusdetails = filteredData;
        } else if (this.empdata?.empstatus == 'Active') {
          const filteredData = data?.filter((status: IStatus) => {
            const lowerCaseStatusName = status?.statusname?.toLowerCase();
            return (
              lowerCaseStatusName === 'active' ||
              lowerCaseStatusName === 'inactive'
            );
          });
          console.log(filteredData);
          this.Statusdetails = filteredData;
        } else if (this.empdata?.empstatus?.toLowerCase() == 'inactive') {
          const filteredData = data?.filter((status: IStatus) => {
            const lowerCaseStatusName = status?.statusname?.toLowerCase();
            return (
              lowerCaseStatusName === 'active' ||
              lowerCaseStatusName === 'inactive'
            );
          });
          console.log(filteredData);
          this.Statusdetails = filteredData;
        }
        else if (this.empdata?.empstatus?.toLowerCase() == 'trainee') {
          const filteredData = data?.filter((status: IStatus) => {
            const lowerCaseStatusName = status?.statusname?.toLowerCase();
            return lowerCaseStatusName === 'trainee active' 
            || lowerCaseStatusName === 'inactive' 
            || lowerCaseStatusName === 'trainee';
          });
          this.Statusdetails = filteredData
        }
        else if (this.empdata?.empstatus?.toLowerCase() == 'trainee prospective') {
          const filteredData = data?.filter((status: IStatus) => {
            const lowerCaseStatusName = status?.statusname?.toLowerCase();
            return lowerCaseStatusName === 'trainee active' || lowerCaseStatusName === 'trainee prospective';
          });

          this.Statusdetails = filteredData
        }
        else if (this.empdata?.empstatus?.toLowerCase() == 'trainee active') {
          const filteredData = data?.filter((status: IStatus) => {
            const lowerCaseStatusName = status?.statusname?.toLowerCase();
            return lowerCaseStatusName === 'trainee active';
          });
          this.Statusdetails = filteredData

        }
        else if (this.empdata?.empstatus?.toLowerCase() == 'trainee inactive') {
          const filteredData = data?.filter((status: IStatus) => {
            const lowerCaseStatusName = status?.statusname?.toLowerCase();
            return lowerCaseStatusName === 'trainee inactive';
          });
          //console.log(filteredData);
          this.Statusdetails = filteredData
        }
      },
    });
  }

  //function to get probition dropdown
  getprobation() {
    this.subscription = this.http.getData("ProbationStatus").subscribe({
      next: (data: any) => {
        console.log(data);
      if(data){
        this.probation = data as IProbation[];
      }
      else{
        this.probation = [] as IProbation[];
      }
      }
    })
  }

  //get all Branch Locations
  getBranchLocations(): void {
    this.subscription = this.http.getData('BranchLocation').subscribe({
      next: (data: any) => {
        this.branchLocations = data as IBranchLocation[]
      },
      error: err => console.log(err),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      complete: () => {

      },

    })
  }


  getBackground() {
    this.subscription = this.http.getData("Background").subscribe({
      next: (data: any) => {
        console.log(data);
        this.backgroundDetails = data as IBackground[]
      }
    })
  }

  getWorkfromhomeManager() {
    this.subscription = this.http.getData('FusionRole/getbyNormalizedName?Nname=WORK FROM HOME MANAGER&includeAssignee=true').subscribe({
      next: (data: any) => {
        console.log(data);
        // Assuming IWfh is your interface/model for the Manager data
        this.Manager = data.getUserWithRoleNames.map((user: { firstName: any; middleName: any; lastName: any; employeeId: any; fusionEmpId: any }) => ({
          ...user,
          name: ` ${user.fusionEmpId ?? ''} -${user.firstName} ${user.middleName ?? ''} ${user.lastName ?? ''}`.trim(),
          value: user.employeeId
        }));
        console.log(this.Manager);
      },
      error: (error) => {
        console.error('Error fetching data:', error);

      }
    });
  }


  //function to get notice dropdown
  getNotice() {
    this.subscription = this.http.getData("Noticeperiod").subscribe({
      next: (data: any) => {
        console.log(data);
        this.noticeDetails = data as INotice[]
      }
    })
  }

  onReportingManagerChange(selectedManager: any): void {
    this.selectedEmployeeId = selectedManager
    console.log('Selected Employee ID:', this.selectedEmployeeId);
  }
  onSubmit() {
    if (this.onboardingForm.invalid) {
      this.onboardingForm.markAllAsTouched();
      return;
    }
    
    const payload = {
     ...this.empdata,
      empstatus: this.onboardingForm.get('status')?.value?.statusname ?? this.empdata.empstatus,
      dateOfJoining: this.onboardingForm.get('dateOfJoining')?.value ?? this.empdata.dateOfJoining,
      branchCode: this.onboardingForm.get('dateOfJoining')?.value ?? this.empdata.branchCode,
      probationEndDate: this.onboardingForm.get('probationEndDate')?.value ?? this.empdata.probationEndDate,
      probationStatus: this.empdata.probationStatus ?? this.onboardingForm.get('probationStatus')?.value?.probationstatus1,
      noticePeriod: this.onboardingForm.get('noticePeriodStatus')?.value?.name ?? this.empdata.noticePeriod,
      backgroundCheckStatus: this.onboardingForm.get('backgroundCheckStatus')?.value?.backgroundcheckstatus1 ?? this.empdata.backgroundCheckStatus,
      issalaryhold: this.onboardingForm.get('salaryHold')?.value?.value ?? this.empdata.issalaryhold,
      pf: this.onboardingForm.get('pf')?.value?.value ?? this.empdata.pf,
      esic: this.onboardingForm.get('esic')?.value?.value ?? this.empdata.esic,
      pt: this.onboardingForm.get('pt')?.value?.value ?? this.empdata.pt,
      totalYearsOfExperience: this.onboardingForm.get('totalExperience')?.value ?? this.empdata.totalYearsOfExperience,
      allowWFH: this.onboardingForm.get('remoteLogin')?.value?.value ?? this.empdata.allowWFH,
      workLocation: this.onboardingForm.get('workLocation')?.value ?? this.empdata.workLocation,
      wfhManagerId: this.onboardingForm.get('wfhmanger')?.value ?? this.empdata.wfhManagerId,
      
    };
    if (payload.empstatus === 'Active' && payload.substatus === 'Offer Letter Accepted') {
      payload.substatus = 'Probation' 
      payload.empType = 'Probation'
    }
    this.subscription = this.http
      .postdata(`Employeedata/UPDATER`, payload)
      .subscribe({
        next: (data: any) => {
          this.conformationPopup.openSuccessModal('Onboarding Details Updated Successfully');
          this.getEmployeeId();
          this.buttons = !this.buttons;
          this.onboardingForm.disable();
          console.log('Data updated successfully:', data);
        },
        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal('Onboarding Details Updated failed')

        },
      });
  }

  showButtons(): void {
    this.buttons = !this.buttons;

    if (this.buttons) {
      // Enable the form when the user clicks "Edit"
      this.onboardingForm.enable();
    } else {
      // Disable the form when the user clicks "Close"
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
  
}



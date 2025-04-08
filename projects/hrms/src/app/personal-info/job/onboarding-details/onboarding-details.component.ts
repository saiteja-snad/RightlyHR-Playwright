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

@Component({
  selector: 'app-onboarding-details',
  imports: [CommonModule, ReactiveFormsModule, Select],
  templateUrl: './onboarding-details.component.html',
  styleUrl: './onboarding-details.component.scss'
})
export class OnboardingDetailsComponent {
  subscription!: Subscription;
  buttons = false;
  Statusdetails: any;
  probation = [] as IProbation[];
  noticePeriod  = [{id : 1, name : 'Yes'}, {id : 2, name : 'No'}]

  empinfo = {} as IJob;
  backgroundDetails = [] as IBackground[];
  branchLocations = [] as IBranchLocation[]
  empdata: Ipersonal = {} as Ipersonal;
  previousEmpData: Ipersonal = {} as Ipersonal;
  Manager: any = [];
  noticeDetails: INotice[] = []
  selectedEmployeeId: any

  onboardingForm!: FormGroup;
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
  constructor(private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService, private modalService: NgbModal) { }

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
    this.onboardingForm.get('status')?.setValue(this.empinfo.empstatus);
  }

  initializeForm(): void {
    this.onboardingForm = this.fb.group({
      status: [{ value: "", disabled: true }],
      dateOfJoining: [{ value: "", disabled: true }],
      branchLocation: [{ value: "", disabled: true }],
      probationEndDate: [{ value: "", disabled: true }],
      probationStatus: [{ value: "", disabled: true }],
      noticePeriodStatus: [{ value: '', disable: true }, Validators.required],
      backgroundCheckStatus: [{ value: "", disabled: true }],
      salaryHold: [{ value: "", disabled: true }],
      pf: [{ value: "", disabled: true }],
      esic: [{ value: "", disabled: true }],
      pt: [{ value: "", disabled: true }],
      totalExperience: [{ value: "", disabled: true }],
      remoteLogin: [{ value: "", disabled: true }],
      workLocation: [{ value: "", disabled: true }],
      wfhmanger: [{ value: "", disabled: true }],
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


    this.onboardingForm.patchValue({
      status: this.Statusdetails.find((item: any) => item.statusname === data.empstatus),
      dateOfJoining: moment(data.dateOfJoining).format('yyyy-MM-DD'),
      branchLocation: this.branchLocations.find((item: any) => item.branchCode === data.branchCode),
      probationEndDate: data.probationEndDate ? moment(data.probationEndDate).format('yyyy-MM-DD') : null,
      probationStatus: this.probation.find((item: any) => item.probationstatus1 === data.probationStatus),
      noticePeriodStatus: this.noticePeriod.find((item: any) => item.name === data.noticePeriod),
      backgroundCheckStatus: this.backgroundDetails.find((item: any) => item.backgroundcheckstatus1 === data.backgroundCheckStatus),
      salaryHold: this.salaryHoldDetails.find((item: any) => item.value === data.issalaryhold),
      pf: this.pfdata.find((item: any) => item.value === data.pf),
      esic: this.esicdata.find((item: any) => item.value === data.esic),
      pt: this.ptdata.find((item: any) => item.value === data.pt),
      totalExperience: data.totalYearsOfExperience,
      remoteLogin: this.remoteLogin.find((item: any) => item.value === data.allowWFH),
      workLocation: this.worklocation.find((item: any) => item.value === data.workLocation),
      wfhmanger: this.Manager.find((item: any) => item.value === data.wfhManagerId),
    });
    console.log(this.onboardingForm.value);

  }

  getStatus() {
    this.subscription = this.http.getData(`Status`).subscribe({
      next: (data: any) => {
        this.Statusdetails = data as IStatus[];
        console.log(this.Statusdetails);
        if (this.empinfo.empstatus == 'Prospective') {
          const filteredData = data.filter((status: IStatus) => {
            const lowerCaseStatusName = status.statusname.toLowerCase();
            return (
              lowerCaseStatusName === 'active' ||
              lowerCaseStatusName === 'inactive' ||
              lowerCaseStatusName === 'prospective'
            );
          });
          console.log(filteredData);
          this.Statusdetails = filteredData;
        } else if (this.empinfo.empstatus == 'Active') {
          const filteredData = data.filter((status: IStatus) => {
            const lowerCaseStatusName = status.statusname.toLowerCase();
            return (
              lowerCaseStatusName === 'active' ||
              lowerCaseStatusName === 'inactive'
            );
          });
          console.log(filteredData);
          this.Statusdetails = filteredData;
        } else if (this.empinfo.empstatus.toLocaleLowerCase() == 'inactive') {
          const filteredData = data.filter((status: IStatus) => {
            const lowerCaseStatusName = status.statusname.toLowerCase();
            return (
              lowerCaseStatusName === 'active' ||
              lowerCaseStatusName === 'inactive'
            );
          });
          console.log(filteredData);
          this.Statusdetails = filteredData;
        }
      },
    });
  }

  //function to get probition dropdown
  getprobation() {
    this.subscription = this.http.getData("ProbationStatus").subscribe({
      next: (data: any) => {
        console.log(data);
        this.probation = data as IProbation[];
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

    const formData = this.onboardingForm.value;
    const currentDate = new Date().toISOString();
    const payload = {
      employeeId: this.empinfo.employeeId,
      title: this.empinfo.title,
      firstName: this.empinfo.firstName,
      middleName: this.empinfo.middleName,
      lastName: this.empinfo.lastName,
      gender: this.empinfo.gender,
      dob: this.empinfo.dob,
      bloodGroup: this.empinfo.bloodGroup,
      maritalStatus: this.empinfo.maritalStatus,
      emailaddress: this.empinfo.emailaddress,
      workEmail: this.empinfo.workEmail,
      contactnumber: this.empinfo.contactnumber,
      workPhone: this.empinfo.workPhone,
      emergencyName: this.empinfo.emergencyName,
      emailId: this.empinfo.emailId,
      relationShip: this.empinfo.relationShip,
      mobileNumber: this.empinfo.mobileNumber,
      emergencyName1: this.empinfo.emergencyName1,
      emergencyEmail1: this.empinfo.emergencyEmail1,
      emergencyNumber1: this.empinfo.emergencyNumber1,
      relationship1: this.empinfo.relationship1,
      profileUrl: this.empinfo.profileUrl,
      fusionEmpId: this.empinfo.fusionEmpId,
      empstatus: this.onboardingForm.get('status')?.value.statusname ?? this.empinfo.empstatus,
      dateOfJoining: this.onboardingForm.get('dateOfJoining')?.value ?? this.empinfo.dateOfJoining,
      branchCode: this.onboardingForm.get('dateOfJoining')?.value ?? this.empinfo.branchCode,
      probationEndDate: this.onboardingForm.get('probationEndDate')?.value ?? this.empinfo.probationEndDate,
      probationStatus: this.onboardingForm.get('probationStatus')?.value.probationstatus1 ?? this.empinfo.probationStatus,
      noticePeriod: this.onboardingForm.get('noticePeriodStatus')?.value.name ?? this.empinfo.noticePeriod,
      backgroundCheckStatus: this.onboardingForm.get('backgroundCheckStatus')?.value.backgroundcheckstatus1 ?? this.empinfo.backgroundCheckStatus,
      issalaryhold: this.onboardingForm.get('salaryHold')?.value.value ?? this.empinfo.issalaryhold,
      pf: this.onboardingForm.get('pf')?.value.value ?? this.empinfo.pf,
      esic: this.onboardingForm.get('esic')?.value.value ?? this.empinfo.esic,
      pt: this.onboardingForm.get('pt')?.value.value ?? this.empinfo.pt,
      totalYearsOfExperience: this.onboardingForm.get('totalExperience')?.value ?? this.empinfo.totalYearsOfExperience,
      allowWFH: this.onboardingForm.get('remoteLogin')?.value.value ?? this.empinfo.allowWFH,
      workLocation: this.onboardingForm.get('workLocation')?.value ?? this.empinfo.workLocation,
      wfhManagerId: this.onboardingForm.get('wfhmanger')?.value ?? this.empinfo.wfhManagerId
    };
    this.subscription = this.http
      .postdata(`Employeedata/UPDATER`, payload)
      .subscribe({
        next: (data: any) => {
          this.conformationPopup.openSuccessModal('Onboarding Details Updated Successfully',);
          this.getEmployeeId();
          this.onboardingForm.disable();
          console.log('Data updated successfully:', data);
          this.modalService.dismissAll();

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





}



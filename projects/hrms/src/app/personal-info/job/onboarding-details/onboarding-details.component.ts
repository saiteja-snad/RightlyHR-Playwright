import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { IBranchLocation, IStatus } from '../../../Interfaces/personal-modal';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { IBackground, IProbation } from '../../../Interfaces/job-model';

@Component({
  selector: 'app-onboarding-details',
  imports: [CommonModule,ReactiveFormsModule,Select],
  templateUrl: './onboarding-details.component.html',
  styleUrl: './onboarding-details.component.scss'
})
export class OnboardingDetailsComponent {
  subscription!:Subscription;
  buttons= false;
  Statusdetails: any;
  probation = [] as IProbation[];
  empinfo = {} as IJob;
  backgroundDetails = [] as IBackground[];
  branchLocations = [] as IBranchLocation[] 
  Manager: any=[];
  showButtons() {
    this.buttons = !this.buttons
  }
  onboardingForm!: FormGroup;
  noticePeriodStatus = [
    { name: 'Yes', value: true },
    { name: 'No', value: false },
  ]

  sarleryonhold = [
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
  constructor( private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getStatus();
   // this.getEmployeeId();
    this.initializeForm();
    this.getBackground();
    this.getBranchLocations();
    this.getprobation();
    this.remoteLoginChange();
    this.getWorkfromhomeManager();
    this.onboardingForm.get('status')?.setValue(this.empinfo.empstatus);
    //this.onboardingForm.get('dateOfJoining')?.setValue(this.empinfo?.);
  }

  initializeForm(): void {
    this.onboardingForm = this.fb.group({
      status: ['', Validators.required],
     
      dateOfJoining: ['', Validators.required],
      branchLocation: ['', Validators.required],
      probationEndDate: ['', Validators.required],
      probationStatus: ['', Validators.required],
      noticePeriodStatus: ['', Validators.required],
      backgroundCheckStatus: ['', Validators.required],
      salaryHold: ['', Validators.required],
      pf: ['', Validators.required],
      esic: ['', Validators.required],
      pt: ['', Validators.required],
      totalExperience: ['', Validators.required],
      remoteLogin: ['', Validators.required],
      workLocation: ['', Validators.required],
      wfhmanger: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.onboardingForm.valid) {
      console.log('Form Submitted:', this.onboardingForm.value);
    } else {
      console.error('Form is invalid');
    }
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
        this.Manager = data.getUserWithRoleNames.map((user: { firstName: any; middleName: any; lastName: any; userId: any;fusionEmpId:any }) => ({
          ...user,
          name: ` ${user.fusionEmpId ?? ''} -${user.firstName} ${user.middleName ?? ''} ${user.lastName ?? ''}`.trim(),
          value: user.userId // or user.employeeId or any unique identifier you want to bind
        }));
        console.log(this.Manager);
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        // Handle error appropriately, e.g., show error message to the user
      }
    });
  }
}

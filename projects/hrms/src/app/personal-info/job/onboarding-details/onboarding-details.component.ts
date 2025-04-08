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
  constructor(private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService, private modalService: NgbModal) { }

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
        this.previousEmpData = JSON.parse(JSON.stringify(data));
        this.empdata = data as Ipersonal;
        const dateOfJoining = this.empdata.dateOfJoining
          ? new Date(this.empdata.dateOfJoining).toISOString().split('T')[0]
          : null;

        const matchedStatus = this.Statusdetails.find(
          (s: { statusname: string }) =>
            s.statusname.toLowerCase() === this.empdata.empstatus?.toLowerCase()
        );


        const matchedBranchLocation = this.branchLocations.find(
          (b: any) => b.branchCode === this.empdata.branchCode
        );

        const matchedProbationStatus = this.probation.find(
          (p) => p.probationstatus1 === this.empdata.probationStatus
        );

        const matchedBackgroundStatus = this.backgroundDetails.find(
          (b) => b.backgroundcheckstatus1 === this.empdata.bgc
        );
        this.onboardingForm.patchValue({

          status: matchedStatus,

          dateOfJoining: dateOfJoining || this.empdata.dateOfJoining,
          branchLocation: this.empdata.branchCode || matchedBranchLocation,
          probationEndDate: matchedBranchLocation || '',
          probationStatus: matchedProbationStatus || '',

          backgroundCheckStatus: matchedBackgroundStatus,
          noticePeriodStatus: this.empdata.noticePeriod || '',
          salaryHold: this.empdata.issalaryhold ?? false,
          pf: this.empdata.pf ?? false,
          esic: this.empdata.esic ?? false,
          pt: this.empdata.pt ?? false,
          totalExperience: this.empdata.totalYearsOfExperience || '',
          remoteLogin: this.empdata.allowWFH ?? false,
          workLocation: this.empdata.workLocation || '',

        });
      },
      error: (err: any) => {
        console.log(err);
      }
    });
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
      status: formData.status.statusname,
      dateOfJoining: formData.dateOfJoining,
      branchCode: formData.branchLocation,
      probationEndDate: formData.probationEndDate,
      probationStatus: formData.probationStatus.probationstatus1,
      noticePeriodStatus: formData.noticePeriodStatus,
      backgroundCheckStatus: formData.backgroundCheckStatus.backgroundcheckstatus1,
      salaryHold: formData.salaryHold,
      pf: formData.pf,
      esic: formData.esic,
      pt: formData.pt,
      totalYearsOfExperience: formData.totalExperience,
      remoteLogin: formData.remoteLogin,
      workLocation: formData.workLocation,
      wfhManagerId: this.selectedEmployeeId,
      empstatus: "Active",
      createdAt: currentDate,
      updatedAt: currentDate,


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



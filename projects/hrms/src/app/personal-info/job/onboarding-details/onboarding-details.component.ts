import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { IBranchLocation, IStatus } from '../../../Interfaces/personal-modal';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { IProbation } from '../../../Interfaces/job-model';

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
  branchLocations = [] as IBranchLocation[] 
  showButtons() {
    this.buttons = !this.buttons
  }
  onboardingForm!: FormGroup;

  constructor( private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getStatus();
   // this.getEmployeeId();
    this.initializeForm();
    this.getBranchLocations();
    this.getprobation();
    this.onboardingForm.get('status')?.setValue(this.empinfo.empstatus);
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
    });
  }

  onSubmit(): void {
    if (this.onboardingForm.valid) {
      console.log('Form Submitted:', this.onboardingForm.value);
    } else {
      console.error('Form is invalid');
    }
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
}

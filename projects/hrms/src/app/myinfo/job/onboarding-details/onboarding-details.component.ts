import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IBranchLocation, Ipersonal, IStatus } from '../../../Interfaces/personal-modal';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { IProbation } from '../../../Interfaces/job-model';

@Component({
  selector: 'app-onboarding-details',
  imports: [CommonModule,ReactiveFormsModule,],
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
  empdata: Ipersonal = {} as Ipersonal;
  previousEmpData: Ipersonal = {} as Ipersonal;
  showButtons() {
    this.buttons = !this.buttons
  }
  onboardingForm!: FormGroup;

  constructor( private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getStatus();
    this.getEmployeeId();
    this.initializeForm();
    this.getBranchLocations();
    this.getprobation();
    this.onboardingForm.get('status')?.setValue(this.empinfo.empstatus);
  }

  initializeForm(): void {
    this.onboardingForm = this.fb.group({
      status: [{ value: '', disabled: true }, ],
      trainingDuration: [{ value: '', disabled: true } ],
      trainingEndDate: [{ value: '', disabled: true } ],
      dateOfJoining: [{ value: '', disabled: true }],
      branchLocation: [{ value: '', disabled: true } ],
      probationEndDate: [{ value: '', disabled: true }],
      probationStatus:  [{ value: '', disabled: true } ],
      noticePeriodStatus:  [{ value: '', disabled: true } ],
      backgroundCheckStatus:  [{ value: '', disabled: true } ],
      salaryHold: [{ value: '', disabled: true } ],
      pf: [{ value: '', disabled: true } ],
      esic: [{ value: '', disabled: true } ],
      pt:  [{ value: '', disabled: true } ],
      totalExperience:  [{ value: '', disabled: true } ],
      remoteLogin:  [{ value: '', disabled: true } ],
      workLocation:  [{ value: '', disabled: true } ],
    });
  }

  onSubmit(): void {
    if (this.onboardingForm.valid) {
      console.log('Form Submitted:', this.onboardingForm.value);
    } else {
      console.error('Form is invalid');
    }
  }
  formatDateToLocal(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

    getEmployeeId(): void {
      const employeeId = parseInt(this.empinfo.employeeId);
      console.log(this.empinfo);
  
      this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
        next: (data: any) => {
          console.log(data);
          this.previousEmpData = JSON.parse(JSON.stringify(data));
          this.empdata = data as Ipersonal;
          const dateOfJoining = this.formatDateToLocal(this.empdata.dateOfJoining) || '';
          const trainingEndDate = this.formatDateToLocal(this.empdata.trainingEndDate) || '';
          
          this.onboardingForm.patchValue({
            status: this.empdata.empstatus,
            trainingDuration: this.empdata.trainingDuration || '', 
            trainingEndDate: this.empdata.trainingEndDate || '', 
            dateOfJoining:dateOfJoining || '', 
            branchLocation: this.empdata.branchCode || '', 
            probationEndDate: this.empdata.probationEndDate || '', 
            probationStatus: this.empdata.probationStatus || '', 
            noticePeriodStatus: this.empdata.noticePeriod || '',
            backgroundCheckStatus: this.empdata.backgroundCheckStatus , // Map boolean to string
            salaryHold: this.empdata.issalaryhold ? 'Yes' : 'No', // Map boolean to string
            pf: this.empdata.pf ? 'Yes' : 'No', // Map boolean to string
            esic: this.empdata.esic ? 'Yes' : 'No', 
            pt: this.empdata.pt ? 'Yes' : 'No', // Map boolean to string
            totalExperience: this.empdata.totalYearsOfExperience || '', // Default to empty if undefined
            remoteLogin: this.empdata.allowWFH ? 'Allowed' : 'Not Allowed', // Map boolean to string
            workLocation: this.empdata.workLocation || '', // Default to empty if undefined
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

    ngOnDestroy(): void {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }
}

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { IGender, IMarital, ITitle } from '../../../Interfaces/personal-modal';
import { OnboardingRequestComponent } from "../../onboarding-request/onboarding-request.component";


@Component({
  selector: 'app-basic-info',
  imports: [CommonModule, ReactiveFormsModule, Select, OnboardingRequestComponent],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss'
})
export class BasicInfoComponent {
  basicInfoForm!: FormGroup;
  subscription!:Subscription
  empinfo:any
  bloodGroups = [
    { name: 'A+' },
    { name: 'A-' },
    { name: 'B+' },
    { name: 'B-' },
    { name: 'AB+' },
    { name: 'AB-' },
    { name: 'O+' },
    { name: 'O-' }
  ];
  Gender:IGender[]=[];
  Titledetails :ITitle[]=[];
  Maritaldetails:IMarital[]=[];
  buttons=false
  constructor( private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    console.log(this.empinfo);
    this.initializeForm();
    this.getEmployeeId();
    this.getGender()
    this.getMaritaldetails()
    this.getTitle()
    this.basicInfoForm.disable();
  }
 
  initializeForm(): void {
    this.basicInfoForm = this.fb.group({
      employeeId: ['', Validators.required],
      salutation: [null, Validators.required],
      firstName: ['', Validators.required],
      middleName: [''],
      lastName: ['', Validators.required],
      gender: [null, Validators.required],
      dob: ['', Validators.required],
      bloodGroup: [null, Validators.required],
      maritalStatus: [null, Validators.required],
    });
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
       this.empinfo = data;
       this.patchForm(data);
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  patchForm(data: any): void {
    
    this.basicInfoForm.patchValue({
      employeeId: data.employeeId,
      salutation: data.title,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      gender: this.Gender.find((item: any) => item.genderName === data.gender),
      dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
      bloodGroup: this.bloodGroups.find((item: any) => item.name === data.bloodGroup),
      maritalstatus1:this.Maritaldetails.find((item: any) => item.maritalstatus1 === data.maritalStatus),
    });
    console.log(this.basicInfoForm.value);
    
  }

  updateBasicInfo(): void {
    const formValue = this.basicInfoForm.value;
    console.log(formValue);
    
    const updatePayload = {
      employeeId: formValue.employeeId,
      title: formValue.salutation || null,
      firstName: formValue.firstName,
      middleName: formValue.middleName,
      lastName: formValue.lastName,
      gender: formValue.gender.genderName || null,
      dob: formValue.dob,
      bloodGroup: formValue.bloodGroup.name|| null,
      maritalStatus: formValue.maritalStatus || null,
      empStatus: 'Active',
    };
    console.log(updatePayload);
    
    this.subscription = this.http
        .postdata(`Employeedata/UPDATER`, updatePayload)
        .subscribe({
          next: (data: any) => {
           this.conformationPopup.openSuccessModal('Basic Information Updated Successfully', );
           this.getEmployeeId();
           this.basicInfoForm.disable();
            console.log('Data updated successfully:', data);
          },
          error: (reason: any) => {
              console.log(reason);
              
          },
        });
  }

  getGender() {
    this.subscription = this.http.getData('gender').subscribe({
      next: (data: any) => {
        this.Gender = data as IGender[];
      },
    });
  }
  getTitle() {
    this.subscription = this.http.getData('Title').subscribe({
      next: (data: any) => {
        this.Titledetails = data as ITitle[];
      },
    });
  }
  getMaritaldetails() {
    this.subscription = this.http.getData('Maritalstatus').subscribe({
      next: (data: any) => {
        this.Maritaldetails = data as IMarital[];
      },
    });
  }

  showButtons(): void {
    this.buttons = !this.buttons;

    if (this.buttons) {
        // Enable the form when the user clicks "Edit"
        this.basicInfoForm.enable();
    } else {
        // Disable the form when the user clicks "Close"
        this.basicInfoForm.disable();
    }
}
}

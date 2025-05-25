import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { IGender, IMarital, ITitle } from '../../../Interfaces/personal-modal';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { IJob } from '../../../Interfaces/letters-model';
import { RbacService } from '../../../services/rbac.service';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import {Router } from '@angular/router';





@Component({
  selector: 'app-basic-info',
  imports: [CommonModule, ReactiveFormsModule, Select],
  templateUrl: './basic-info.component.html',
  styleUrl: './basic-info.component.scss'
})
export class BasicInfoComponent implements OnInit, OnDestroy {
  basicInfoForm!: FormGroup;
  subscription!: Subscription
  salutationValidationcheck: boolean = false
  empinfo = {} as IJob;
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
  Gender: IGender[] = [];
  titledetails: ITitle[] = [];
  Maritaldetails: IMarital[] = [];
  empyployeedata = {} as any;
  buttons = false
  dateofbirth: any
  changeingdob: any;
  currentdata=new Date()
  constructor(private modalService: NgbModal, private fb: FormBuilder,
    public formValidation: FormValidationService,
   
    private conformationPopup: OpenModalService, private http: HttpService, public rbac: RbacService, public permission: AccessForEmployeeinfoService, private router: Router,) { }

  ngOnInit(): void {

    this.getEmpInfoFromRoute();
    this.initializeForm();
    this.getGender();
    this.getMaritaldetails();
    this.getTitle();
    this.basicInfoForm.disable();
  


    this.basicInfoForm.get('dob')?.valueChanges.subscribe((data) => {
      console.log(data)
      this.empyployeedata.dob = null
      this.changeingdob = data
    });

  }

  canAccessfield(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permission.canAccessField(action, permission);
  }
  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;

    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getEmployeeId();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getEmployeeId();
    }
  }

  initializeForm(): void {
    this.basicInfoForm = this.fb.group({
      employeeId: [{ value: null, disabled: true }, Validators.required],
      salutation: [   null, Validators.required],
      firstName: [null, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      middleName: [null, [Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      lastName: [null, [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,29}$')]],
      gender: [null, Validators.required],
      dob: [null, [Validators.required, this.validateAge.bind(this)]],
      bloodGroup: [null],
      maritalStatus: [null, Validators.required],
      marriageDate: [null],
    });
 
  }

  validateAge(control: AbstractControl): { [key: string]: boolean } | null {
    const dob = control.value;
    if (dob) {
      const currentDate = new Date();
      const birthDate = new Date(dob);
      let age = currentDate.getFullYear() - birthDate.getFullYear();
      const monthDiff = currentDate.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && currentDate.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      if (age < 18 || age > 75) {
        return { invalidAge: true }; // Return an error object if age is invalid
      }
    }
    return null; // Return null if validation passes
  }

  onsalutationvalidation(): void {
    console.log("CALL")
    const gender = this.basicInfoForm.get('gender')?.value
    console.log(gender);
    
    const title = this.basicInfoForm.get('salutation')?.value?.titlename;
    console.log(title)

    const genderLower = typeof gender === 'string' ? gender.toLowerCase() : '';
    const titleLower = typeof title === 'string' ? title.toLowerCase() : '';

    if (
      (genderLower === 'male' && titleLower === 'mr.') ||
      (genderLower === 'female' && ['ms.', 'miss.', 'mrs.'].includes(titleLower)) ||
      ((genderLower === 'other' || genderLower === 'others') && (titleLower === 'others.' || titleLower === 'other.')) ||
      ((genderLower === 'male' || genderLower === 'female') && (titleLower == null || titleLower === ''))
    ) {
      this.salutationValidationcheck = false; // Valid combination
    } else {
      this.salutationValidationcheck = true; // Invalid combination
      console.log(this.salutationValidationcheck)
    }
  }


  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empyployeedata = data;
        this.patchForm(data);
        this.dateofbirth = this.formatDateToLocal(this.empyployeedata.dob)
        localStorage.setItem('rightlyHrUserData', JSON.stringify(data));
        this.changemaritalstatus();
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  getdateofbirth(): string | null {
    const startDateValue = this.formatDateToLocal(this.empyployeedata.dob) || this.formatDateToLocal(this.basicInfoForm.get('dob')?.value);
    if (startDateValue) {
      const startDate = new Date(startDateValue);
      startDate.setDate(startDate.getDate() + 1); // Add one day to the start date
      return startDate.toISOString().split('T')[0]; // Return the date in 'YYYY-MM-DD' format
    }
    return null;
  }
  // Helper method to format a date to 'YYYY-MM-DD'
  formatDateToLocal(date: string | null): string | null {
    if (!date) return null;
    const d = new Date(date);
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  }

  patchForm(data: any): void {
    console.log('data', data)
    this.basicInfoForm.patchValue({
      employeeId: data.fusionEmpId,
      fusionEmpId: data.fusionEmpId,
      salutation: this.titledetails.find((item: any) => item.titlename === data.title) || data.title,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      gender: data.gender,
      marriageDate: this.formatDateToLocal(data.marriedDate) || null,
      dob: this.formatDateToLocal(data.dob),
      bloodGroup: this.bloodGroups.find((item: any) => item.name === data.bloodGroup),
      maritalStatus: this.Maritaldetails.find(((item: any) => item.maritalstatus1 === data.maritalStatus)) || data.maritalStatus,
    });
   
  }

  updateBasicInfo(): void {
    const formValue = this.basicInfoForm.value;
    console.log(formValue);


    const updatePayload = {
      ...this.empyployeedata,
      employeeId: this.empinfo.employeeId,
      title: formValue.salutation.titlename,
      firstName: formValue.firstName,
      middleName: formValue.middleName,
      lastName: formValue.lastName,
      gender: formValue.gender,
      dob: formValue.dob,
      bloodGroup: formValue.bloodGroup?.name,
      maritalStatus: formValue.maritalStatus?.maritalstatus1,

      marriedDate: formValue.marriageDate,
    };


    this.subscription = this.http
      .postdata(`Employeedata/UPDATER`, updatePayload)
      .subscribe({
        next: (data: any) => {
          if (data.statusCode === 200) {
            // Success case
            this.conformationPopup.openSuccessModal('Basic Information Updated Successfully');
            this.getEmployeeId();
            this.http.setBasicDetails();
            this.basicInfoForm.disable();
            console.log('Data updated successfully:', data);
            this.buttons = !this.buttons;
          } else if (data.statusCode === 409) {

            console.log('Conflict:', data.message);
            this.conformationPopup.openErrorModal(data.message);
            this.patchForm(this.empyployeedata);
          }
        },
        error: (reason: any) => {

          this.conformationPopup.openErrorModal(reason.error.message || 'Basic Info update failed')
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
  // Fetch titles from the API
  getTitle() {
    this.subscription = this.http.getData('Title').subscribe({
      next: (data: any) => {
        this.titledetails = data as ITitle[];
      },
    });
  }
  // Fetch marital status from the API
  getMaritaldetails() {
    this.subscription = this.http.getData('Maritalstatus').subscribe({
      next: (data: any) => {
        this.Maritaldetails = data as IMarital[];
      },
    });
  }

  changemaritalstatus(): void {
    const maritalStatus = this.basicInfoForm.get('maritalStatus')?.value?.maritalstatus1 || this.basicInfoForm.get('maritalStatus')?.value || this.empyployeedata.maritalStatus;

    console.log('Marital Status:', maritalStatus);

    if (maritalStatus === 'Married') {
      // Add the required validator to the marriageDate field
      this.basicInfoForm.get('marriageDate')?.setValidators([Validators.required]);
    } else {
      // Clear the validators if marital status is not "Married"
      this.basicInfoForm.get('marriageDate')?.clearValidators();
      this.basicInfoForm.get('marriageDate')?.setValue(null); // Reset the marriage date field
    }

    // Update the validation state of the marriageDate field
    this.basicInfoForm.get('marriageDate')?.updateValueAndValidity();
  }

  showButtons(): void {
    this.buttons = !this.buttons;
  
    if (this.buttons) {
      this.basicInfoForm.enable();
      this.basicInfoForm.get('employeeId')?.disable();

    } else {
      this.basicInfoForm.get('employeeId')?.disable();
      this.basicInfoForm.disable();
      this.basicInfoForm.reset();
      this.getEmployeeId();
    }
  }
  

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
import { CommonModule, formatDate } from '@angular/common';
import { ChangeDetectorRef, Component, effect, Input, OnInit, signal, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { single, Subscription } from 'rxjs';
import { IAddress, IGender, IJobdetails, Ipersonal, ITitle } from '../../models/personal-details.model';
import { HttpService } from '../../http-services/http.service';
import { BnNgIdleService } from 'bn-ng-idle';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { IphoneNumberData } from '../../models/mobilenumber.model';
@Component({
  selector: 'app-personal-details',
  imports: [CommonModule, Select, ReactiveFormsModule, NgxCountriesDropdownModule],
  templateUrl: './personal-details.component.html',
  styleUrl: './personal-details.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class PersonalDetailsComponent implements OnInit {
  personalDetailsForm!: FormGroup;
  subscription!: Subscription;
  Gender = [] as IGender[];
  titleDetails = [] as ITitle[]
  prospectiveEmpData = {} as any;
  employeeData = {} as any;
  postAddress = {} as any;
  postPermanentAddress = {} as any;
  jobdetails = [] as any;
  isChecked: boolean = false;
  currentAddress = {} as IAddress;
  permanentAddress = {} as IAddress;
  identityDetails = {} as any;
  @ViewChild('success') success: any;
  selectedDialCode: any;
  formattedPhoneNumber: string = '';
  placeholderPhoneNumber: string = '';
  spinnerLoader = false;
  selectedCountryCode = signal<string>('');
  selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true,
  };
  mobileNumberData: IphoneNumberData | null = null;
  bloodGroups = [
    { name: 'A+', value: 'A+' },
    { name: 'A-', value: 'A-' },
    { name: 'B+', value: 'B+' },
    { name: 'B-', value: 'B-' },
    { name: 'AB+', value: 'AB+' },
    { name: 'AB-', value: 'AB-' },
    { name: 'O+', value: 'O+' },
    { name: 'O-', value: 'O-' }
  ];

  constructor(private router: Router, private modalService: NgbModal, private readonly fb: FormBuilder,
    private http: HttpService, private bnIdle: BnNgIdleService) {
      effect(() => {
       this.selectedCountryCode.set(this.selectedDialCode);
      })
     }

  ngOnInit(): void {
    this.bnIdle.startWatching(1600).subscribe((isTimeOut: boolean) => {
      if (isTimeOut) {
        localStorage.removeItem('prospectiveusertoken')
        this.router.navigate([''], { replaceUrl: true });
        this.bnIdle.stopTimer();
      }
    })
    this.prospectiveEmpData = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}')
    this.getprospectivempdata()
    this.initializePersonalForm();
    this.getGender();;
    this.getJobDetails();
    this.getTitle();
  }

  // Prospective Employee Data
  getprospectivempdata() {
    let employeeId = parseInt(this.prospectiveEmpData.employeeId);
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.employeeData = data as Ipersonal; 
      this.selectedCountryCode.set(this.employeeData?.mobilePhoneCountryCode);
      console.log(this.selectedCountryCode);
        this.patchForm();
      },
      error: (reason: any) => {
        console.log(reason);
        if (reason.status == 401) {
          localStorage.clear();
          this.router.navigate(['']);
        }
      }
    });
  }

  //function to get jobdetails
  getJobDetails() {
    let EmployeeId = parseInt(this.prospectiveEmpData.employeeId);
    this.subscription = this.http.getData(`PreonboardingJobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.jobdetails = data[0] as IJobdetails[];
        console.log(this.jobdetails);
      }
    })
  }

  //function to get the gender details in the dropdown 
  getGender() {
    this.subscription = this.http.getData("PreonboardingGender").subscribe({
      next: (data: any) => {
        this.Gender = data as IGender[];
      }
    })
  }

  //function to get the salutaion details in dropdown 
  getTitle() {
    this.subscription = this.http.getData("PreonboardingTitle").subscribe({
      next: (data: any) => {
        this.titleDetails = data as ITitle[]
      }
    })
  }

  initializePersonalForm() {
    let loggedInUser = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}')
    this.personalDetailsForm = this.fb.group({
      firstName: [null, [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      middleName: [null],
      lastName: [null, [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      gender: [null, Validators.required],
      salutation: [null, Validators.required],
      phonenumber: [null, [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dob: [null, Validators.required],
      bloodGroup: [null],
      location: [{ value: null, disabled: true }, Validators.required],
      subLocation: [{ value: null, disabled: true }, Validators.required],
      designation: [{ value: null, disabled: true }, Validators.required],
      personalEmail: [{ value: null, disabled: true }, Validators.required],
      currentAddress: this.fb.group({
        empId: parseInt(loggedInUser.employeeId),
        type: 'C',
        addressLine1: [null, Validators.required],
        addressLine2: [null, Validators.required],
        city: [null, Validators.required],
        state: [null, Validators.required],
        country: [null, Validators.required],
        zipCode: [null, Validators.required],
      }),
      permanentAddress: this.fb.group({
        empId: parseInt(loggedInUser.employeeId),
        type: 'P',
        addressLine1: [null, Validators.required],
        addressLine2: [null, Validators.required],
        city: [null, Validators.required],
        state: [null, Validators.required],
        country: [null, Validators.required],
        zipCode: [null, Validators.required],
      }),
    });
  }
 
  patchForm() {
    const dateOfBirth = this.employeeData.dob ? this.formatDate(this.employeeData.dob) : null;
    this.personalDetailsForm.patchValue({
      firstName: this.employeeData.firstName,
      middleName: this.employeeData.middleName,
      lastName: this.employeeData.lastName,
      gender: this.employeeData.gender,
      salutation: this.employeeData.title,
      phonenumber: this.employeeData.contactnumber,
      dob: dateOfBirth,
      bloodGroup: this.employeeData.bloodGroup,
      location: this.jobdetails.lopcation,
      subLocation: this.jobdetails.subLocation,
      designation: this.jobdetails.jobRole,
      personalEmail: this.employeeData.emailaddress,
      currentAddress: this.employeeData?.employeeAddresses?.find((address:IAddress)=>address?.type?.toLowerCase() == 'c'),
      permanentAddress: this.employeeData?.employeeAddresses?.find((address:IAddress)=>address?.type?.toLowerCase() == 'p')
    }); 

  }
  // Copy Current Address to Permanent Address
  copyCurrentAddress(event: any) {
    if (event.target.checked) {
      const currentAddress = this.personalDetailsForm.get('currentAddress')?.value;
      this.personalDetailsForm.patchValue({
        permanentAddress: {
          addressLine1: currentAddress?.addressLine1 || null,
          addressLine2: currentAddress?.addressLine2 || null,
          city: currentAddress?.city || null,
          state: currentAddress?.state || null,
          country: currentAddress?.country || null,
          zipCode: currentAddress?.zipCode || null,
        }
      });
    }
  }

  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if ((charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122) && charCode !== 32) {
      return false;
    }
    return true;
  }

  //function formate the data 
  formatDate(date: Date): string {
    return formatDate(date, 'yyyy-MM-dd', 'en-US');
  }

  // Submit Form
  onSubmit() {
    console.log(this.employeeData);
    if (!this.personalDetailsForm.invalid) {
      this.subscription = this.http.postData(`PreonboardingEmployeedata/UPDATER`, this.employeeData).subscribe({
        next: (data: any) => {
          console.log(data);
          if (data.statusCode === 409) {
            alert(`${data.message}`);
          } else if (data.statusCode === 200) {
            this.postEmployeeAddresses();
          }
        },
        error: (errorReason: any) => {
          console.error(errorReason);
          if (errorReason.status === 400) {
            alert(`${errorReason.error?.message || 'Bad request'}`);
          }
        }
      });
    } else {
      this.personalDetailsForm.markAllAsTouched(); // Mark all fields as touched to trigger validation
    }
  }

  postEmployeeAddresses() {
    let payload = {
      employeeAddresses: [  {
        ...this.personalDetailsForm.get('currentAddress')?.value,
        zipCode: String(this.personalDetailsForm.get('currentAddress')?.value?.zipCode)
      },
      {
        ...this.personalDetailsForm.get('permanentAddress')?.value,
        zipCode: String(this.personalDetailsForm.get('permanentAddress')?.value?.zipCode)
      }]
    }
    this.subscription = this.http.postData("PreonboardingEmployeeAddress", payload).subscribe({
      next: (data: any) => {
        console.log(data);
        this.router.navigate(['/document']);
      },
      error: reason => console.log(reason),
      complete: () => {
        
      }
    })
  }

  // mobile number functions
 
  onCountryChange(country: any) {
    console.log(country);
    this.selectedDialCode = country.code;
    this.personalDetailsForm.get('phonenumber')?.setValidators([Validators.required, this.phoneNumberValidator()]);
    this.personalDetailsForm.get('phonenumber')?.updateValueAndValidity();
    this.employeeData.mobilePhoneCountryCode = country.code; 
    console.log(this.employeeData.mobilePhoneCountryCode);
  }

  formatPhoneNumber(value: any) {
    if (!this.selectedDialCode || !value) return value;
    const stringValue = String(value); // Make sure it's a string
    const phoneNumber = parsePhoneNumberFromString(stringValue, this.selectedDialCode);
    if (phoneNumber && phoneNumber.isValid()) {
      this.formattedPhoneNumber = phoneNumber.formatInternational();
      return phoneNumber.formatNational();
    }
    return stringValue;
  }

  phoneNumberValidator() {
    return (control: AbstractControl) => {
      const value = String(control.value);
      if (!this.selectedDialCode || !value) {
        return null;
      }
      const phoneNumber = parsePhoneNumberFromString(value, this.selectedDialCode);
      if (phoneNumber && phoneNumber.isValid()) {
        return null;
      } else {
        return { invalidPhoneNumber: true };
      }
    };
  }

  close() {
    this.modalService.dismissAll();
  }

  navigateDocumentUpload() {
    this.router.navigate(['/document']);
  }
}
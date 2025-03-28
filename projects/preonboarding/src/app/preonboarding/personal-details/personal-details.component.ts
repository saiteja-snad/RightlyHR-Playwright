import { CommonModule, formatDate } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
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
  // selectedDialCode: any;
  // formattedPhoneNumber: string = '';
  // placeholderPhoneNumber: string = '';
  // selectedCountryCode: any;
  spinnerLoader = false;
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
    private http: HttpService, private bnIdle: BnNgIdleService) { }

  ngOnInit(): void {
    this.bnIdle.startWatching(1600).subscribe((isTimeOut: boolean) => {
      if (isTimeOut) {
        localStorage.removeItem('prospectiveusertoken')
        this.router.navigate(['/login'], { replaceUrl: true });
        this.bnIdle.stopTimer();
        location.reload();
      }
    })
    this.prospectiveEmpData = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}')
    this.initializePersonalForm();
    this.getprospectivempdata();
    this.getGender();
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
        this.patchForm();
       
      },
      error: (reason: any) => {
        console.log(reason);
        if (reason.status == 401) {
          localStorage.clear();
          this.router.navigate(['login']);
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
        this.patchForm();
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
      firstName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      middleName: [''],
      lastName: ['', [Validators.required, Validators.pattern('^[a-zA-Z]+$')]],
      gender: ['', Validators.required],
      salutation: ['', Validators.required],
      phonenumber: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      dob: ['', Validators.required],
      bloodGroup: [''],
      location: [{ value: '', disabled: true }, Validators.required],
      subLocation: [{ value: '', disabled: true }, Validators.required],
      designation: [{ value: '', disabled: true }, Validators.required],
      personalEmail: [{ value: '', disabled: true }, Validators.required],
      currentAddress: this.fb.group({
        empId: parseInt(loggedInUser.employeeId),
        type: 'C',
        addressLine1: ['', Validators.required],
        addressLine2: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        zipCode: ['', Validators.required],
      }),
      permanentAddress: this.fb.group({
        empId: parseInt(loggedInUser.employeeId),
        type: 'P',
        addressLine1: ['', Validators.required],
        addressLine2: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['', Validators.required],
        zipCode: ['', Validators.required],
      }),
    });
  }

  patchForm() {
    const dateOfBirth = this.formatDate(this.employeeData.dob)
    console.log(this.employeeData)
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
      currentAddress: this.employeeData.employeeAddresses.find((address:IAddress)=>address.type.toLowerCase() == 'c'),
      permanentAddress: this.employeeData.employeeAddresses.find((address:IAddress)=>address.type.toLowerCase() == 'p')
    });
    console.log(this.personalDetailsForm);
    this.selectedCountryConfig = {
      hideCode: true,  
      hideName: true,  
      dialCode: this.employeeData.mobilePhoneCountryCode, 
    };
    console.log(this.selectedCountryConfig)
  }

  // Copy Current Address to Permanent Address
  copyCurrentAddress(event: any) {
    if (event.target.checked) {
      const currentAddress = this.personalDetailsForm.get('currentAddress')?.value;
      this.personalDetailsForm.patchValue({
        permanentAddress: {
          addressLine1: currentAddress?.addressLine1 || '',
          addressLine2: currentAddress?.addressLine2 || '',
          city: currentAddress?.city || '',
          state: currentAddress?.state || '',
          country: currentAddress?.country || '',
          zipCode: currentAddress?.zipCode || '',
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
      let formEmployeeData = this.personalDetailsForm.value;
      const payload = {
        firstName: formEmployeeData.firstName,
        lastName: formEmployeeData.lastName,
        empstatus: this.employeeData.empstatus,
        emailaddress: this.employeeData.emailaddress,
        wfhManagerId: this.employeeData.wfhManagerId,
        password: this.employeeData.password,
        isManager: this.employeeData.isManager,
        employeeId: this.employeeData.employeeId,
        issalaryhold: this.employeeData.issalaryhold,
        pf: this.employeeData.pf,
        esic: this.employeeData.esic,
        pt: this.employeeData.pt,
        insurance: this.employeeData.insurance,
        expirationTime: this.employeeData.expirationTime,
        middleName: formEmployeeData.middleName,
        substatus: this.employeeData.substatus,
        bgc: this.employeeData.bgc,
        allowWFH: this.employeeData.allowWFH,
        gender: formEmployeeData.gender,
        dob: formEmployeeData.dob,
        contactnumber: formEmployeeData.phonenumber,
        title: formEmployeeData.salutation,
        // mobilePhoneCountryCode: this.selectedCountryCode,
        bloodGroup: formEmployeeData.bloodGroup,
        generateOffer: false
      }
      console.log(payload)
      this.subscription = this.http.postData(`PreonboardingEmployeedata/UPDATER`, payload).subscribe({
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
      console.log('Form is invalid');
      this.personalDetailsForm.markAllAsTouched(); // Mark all fields as touched to trigger validation
    }
  }

  postEmployeeAddresses() {
    let payload = {
      employeeAddresses: [this.personalDetailsForm.get('currentAddress')?.value, this.personalDetailsForm.get('permanentAddress')?.value]
    }
    this.subscription = this.http.postData("PreonboardingEmployeeAddress", payload).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: reason => console.log(reason),
      complete: () => {
        this.router.navigate(['/document']);
      }
    })
  }

  // mobile number functions
  // onCountryChange(country: any) {
  //   this.selectedCountryCode = country.dialling_code;
  //   this.selectedDialCode = country.code;
  //   this.updatePlaceholder();
  //   this.personalDetailsForm.get('phonenumber')?.setValidators([Validators.required, this.phoneNumberValidator()]);
  //   this.personalDetailsForm.get('phonenumber')?.updateValueAndValidity();
  // }

  // formatPhoneNumber(value: string): string {
  //   if (!this.selectedDialCode || !value) return value;
  //   const phoneNumber = parsePhoneNumberFromString(value, this.selectedDialCode);
  //   if (phoneNumber && phoneNumber.isValid()) {
  //     this.formattedPhoneNumber = phoneNumber.formatInternational();
  //     return phoneNumber.formatNational();
  //   }
  //   return value;
  // }

  // phoneNumberValidator() {
  //   return (control: AbstractControl) => {
  //     const value = control.value;
  //     if (!this.selectedDialCode || !value) {
  //       return null;
  //     }
  //     const phoneNumber = parsePhoneNumberFromString(value, this.selectedDialCode);
  //     if (phoneNumber && phoneNumber.isValid()) {
  //       return null;
  //     } else {
  //       return { invalidPhoneNumber: true };
  //     }
  //   };
  // }

  // updatePlaceholder() {
  //   if (this.selectedDialCode) {
  //     const samplePhoneNumber = `+${this.selectedDialCode}1234567890`;
  //     try {
  //       const phoneNumber = parsePhoneNumberFromString(samplePhoneNumber, this.selectedDialCode);
  //       if (phoneNumber && phoneNumber.isValid()) {
  //         this.placeholderPhoneNumber = phoneNumber.formatNational();
  //       } else {
  //         this.placeholderPhoneNumber = '';
  //       }
  //     } catch (error) {
  //       console.error('Error parsing phone number:', error);
  //       this.placeholderPhoneNumber = '';
  //     }
  //   }
  // }

  close() {
    this.modalService.dismissAll();
  }

  navigateDocumentUpload() {
    this.router.navigate(['/document']);
  }
}
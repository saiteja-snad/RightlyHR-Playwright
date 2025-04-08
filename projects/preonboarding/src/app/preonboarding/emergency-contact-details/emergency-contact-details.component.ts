import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpService } from '../../http-services/http.service';
import { Ipersonal } from '../../models/personal-details.model';
import { Select } from 'primeng/select';
import { IRelation } from '../../models/emergency.model';
import { IphoneNumberData } from '../../models/mobilenumber.model';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { PopupService } from '../../common-services/popup.service';
@Component({
  selector: 'app-emergency-contact-details',
  imports: [CommonModule, ReactiveFormsModule, Select, NgxCountriesDropdownModule],
  templateUrl: './emergency-contact-details.component.html',
  styleUrl: './emergency-contact-details.component.scss'
})

export class EmergencyContactDetailsComponent {
  subscription!: Subscription;
  empdata = {} as any;
  prosempdata = {} as any;
  Relationdetails = [] as IRelation[];
  contactForm!: FormGroup;
  // mobile number1
  selectedDialCode: any;
  selectedCountryCode: any;
  // mobile number2
  selectedDialCode1: any;
  selectedCountryCode1: any;
  formattedPhoneNumber: string = '';
  placeholderPhoneNumber: string = '';
  spinnerLoader = false;
  selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true,
  };
  mobileNumberData: IphoneNumberData | null = null;

  constructor(private http: HttpService, private router: Router, private modalService: NgbModal, private fb: FormBuilder,
    private openPopup: PopupService) { }

  ngOnInit(): void {
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getRelation();
    this.getempdate();
    this.initializeForm();
  }
  navigateNext() {
    this.router.navigate(['/experience-details']);
  }
  getempdate() {
    let employeeId = parseInt(this.prosempdata.employeeId);
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empdata = data as Ipersonal;
        this.patchForm();
      }
    })
  }

  getRelation() {
    this.subscription = this.http.getData("PreonboardingRelationShip").subscribe({
      next: (data: any) => {
        this.Relationdetails = data as IRelation[];
      }
    })
  }

  initializeForm() {
    this.contactForm = this.fb.group({
      contact1: this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', Validators.required],
        relationship: ['', Validators.required],
      }),
      contact2: this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', Validators.required],
        relationship: ['', Validators.required],
      })
    });
    this.selectedCountryCode = this.empdata.emergencycode;
    this.selectedDialCode = this.empdata.emergencycode;
    this.selectedCountryCode1 = this.empdata.emergencycode1;
    this.selectedDialCode1 = this.empdata.emergencycode1;
  }

  patchForm() {
    this.contactForm.patchValue({
      contact1: {
        name: this.empdata.emergencyName,
        email: this.empdata.emailId,
        mobile: this.empdata.emergencynumber,
        relationship: this.empdata.relationShip
      },
      contact2: {
        name: this.empdata.emergencyName1,
        email: this.empdata.emergencyEmail1,
        mobile: this.empdata.emergencyNumber1,
        relationship: this.empdata.relationship1
      }
    });
  }

  updateEmpDetails() {
    if (this.contactForm.valid) {
      let formEmployeeData = this.contactForm.value;
      const payload = {
        firstName: this.empdata.firstName,
        lastName: this.empdata.lastName,
        empstatus: this.empdata.empstatus,
        emailaddress: this.empdata.emailaddress,
        wfhManagerId: this.empdata.wfhManagerId,
        password: this.empdata.password,
        isManager: this.empdata.isManager,
        employeeId: this.empdata.employeeId,
        issalaryhold: this.empdata.issalaryhold,
        pf: this.empdata.pf,
        esic: this.empdata.esic,
        pt: this.empdata.pt,
        insurance: this.empdata.insurance,
        expirationTime: this.empdata.expirationTime,
        middleName: this.empdata.middleName,
        substatus: this.empdata.substatus,
        bgc: this.empdata.bgc,
        allowWFH: this.empdata.allowWFH,
        gender: this.empdata.gender,
        dob: this.empdata.dob,
        contactnumber: this.empdata.contactnumber,
        title: this.empdata.title,
        mobilePhoneCountryCode: this.empdata.mobilePhoneCountryCode,
        bloodGroup: this.empdata.bloodGroup,
        emergencyName: formEmployeeData.contact1.name,
        emailId: formEmployeeData.contact1.email,
        emergencycode: formEmployeeData.contact1.selectedDialCode,
        emergencynumber: formEmployeeData.contact1.mobile,
        relationShip: formEmployeeData.contact1.relationship,
        emergencyName1: formEmployeeData.contact2.name,
        emergencyEmail1: formEmployeeData.contact2.email,
        emergencycode1: formEmployeeData.contact2.selectedDialCode1,
        emergencyNumber1: formEmployeeData.contact2.mobile,
        relationship1: formEmployeeData.contact2.relationship
      }
      console.log(payload);
      this.subscription = this.http.postData(`PreonboardingEmployeedata/UPDATER`, payload).subscribe({
        next: (data: any) => {
          console.log(data);
          if (data.statusCode === 409) {
            this.openPopup.openError(`${data.message}`);
          }
          else if (data.statusCode === 200) { }
        },
        error: (eroorReason: any) => {
          console.log(eroorReason);
          if (eroorReason.status === 400) {
            this.openPopup.openError(`${eroorReason.message}`);
          }
        },
        complete: () => { }
      })
    }
  }

  // mobile number 1 functions
  onCountryChange(country: any) {
    this.selectedCountryCode = country.dialling_code;
    this.selectedDialCode = country.code;
    this.contactForm.get('contact1.mobile')?.setValidators([Validators.required, this.phoneNumberValidator()]);
    this.contactForm.get('contact1.mobile')?.updateValueAndValidity();
  }

  formatPhoneNumber(value: string): string {
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
      const value = control.value;
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

  // mobile number 2 functions
  onCountryChange1(country: any) {
    this.selectedCountryCode1 = country.dialling_code;
    this.selectedDialCode1 = country.code;
    this.contactForm.get('contact2.mobile')?.setValidators([Validators.required, this.phoneNumberValidator()]);
    this.contactForm.get('contact2.mobile')?.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { OpenModalService } from '../../../services/open-modal.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { IphoneNumberData } from '../../../../../../preonboarding/src/app/models/mobilenumber.model';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-contact-details',
  imports: [CommonModule,ReactiveFormsModule,NgxCountriesDropdownModule],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss'
})
export class ContactDetailsComponent implements OnInit,OnDestroy {

  contactForm!: FormGroup;
subscription!:Subscription
  empinfo:any
  employedata:any
  buttons= false;
 
      selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
        hideCode: true,
        hideName: true
      };
      countryListConfig = {
        hideCode: true,
      };
      mobileNumberData: IphoneNumberData | null = null;
      selectedworkcountrtycode:any
      selectedworkdialcaode:any
      selectedpersonalcountrycode:any
      selectedpersoanldialcode:any
      formattedPhoneNumber: string = '';

  constructor(private modalService: NgbModal,private cd: ChangeDetectorRef, private fb: FormBuilder, private conformationPopup: OpenModalService, public http: HttpService,public rbac: RbacService) { 
    this.http.selectedworkcoutrycode.set(this.selectedworkcountrtycode  ?? '')
    this.http.selectedpersonalnumbercode.set(this.selectedpersonalcountrycode ?? '')
    console.log(this.http.selectedworkcoutrycode)

  }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getEmployeeId();
    this.initializeForm();
    this.contactForm.disable();
  }       

  initializeForm(): void {
    this.contactForm = this.fb.group({
      personalEmail: ['', [Validators.required, Validators.email]], 
      workMail: ['', [Validators.required, Validators.email]], // Required and valid email format
      phoneNumber: ['', [Validators.required, ]], // Required and 10-digit phone number
      workNumber: ['', [Validators.required, ]], // Required and 10-digit phone number
  
    });
    this.selectedworkcountrtycode=this.empinfo.workPhoneCountryCode;
    this.selectedworkdialcaode= this.empinfo.workPhoneCountryCode;
    this.selectedpersonalcountrycode=this.empinfo.mobilePhoneCountryCode;
    this.selectedpersoanldialcode=this.empinfo.mobilePhoneCountryCode;
    console.log(this.selectedworkcountrtycode)

  }



enableForm(): void {
  this.buttons = true;
  this.contactForm.enable();
}

disableForm(): void {
  this.buttons = false;

  this.contactForm.disable();
}
  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
      this.employedata = data;
      this.patchForm(data);
      this.http.selectedworkcoutrycode.set(data.workPhoneCountryCode ?? '')
        this.http.selectedpersonalnumbercode.set(data.mobilePhoneCountryCode ?? '')
        this.cd.detectChanges();
        console.log(this.http.selectedworkcoutrycode)
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  patchForm(data: any): void {   
    this.contactForm.patchValue({
      personalEmail: data.emailaddress || '', // Bind personal email
      workMail: data.workEmail || '',         // Bind work email
      phoneNumber: data.contactnumber || '',  // Bind personal phone number
      workNumber: data.workPhone || '',       // Bind work phone number
    });
  }
  updateAddressInfo(): void {
    const formValue = this.contactForm.value; 

    const cleanPhoneNumber = (phone: any): string => {
      if (!phone) return ''; 
      return String(phone).replace(/\s+/g, '').replace(/-/g, ''); 
    };

    const contactnumber = cleanPhoneNumber(formValue.phoneNumber || this.empinfo.phoneNumber || '');
    const worknumber = cleanPhoneNumber(formValue.workNumber || this.empinfo.workNumber || '');

  const updatePayload = {
    employeeId: this.empinfo.employeeId,
    title: this.empinfo.title || null,
    firstName: this.empinfo.firstName,
    middleName: this.empinfo.middleName,
    lastName: this.empinfo.lastName,
    gender: this.empinfo.gender || null,
    dob: this.empinfo.dob,
    bloodGroup: this.empinfo.bloodGroup || null,
    maritalStatus: this.empinfo.maritalStatus || null,
    empStatus: this.empinfo.empstatus,
    emailaddress: formValue.personalEmail || this.empinfo.personalEmail, 
    workEmail: formValue.workMail || this.empinfo.workMail, 
    contactnumber: contactnumber,
    workPhone:worknumber,
    emergencyName: this.empinfo.emergencyName,
    emailId: this.empinfo.emailId,
    relationShip: this.empinfo.relationShip,
    mobileNumber: this.empinfo.mobileNumber,
    emergencyName1: this.empinfo.emergencyName1,
    emergencyEmail1: this.empinfo.emergencyEmail1,
    emergencyNumber1: this.empinfo.emergencyNumber1,
    relationship1: this.empinfo.relationship1,
    profileUrl : this.empinfo.profileUrl,
    fusionEmpId: this.empinfo.fusionEmpId,
    dateOfJoining: this.empinfo.dateOfJoining,
    branchCode: this.empinfo.branchCode,
    probationEndDate: this.empinfo.probationEndDate,
    probationStatus: this.empinfo.probationStatus,
    noticePeriod: this.empinfo.noticePeriod,
    backgroundCheckStatus: this.empinfo.backgroundCheckStatus,
    issalaryhold:this.empinfo.issalaryhold,
    pf: this.empinfo.pf,
    esic:this.empinfo.esic,
    pt: this.empinfo.pt,
    totalYearsOfExperience: this.empinfo.totalYearsOfExperience,
    allowWFH: this.empinfo.allowWFH,
    workLocation:this.empinfo.workLocation,
    wfhManagerId: this.empinfo.wfhManagerId,
    mobilePhoneCountryCode:  this.selectedpersoanldialcode || this.empinfo.mobilePhoneCountryCode ,
  workPhoneCountryCode: this.selectedworkdialcaode ||  this.empinfo.workPhoneCountryCode 
  };

 
  this.subscription = this.http.postdata(`Employeedata/UPDATER`, updatePayload)
    .subscribe({
      next: (data: any) => {
        console.log('Data updated successfully:', data);
        this.modalService.dismissAll();
        this.contactForm.disable();
        this.buttons = false; // Disable the button after successful update
        this.getEmployeeId(); 
        this.conformationPopup.openSuccessModal('Contact Details updated successfully');
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('Contact Details update failed');
      },
    });
  }

  
  onCountryChangeworknumber(country: any): void {
    // Check if the selected country is actually changing
    if (this.selectedworkdialcaode === country.code) {
      return; // No change, do not apply validators again
    }
  
    // Country has changed - update values
    this.selectedworkcountrtycode = country.dialling_code;
    this.selectedworkdialcaode = country.code;
  
    const contact1PhoneControl = this.contactForm.get('workNumber');
  
    if (country?.code) {
      // Country selected: apply validator
      contact1PhoneControl?.setValidators([this.phoneNumberValidator()]);
    } else {
      // No country selected: remove validators
      contact1PhoneControl?.clearValidators();
    }
  
    contact1PhoneControl?.updateValueAndValidity();
  }
  

  onCountryChangepersonalcode(country: any): void {
    // Only apply validators if the user changes the country
    if (this.selectedpersoanldialcode === country.code) {
      return;
    }
  
    // Country has changed - update values and apply validator
    this.selectedpersonalcountrycode = country.dialling_code;
    this.selectedpersoanldialcode = country.code;
  
    const control = this.contactForm.get('phoneNumber');
  
    control?.setValidators([this.phoneNumberValidator()]);
    control?.updateValueAndValidity();
  }
  

  formatPhoneNumber(value: any): string {
    if (!this.selectedworkdialcaode || !value) return ''; // Return an empty string if value is null/undefined
    const stringValue = String(value); // Ensure the value is converted to a string
    const phoneNumber = parsePhoneNumberFromString(stringValue, this.selectedworkdialcaode);
    if (phoneNumber && phoneNumber.isValid()) {
      this.formattedPhoneNumber = phoneNumber.formatInternational();
      return phoneNumber.formatNational();
    }
    return stringValue; // Return the original value if parsing fails
  }

  phoneNumberValidator() {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!this.selectedworkdialcaode || !value) {
        return null;
      }
  
      const phoneNumber = parsePhoneNumberFromString(String(value), this.selectedworkdialcaode);
  
      if (phoneNumber && phoneNumber.isValid()) {
        return null;
      } else {
        return { invalidPhoneNumber: true };
      }
    };
  }


  showButtons() {
    this.buttons = !this.buttons
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}

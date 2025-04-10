import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, effect, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { IRelation } from '../../../Interfaces/personal-modal';
import { Select } from 'primeng/select';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { IphoneNumberData } from '../../../../../../preonboarding/src/app/models/mobilenumber.model';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { IJob } from '../../../Interfaces/job-model';

@Component({
  selector: 'app-emergency-contact-details',
  imports: [CommonModule, ReactiveFormsModule, Select,NgxCountriesDropdownModule],
  templateUrl: './emergency-contact-details.component.html',
  styleUrl: './emergency-contact-details.component.scss'
})
export class EmergencyContactDetailsComponent {

  subscription!: Subscription
  buttons = false;
  buttons2 = false;
  familyRelations: IRelation[] = [];
  emergencyContactForm!: FormGroup;
  selectedDialCode: any;
  selectedDialCode1: any;
  selectedCountryCode1: any;
  formattedPhoneNumber: string = '';
  selectedCountryCode: any;
    selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
      hideCode: true,
      hideName: true
    };
    countryListConfig = {
      hideCode: true,
    };
    mobileNumberData: IphoneNumberData | null = null;
    empinfo = {} as IJob; 

  constructor(private modalService: NgbModal, private fb: FormBuilder, private cd: ChangeDetectorRef,  public formValidation: FormValidationService, private conformationPopup: OpenModalService, public http: HttpService) { 
    effect(() => {

      this.http.selectedCountryCodeSignal.set(this.selectedCountryCode)
      this.http.selectedCountryCode2Signal.set(this.selectedCountryCode1)
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getEmployeeId();
    this.getFamilyRelations();
    this.initializeForm();
    this.emergencyContactForm.disable(); // Disable the form initially
  }

  initializeForm(): void {
    this.emergencyContactForm = this.fb.group({
      contact1Name: ['', Validators.required],
      contact1Email: ['', [Validators.required, Validators.email]],
      contact1Phone: ['', ],
      contact1Relationship: ['', Validators.required],
      contact2Name: ['', Validators.required],
      contact2Email: ['', [Validators.required, Validators.email]],
      contact2Phone: ['', ],
      contact2Relationship: ['', Validators.required],
    });
    this.selectedCountryCode = this.empinfo.emergencycode;
    this.selectedDialCode = this.empinfo.emergencycode;
    this.selectedCountryCode1 = this.empinfo.emergencycode1;
    this.selectedDialCode1 = this.empinfo.emergencycode1;
  }
  showButtons() {
    this.buttons = !this.buttons
  }
  //employedata
  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empinfo = data;

        this.http.selectedCountryCodeSignal.set(data.emergencycode || '');
        this.http.selectedCountryCode2Signal.set(data.emergencycode1)
        this.cd.detectChanges();
      
        this.patchForm(data);
       
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }
  patchForm(data: any): void {
  
    const contact1Relationship = this.familyRelations.find(
      (relation) => relation.relationship1 === data.relationShip
    ) || null;
  
    const contact2Relationship = this.familyRelations.find(
      (relation) => relation.relationship1 === data.relationship1
    ) || null;


    this.emergencyContactForm.patchValue({
      // Bind first emergency contact country code
      contact1Name: data.emergencyName || '', // Bind first emergency contact name
      contact1Email: data.emailId || '',      // Bind first emergency contact email
      contact1Phone: data.mobileNumber || '', // Bind first emergency contact phone
      contact1Relationship:contact1Relationship || '', // Bind first emergency contact relationship
      contact2Name: data.emergencyName1 || '', // Bind second emergency contact name
      contact2Email: data.emergencyEmail1 || '', // Bind second emergency contact email
      contact2Phone: data.emergencyNumber1 || '', // Bind second emergency contact phone
      contact2Relationship: contact2Relationship  || '', // Bind second emergency contact relationship
    });
    console.log('Selected Dial Code 1:', this.selectedDialCode);
    console.log('Selected Dial Code 2:', this.selectedDialCode1);
  }

  disableForm(): void {
    this.buttons = false;
    this.buttons2 = false;
    this.emergencyContactForm.disable();
    this.getEmployeeId()

  }
  enableForm(): void {
    this.buttons = true;
    this.emergencyContactForm.get('contact1Name')?.enable();
    this.emergencyContactForm.get('contact1Email')?.enable();
    this.emergencyContactForm.get('contact1Phone')?.enable();
    this.emergencyContactForm.get('contact1Relationship')?.enable();
    this.buttons2 = true;
    this.emergencyContactForm.get('contact2Name')?.enable();
    this.emergencyContactForm.get('contact2Email')?.enable();
    this.emergencyContactForm.get('contact2Phone')?.enable();
    this.emergencyContactForm.get('contact2Relationship')?.enable();
  }

 

 
  saveForm(): void {
    const formValue = this.emergencyContactForm.value;
    // Clean and format phone numbers
    const cleanPhoneNumber = (phone: any): string => {
      if (!phone) return ''; 
      return String(phone).replace(/\s+/g, '').replace(/-/g, ''); 
    };

  const contact1Phone = cleanPhoneNumber(formValue.contact1Phone || this.empinfo.mobileNumber || '');
  const contact2Phone = cleanPhoneNumber(formValue.contact2Phone || this.empinfo.emergencyNumber1 || '');
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
      emailaddress: this.empinfo.emailaddress || null,
      workEmail: this.empinfo.workEmail || null,
      contactnumber: this.empinfo.contactnumber || null,
      workPhone: this.empinfo.workPhone || null,
      emergencyName: formValue.contact1Name || this.empinfo.emergencyName,
      emailId: formValue.contact1Email || this.empinfo.emailId,
      emergencycode: this.selectedDialCode,
      emergencycode1: this.selectedDialCode1,
      relationShip: this.emergencyContactForm.get('contact1Relationship')?.value?.relationship1 || this.empinfo.relationShip,
      mobileNumber: contact1Phone ,
      emergencyName1: formValue.contact2Name || this.empinfo.emergencyName1,
      emergencyEmail1: formValue.contact2Email || this.empinfo.emergencyEmail1,
      emergencyNumber1:contact2Phone ,
      relationship1: this.emergencyContactForm.get('contact2Relationship')?.value?.relationship1 || this.empinfo.relationship1,
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
      mobilePhoneCountryCode:this.empinfo.mobilePhoneCountryCode,
      workPhoneCountryCode: this.empinfo.workPhoneCountryCode
    };


    this.subscription = this.http.postdata(`Employeedata/UPDATER`, updatePayload)
      .subscribe({
        next: (data: any) => {
          console.log('Data updated successfully:', data);
          this.modalService.dismissAll();
          this.getEmployeeId()
         this.emergencyContactForm.disable()
          this.conformationPopup.openSuccessModal('Emergency Contact Details updated successfully');
        },
        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal('Emergency Contact Details update failed');
        },
      });
  }


  //get family relations dropdown
  getFamilyRelations() {
    this.subscription = this.http
      .getData('Relationship?isDependent=true')
      .subscribe({
        next: (data: any) => {
          this.familyRelations = data as IRelation[];
        },
      });
  }

  onCountryChange(country: any): void {
    // Check if the selected country is actually changing
    if (this.selectedDialCode === country.code) {
      return; // No change, do not apply validators again
    }
  
    // Country has changed - update values
    this.selectedCountryCode = country.dialling_code;
    this.selectedDialCode = country.code;
  
    const contact1PhoneControl = this.emergencyContactForm.get('contact1Phone');
  
    if (country?.code) {
      // Country selected: apply validator
      contact1PhoneControl?.setValidators([this.phoneNumberValidator()]);
    } else {
      // No country selected: remove validators
      contact1PhoneControl?.clearValidators();
    }
  
    contact1PhoneControl?.updateValueAndValidity();
  }
  

  onCountryChange1(country: any): void {
    // Only apply validators if the user changes the country
    if (this.selectedDialCode1 === country.code) {
      return;
    }
  
    // Country has changed - update values and apply validator
    this.selectedCountryCode1 = country.dialling_code;
    this.selectedDialCode1 = country.code;
  
    const control = this.emergencyContactForm.get('contact2Phone');
  
    control?.setValidators([this.phoneNumberValidator()]);
    control?.updateValueAndValidity();
  }
  

  formatPhoneNumber(value: any): string {
    if (!this.selectedDialCode || !value) return ''; // Return an empty string if value is null/undefined
    const stringValue = String(value); // Ensure the value is converted to a string
    const phoneNumber = parsePhoneNumberFromString(stringValue, this.selectedDialCode);
    if (phoneNumber && phoneNumber.isValid()) {
      this.formattedPhoneNumber = phoneNumber.formatInternational();
      return phoneNumber.formatNational();
    }
    return stringValue; // Return the original value if parsing fails
  }

  phoneNumberValidator() {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!this.selectedDialCode || !value) {
        return null;
      }
  
      const phoneNumber = parsePhoneNumberFromString(String(value), this.selectedDialCode);
  
      if (phoneNumber && phoneNumber.isValid()) {
        return null;
      } else {
        return { invalidPhoneNumber: true };
      }
    };
  }
    
}

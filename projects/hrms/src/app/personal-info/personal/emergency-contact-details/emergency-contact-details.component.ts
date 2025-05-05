import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
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

@Component({
  selector: 'app-emergency-contact-details',
  imports: [CommonModule, ReactiveFormsModule, Select, NgxCountriesDropdownModule],
  templateUrl: './emergency-contact-details.component.html',
  styleUrl: './emergency-contact-details.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class EmergencyContactDetailsComponent implements OnInit, OnDestroy {

  subscription!: Subscription
  buttons = false;
  buttons2 = false;
  familyRelations: IRelation[] = [];
  emergencyContactForm!: FormGroup;
  selectedDialCode: any;
  selectedCountryCodegflag: any;
  selectedDialCode1: any;
  selectedCountryflag: any;
  formattedPhoneNumber: string = '';
  selectedCountryCode: any;
  loading = true;
  selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true,
  };
  selectedemergencycoutrycode = signal<any>('');
  selectedemergency1coutrycode = signal<any>('');
  mobileNumberData: IphoneNumberData | null = null;
  empinfo: any
  employedata = {} as any;
  constructor(private modalService: NgbModal, private fb: FormBuilder, public formValidation: FormValidationService, private conformationPopup: OpenModalService, private http: HttpService) { 
    effect(() => {
      this.selectedemergencycoutrycode.set(this.selectedDialCode);
      this.selectedemergency1coutrycode.set(this.selectedDialCode1);
    })
  }

  ngOnInit(): void {
 
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.getEmployeeId();
    this.getFamilyRelations();
    this.initializeForm();
  
    this.emergencyContactForm.get('contact1Phone')?.setValidators([Validators.required, this.phoneNumberValidator(this.selectedCountryCodegflag)]);
   
   
  }
  showButtons() {
    this.buttons = !this.buttons
  }

  initializeForm(): void {
    this.emergencyContactForm = this.fb.group({
      contact1Name: ['', Validators.required],
      contact1Email: ['', [ Validators.email]],
      contact1Phone: ['', Validators.required],
      contact1Relationship: ['', Validators.required],
      contact1CountryCode: ['', Validators.required],
      contact2CountryCode: ['', Validators.required],
      contact2Name: ['', Validators.required],
      contact2Email: ['', [ Validators.email]],
      contact2Phone: ['', Validators.required],
      contact2Relationship: ['', Validators.required],
    });
    this.emergencyContactForm.disable();
  }

  getEmployeeId(): void {
    this.loading = true;
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employedata = data;
        this.patchForm(data);
        this.loading = false;
        this.selectedemergencycoutrycode.set(data.emergencynumbercountryflag);
        this.selectedemergency1coutrycode.set(data.emergencyphonecountryflag);
       
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
      
      contact1Name: data.emergencyName || '', // Bind first emergency contact name
      contact1Email: data.emailId || '',      // Bind first emergency contact email
      contact1Phone: data.emergencynumber || '', // Bind first emergency contact phone
      contact1Relationship: contact1Relationship || '', // Bind first emergency contact relationship
      contact2Name: data.emergencyName1 || '', // Bind second emergency contact name
      contact2Email: data.emergencyEmail1 || '', // Bind second emergency contact email
      contact2Phone: data.emergencyNumber1 || '', // Bind second emergency contact phone
      contact2Relationship: contact2Relationship || '', // Bind second emergency contact relationship
    });

  }

  enableForm(): void {
    this.buttons = true;
    this.buttons2 = true;
    this.emergencyContactForm.enable();
  }

  disableForm(): void {
    this.buttons = false;
    this.buttons2 = false;
    this.emergencyContactForm.disable();
    this.emergencyContactForm.markAsUntouched(); 
    this.emergencyContactForm.reset(); 
    this.getEmployeeId(); 
  }


  saveForm(): void {
    const formValue = this.emergencyContactForm.value;
    // Clean and format phone numbers
    const cleanPhoneNumber = (phone: any): string => {
      if (!phone) return ''; // Return an empty string if phone is null or undefined
      return String(phone).replace(/\D+/g, '');; // Convert to string and remove spaces and dashes
    };

    const contact1Phone = cleanPhoneNumber(formValue.contact1Phone || this.employedata.mobileNumber || '');
    const contact2Phone = cleanPhoneNumber(formValue.contact2Phone || this.employedata.emergencyNumber1 || '');
    const updatePayload = {
      ...this.employedata,
      emailId: formValue.contact1Email || null,
      emergencycode: this.selectedDialCode,
      emergencycode1: this.selectedDialCode1,
      emergencyName: formValue.contact1Name || this.employedata.emergencyName,
      relationShip: this.emergencyContactForm.get('contact1Relationship')?.value?.relationship1 || this.employedata.relationShip,
      emergencynumber: contact1Phone,
      emergencyName1: formValue.contact2Name || this.employedata.emergencyName1,
      emergencyEmail1: formValue.contact2Email || null,
      emergencyNumber1: contact2Phone,
      relationship1: this.emergencyContactForm.get('contact2Relationship')?.value?.relationship1 || this.employedata.relationship1,
      emergencyphonecountryflag: this.selectedCountryflag,
      emergencynumbercountryflag: this.selectedCountryCodegflag,
    };


    this.subscription = this.http.postdata(`Employeedata/UPDATER`, updatePayload)
      .subscribe({
        next: (data: any) => {
          console.log('Data updated successfully:', data);
          if (data.statusCode === 200) {
            this.conformationPopup.openSuccessModal('Emergency Contact Details updated successfully');
            this.emergencyContactForm.disable();
            this.buttons = false; 
            this.buttons2 = false;
            this.getEmployeeId(); 
          }
          else if (data.statusCode === 409) {
            console.log('Conflict:', data.message);
            this.conformationPopup.openErrorModal(data.message);
            this.patchForm(data); 
          }

        
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
      .getData('Relationship')
      .subscribe({
        next: (data: any) => {
          this.familyRelations = data as IRelation[];
        },
      });
  }

 
  onCountryChange(country: any) {
    this.selectedDialCode = country.dialling_code;
    this.selectedCountryCodegflag = country.code;
    console.log('Selected country code:', this.selectedCountryCodegflag);
    console.log('Selected country dial code:', this.selectedDialCode);
    this.emergencyContactForm.get('contact1CountryCode')?.setValue(country.dialling_code);
    this.emergencyContactForm.get('contact1CountryCode')?.markAsTouched();
    this.emergencyContactForm.get('contact1Phone')?.setValidators([Validators.required, this.phoneNumberValidator( this.selectedCountryCodegflag)]);
    this.emergencyContactForm.get('contact1Phone')?.updateValueAndValidity();
    this.employedata.emergencycode = country.dialling_code;
    this.employedata.emergencynumbercountryflag = country.code;
  }
  onEmergencyContact1PhoneInput(){
    const phoneNumberControl = this.emergencyContactForm.get('contact1Phone');
    if (phoneNumberControl?.value) {
      const formattedValue = this.formatPhoneNumber(phoneNumberControl.value, this.selectedCountryCodegflag);
      phoneNumberControl.setValue(formattedValue, { emitEvent: false });
    }
  }
  onCountryChange1(country: any): void {
    this.selectedDialCode = country.dialling_code;
    this.selectedCountryflag = country.code;
    console.log('Selected country code:', this.selectedDialCode);
    console.log('Selected country dial code:', this.selectedDialCode);
    this.emergencyContactForm.get('contact2CountryCode')?.setValue(country.dialling_code);
    this.emergencyContactForm.get('contact2CountryCode')?.markAsTouched();
    this.emergencyContactForm.get('contact2Phone')?.setValidators([Validators.required, this.phoneNumberValidator(this.selectedCountryflag)]);
    this.emergencyContactForm.get('contact2Phone')?.updateValueAndValidity();
    this.employedata.emergencycode1 = country.dialling_code;
    this.employedata.emergencyphonecountryflag = country.code;
  }

  onEmergencyContact2PhoneInput(){
    const phoneNumberControl = this.emergencyContactForm.get('contact2Phone');
    if (phoneNumberControl?.value) {
      const formattedValue = this.formatPhoneNumber(phoneNumberControl.value, this.selectedCountryflag);
      phoneNumberControl.setValue(formattedValue, { emitEvent: false });
    }
  }

  formatPhoneNumber(value: any,countryCode:any): string {
    if (!countryCode || !value) return ''; // Return an empty string if value is null/undefined
    const stringValue = String(value); // Ensure the value is converted to a string
    const phoneNumber = parsePhoneNumberFromString(stringValue, countryCode);
    if (phoneNumber && phoneNumber.isValid()) {
      this.formattedPhoneNumber = phoneNumber.formatInternational();
      return phoneNumber.formatNational();
    }
    return stringValue; // Return the original value if parsing fails
  }

 phoneNumberValidator(countryCode:any) {
    return (control: AbstractControl) => {
      const value = String(control.value);
      if (!countryCode || !value) {
        return null;
      }
      const phoneNumber = parsePhoneNumberFromString(value,countryCode);
      if (phoneNumber && phoneNumber.isValid()) {
        return null;
      } else {
        return { invalidPhoneNumber: true };
      }
    };
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}

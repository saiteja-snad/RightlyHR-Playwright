import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, effect, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { OpenModalService } from '../../../services/open-modal.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { IphoneNumberData } from '../../../../../../preonboarding/src/app/models/mobilenumber.model';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { RbacService } from '../../../services/rbac.service';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';

@Component({
  selector: 'app-contact-details',
  imports: [CommonModule, ReactiveFormsModule, NgxCountriesDropdownModule],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ContactDetailsComponent implements OnInit, OnDestroy {

  contactForm!: FormGroup;
  subscription!: Subscription
  empinfo: any
  employedata: any
  buttons = false;
  loading = true;

  selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true,
  };
  selectedDialCode: any;
  selectedCountryCodegflag: any;
  selectedDialphoneCode: any;
  selectedCountryCodephoneflag: any;
  formattedPhoneNumber: string = '';
  placeholderPhoneNumber: string = '';
  mobileNumberData: IphoneNumberData | null = null;

  selectedworkcoutrycode = signal<any>('');
  selectedpersonalnumbercode = signal<any>('');

  constructor(private modalService: NgbModal, private cd: ChangeDetectorRef, private fb: FormBuilder,public formValidation: FormValidationService, private conformationPopup: OpenModalService, public http: HttpService, public rbac: RbacService) {
    effect(() => {
      this.selectedworkcoutrycode.set(this.selectedDialCode);
      this.selectedpersonalnumbercode.set(this.selectedDialphoneCode);
    })

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
      workMail: ['', [Validators.required, Validators.email]],
      countyCode1: [null, [Validators.required]],
      countyCode2: [null, [Validators.required]],
      phoneNumber: [null, [Validators.required,]], // Required and 10-digit phone number
      workNumber: [null, [Validators.required,]], // Required and 10-digit phone number

    });


  }


  enableForm(): void {
    this.buttons = true;
    this.contactForm.enable();
  }

  disableForm(): void {
    this.buttons = false;
    this.contactForm.reset();
    this.getEmployeeId();
    this.contactForm.disable();

  }
  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employedata = data;
        this.patchForm(data);
        this.loading = false;
        this.selectedworkcoutrycode.set(data.workphonecountryflag);

        this.selectedpersonalnumbercode.set(data.mobilephonecountryflag);

      },
      error: (reason) => {
        console.log(reason);
        this.loading = false;
        console.error('Error fetching employee data:', reason)
      }
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

    const contactnumber = cleanPhoneNumber(formValue.phoneNumber || this.employedata?.phoneNumber || '');
    const worknumber = cleanPhoneNumber(formValue.workNumber || this.employedata?.workNumber || '');

    const updatePayload = {
      ...this.employedata,

      emailaddress: formValue.personalEmail,
      workEmail: formValue.workMail,
      contactnumber: contactnumber,
      workPhone: worknumber,
      mobilePhoneCountryCode: this.selectedDialphoneCode || this.employedata.mobilePhoneCountryCode,
      workPhoneCountryCode: this.selectedDialCode || this.employedata.workPhoneCountryCode,
      mobilephonecountryflag: this.selectedCountryCodephoneflag || this.employedata.mobilephonecountryflag,
      workPhoneCountryFlag: this.selectedCountryCodegflag || this.employedata.workPhoneCountryFlag
    };


    this.subscription = this.http.postdata(`Employeedata/UPDATER`, updatePayload)
      .subscribe({
        next: (data: any) => {
          if (data.statusCode === 200) {
            this.conformationPopup.openSuccessModal('Contact Details updated successfully');
            this.contactForm.disable();
            this.buttons = false; // Disable the button after successful update
            this.getEmployeeId()
          } else if (data.statusCode === 409) {
            this.conformationPopup.openErrorModal(data.message,);
            this.patchForm(this.employedata);
          }

        },
        error: (reason: any) => {
          console.log(reason);
          this.conformationPopup.openErrorModal('Contact Details update failed');
        },
      });
  }

  onPhoneNumberInput(): void {
    const phoneNumberControl = this.contactForm.get('phoneNumber');
    if (phoneNumberControl?.value) {
      const formattedValue = this.formatPhoneNumber(phoneNumberControl.value, this.selectedCountryCodephoneflag);
      phoneNumberControl.setValue(formattedValue, { emitEvent: false });
    }
  }

  onWorkNumberInput(): void {
    const workNumberControl = this.contactForm.get('workNumber');
    if (workNumberControl?.value) {
      const formattedValue = this.formatPhoneNumber(workNumberControl.value, this.selectedCountryCodegflag);
      workNumberControl.setValue(formattedValue, { emitEvent: false });
    }
  }

  onCountryChange(country: any) {
    this.selectedDialCode = country.dialling_code;
    this.selectedCountryCodegflag = country.code;
    console.log('Selected country code:', this.selectedCountryCodegflag);
    console.log('Selected country dial code:', this.selectedDialCode);
    this.contactForm.get('countyCode1')?.setValue(country.dialling_code);
    this.contactForm.get('countyCode1')?.markAsTouched();
    this.contactForm.get('workNumber')?.setValidators([Validators.required, this.phoneNumberValidator(this.selectedCountryCodegflag)]);
    this.contactForm.get('workNumber')?.updateValueAndValidity();
    this.employedata.workPhoneCountryCode = country.dialling_code;
    this.employedata.workphonecountryflag = country.code;
  }
  onCountryphoneChange(country: any) {
    this.selectedDialphoneCode = country.dialling_code;
    this.selectedCountryCodephoneflag = country.code;
    console.log('Selected country code:', this.selectedDialphoneCode);
    console.log('Selected country dial code:', this.selectedCountryCodephoneflag);
    this.contactForm.get('countyCode2')?.setValue(country.dialling_code);
    this.contactForm.get('countyCode2')?.markAsTouched();
    this.contactForm.get('phoneNumber')?.setValidators([Validators.required, this.phoneNumberValidator(this.selectedCountryCodephoneflag)]);
    this.contactForm.get('phoneNumber')?.updateValueAndValidity();
    this.employedata.mobilePhoneCountryCode = country.dialling_code;
    this.employedata.mobilephonecountryflag = country.code;
  }

  formatPhoneNumber(value: any, countryCode: any) {
    if (!countryCode || !value) return value;
    const stringValue = String(value); // Make sure it's a string
    const phoneNumber = parsePhoneNumberFromString(stringValue, countryCode);
    if (phoneNumber && phoneNumber.isValid()) {
      this.formattedPhoneNumber = phoneNumber.formatInternational();
      return phoneNumber.formatNational();
    }
    return stringValue;
  }

  phoneNumberValidator(countryCode: any) {
    return (control: AbstractControl) => {
      const value = String(control.value);
      if (!countryCode || !value) {
        return null;
      }
      const phoneNumber = parsePhoneNumberFromString(value, countryCode);
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

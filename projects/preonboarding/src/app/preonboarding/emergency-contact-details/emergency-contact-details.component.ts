import { Component, effect,Signal,signal} from '@angular/core';
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
  selectedCountryCode=signal<string>('');
  selectedCountryCode1= signal<string>('');
  // mobile number2
  selectedDialCode1: any;
 
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
    private openPopup: PopupService) { 
      effect(() => {
        this.selectedCountryCode?.set(this.selectedDialCode);
        this.selectedCountryCode1?.set(this.selectedDialCode1);
      });
    }

  ngOnInit(): void {
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getRelation();
    this.getempdate();
    this.initializeForm();
  }
  navigateNext() {
    this.router.navigate(['/experience-details']);
  }
  navigatePrevious(){
    this.router.navigate(['/education-details']);
  }
  loading: boolean = true;
  getempdate() {
    let employeeId = parseInt(this.prosempdata.employeeId);
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empdata = data as Ipersonal;
        this.selectedCountryCode?.set(this.empdata.emergencycode);
        this.selectedCountryCode1?.set(this.empdata.emergencycode1);
        this.patchForm();
        this.loading = false;
      },
      error: (error) => {
        console.error(error);
        this.loading = false;
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
      this.empdata.emergencyName=formEmployeeData.contact1.name,
      this.empdata.emailId= formEmployeeData.contact1.email,
      this.empdata.emergencycode= this.selectedCountryCode(),
      this.empdata.emergencynumber=formEmployeeData.contact1.mobile,
      this.empdata.relationShip= formEmployeeData.contact1.relationship,
      this.empdata.emergencyName1= formEmployeeData.contact2.name,
      this.empdata.emergencyEmail1= formEmployeeData.contact2.email,
      this.empdata.emergencycode1= this.selectedCountryCode1(),
      this.empdata.emergencyNumber1= formEmployeeData.contact2.mobile,
      this.empdata.relationship1= formEmployeeData.contact2.relationship
      
      console.log(this.empdata);
      this.subscription = this.http.postData(`PreonboardingEmployeedata/UPDATER`, this.empdata).subscribe({
        next: (data: any) => {
          console.log(data);
          if (data.statusCode === 409) {
           
            this.openPopup.openError(`${data.message}`);
            
          }
          else if (data.statusCode === 200) { 
            this.navigateNext();
          }
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
    else{
      this.openPopup.openError("Please fill all the required fields")
    }
  }

  // mobile number 1 functions
  onCountryChange(country: any) {
    this.selectedCountryCode.set(country.code);
    this.selectedDialCode = country.code;
    if( this.selectedDialCode ){
      this.contactForm.get('contact1.mobile')?.setValidators([Validators.required, this.phoneNumberValidator()]);
      this.contactForm.get('contact1.mobile')?.updateValueAndValidity();
    }
   
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

  // mobile number 2 functions
  onCountryChange1(country: any) {
    this.selectedCountryCode1.set(country.code);
    this.selectedDialCode1 = country.dialling_code;
    this.contactForm.get('contact2.mobile')?.setValidators([Validators.required, this.phoneNumberValidator()]);
    this.contactForm.get('contact2.mobile')?.updateValueAndValidity();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
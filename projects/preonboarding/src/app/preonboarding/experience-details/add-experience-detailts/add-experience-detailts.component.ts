import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { HttpService } from '../../../http-services/http.service';
import { IJobtype } from '../../../models/experience.model';
import { Select } from 'primeng/select';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { IphoneNumberData } from '../../../models/mobilenumber.model';
import { PopupService } from '../../../common-services/popup.service';
import { DataService } from '../../../common-services/data.service';
import { FormValidationService } from '../../../common-services/form-validation.service';
import moment from 'moment';
@Component({
  selector: 'app-add-experience-detailts',
  imports: [CommonModule, Select, ReactiveFormsModule, NgxCountriesDropdownModule],
  templateUrl: './add-experience-detailts.component.html',
  styleUrl: './add-experience-detailts.component.scss'
})

export class AddExperienceDetailtsComponent {
  subscription!: Subscription;
  JobemploymenttypeDetails = [] as IJobtype[];
  showErrorforpdf: boolean = false;
  showErrorforsize: boolean = false;
  file: any;
  isfileselected: boolean = true;
  prosempdata = {} as any;
  ExperienceDetails !: File;
  empdata = {} as any;
  experienceForm!: FormGroup;
  isDisabletoDate = false;
  selectedDialCode: any;
  formattedPhoneNumber: string = '';
  placeholderPhoneNumber: string = '';
  selectedCountryCode: any;
  spinnerLoader = false;
  selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true,
  };
  mobileNumberData: IphoneNumberData | null = null;
  showError = false;
  showErrorr = false;
  required=true;
  startDatevalidate:any;
  submissionInProgress = false;
  today = new Date().toISOString().split('T')[0];

  constructor(private http: HttpService,private formValidationService:FormValidationService, private fb: FormBuilder, private modalService: NgbModal, private openPopup:PopupService, 
    private getData:DataService, public formValidation: FormValidationService) { }

  ngOnInit(): void {
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getemploymenttype();
    this.initializeExperienceForm();
  }

  initializeExperienceForm() {
    this.experienceForm = this.fb.group({
      isPresent: [false],
      companyName: [null, [Validators.required, Validators.maxLength(100)]],
      employmentType: [null, Validators.required],
      fromDate: [null, Validators.required],
      toDate: [null],
      jobTitle: [null, [Validators.required, Validators.maxLength(100)]],
      description: [null],
      previousContactName: [null],
      previousContactNumber: [null],
      previousContactEmail: [null, [Validators.email]],
      attachment: [null, Validators.required]
    }, { validators: [this.DateValidator()] });
    this.experienceForm.get('isPresent')?.valueChanges.subscribe((isPresent) => {
      this.isDisabletoDate = isPresent;
      if (isPresent) {
        this.experienceForm.get('toDate')?.setValue(null);
        this.experienceForm.get('toDate')?.disable();
      } else {
        this.experienceForm.get('toDate')?.enable();
      }
    });
  }
    oncheckdates(value:any){
    if(value){
      this.experienceForm.get('toDate')?.setValue(null);
    }
  }
  //function for the date validation
DateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDate = control.get('fromDate')?.value;

    if (!startDate) return null;

    const formattedStart = moment(startDate, 'YYYY-MM-DD');
    const startOfCurrentMonth = moment().startOf('month');

    // Save formatted value (optional)
    this.startDatevalidate = formattedStart.format('YYYY-MM-DD');

    

    return null; // valid
  };
}

  restrictInputaccteponlynumber(event: KeyboardEvent) {
    const key = event.key;
    const inputElement = event.target as HTMLInputElement;

    // Allow navigation keys and backspace/delete
    if (key === 'Backspace' || key === 'Delete' || key === 'ArrowLeft' || key === 'ArrowRight') {
      return;
    }

    // Prevent the first character from being a space
    if (key === ' ' && inputElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    // Allow only numeric characters
    const isNumeric = /^[0-9]$/.test(key);
    if (!isNumeric) {
      event.preventDefault();
    }
  }
  
  checkboxCondition(event: any) {
    if (event.target.checked) {
      this.required=false;
      this.experienceForm.get('toDate')?.disable();
      this.experienceForm.get('toDate')?.clearValidators();
      this.experienceForm.get('toDate')?.setValue(null);
      this.experienceForm.get('toDate')?.updateValueAndValidity();
    } else {
      this.required=true;
      this.experienceForm.get('toDate')?.enable();
      this.experienceForm.get('toDate')?.setValidators(Validators.required);
      this.experienceForm.get('toDate')?.updateValueAndValidity();
    }

  }
  private renameFile(originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  //function to get jobtype dropdown
  getemploymenttype() {
    this.subscription = this.http.getData("PreonboardingJobtype").subscribe({
      next: (data: any) => {
        this.JobemploymenttypeDetails = data as IJobtype[]
      },
      error: (reason: any) => {
        console.log(reason);
      }
    })
  }

  //function to select the file in post 
  onChangeexperience(event: any) {
   
  this.isfileselected = false;
    this.file = event.target.files[0];
    let d: Date = new Date()
     if(this.file){
    const removeSpaceFileName = this.formValidationService.sanitizeFileName(this.file.name);
        const newFileName = `${this.prosempdata.employeeId}_${d.getTime()}_${removeSpaceFileName}`;
    this.ExperienceDetails = this.renameFile(this.file, newFileName);
    this.experienceForm.get('attachment')?.setValue(this.file);
    this.experienceForm.get('attachment')?.updateValueAndValidity();
    }else{
      this.experienceForm.get('attachment')?.setValue(null);
        this.experienceForm.get('attachment')?.updateValueAndValidity();
    }
  
  }
  
  onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSizeInBytes = 25 * 1024 * 1024; // 5MB
      if (!allowedTypes.includes(file.type)) {
        this.showErrorforpdf = true;
        this.showErrorforsize = false;
        input.value = '';
      }
      else if (file.size > maxSizeInBytes) {
        this.showErrorforsize = true;
        this.showErrorforpdf = false;
        input.value = '';
      }
      else {
        this.showErrorforpdf = false;
        this.showErrorforsize = false;
      }
    }
  }

  postExpDetails() {
  if (this.submissionInProgress) return; 
  this.submissionInProgress = true;

  const formData = this.experienceForm.value;

  let payload = {
    ...formData,
    empId: parseInt(this.prosempdata.employeeId),
    isDeleted: false,
    attachment: '',
    countryCode: this.selectedCountryCode,
  };
  payload = this.cleanPayload(payload);
  const submitData = (finalPayload: any) => {
    this.subscription = this.http.postData("PreonboardingExperience", finalPayload).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.openPopup.openSuccess("Employment history added successfully");
        this.getData.getExperience.set(true);
        this.experienceForm.reset();
        this.submissionInProgress = false; 
      },
      error: (error: any) => {
        console.log('Save failed:', error);
        if (error.status == 409) {
          this.openPopup.openError(error.error);
        } else if (error.status == 400) {
          this.openPopup.openError(error.error.message);
        } else {
          this.openPopup.openError("Insertion of data is failed");
        }
        this.submissionInProgress = false; 
      }
    });
  };

  if (this.file) {
    const filepath = `/FusionDocuments/Employee Documents/Previous Experience Documents/${this.prosempdata.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filepath, this.file)
      .subscribe({
        next: (data: any) => {
          payload.attachment = data.path;
          submitData(payload);
        },
        error: (error: any) => {
          this.openPopup.openError("File upload failed");
          this.submissionInProgress = false; 
        }
      });
  } else {
    submitData(payload);
  }
}

private cleanPayload(payload: any): any {
  const cleaned: any = {};

  Object.keys(payload).forEach(key => {
    let value = payload[key];

    // Convert empty strings to null
    if (value === '' || value === undefined) {
      cleaned[key] = null;
      return;
    }

    // Convert contact number to a number if it's not null/empty
    if (key === 'previousContactNumber' && value !== null) {
      const parsedValue = Number(value);
      cleaned[key] = isNaN(parsedValue) ? null : parsedValue;
      return;
    }

    // Keep other values as they are
    cleaned[key] = value;
  });

  return cleaned;
}

  // mobile number functions
  onCountryChange(country: any) {
    this.selectedCountryCode = country.dialling_code;
    this.selectedDialCode = country.code;
    this.experienceForm.get('phonenumber')?.setValidators([Validators.required, this.phoneNumberValidator()]);
    this.experienceForm.get('phonenumber')?.updateValueAndValidity();
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

  close(): void {
    this.experienceForm.reset();
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
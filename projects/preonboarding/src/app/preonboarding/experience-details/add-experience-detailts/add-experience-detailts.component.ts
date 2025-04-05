import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../http-services/http.service';
import { IJobtype } from '../../../models/experience.model';
import { Select } from 'primeng/select';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { IphoneNumberData } from '../../../models/mobilenumber.model';
import { PopupService } from '../../../common-services/popup.service';
import { DataService } from '../../../common-services/data.service';
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

  constructor(private http: HttpService, private fb: FormBuilder, private modalService: NgbModal, private openPopup:PopupService, private getData:DataService) { }

  ngOnInit(): void {
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getemploymenttype();
    this.initializeExperienceForm();
  }

  initializeExperienceForm() {
    this.experienceForm = this.fb.group({
      isPresent: [false],
      companyName: ['', Validators.required],
      employmentType: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: [''],
      jobTitle: ['', Validators.required],
      responsibilities: ['', Validators.required],
      contactName: ['', Validators.required],
      phonenumber: ['', [Validators.required, this.phoneNumberValidator()]],
      workEmail: ['', [Validators.required, Validators.email]],
      attachment: [null, Validators.required]
    });
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
    this.ExperienceDetails = this.renameFile(this.file, `${this.prosempdata.employeeId}_${d.getTime()}_${this.file.name}`);
    this.experienceForm.get('attachment')?.setValue(this.file);
    this.experienceForm.get('attachment')?.updateValueAndValidity();
  }
  
  onChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/jpeg', 'image/*', 'application/pdf', 'image/png'];
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
    const formData = this.experienceForm.value;
    const payload = {
      ...formData,
      empId: parseInt(this.prosempdata.employeeId),
      isDeleted: true,
      attachment: ''
    };
    const submitData = (finalPayload: any) => {
      this.subscription = this.http.postData("PreonboardingExperience", finalPayload).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.openPopup.openSuccess("Data Added Successfully!");
          this.getData.getExperience.set(true);
          this.experienceForm.reset();
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
        },
        complete: () => {

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
          }
        });
    } else {
      submitData(payload);
    }
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
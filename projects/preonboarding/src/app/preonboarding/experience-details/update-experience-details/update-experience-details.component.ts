import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
import moment from 'moment';

@Component({
  selector: 'app-update-experience-details',
  imports: [CommonModule, Select, ReactiveFormsModule, NgxCountriesDropdownModule],
  templateUrl: './update-experience-details.component.html',
  styleUrl: './update-experience-details.component.scss'
})
export class UpdateExperienceDetailsComponent {
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
  @Input() experienceData: any;

  constructor(private http: HttpService, private fb: FormBuilder, private modalService: NgbModal, private openPopup: PopupService, private getData: DataService) { }

  ngOnInit(): void {
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getemploymenttype();
    this.initializeExperienceForm();
  }

  initializeExperienceForm() {
    this.experienceForm = this.fb.group({
      isPresent: [this.experienceData?.isPresent || false],
      companyName: [this.experienceData?.companyName || null, [Validators.pattern(/^[A-Za-z,._-][A-Za-z ,._-]*$/), Validators.maxLength(100)]],
      employmentType: [this.experienceData?.employmentType || null, Validators.required],
      fromDate: [this.formatDate(this.experienceData?.fromDate) || null, Validators.required],
      toDate: [this.formatDate(this.experienceData?.toDate) || null],
      jobTitle: [this.experienceData?.jobTitle || null, [ Validators.pattern(/^[A-Za-z,._-][A-Za-z ,._-]*$/), Validators.maxLength(100)]],
      description: [this.experienceData?.description || null,[Validators.pattern(/^[A-Za-z,._-][A-Za-z ,._-]*$/)]],
      previousContactName: [this.experienceData?.previousContactName || null],
      previousContactNumber: [this.experienceData?.previousContactNumber ||null, [this.phoneNumberValidator()]],
      previousContactEmail: [this.experienceData?.previousContactEmail || null, [Validators.email]],
      attachment: [this.experienceData?.attachment || null, Validators.required]
    });
      this.isDisabletoDate = this.experienceData?.isPresent;
      console.log(this.isDisabletoDate);
      if (this.experienceData?.isPresent) {
        this.experienceForm.get('toDate')?.setValue(null);
        this.experienceForm.get('toDate')?.disable();
      } else {
        this.isDisabletoDate = false;
        this.experienceForm.get('toDate')?.enable();
        this.experienceForm.get('toDate')?.setValidators(Validators.required);
      }
    
  }
  checkboxCondition(event: any) {
    if (event.target.checked) {
      this.isDisabletoDate=false;
      this.experienceForm.get('toDate')?.disable();
      this.experienceForm.get('toDate')?.clearValidators();
      this.experienceForm.get('toDate')?.setValue(null);
      this.experienceForm.get('toDate')?.updateValueAndValidity();
    } else {
      this.isDisabletoDate=true;
      this.experienceForm.get('toDate')?.enable();
      this.experienceForm.get('toDate')?.setValidators(Validators.required);
      this.experienceForm.get('toDate')?.updateValueAndValidity();
    }

  }
  //function to formate the data
  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
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

  //function to get file 
  getFileName(attachmentPath: string): string {
    if (attachmentPath) {
      const splitPath = attachmentPath.split('/');
      let fileName = splitPath[splitPath.length - 1];
      if (fileName.length > 12) {
        fileName = fileName.substring(12);  // Exclude the first 12 characters
      }
      return fileName;
    }
    return '';
  }

  updateExpDetails() {
    const formData = this.experienceForm.value;
    const payload = {
      id: this.experienceData?.id,
      empId: this.experienceData.empId,
      companyName: formData.companyName ?? this.experienceData?.companyName,
      employmentType: formData.employmentType ?? this.experienceData?.employmentType,
      fromDate: formData.fromDate ? moment(formData.fromDate).format('YYYY-MM-DD') : this.experienceData?.fromDate,
      toDate: formData.toDate ? moment(formData.toDate).format('YYYY-MM-DD') : this.experienceData?.toDate,
      jobTitle: formData.jobTitle ?? this.experienceData?.jobTitle,
      description: formData.description ?? this.experienceData?.description,
      previousContactName: formData.previousContactName ?? this.experienceData?.previousContactName,
      previousContactNumber: formData.previousContactNumber ?? this.experienceData?.previousContactNumber,
      previousContactEmail: formData.previousContactEmail ?? this.experienceData?.previousContactEmail,
      isPresent: formData.isPresent ?? this.experienceData?.isPresent,
      isDeleted: this.experienceData?.isDeleted,
      attachment: formData.attachment ?? this.experienceData?.attachment,
    };

    if (this.file) {
      const filepath = `/FusionDocuments/Employee Documents/Previous Experience Documents/${this.prosempdata.employeeId}`;
      this.subscription = this.http.uploadFileWithQuery('PreonboardingFilesystem/uploadfiletodirectory', filepath, this.file)
        .subscribe({
          next: (data: any) => {
            payload.attachment = data.path;
            this.subscription = this.http.postData("PreonboardingExperience/Update", payload).subscribe({
              next: (data: any) => {
                this.modalService.dismissAll();
                this.openPopup.openSuccess("Experience Details updated successfully");
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
              complete: () => { }
            });
          },
          error: (error: any) => {
            this.openPopup.openError("File upload failed");
          }
        });
    } else {
      this.subscription = this.http.postData("PreonboardingExperience/Update", payload).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.openPopup.openSuccess("Experience Details updated successfully");
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
        complete: () => { }
      });
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
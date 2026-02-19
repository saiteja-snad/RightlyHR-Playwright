import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { IRelation } from '../../../Interfaces/personal-modal';
import { Select } from 'primeng/select';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { IphoneNumberData } from '../../../../../../preonboarding/src/app/models/mobilenumber.model';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { RbacService } from '../../../services/rbac.service';
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { Router } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { EditIconComponent } from "../../../icons/edit-icon/edit-icon.component";
import { TooltipModule } from 'primeng/tooltip';
import { ModuleInformationComponent } from '../../../shared/module-information/module-information.component';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-emergency-contact-details',
  imports: [CommonModule, ReactiveFormsModule, Select, NgxCountriesDropdownModule, Skeleton, TooltipModule, 
    NgbPopoverModule, ModuleInformationComponent, EditIconComponent,InfoIconComponent, TranslateModule],
  templateUrl: './emergency-contact-details.component.html',
  styleUrl: './emergency-contact-details.component.scss',
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
  dataloader: boolean = false;
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
  isMyInfoRoute = false;
  fieldOptions: any[] = [];
  getFieldsApprovalStatusList: any[] = [];
  activeMessage: string = '';

  constructor(private modalService: NgbModal, private fb: FormBuilder, public formValidation: FormValidationService,
    private conformationPopup: OpenModalService, private http: HttpService, public rbac: RbacService, 
    public permissionRouteService: AccessForEmployeeinfoService, private router: Router) {
    effect(() => {
      this.selectedemergencycoutrycode.set(this.selectedDialCode);
      this.selectedemergency1coutrycode.set(this.selectedDialCode1);
    })
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getFamilyRelations();
    this.getEmpInfoFromRoute();
    this.emergencyContactForm.get('contact1Phone')?.setValidators([Validators.required, this.phoneNumberValidator(this.selectedCountryCodegflag)]);
    this.getEmergencyApprovalFields()
    this.getEmergencyFieldsApprovalStatus()
  }

  showButtons() {
    this.buttons = !this.buttons
  }

  // Add this method
  isFieldDisabledDueToPending(fieldName: string): boolean {
    return this.isFieldPendingApproval(fieldName);
  }

  // Check if field has pending approval
  isFieldPendingApproval(fieldName: string): boolean {
    return this.getFieldsApprovalStatusList.some(
      (item: any) => item.fieldName === fieldName && item.approvalStatus === 'Pending'
    );
  }

  getPendingApprovalMessage(fieldName: string): string {
    const item = this.getFieldsApprovalStatusList.find(
      (item: any) => item.fieldName === fieldName && item.approvalStatus === 'Pending'
    );
    return item?.message || 'This field change request is awaiting approval.';
  }

  setActiveMessage(fieldName: string) {
    this.activeMessage = this.getPendingApprovalMessage(fieldName);
  }

  // Fetch approval fields for Emergency Contact
  getEmergencyApprovalFields() {
    const params = 'Personal';
    const param = 'Emergency Contacts';
    this.subscription = this.http.getDatabyentityvalueForFieldUpdate(`EmployeeInfoApprovalFields/getApprovalFields`, params, param).subscribe({
      next: (data: any) => {
        if (data.data?.length > 0) {
          this.fieldOptions = data.data;
        }
      },
      error: (err) => console.error('Error loading emergency approval fields:', err)
    });
  }

  // Fetch pending approval status
  getEmergencyFieldsApprovalStatus() {
    const params = {
      displayName: 'Personal',
      moduleName: 'Emergency Contacts',
      employeeId: parseInt(this.empinfo.employeeId)
    };
    this.subscription = this.http.getDataIncludeParams(`EmployeeInfoFieldUpdate/getLatestFieldApprovalStatus`, params).subscribe({
      next: (data: any) => {
        this.getFieldsApprovalStatusList = data.data || [];
      },
      error: (err) => console.error('Error loading pending status:', err)
    });
  }

  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/personalinfo')) {
      this.isMyInfoRoute = false;
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getEmployeeId();
    } else if (fullPath.startsWith('/myinfo')) {
      this.isMyInfoRoute = true;
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getEmployeeId();
    }
  }

  initializeForm(): void {
    this.emergencyContactForm = this.fb.group({
      contact1Name: ['', Validators.required],
      contact1Email: ['', [Validators.email]],
      contact1Phone: ['', Validators.required],
      contact1Relationship: ['', Validators.required],
      contact1CountryCode: ['', Validators.required],
      contact2CountryCode: ['', Validators.required],
      contact2Name: ['', Validators.required],
      contact2Email: ['', [Validators.email]],
      contact2Phone: ['', Validators.required],
      contact2Relationship: ['', Validators.required],
    });
    this.emergencyContactForm.disable();
  }

  getEmployeeId(): void {
    this.dataloader = true;
    this.loading = true;
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.dataloader = false;
        this.employedata = data;
        this.loading = false;
        this.selectedemergencycoutrycode.set(data.emergencynumbercountryflag);
        this.selectedemergency1coutrycode.set(data.emergencyphonecountryflag);
        if (this.familyRelations.length) {
          this.patchForm(data);
        }
      },
      error: (reason) => {
        console.error('Error fetching employee data:', reason)
        this.dataloader = false
      },
      complete: () => {

        this.dataloader = false;
      }
    });
  }

  patchForm(data: any): void {
    const contact1Relationship = this.familyRelations.find((relation) => relation.relationship1 === data.relationShip) || null;
    const contact2Relationship = this.familyRelations.find((relation) => relation.relationship1 === data.relationship1) || null;
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
    this.disablePendingFields();
  }

  isPrimaryCountryDisabled = false;
  isSecondaryCountryDisabled = false;
  private disablePendingFields(): void {
    const pendingFields = this.getFieldsApprovalStatusList.filter(item => item.approvalStatus === 'Pending').map(item => item.fieldName);
    const fieldMap: { [key: string]: string } = {
      'Primary Contact Name': 'contact1Name',
      'Primary Contact Email Id': 'contact1Email',
      'Primary Contact Phone Number': 'contact1Phone',
      'Primary Contact Relationship': 'contact1Relationship',
      'Secondary Contact Name': 'contact2Name',
      'Secondary Contact Email Id': 'contact2Email',
      'Secondary Contact Phone Number': 'contact2Phone',
      'Secondary Contact Relationship': 'contact2Relationship',
    };
    pendingFields.forEach(fieldName => {
      const controlName = fieldMap[fieldName];
      if (controlName) {
        this.emergencyContactForm.get(controlName)?.disable({ emitEvent: false });
        // also disable country selectors
        if (controlName === 'contact1Phone') {
          this.isPrimaryCountryDisabled = true;
        }
        if (controlName === 'contact2Phone') {
          this.isSecondaryCountryDisabled = true;
        }
      }
    });
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
    const formValue = this.emergencyContactForm.getRawValue();
    const cleanPhone = (phone: any) => phone ? String(phone).replace(/\D+/g, '') : '';
    const targetStatuses = ['Pending', 'Cancelled'];
    const pendingFields = this.getFieldsApprovalStatusList.filter(item => targetStatuses.includes(item.approvalStatus)).map(item => item.fieldName);
    // const pendingFieldNames = this.getFieldsApprovalStatusList
    // .filter((item) => targetStatuses.includes(item.approvalStatus))
    // .map((item) => item.fieldName);
    const updatePayload: any = {
      ...this.employedata,
      updatedby: this.empinfo.employeeId.toString(),
      selfUpdate: this.isMyInfoRoute,
      moduleName: this.isMyInfoRoute ? 'Emergency Contacts' : undefined,
      displayName: this.isMyInfoRoute ? 'Personal' : undefined,
    };
    const mapping: { [key: string]: { apiKey: string; control?: string } } = {
      'Primary Name': { apiKey: 'emergencyName', control: 'contact1Name' },
      'Primary Email Id': { apiKey: 'emailId', control: 'contact1Email' },
      'Primary Phone Number': { apiKey: 'emergencynumber', control: 'contact1Phone' },
      'Primary Relationship': { apiKey: 'relationShip', control: 'contact1Relationship' },
      'Secondary Name': { apiKey: 'emergencyName1', control: 'contact2Name' },
      'Secondary Email Id': { apiKey: 'emergencyEmail1', control: 'contact2Email' },
      'Secondary Phone Number': { apiKey: 'emergencyNumber1', control: 'contact2Phone' },
      'Secondary Relationship': { apiKey: 'relationship1', control: 'contact2Relationship' },
    };
    Object.keys(mapping).forEach(displayName => {
      if (!pendingFields.includes(displayName)) {
        const { apiKey, control } = mapping[displayName];
        const value = formValue[control!];
        if (value !== undefined && value !== null && value !== '') {
          if (displayName.includes('Phone Number')) {
            updatePayload[apiKey] = cleanPhone(value);
          } else if (displayName.includes('Relationship')) {
            updatePayload[apiKey] = value?.relationship1 || value;
          } else {
            updatePayload[apiKey] = value;
          }
        }
      }
    });
    // Always send country codes/flags
    updatePayload.emergencycode = this.selectedDialCode || this.employedata.emergencycode;
    updatePayload.emergencycode1 = this.selectedDialCode1 || this.employedata.emergencycode1;
    updatePayload.emergencynumbercountryflag = this.selectedCountryCodegflag || this.employedata.emergencynumbercountryflag;
    updatePayload.emergencyphonecountryflag = this.selectedCountryflag || this.employedata.emergencyphonecountryflag;
    this.subscription = this.http.postdata(`Employeedata/UPDATER`, updatePayload).subscribe({
      next: (data: any) => {
        if (data.statusCode === 200) {
          this.conformationPopup.openSuccessModal('Emergency contact updated successfully');
          this.getEmergencyFieldsApprovalStatus();
          this.emergencyContactForm.disable();
          this.buttons = false;
          this.buttons2 = false;
          this.getEmployeeId();
          this.getEmergencyFieldsApprovalStatus()
        } else if (data.statusCode === 409) {
          this.conformationPopup.openErrorModal(data.message);
        }
      },
      error: () => this.conformationPopup.openErrorModal('Update failed')
    });
  }

  //get family relations dropdown
  getFamilyRelations() {
    this.subscription = this.http.getData('Relationship').subscribe({
      next: (data: any) => {
        this.familyRelations = data as IRelation[];
        if (this.employedata) {
          this.patchForm(this.employedata); // Only patch after relations are available
        }
      },
    });
  }

  onCountryChange(country: any) {
    this.selectedDialCode = country.dialling_code;
    this.selectedCountryCodegflag = country.code;
    this.emergencyContactForm.get('contact1CountryCode')?.setValue(country.dialling_code);
    this.emergencyContactForm.get('contact1CountryCode')?.markAsTouched();
    this.emergencyContactForm.get('contact1Phone')?.setValidators([Validators.required, this.phoneNumberValidator(this.selectedCountryCodegflag)]);
    this.emergencyContactForm.get('contact1Phone')?.updateValueAndValidity();
    this.employedata.emergencycode = country.dialling_code;
    this.employedata.emergencynumbercountryflag = country.code;
  }

  onEmergencyContact1PhoneInput() {
    const phoneNumberControl = this.emergencyContactForm.get('contact1Phone');
    if (phoneNumberControl?.value) {
      const formattedValue = this.formatPhoneNumber(phoneNumberControl.value, this.selectedCountryCodegflag);
      phoneNumberControl.setValue(formattedValue, { emitEvent: false });
    }
  }

  onCountryChange1(country: any): void {
    this.selectedDialCode1 = country.dialling_code;
    this.selectedCountryflag = country.code;
    this.emergencyContactForm.get('contact2CountryCode')?.setValue(country.dialling_code);
    this.emergencyContactForm.get('contact2CountryCode')?.markAsTouched();
    this.emergencyContactForm.get('contact2Phone')?.setValidators([Validators.required, this.phoneNumberValidator(this.selectedCountryflag)]);
    this.emergencyContactForm.get('contact2Phone')?.updateValueAndValidity();
    this.employedata.emergencycode1 = country.dialling_code;
    this.employedata.emergencyphonecountryflag = country.code;
  }

  onEmergencyContact2PhoneInput() {
    const phoneNumberControl = this.emergencyContactForm.get('contact2Phone');
    if (phoneNumberControl?.value) {
      const formattedValue = this.formatPhoneNumber(phoneNumberControl.value, this.selectedCountryflag);
      phoneNumberControl.setValue(formattedValue, { emitEvent: false });
    }
  }

  formatPhoneNumber(value: any, countryCode: any): string {
    if (!countryCode || !value) return ''; // Return an empty string if value is null/undefined
    const stringValue = String(value); // Ensure the value is converted to a string
    const phoneNumber = parsePhoneNumberFromString(stringValue, countryCode);
    if (phoneNumber && phoneNumber.isValid()) {
      this.formattedPhoneNumber = phoneNumber.formatInternational();
      return phoneNumber.formatNational();
    }
    return stringValue; // Return the original value if parsing fails
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { FormValidationsService } from '../../../services/form-validations.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
@Component({
  selector: 'app-client-contact-information',
  imports: [CommonModule, ReactiveFormsModule, NoDataFoundComponent, NgxCountriesDropdownModule,
    TranslateModule, DataLoaderContentComponent, ConfirmationIconComponent],
  templateUrl: './client-contact-information.component.html',
  styleUrl: './client-contact-information.component.scss'
})

export class ClientContactInformationComponent {
  clientId: any;
  spinnerLoader = false
  empinfo: any;
  updatecontactFrom!: FormGroup
  loading: boolean = true;
  contactData: any[] = [];
  contactDelete: any;
  selectedDialCode: any;
  selectedCountryCodegflag: any;
  selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true,
  };
  destroy$: Subject<boolean> = new Subject<boolean>();
  inactiveClientStatus: any;

  constructor(private modalService: NgbModal, private route: ActivatedRoute, private http: HttpService, public formValidation: FormValidationsService,
    private conformationPopup: OpenModalService, private fb: FormBuilder, private router: Router, public rbac: RbacService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.intizationfrom()
    this.route.queryParams.subscribe(params => {
      const clientId = params['id'];
      if (clientId) {
        this.clientId = clientId;
        this.getClientsData(clientId);
        this.getContactData(clientId);
      }
    });
    this.http.contactDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getContactData(this.clientId);
    });
  }

  getClientsData(clientID: any): void {
    this.http.getData(`Client/${clientID}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.inactiveClientStatus = res.data.status.toLowerCase();
      },
      error: (err) => {
        console.error('Error fetching clients:', err);
      }
    });
  }

  intizationfrom() {
    this.updatecontactFrom = this.fb.group({
      contactname: [null, [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      contactPhone: [null, [Validators.required]],
      contactrole: [null, Validators.required],
      countryCode: [null, Validators.required],
      dialling_code: [null, Validators.required],
      contactemail: [null, [Validators.required, Validators.email]]
    })
  }

  getContactData(clientId: string) {
    this.http.getData(`ProjectManagementContact?status=Active&entityType=Client&entityRefId=${clientId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.contactData = res?.data ?? [];
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.contactData = [];
        console.error('Error fetching projects data:', err);
        this.contactData = [];
      },
    });
  }

  opendeletModal(content: any, contact: any): void {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.contactDelete = contact;
  }

  deleteContact(): void {
    const payload = [{
      entityType: "Client",
      entityRefId: this.clientId,
      name: this.contactDelete.name,
      email: this.contactDelete.email,
      phoneNumber: this.contactDelete.phoneNumber,
      phoneCountryCode: this.contactDelete.phoneCountryCode,
      phoneDialCode: this.contactDelete.phoneDialCode,
      role: this.contactDelete.role,
      primaryContact: this.contactDelete.primaryContact,
      active: false,
      createdBy: parseInt(this.empinfo.employeeId),
      updatedBy: parseInt(this.empinfo.employeeId)
    }];
    this.http.putData(`ProjectManagementContact?contactId=${this.contactDelete.contactId}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll();
        this.contactDelete = null;
        this.conformationPopup.openSuccessModal('Contact deleted successfully.');
        this.getContactData(this.clientId);
      },
      error: (err) => {
        this.conformationPopup.openErrorModal(err.error.message)
        console.error('Error deleting contact:', err);
      }
    });
  }

  openupdateModal(content: any, contact: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.contactDelete = contact;
    this.updatecontactFrom.patchValue({
      contactname: contact.name,
      contactemail: contact.email,
      contactPhone: contact.phoneNumber,
      countryCode: contact.phoneCountryCode,
      contactrole: contact.role
    });
  }

  updateContact() {
    if (this.updatecontactFrom.invalid) {
      this.updatecontactFrom.markAllAsTouched();
      return;
    }
    this.spinnerLoader = true
    const payload = [{
      entityType: "Client",
      entityRefId: this.clientId,
      name: this.updatecontactFrom.value.contactname,
      email: this.updatecontactFrom.value.contactemail,
      phoneNumber: this.updatecontactFrom.value.contactPhone,
      phoneCountryCode: this.updatecontactFrom.value.countryCode,
      phoneDialCode: this.updatecontactFrom.value.dialling_code ?? this.contactDelete.phoneDialCode,
      role: this.updatecontactFrom.value.contactrole,
      primaryContact: this.contactDelete.primaryContact,
      active: true,
      createdBy: parseInt(this.empinfo.employeeId),
      updatedBy: parseInt(this.empinfo.employeeId)
    }];
    this.http.putData(`ProjectManagementContact?contactId=${this.contactDelete?.contactId}`, payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.contactDelete = null;
        this.spinnerLoader = false;
        this.getContactData(this.clientId);
        this.conformationPopup.openSuccessModal('Contact info updated successfully');
      },
      error: (err) => {
        this.spinnerLoader = false;
        console.error("Update failed:", err);
        this.conformationPopup.openErrorModal(err.error.message);
      }
    });
  }

  onCountryChange(country: any,) {
    this.updatecontactFrom.get('countryCode')?.setValue(country.code);
    this.updatecontactFrom.get('dialling_code')?.setValue(country.dialling_code); // <-- Set dial code
    // Set phone validator for this contact
    this.updatecontactFrom.get('contactPhone')?.setValidators([
      Validators.required,
      this.phoneNumberValidator(country.code)
    ]);
    this.updatecontactFrom.get('contactPhone')?.updateValueAndValidity();
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

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
  }

  callapi() {
    this.getContactData(this.clientId);
  }

  openispermiarayModal(content: any, contactdata: any): void {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.contactDelete = contactdata;
  }

  yesChangesprimary(): void {
    const payload = [{
      entityType: "Client",
      entityRefId: this.clientId,
      name: this.contactDelete.name,
      email: this.contactDelete.email,
      phoneNumber: this.contactDelete.phoneNumber,
      phoneCountryCode: this.contactDelete.phoneCountryCode,
      phoneDialCode: this.contactDelete.phoneDialCode,
      role: this.contactDelete.role,
      primaryContact: true,
      active: true,
      createdBy: parseInt(this.empinfo.employeeId),
      updatedBy: parseInt(this.empinfo.employeeId)
    }];
    this.http.putData(`ProjectManagementContact?contactId=${this.contactDelete?.contactId}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.modalService.dismissAll();
          this.contactDelete = null;
          this.conformationPopup.openSuccessModal('Primary Contact has been set successfully');
          this.getContactData(this.clientId);
        },
        error: (err) => {
          this.conformationPopup.openErrorModal(err.error.message)
          console.error('Error deleting contact:', err);
          this.getContactData(this.clientId);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../services/form-validations.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { RbacService } from '../../../services/rbac.service';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
@Component({
  selector: 'app-project-contacts',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, NgxCountriesDropdownModule,
    DataLoaderContentComponent, NoDataFoundComponent, ConfirmationIconComponent],
  templateUrl: './project-contacts.component.html',
  styleUrl: './project-contacts.component.scss'
})

export class ProjectContactsComponent implements OnInit {
  projectId: any;
  empinfo: any;
  loading: boolean = true;
  updatecontactFrom!: FormGroup
  contactData: any[] = [];
  contactDelete: any;
  spinnerLoader = false
  selectedDialCode: any;
  selectedCountryCodegflag: any;
  selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true,
  };
  inactiveStatus: any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private modalService: NgbModal, private route: ActivatedRoute, private http: HttpService,
    public formValidation: FormValidationsService, private conformationPopup: OpenModalService,
    private fb: FormBuilder, public rbac: RbacService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.intizationfrom()
    this.route.queryParams.subscribe(params => {
      const projectId = params['id'];
      if (projectId) {
        this.projectId = projectId;
        this.getContactData(projectId);
        this.getProject(projectId);
      }
    });
    this.http.contactDetailesadded$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.getContactData(this.projectId);
    });
  }

  getProject(projectId: string) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.inactiveStatus = (res?.data ?? []).some((p: any) =>
          p.status === 'Inactive' || p.client.status === 'Inactive') ? 'Inactive' : 'Active';
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
      },
    });
  }

  intizationfrom() {
    this.updatecontactFrom = this.fb.group({
      contactname: [null, [Validators.required, this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(51)]],
      contactPhone: [null, Validators.required],
      contactrole: [null, [Validators.required, this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(51)]],
      countryCode: [null],
      dialling_code: [null],
      contactemail: [null, [Validators.required, Validators.email]]
    }
    )
  }

  getContactData(projectId: string) {
    this.http.getData(`ProjectManagementContact?status=Active&entityType=Project&entityRefId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.contactData = res?.data ?? [];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.contactData = [];
        console.error('Error fetching projects data:', err);
        this.contactData = [];
      },
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

  opendeletModal(content: any, contactdata: any): void {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.contactDelete = contactdata;
  }

  deleteContact(): void {
    const payload = [{
      entityType: "Project",
      entityRefId: this.projectId,
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
    this.http.putData(`ProjectManagementContact?contactId=${this.contactDelete?.contactId}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.modalService.dismissAll();
          this.contactDelete = null;
          this.conformationPopup.openSuccessModal('Contact deleted successfully.');
          this.getContactData(this.projectId);
        },
        error: (err) => {
          this.conformationPopup.openErrorModal('Error deleting contact.');
          console.error('Error deleting contact:', err);
          this.modalService.dismissAll();
        }
      });
  }

  callapi() {
    this.getContactData(this.projectId);
  }

  openispermiarayModal(content: any, contactdata: any): void {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.contactDelete = contactdata;
  }

  yesChangesprimary(): void {
    const payload = [{
      entityType: "Project",
      entityRefId: this.projectId,
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
          this.getContactData(this.projectId);
        },
        error: (err) => {
          this.conformationPopup.openErrorModal('Error deleting contact.');
          console.error('Error deleting contact:', err);
          this.modalService.dismissAll();
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
      entityType: "Project",
      entityRefId: this.projectId,
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
        this.getContactData(this.projectId);
        this.conformationPopup.openSuccessModal('Contact Info updated successfully');
      },
      error: (err) => {
        this.spinnerLoader = false;
        console.error("Update failed:", err);
          this.conformationPopup.openErrorModal(err.error.message);
      }
    });
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
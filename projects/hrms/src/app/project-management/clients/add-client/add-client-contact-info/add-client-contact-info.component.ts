import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../../../Interfaces/projects.model';
import { Subject, takeUntil } from 'rxjs';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { Router } from '@angular/router';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { CommonModule } from '@angular/common';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import { ConfirmationIconComponent } from "../../../../icons/confirmation-icon/confirmation-icon.component";
import { CircularAddComponent } from "../../../../icons/circular-add/circular-add.component";
import { CircularDeleteComponent } from "../../../../icons/circular-delete/circular-delete.component";
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-add-client-contact-info',
  imports: [CommonModule, ReactiveFormsModule, NgxCountriesDropdownModule, TranslateModule, ConfirmationIconComponent, CircularAddComponent, CircularDeleteComponent],
  templateUrl: './add-client-contact-info.component.html',
  styleUrl: './add-client-contact-info.component.scss'
})

export class AddClientContactInfoComponent {
  addContactForm!: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();
  empinfo: any;
  latestClientId: any
  clientId: any
  clients: Client[] = [];
  selectedDialCode: any;
  selectedCountryCodegflag: any;
  selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true,
  };

  constructor(private fb: FormBuilder, public formValidations: FormValidationsService, private modalService: NgbModal, public formValidation: FormValidationsService,
    private route: Router, private http: HttpService, private conformationPopup: OpenModalService) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getClientsData()
    this.createContactForm();
     localStorage.getItem('newlyAddedClientId');
  this.latestClientId = localStorage.getItem('newlyAddedClientId');
  }

  createContactForm() {
    this.addContactForm = this.fb.group({
      contacts: this.fb.array([this.createContactGroup()])
    });
  }

  // Create a single contact form group
  createContactGroup(): FormGroup {
    const group = this.fb.group({
      contactName: [null, [Validators.required, this.formValidations.minCharactersValidator(3), this.formValidations.maxCharactersValidator(51), ]],
      contactEmail: [null, [Validators.required, Validators.email,]],
      contactPhone: [null, [Validators.required,]],
      contactRole: [null, [Validators.required, Validators.minLength(3), Validators.maxLength(50), ]],
      countryCode: [null, [Validators.required]],      // <-- Add this
      dialling_code: [null, [Validators.required]]
    });
 
    return group;
  }
onRoleChange(control: AbstractControl|null) {
   if (!control) return;
  control.markAsTouched();
  control.updateValueAndValidity();
}
  // Getter for easy access
  get contacts(): FormArray {
    return this.addContactForm.get('contacts') as FormArray;
  }

  // Add a new row
  addContact() {
    this.contacts.push(this.createContactGroup());
  }

  // Remove a row
  removeContact(index: number) {
    this.contacts.removeAt(index);
  }

  onCountryChange(country: any, index: number) {
    const contactsArray = this.addContactForm.get('contacts') as FormArray;
    const contactGroup = contactsArray.at(index) as FormGroup;
    contactGroup.get('countryCode')?.setValue(country.code);
    contactGroup.get('dialling_code')?.setValue(country.dialling_code); // <-- Set dial code
    // Set phone validator for this contact
    contactGroup.get('contactPhone')?.setValidators([
      Validators.required,
      this.phoneNumberValidator(country.code)
    ]);
    contactGroup.get('contactPhone')?.updateValueAndValidity();
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

  getClientsData(): void {
    this.http.getData(`Client/GetAll?status=Archive`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.clients = Array.isArray(res?.data[0]) ? res.data[0] : [];
        if (Array.isArray(res?.data) && res.data.length > 0) {
          const latestClient = res.data[0];
          this.clients = [latestClient];
          // Store only clientId
          // this.latestClientId = latestClient.clientId;
        } else {
          this.clients = [];
          // this.latestClientId = null;
        }
      },
      error: (err) => {
        this.clients = [];
        console.error('Error fetching clients:', err);
      }
    });
  }

  submitContacts() {
    const contactsArray = this.addContactForm.get('contacts') as FormArray;
    const payload = contactsArray.value.map((contact: any, idx: number) => ({
      entityType: "Client",
      entityRefId: this.latestClientId,
      name: contact.contactName,
      email: contact.contactEmail,
      phoneNumber: contact.contactPhone,
      phoneCountryCode: contact.countryCode,
      phoneDialCode: contact.dialling_code,
      role: contact.contactRole,
      primaryContact: idx === 0 ? true : false,
      active: true,
      createdBy: parseInt(this.empinfo.employeeId),
      updatedBy: parseInt(this.empinfo.employeeId)
    }));
    // Call your API with payload
    this.http.postdata('ProjectManagementContact', payload).subscribe({
      next: (res) => {
        this.modalService.dismissAll();
        this.addContactForm.reset();
        this.contacts.clear();
        this.route.navigate(['/project-management/clients/add/documents']);
        // this.conformationPopup.openSuccessModal('Contacts added successfully');
      },
      error: (err) => {
        this.conformationPopup.openErrorModal(err.error?.message || 'Failed to add contacts');
        // handle error 
      }
    });
  }

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  close() {
    this.modalService.dismissAll();
    this.route.navigate(['/project-management/clients/active'])
  }
}
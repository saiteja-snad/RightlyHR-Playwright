import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormValidationsService } from '../../../services/form-validations.service';
import { CommonModule } from '@angular/common';
import { NgxCountriesDropdownModule } from 'ngx-countries-dropdown';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { Subject, takeUntil } from 'rxjs';
import { Project } from '../../../Interfaces/projects.model';
import { OpenModalService } from '../../../services/open-modal.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../../../services/http.service';
import { CircularAddComponent } from "../../../icons/circular-add/circular-add.component";
import { CircularDeleteComponent } from "../../../icons/circular-delete/circular-delete.component";
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-project-contact-info-creation',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, NgxCountriesDropdownModule, CircularAddComponent, CircularDeleteComponent],
  templateUrl: './project-contact-info-creation.component.html',
  styleUrl: './project-contact-info-creation.component.scss'
})

export class ProjectContactInfoCreationComponent implements OnInit, OnDestroy {
  addContactForm!: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();
  projectsData: Project[] = [];
  contactData: any[] = [];
  clients: any[] = [];
  empinfo: any;
  entityType: any
  primaryContact: any;
  spinnerLoader = false
  entityRefId: any
  selectedDialCode: any;
  selectedCountryCodegflag: any;
  selectedCountryConfig: { hideCode: boolean; hideName: boolean; dialCode?: string } = {
    hideCode: true,
    hideName: true
  };
  countryListConfig = {
    hideCode: true,
  };

  constructor(private fb: FormBuilder, private modalService: NgbModal, public formValidation: FormValidationsService,
    private route: ActivatedRoute, private http: HttpService, private conformationPopup: OpenModalService, private router: Router) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.createContactForm();
    this.getcontactbaedonRoute();
  }

  getcontactbaedonRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/project-management/projects')) {
      this.entityType = 'Project';
      this.route.queryParams.subscribe(params => {
        const projectId = params['id'];
        if (projectId) {
          this.getProjects(projectId);
          this.entityRefId = parseInt(projectId);
          this.getContactData();
        }
      });
    } else if (fullPath.startsWith('/project-management/clients')) {
      this.entityType = 'Client';
      this.route.queryParams.subscribe(params => {
        const clientID = params['id'];
        if (clientID) {
          this.getClientsbyid(clientID);
          this.entityRefId = parseInt(clientID);
          this.getContactData();
        }
      });
    }
  }

  createContactForm() {
    this.addContactForm = this.fb.group({
      contacts: this.fb.array([this.createContactGroup()])
    });
  }

  // Create a single contact form group
  createContactGroup(): FormGroup {
    const group = this.fb.group({
      contactName: [null, [Validators.required,this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(51) ]],
      contactPhone: [null,[ Validators.required, ]],
      contactRole: [null, [Validators.required, this.formValidation.minCharactersValidator(2), this.formValidation.maxCharactersValidator(51) ]],
      contactEmail: [null, [Validators.required, Validators.email, ]],
      countryCode: [null, [Validators.required]],
      dialling_code: [null, [Validators.required]]
    });
 
    return group
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

  cancel() {
    this.modalService.dismissAll();
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

  getProjects(projectId: string) {
    this.http.getData(`Project?projectId=${projectId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.projectsData = res?.data ?? []; // Extract "data" array
      },
      error: (err) => {
        console.error('Error fetching projects data:', err);
        this.projectsData = [];
      },
    });
  }

  getClientsbyid(clientID: any): void {
    this.http.getData(`Client/${clientID}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const client = res.data;
          this.clients = [client];
        }
      },
      error: (err) => {
        this.clients = [];
        console.error('Error fetching clients:', err);
      }
    });
  }

  getContactData() {
    this.http.getData(`ProjectManagementContact?status=Active&entityType=${this.entityType}&entityRefId=${this.entityRefId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.contactData = res?.data ?? [];
        this.primaryContact = this.contactData.some((c: any) => c.primaryContact === true);
      },
      error: (err) => {
        this.contactData = [];
        console.error('Error fetching projects data:', err);
        this.contactData = [];
      },
    });
  }

  submitContacts() {
    this.spinnerLoader = true
    const contactsArray = this.addContactForm.get('contacts') as FormArray;
    const payload = contactsArray.value.map((contact: any, idx: number) => ({
      entityType: this.entityType,
      entityRefId: this.entityRefId,
      name: contact.contactName,
      email: contact.contactEmail,
      phoneNumber: contact.contactPhone,
      phoneCountryCode: contact.countryCode,
      phoneDialCode: contact.dialling_code,
      role: contact.contactRole,
      primaryContact: (!this.primaryContact && idx === 0) ? true : false,
      active: true,
      createdBy: parseInt(this.empinfo.employeeId),
      updatedBy: parseInt(this.empinfo.employeeId)
    }));
    // Call your API with payload
    this.http.postdata('ProjectManagementContact', payload).subscribe({
      next: (res) => {
        this.spinnerLoader = false;
        this.modalService.dismissAll();
        this.addContactForm.reset();
        this.contacts.clear();
        this.http.setnewcontactDetails();
        this.conformationPopup.openSuccessModal('Contact Info added successfully');
      },
      error: (err) => {
        this.spinnerLoader = false;
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

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
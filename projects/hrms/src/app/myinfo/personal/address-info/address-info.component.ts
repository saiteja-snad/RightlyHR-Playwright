import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';


@Component({
  selector: 'app-address-info',
  imports: [CommonModule, ReactiveFormsModule,],
  templateUrl: './address-info.component.html',
  styleUrl: './address-info.component.scss'
})
export class AddressInfoComponent {
  buttons = false;
  buttons2 = false;
  addressForm!: FormGroup;
  currentAddress: any;
  permanentAddress: any;
  subscription!: Subscription
  empinfo: any
  bloodGroups = [
    { name: 'A+' },
    { name: 'A-' },
    { name: 'B+' },
    { name: 'B-' },
    { name: 'AB+' },
    { name: 'AB-' },
    { name: 'O+' },
    { name: 'O-' }
  ];


  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.initializeForm();
    this.getEmployeeId();
    ;
    this.addressForm.disable();


  }

  initializeForm(): void {
    this.addressForm = this.fb.group({
      currentAddressLine1: ['', Validators.required],
      currentAddressLine2: [''],
      currentCity: ['', Validators.required],
      currentState: ['', Validators.required],
      currentCountry: ['', Validators.required],
      currentZipCode: ['', Validators.required],
      permanentAddressLine1: ['', Validators.required],
      permanentAddressLine2: [''],
      permanentCity: ['', Validators.required],
      permanentState: ['', Validators.required],
      permanentCountry: ['', Validators.required],
      permanentZipCode: ['', Validators.required],
    });
  }

  enableForm(): void {
    this.buttons = true;
    this.addressForm.get('currentAddressLine1')?.enable();
    this.addressForm.get('currentAddressLine2')?.enable();
    this.addressForm.get('currentCity')?.enable();
    this.addressForm.get('currentState')?.enable();
    this.addressForm.get('currentCountry')?.enable();
    this.addressForm.get('currentZipCode')?.enable();
  }
  enableForm2(): void {
    this.buttons2 = true;
    this.addressForm.get('permanentAddressLine1')?.enable();
    this.addressForm.get('permanentAddressLine2')?.enable();
    this.addressForm.get('permanentCity')?.enable();
    this.addressForm.get('permanentState')?.enable();
    this.addressForm.get('permanentCountry')?.enable();
    this.addressForm.get('permanentZipCode')?.enable();
  }

  disableForm(): void {
    this.buttons = false;
    this.buttons2 = false;
    this.addressForm.disable();
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empinfo = data;
        this.patchForm(data);
      },
      error: (reason: any) => console.error('Error fetching employee data:', reason),
    });
  }

  patchForm(data: any): void {
    this.currentAddress = data.employeeAddresses.find((address: any) => address.type === 'C');
    this.permanentAddress = data.employeeAddresses.find((address: any) => address.type === 'P');
    // this.empinfo = data

    this.addressForm.patchValue({
      currentAddressLine1: this.currentAddress?.addressLine1 || '',
      currentAddressLine2: this.currentAddress?.addressLine2 || '',
      currentCity: this.currentAddress?.city || '',
      currentState: this.currentAddress?.state || '',
      currentCountry: this.currentAddress?.country || '',
      currentZipCode: this.currentAddress?.zipCode || '',
      permanentAddressLine1: this.permanentAddress?.addressLine1 || '',
      permanentAddressLine2: this.permanentAddress?.addressLine2 || '',
      permanentCity: this.permanentAddress?.city || '',
      permanentState: this.permanentAddress?.state || '',
      permanentCountry: this.permanentAddress?.country || '',
      permanentZipCode: this.permanentAddress?.zipCode || '',
      // Add any other fields you need to patch
    });
  }
  updateAddressInfo(): void {
    const formValue = this.addressForm.value; // Get updated form values

  // Ensure the existing address object remains unchanged while updating fields
  this.currentAddress = this.currentAddress
    ? {
        ...this.currentAddress,
        addressLine1: formValue.currentAddressLine1 || this.currentAddress.addressLine1,
        addressLine2: formValue.currentAddressLine2 || this.currentAddress.addressLine2,
        city: formValue.currentCity || this.currentAddress.city,
        state: formValue.currentState || this.currentAddress.state,
        country: formValue.currentCountry || this.currentAddress.country,
        zipCode: formValue.currentZipCode || this.currentAddress.zipCode,
      }
    : null;

  this.permanentAddress = this.permanentAddress
    ? {
        ...this.permanentAddress,
        addressLine1: formValue.permanentAddressLine1 || this.permanentAddress.addressLine1,
        addressLine2: formValue.permanentAddressLine2 || this.permanentAddress.addressLine2,
        city: formValue.permanentCity || this.permanentAddress.city,
        state: formValue.permanentState || this.permanentAddress.state,
        country: formValue.permanentCountry || this.permanentAddress.country,
        zipCode: formValue.permanentZipCode || this.permanentAddress.zipCode,
      }
    : null;

  // Debugging Log - Ensure both addresses are updated properly
  console.log('Updated Current Address:', this.currentAddress);
  console.log('Updated Permanent Address:', this.permanentAddress);

  // Prepare payload for employee details update
  const updatePayload = {
    employeeId: this.empinfo.employeeId,
    title: this.empinfo.title || null,
    firstName: this.empinfo.firstName,
    middleName: this.empinfo.middleName,
    lastName: this.empinfo.lastName,
    gender: this.empinfo.gender || null,
    dob: this.empinfo.dob,
    bloodGroup: this.empinfo.bloodGroup || null,
    maritalStatus: this.empinfo.maritalStatus || null,
    empStatus: this.empinfo.empstatus,
    emailaddress: this.empinfo.emailaddress || null, 
    workEmail: this.empinfo.workEmail || null, 
    contactnumber: this.empinfo.contactnumber || null,
    workPhone: this.empinfo.workPhone || null, 
  };

  // Send employee basic details update
  this.subscription = this.http.postdata(`Employeedata/UPDATER`, updatePayload)
    .subscribe({
      next: (data: any) => {
        console.log('Data updated successfully:', data);
        this.modalService.dismissAll();
        this.postEmployeeAddresses(); // Ensure updated addresses are sent
        this.conformationPopup.openSuccessModal('Basic Info updated successfully');
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('Basic Info update failed');
      },
    });
  }

  postEmployeeAddresses() {
    const payload = {
      employeeAddresses: [this.currentAddress, this.permanentAddress],
    };
  
    this.subscription = this.http.postdata('EmployeeAddress', payload)
      .subscribe({
        next: (data: any) => {
          console.log('Addresses updated successfully:', data);
          this.conformationPopup.openSuccessModal('Basic Info updated successfully');
        },
        error: (reason) => {
          console.log(reason);
          this.conformationPopup.openErrorModal('Basic Info update failed');

        },
      });
  }
  copyCurrentAddress(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.addressForm.patchValue({
        permanentAddressLine1: this.addressForm.value.currentAddressLine1,
        permanentAddressLine2: this.addressForm.value.currentAddressLine2,
        permanentCity: this.addressForm.value.currentCity,
        permanentState: this.addressForm.value.currentState,
        permanentCountry: this.addressForm.value.currentCountry,
        permanentZipCode: this.addressForm.value.currentZipCode,
      });
    } else {
      this.addressForm.patchValue({
        permanentAddressLine1: '',
        permanentAddressLine2: '',
        permanentCity: '',
        permanentState: '',
        permanentCountry: '',
        permanentZipCode: '',
      });
    }
  }
  saveForm(): void {
    if (this.addressForm.valid) {
      console.log('Form Data:', this.addressForm.value);
      this.disableForm();
    }
  }

}




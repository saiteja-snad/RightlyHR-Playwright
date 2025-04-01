import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';


@Component({
  selector: 'app-address-info',
  imports: [CommonModule, ReactiveFormsModule, ],
  templateUrl: './address-info.component.html',
  styleUrl: './address-info.component.scss'
})
export class AddressInfoComponent {
  buttons= false;
  addressForm!: FormGroup;
 
  subscription!:Subscription
  empinfo:any
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
    this.addressForm.enable();
  }

  disableForm(): void {
    this.buttons = false;
    this.addressForm.reset();
    this.addressForm.disable();
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
       this.patchForm(data);
      },
      error: (reason:any) => console.error('Error fetching employee data:', reason),
    });
  }

  patchForm(data: any): void {
    this.addressForm.patchValue({
      employeeId: data.employeeId,
      currentAddressLine1: data.currentAddressLine1,
      currentAddressLine2: data.currentAddressLine2,
      currentCity: data.currentCity,

      currentState: data.currentState,
      currentCountry: data.currentCountry,
      currentZipCode: data.currentZipCode,
      permanentAddressLine1: data.permanentAddressLine1,
      permanentAddressLine2: data.permanentAddressLine2,
      permanentCity: data.permanentCity,
      permanentState: data.permanentState,
      permanentCountry: data.permanentCountry,
      permanentZipCode: data.permanentZipCode,
      // Add any other fields you need to patch
      
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

  


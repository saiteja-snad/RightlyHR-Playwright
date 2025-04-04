import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OpenModalService } from '../../../services/open-modal.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-contact-details',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss'
})
export class ContactDetailsComponent {

  contactForm!: FormGroup;
subscription!:Subscription
  empinfo:any
  buttons= false;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getEmployeeId();
    this.initializeForm();
    this.contactForm.disable();
  }       

  initializeForm(): void {
    this.contactForm = this.fb.group({
 
      personalEmail: ['', Validators.required],
      workMail: ['',Validators.required],
      phoneNumber: ['', Validators.required],
      workNumber: ['', Validators.required],
  
    });
  }



enableForm(): void {
  this.buttons = true;
  this.contactForm.enable();
}

disableForm(): void {
  this.buttons = false;
  this.contactForm.reset();
  this.contactForm.disable();
}
  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
      this.patchForm(data);
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  patchForm(data: any): void {   
    this.contactForm.patchValue({
      personalEmail: data.emailaddress || '', // Bind personal email
      workMail: data.workEmail || '',         // Bind work email
      phoneNumber: data.contactnumber || '',  // Bind personal phone number
      workNumber: data.workPhone || '',       // Bind work phone number
    });
  }
  updateAddressInfo(): void {
    const formValue = this.contactForm.value; 
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
    emailaddress: formValue.personalEmail || null, 
    workEmail: formValue.workMail || null, 
    contactnumber: formValue.phoneNumber || null,
    workPhone: formValue.workNumber || null, 
  };

 
  this.subscription = this.http.postdata(`Employeedata/UPDATER`, updatePayload)
    .subscribe({
      next: (data: any) => {
        console.log('Data updated successfully:', data);
        this.modalService.dismissAll();
        
        this.conformationPopup.openSuccessModal('Basic Info updated successfully');
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('Basic Info update failed');
      },
    });
  }
  showButtons() {
    this.buttons = !this.buttons
  }
}

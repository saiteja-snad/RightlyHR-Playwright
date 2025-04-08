import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OpenModalService } from '../../../services/open-modal.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { IJob } from '../../../Interfaces/job-model';

@Component({
  selector: 'app-contact-details',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './contact-details.component.html',
  styleUrl: './contact-details.component.scss'
})
export class ContactDetailsComponent {

  contactForm!: FormGroup;
subscription!:Subscription
 empinfo = {} as IJob;
 employedata:any[]=[]
  buttons= false;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.getEmployeeId();
    this.initializeForm();
    this.contactForm.disable();
  }       

  initializeForm(): void {
    this.contactForm = this.fb.group({
      personalEmail: ['', [Validators.required, Validators.email]], 
      workMail: ['', [Validators.required, Validators.email]], // Required and valid email format
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]], // Required and 10-digit phone number
      workNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]], // Required and 10-digit phone number
  
    });
  }



enableForm(): void {
  this.buttons = true;
  this.contactForm.enable();
}

disableForm(): void {
  this.buttons = false;

  this.contactForm.disable();
}
  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
      this.employedata = data;
      this.patchForm(data);
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }

  patchForm(data: any): void {   
    this.contactForm.patchValue({
      personalEmail: data.emailaddress || this.empinfo.emailaddress,
      workMail: data.workEmail || this.empinfo.workMail,         // Bind work email
      phoneNumber: data.contactnumber || this.empinfo.contactnumber,  // Bind personal phone number
      workNumber: data.workPhone || this.empinfo.workPhone,       // Bind work phone number
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
    bloodGroup: this.empinfo.bloodGroup ,
    maritalStatus: this.empinfo.maritalStatus,
    empStatus: this.empinfo.empstatus,
    emailaddress: formValue.personalEmail || this.empinfo.personalEmail, 
    workEmail: formValue.workMail || this.empinfo.workMail, 
    contactnumber: formValue.phoneNumber || this.empinfo.phoneNumber,
    workPhone: formValue.workNumber || this.empinfo.workNumber,
    emergencyName: this.empinfo.emergencyName,
    emailId: this.empinfo.emailId,
    relationShip: this.empinfo.relationShip,
    mobileNumber: this.empinfo.mobileNumber,
    emergencyName1: this.empinfo.emergencyName1,
    emergencyEmail1: this.empinfo.emergencyEmail1,
    emergencyNumber1: this.empinfo.emergencyNumber1,
    relationship1: this.empinfo.relationship1,
  };

 
  this.subscription = this.http.postdata(`Employeedata/UPDATER`, updatePayload)
    .subscribe({
      next: (data: any) => {
        console.log('Data updated successfully:', data);
        this.modalService.dismissAll();
        this.contactForm.disable();
        this.buttons = false; // Disable the button after successful update
        this.getEmployeeId(); 
        this.conformationPopup.openSuccessModal('Contact Details updated successfully');
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('Contact Details update failed');
      },
    });
  }
  showButtons() {
    this.buttons = !this.buttons
  }
}

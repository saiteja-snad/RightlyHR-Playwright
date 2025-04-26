import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class ContactDetailsComponent implements OnInit,OnDestroy{

  contactForm!: FormGroup;
subscription!:Subscription
 empinfo = {} as IJob;
 employedata={} as any;
  buttons= false;
  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.getEmployeeId();
    this.initializeForm();
    this.contactForm.disable();
  }       

enableForm(): void {
  this.buttons = true;
  this.contactForm.enable();
}

disableForm(): void {
  this.buttons = false;
  this.contactForm.disable();
}

initializeForm(): void {
  this.contactForm = this.fb.group({
    personalEmail: ['', [Validators.required, Validators.email]],  
    workMail: ['', [Validators.required, Validators.email]],  
    phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]], 
    workNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],  
  });
}

getEmployeeId(): void {
  const employeeId = parseInt(this.empinfo.employeeId, 10);  
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
    workMail: data.workEmail || this.empinfo.workMail,  
    phoneNumber: data.contactnumber || this.empinfo.contactnumber,  
    workNumber: data.workPhone || this.empinfo.workPhone, 
  });

  console.log(this.contactForm.value);  
}


  updateAddressInfo(): void {
    const formValue = this.contactForm.value; 
  const updatePayload = {
    ...this.employedata,
    emailaddress: formValue.personalEmail || this.employedata.personalEmail, 
    workEmail: formValue.workMail || this.employedata.workMail, 
    contactnumber: formValue.phoneNumber || this.employedata.phoneNumber,
    workPhone: formValue.workNumber || this.employedata.workNumber,
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}

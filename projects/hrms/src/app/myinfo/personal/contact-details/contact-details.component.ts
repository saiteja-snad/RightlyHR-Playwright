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
      employeeId: ['', Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      pinCode: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      emailId: ['', [Validators.required, Validators.email]],
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
     //  this.patchForm(data);
      },
      error: (reason) => console.error('Error fetching employee data:', reason),
    });
  }
  // patchForm(data: any): void {   
  //   this.contactForm.patchValue({
  //     employeeId: data.employeeId,
  //     addressLine1: data.addressLine1,
  //     addressLine2: data.addressLine2,
  //     city: data.city,
  //     state: data.state,

  //     country: data.country,
  //     pinCode: data.pinCode,
  //     phoneNumber: data.phoneNumber,
  //     emailId: data.emailId,
  //   });
  // }

  showButtons() {
    this.buttons = !this.buttons
  }
}

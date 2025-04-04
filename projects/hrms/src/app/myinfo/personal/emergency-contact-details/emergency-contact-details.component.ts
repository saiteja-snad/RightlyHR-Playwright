import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-emergency-contact-details',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './emergency-contact-details.component.html',
  styleUrl: './emergency-contact-details.component.scss'
})
export class EmergencyContactDetailsComponent {
 
  subscription!:Subscription
  buttons= false;
  buttons2= false;
  emergencyContactForm!: FormGroup;
  empinfo:any
  constructor(private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getEmployeeId();
    this.initializeForm();
    this.emergencyContactForm.disable(); // Disable the form initially
  }

  initializeForm(): void {
    this.emergencyContactForm = this.fb.group({
      contact1Name: ['', Validators.required],
      contact1Email: ['', [Validators.required, Validators.email]],
      contact1Phone: ['', Validators.required],
      contact1Relationship: ['', Validators.required],
      contact2Name: ['', Validators.required],
      contact2Email: ['', [Validators.required, Validators.email]],
      contact2Phone: ['', Validators.required],
      contact2Relationship: ['', Validators.required],
    });
  }
  showButtons() {
    this.buttons = !this.buttons
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
    this.emergencyContactForm.patchValue({
      contact1Name: data.emergencyName || '', // Bind first emergency contact name
      contact1Email: data.emailId || '',      // Bind first emergency contact email
      contact1Phone: data.emergencynumber || '', // Bind first emergency contact phone
      contact1Relationship: data.relationShip || '', // Bind first emergency contact relationship
      contact2Name: data.emergencyName1 || '', // Bind second emergency contact name
      contact2Email: data.emergencyEmail1 || '', // Bind second emergency contact email
      contact2Phone: data.emergencyNumber1 || '', // Bind second emergency contact phone
      contact2Relationship: data.relationship1 || '', // Bind second emergency contact relationship
    });
  }

  enableForm(): void {
    this.buttons = true;
    this.emergencyContactForm.get('contact1Name')?.enable();
    this.emergencyContactForm.get('contact1Email')?.enable();
    this.emergencyContactForm.get('contact1Phone')?.enable();
    this.emergencyContactForm.get('contact1Relationship')?.enable();
  
  }

  disableForm(): void {
    this.buttons = false;
    this.buttons2 = false;
    this.emergencyContactForm.disable();
  }

  enableForm2(): void {
    this.buttons2 = true;
    this.emergencyContactForm.get('contact2Name')?.enable();
    this.emergencyContactForm.get('contact2Email')?.enable();
    this.emergencyContactForm.get('contact2Phone')?.enable();
    this.emergencyContactForm.get('contact2Relationship')?.enable();
  }
  saveForm(): void {
    if (this.emergencyContactForm.valid) {
      console.log('Form Data:', this.emergencyContactForm.value);
      this.disableForm();
    }
  }
}

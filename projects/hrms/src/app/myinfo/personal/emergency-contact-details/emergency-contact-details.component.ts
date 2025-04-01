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
  showButtons() {
    this.buttons = !this.buttons
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
  //   this.emergencyContactForm.patchValue({ 
  //     employeeId: data.employeeId,
  //     contact1Name: data.contact1Name,
  //     contact1Email: data.contact1Email,
  //     contact1Phone: data.contact1Phone,
  //     contact1Relationship: data.contact1Relationship,
  //     contact2Name: data.contact2Name,


  //     contact2Email: data.contact2Email,


  //     contact2Phone: data.contact2Phone,
  //     contact2Relationship: data.contact2Relationship,
  //   });
  // }
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
  enableForm(): void {
    this.buttons = true;
    this.emergencyContactForm.enable();
  }

  disableForm(): void {
    this.buttons = false;
    this.emergencyContactForm.reset();
    this.emergencyContactForm.disable();
  }

  saveForm(): void {
    if (this.emergencyContactForm.valid) {
      console.log('Form Data:', this.emergencyContactForm.value);
      this.disableForm();
    }
  }
}

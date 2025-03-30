import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-pre-onboaring-details',
  imports: [CommonModule, Select,ReactiveFormsModule],
  standalone: true,
  templateUrl: './pre-onboaring-details.component.html',
  styleUrl: './pre-onboaring-details.component.scss'
})
export class PreOnboaringDetailsComponent {
  preOnboardingForm!: FormGroup;
  buttons: boolean = false;

  constructor(private fb: FormBuilder,private conformationPopup: OpenModalService, private http: HttpService) {}

  ngOnInit(): void {
    this.initializeForm();
    this.preOnboardingForm.disable(); // Disable the form initially
  }

  initializeForm(): void {
    this.preOnboardingForm = this.fb.group({
      offerSentDate: ['', Validators.required],
      offerSentBy: ['', Validators.required],
      offerSentStatus: ['', Validators.required],
      appointmentSentDate: ['', Validators.required],
      appointmentSentBy: ['', Validators.required],
      appointmentSentStatus: ['', Validators.required],
      traineeOfferSentDate: ['', Validators.required],
      traineeOfferSentBy: ['', Validators.required],
      traineeOfferSentStatus: ['', Validators.required],
      traineeAppointmentSentBy: ['', Validators.required],
      traineeAppointmentSentStatus: ['', Validators.required],
    });
  }

  enableForm(): void {
    this.buttons = true;
    this.preOnboardingForm.enable();
  }

  disableForm(): void {
    this.buttons = false;
    this.preOnboardingForm.reset();
    this.preOnboardingForm.disable();
  }

  saveForm(): void {
    if (this.preOnboardingForm.valid) {
      console.log('Form Data:', this.preOnboardingForm.value);
      this.disableForm();
    } else {
      console.error('Form is invalid');
    }
  }
}

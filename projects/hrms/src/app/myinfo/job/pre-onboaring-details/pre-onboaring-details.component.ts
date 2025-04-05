import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { Ipersonal } from '../../../Interfaces/personal-modal';
import moment from 'moment';

@Component({
  selector: 'app-pre-onboaring-details',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './pre-onboaring-details.component.html',
  styleUrl: './pre-onboaring-details.component.scss'
})
export class PreOnboaringDetailsComponent {
  subscription!: Subscription;
  empinfo: any;
  preOnboardingForm!: FormGroup;
  buttons: boolean = false;

  empdata: Ipersonal = {} as Ipersonal;
  previousEmpData: Ipersonal = {} as Ipersonal;
  appointmentDetails: any;
  offerDetails: any;
  imgurl: any;

  constructor(private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getEmployeeId();
    this.getAppointmentEmployeebyId();
    this.getOfferLetterEmployeebyId();
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
      const payload = this.preOnboardingForm.value;

      this.http.postdata('Employeedata/UPDATER', payload).subscribe({
        next: (data: any) => {
          console.log('Data updated successfully:', data);
          this.conformationPopup.openSuccessModal('Data updated successfully!');
          window.location.reload();
        },
        error: (reason: any) => {
          console.error('Error updating data:', reason);
          alert('Something went wrong. Please check all the fields.');
        }
      });
    } else {
      this.preOnboardingForm.markAllAsTouched(); // Mark all fields as touched to show validation errors
    }
  }
  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data;
  }

  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    console.log(this.empinfo);

    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.previousEmpData = JSON.parse(JSON.stringify(data));
        this.empdata = data as Ipersonal;

        // Format dates
        this.empdata.lastworkingday = this.formatDate(this.empdata.lastworkingday);
        this.empdata.dateOfJoining = this.formatDate(this.empdata.dateOfJoining);
        this.empdata.probationEndDate = this.formatDate(this.empdata.probationEndDate);
        this.empdata.offerIssueddate = this.formatDate(this.empdata.offerIssueddate);

        console.log(this.empdata);
        this.imgurl = this.empdata.profilePic;

        // Patch the form with employee data
        this.preOnboardingForm.patchValue({
          traineeOfferSentDate: this.empdata.offerIssueddate || '',
          traineeOfferSentBy: this.empdata.createdby || '',
          traineeOfferSentStatus: this.empdata.offerstatus || ''
        });
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  getAppointmentEmployeebyId(): void {
    const Empid = parseInt(this.empinfo.employeeId);
    console.log(Empid);

    this.subscription = this.http.getData(`AppointmentLetter/getbyEmpidNames/${Empid}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.appointmentDetails = data;

        // Patch the form with appointment details
        this.preOnboardingForm.patchValue({
          appointmentSentDate: this.formatDate(this.appointmentDetails.appointmentSentDate) || '',
          appointmentSentBy: this.appointmentDetails.appointmentSentByName || '',
          appointmentSentStatus: this.appointmentDetails.appointmentSentStatus || ''
        });
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  getOfferLetterEmployeebyId(): void {
    const EmpId = parseInt(this.empinfo.employeeId);
    console.log(EmpId);

    this.subscription = this.http.getData(`OfferLetter/getbyEmpidNames/${EmpId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.offerDetails = data;

        // Patch the form with offer letter details
        this.preOnboardingForm.patchValue({
          offerSentDate: this.formatDate(this.offerDetails.offerSentDate) || '',
          offerSentBy: this.offerDetails.offerSentByName || '',
          offerSentStatus: this.offerDetails.offerSentStatus || ''
        });
      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }
}

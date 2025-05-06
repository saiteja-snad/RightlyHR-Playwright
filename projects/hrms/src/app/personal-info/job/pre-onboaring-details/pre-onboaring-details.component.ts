import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
export class PreOnboaringDetailsComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  empinfo: any;
  preOnboardingForm!: FormGroup;
  buttons: boolean = false;

  empdata: Ipersonal = {} as Ipersonal;
  previousEmpData: Ipersonal = {} as Ipersonal;
  appointmentDetails: any;
  offerDetails: any;
  imgurl: any;
  traineeofferDetails: any;

  constructor(private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.getEmployeeId();
    this.getAppointmentEmployeebyId();
    this.getOfferLetterEmployeebyId();
    this.getTraineeOfferLetterEmployeebyId();
    this.initializeForm();
    this.preOnboardingForm.disable(); // Disable the form initially
  }

  initializeForm(): void {
    this.preOnboardingForm = this.fb.group({
      offerSentDate: [{ value: '', disabled: true }],

      offerSentBy: [{ value: '', disabled: true }],
      offerSentStatus: [{ value: '', disabled: true }],
      appointmentSentDate: [{ value: '', disabled: true }],
      appointmentSentBy: [{ value: '', disabled: true }],
      appointmentSentStatus: [{ value: '', disabled: true }],
      traineeOfferSentDate: [{ value: '', disabled: true }],
      traineeOfferSentBy: [{ value: '', disabled: true }],
      traineeOfferSentStatus: [{ value: '', disabled: true }],
      traineeAppointmentSentBy: [{ value: '', disabled: true }],
      traineeAppointmentSentStatus: [{ value: '', disabled: true }]
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
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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


      },
      error: (err: any) => {
        console.log(err);
      }
    });
  }

  //function to get traineeofferletter data using getbyemployeeid
  getTraineeOfferLetterEmployeebyId() {
    let Empid = parseInt(this.empinfo.employeeId)
    console.log(Empid);
    this.subscription = this.http.getData(`TraineeOfferLetter/getbyEmpidNames/${Empid}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.traineeofferDetails = data

        // Patch the form with employee data
        this.preOnboardingForm.patchValue({
          traineeOfferSentDate:this.formatDate( this.traineeofferDetails.offerSentDate) ||  '',
          traineeOfferSentBy: this.traineeofferDetails.offerSentByName || '',
          traineeOfferSentStatus: this.traineeofferDetails.offerSentStatus || ''
        });

      },
      error: Reason => console.log(Reason)
    })

  }

  //function to get appointment letter data using getbyemployeeid
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

  //function to get offer letter data using getbyemployeeid
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}

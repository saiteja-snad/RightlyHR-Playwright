import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-event',
  imports: [CommonModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.scss'
})

export class AddEventComponent implements OnInit {

  subscription!: Subscription
  customEventForm!: FormGroup
  Employeeinfo = {} as any;
  selectedCustomEventField: any;
  spinnerLoader=false
  postEventsData:any
  constructor(public router: Router, private fb: FormBuilder,
    private http: HttpService, private conformationPopup: OpenModalService, private modalService: NgbModal,) { }

  ngOnInit(): void {
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") ?? '{}');
    this.initiateForm()
  }



  close() {
    this.modalService.dismissAll();
  }
  initiateForm() {
    this.customEventForm = this.fb.group({
      eventDate: ['', [Validators.required, this.futureDateValidator()]],
      eventTitle: ['', [Validators.required, Validators.pattern(/^(?!\s).*$/)]],
      eventMessage: ['', [Validators.required, Validators.pattern(/^(?!\s).*$/), Validators.maxLength(250)]],
      imageUrl: [null]
    });
  }
  onFileSelected(event: any) {
    const selectedFile: File = event.target.files[0];
  
    if (selectedFile) {
      const fileType = selectedFile.type;
  
      if (fileType === 'image/png' || fileType === 'image/jpeg') {
        const maxSize = 2 * 1024 * 1024; // 2MB
  
        if (selectedFile.size <= maxSize) {
          const reader = new FileReader();
  
          // Ensure the objects are initialized before setting properties
          if (!this.postEventsData) this.postEventsData = {};
          if (!this.selectedCustomEventField) this.selectedCustomEventField = {};
  
          reader.onload = (e: any) => {
            const base64String = e.target.result;
            this.postEventsData.attachmentUrl = base64String;
            this.selectedCustomEventField.attachmentUrl = base64String;
          };
  
          reader.readAsDataURL(selectedFile);
        } else {
          this.conformationPopup.openErrorModal('File size exceeds the allowed limit of 2MB.');
          if (this.postEventsData) this.postEventsData.attachmentUrl = null;
          event.target.value = '';
        }
      } else {
        this.conformationPopup.openErrorModal('Invalid file type. Only PNG and JPEG files are allowed.');
        if (this.postEventsData) this.postEventsData.attachmentUrl = null;
        event.target.value = '';
      }
    } else {
      event.target.value = '';
      if (this.postEventsData) this.postEventsData.attachmentUrl = null;
      if (this.selectedCustomEventField) this.selectedCustomEventField.attachmentUrl = null;
    }
  }
  

  postevents(customEventForm: FormGroup): void {
    if (customEventForm.valid) {
      this.spinnerLoader=true
      const formdata = customEventForm.value;

      const data = {
        eventDate: formdata.eventDate,
        eventMessage: formdata.eventMessage,
        empId: this.Employeeinfo.employeeId,
        isDeleted: false,
        eventTitle: formdata.eventTitle,
        attachmentUrl: this.postEventsData.attachmentUrl
      };

      this.subscription = this.http.postdata(`CustomEvents`, data).subscribe({
        next: (response: any) => {
          if (response) {
            this.spinnerLoader=false
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Event added successfully');
            // Optionally send custom emails or reset the form
            this.CustomEmail();
            window.location.reload()
          }
        },
        error: (err: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal('Insertion of data failed');
        }
      });
    } else {
      // Optional: mark all controls as touched to trigger validation UI
      this.customEventForm.markAllAsTouched();
    }
  }

  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = moment(control.value).format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');

      return selectedDate < today ? { pastDate: true } : null;
    };
  }


  CustomEmail() {
    const formdata = this.customEventForm.value
    const Emaildata = {
      eventDate: formdata.eventDate,
      eventMessage: formdata.eventMessage,
      empId: this.Employeeinfo.employeeId,
      eventTitle: formdata.eventTitle,
      senderName: this.Employeeinfo.firstName + " " + this.Employeeinfo.lastName
    }
    if (this.Employeeinfo.middleName) {
      Emaildata.senderName = `${this.Employeeinfo.firstName} ${this.Employeeinfo.middleName} ${this.Employeeinfo.lastName}`
    } else {
      Emaildata.senderName = `${this.Employeeinfo.firstName} ${this.Employeeinfo.lastName}`
    }
    this.subscription = this.http.postdata(`CustomEmail/Events`, Emaildata).subscribe({
      next: (data: any) => {
        console.log(data);
        this.customEventForm.reset()
      }
    })
  }

}
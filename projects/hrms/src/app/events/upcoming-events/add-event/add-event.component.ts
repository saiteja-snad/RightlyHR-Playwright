import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import moment from 'moment';

@Component({
  selector: 'app-add-event',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.scss'
})

export class AddEventComponent implements OnInit{
  @ViewChild('success') success: any;
  subscription!:Subscription
  customEventForm!:FormGroup
  Employeeinfo = {} as any;
  selectedCustomEventField: any;
  constructor(public router: Router, private fb: FormBuilder,
    private http: HttpService, private conformationPopup: OpenModalService, private modalService: NgbModal,) { }

    ngOnInit(): void {
      this.Employeeinfo = JSON.parse(localStorage.getItem("fusionuser") ?? '{}');
    this.initiateForm()
    }
  


  close() {
    this.modalService.dismissAll();
  }
  initiateForm(){
    this.customEventForm = this.fb.group({
      eventDate: ['', [Validators.required,this.futureDateValidator()]],
      eventTitle: ['', [Validators.required, Validators.pattern(/^(?!\s).*$/)]],
      eventMessage: ['', [Validators.required, Validators.pattern(/^(?!\s).*$/), Validators.maxLength(250)]],
      imageUrl: [null]
    });
  }

  // onFileSelected(event: any) {
  //   const selectedFile: File = event.target.files[0];

  //   // Check if a file was selected
  //   if (selectedFile) {
  //     // Check file type
  //     const fileType = selectedFile.type;
  //     if (fileType === 'image/png' || fileType === 'image/jpeg') {

  //       // Check file size
  //       const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  //       if (selectedFile.size <= maxSize) {
  //         const reader = new FileReader();
  //         reader.onload = (e: any) => {
  //           // e.target.result contains the file URL
  //           this.postEventsData.attachmentUrl = e.target.result;
  //           this.selectedCustomEventField.attachmentUrl = e.target.result;
  //         };
  //         // Read the file as a data URL (base64 encoded)
  //         reader.readAsDataURL(selectedFile);
  //       } else {
  //         // File size exceeds 2MB, show an error message or handle it accordingly
  //         this.dataFailureMsg('File size exceeds the allowed limit of 2MB.');
  //         this.postEventsData.attachmentUrl = null;
  //         // Reset the input field by setting its value to an empty string
  //         event.target.value = '';
  //       }
  //     } else {
  //       // File type is not PNG or JPEG, show an error message or handle it accordingly
  //       this.dataFailureMsg('Invalid file type. Only PNG and JPEG files are allowed.');
  //       this.postEventsData.attachmentUrl = null;
  //       // Reset the input field by setting its value to an empty string
  //       event.target.value = '';

  //     }
  //   } else {
  //     // Reset the input field by setting its value to an empty string
  //     event.target.value = '';
  //     this.postEventsData.attachmentUrl = null;
  //     this.selectedCustomEventField.attachmentUrl = null;
  //   }
  // }


  postevents(customEventForm: FormGroup): void {
    if (customEventForm.valid) {
      const formdata = customEventForm.value;
  
      const data = {
        eventDate: formdata.eventDate,
        eventMessage: formdata.eventMessage,
        empId: this.Employeeinfo.employeeId,
        isDeleted: false,
        eventTitle: formdata.eventTitle,
        attachmentUrl: formdata.imageUrl // this should be base64 from your file input
      };
  
      this.subscription = this.http.postdata(`CustomEvents`, data).subscribe({
        next: (response: any) => {
          if (response) {
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Event added successfully');
            // Optionally send custom emails or reset the form
            // this.CustomEmail();
            this.customEventForm.reset();
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

 
}
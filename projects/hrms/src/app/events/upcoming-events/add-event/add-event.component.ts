import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import moment from 'moment';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';

@Component({
  selector: 'app-add-event',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-event.component.html',
  styleUrl: './add-event.component.scss'
})

export class AddEventComponent implements OnInit, OnDestroy {

  subscription!: Subscription
  customEventForm!: FormGroup
  Employeeinfo = {} as any;
  selectedCustomEventField: any;
  spinnerLoader = false
  eventAttachment: any
  postEventsData: any
  imageUrl: any;
  constructor(public router: Router, private fb: FormBuilder,
    private http: HttpService, private conformationPopup: OpenModalService,public formValidation: FormValidationService, private sanitizer: DomSanitizer, private modalService: NgbModal,) { }

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
      eventTitle: ['', [Validators.required, Validators.pattern(/^(?!\s).*$/), Validators.maxLength(50)]],
      eventMessage: ['', [Validators.required, Validators.pattern(/^(?!\s).*$/), Validators.maxLength(250)]],
      imageUrl: ['']
    });
  }
  onFileSelected(event: any): void {
    const selectedFile: File = event.target.files[0];
    const fileType = selectedFile?.type;
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (!selectedFile) return;

    if (fileType === 'image/png' || fileType === 'image/jpeg') {
      if (selectedFile.size <= maxSize) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.customEventForm.patchValue({ imageUrl: e.target.result });
        };
        reader.readAsDataURL(selectedFile);
      } else {
        this.conformationPopup.openErrorModal('File size exceeds 2MB.');
        event.target.value = '';
      }
    } else {
      this.conformationPopup.openErrorModal('Invalid file type. Only PNG and JPG are allowed.');
      event.target.value = '';
    }
    const timestamp = new Date().getTime()
    this.eventAttachment = this.renameFileAttachment(
      selectedFile, `${this.Employeeinfo.employeeId}_${timestamp}_${selectedFile.name}`
    );
  }

  getMaxDate(): string {
    const now = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n);

    const year = now.getFullYear() + 2; // Add 2 years
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }


  getToday(): string {
    const now = new Date();
    const pad = (n: number) => n < 10 ? '0' + n : n;

    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hours = pad(now.getHours());
    const minutes = pad(now.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }



  postevents(): void {
    if (this.customEventForm.valid) {
      this.spinnerLoader = true;
      const payload = this.createEventPayload();

      const file = this.eventAttachment;
      if (file) {
        const filePath = `/Events/${this.Employeeinfo.employeeId}`;
        this.uploadEventAttachment(filePath, file, payload);
      } else {
        this.saveEvent(payload);
      }
    } else {
      this.customEventForm.markAllAsTouched(); // Show validation errors
    }
  }

  createEventPayload(attachmentPath: string = ''): any {
    const formdata = this.customEventForm.value;
    return {
      eventDate: formdata.eventDate,
      eventMessage: formdata.eventMessage,
      empId: this.Employeeinfo.employeeId,
      isDeleted: false,
      eventTitle: formdata.eventTitle,
      attachmentUrl: attachmentPath || null
    };
  }

  uploadEventAttachment(filePath: string, file: File, payload: any): void {
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file)
      .subscribe({
        next: (data: any) => {
          if (data?.path) {
            payload.attachmentUrl = data.path;
          }
          this.saveEvent(payload);
        },
        error: () => {
          this.spinnerLoader = false;
          console.error('Event file upload failed');
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal('File upload failed');
        }
      });
  }

  saveEvent(payload: any): void {
    this.subscription = this.http.postdata('CustomEvents', payload).subscribe({
      next: (response: any) => {
        this.spinnerLoader = false;
        if (response) {
          this.http.notifyEventAdded(); // Optional notification
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Event added successfully');
          this.CustomEmail(); // Send email notification
        }
      },
      error: () => {
        this.spinnerLoader = false;
        this.modalService.dismissAll();
        this.conformationPopup.openErrorModal('Insertion of event data failed');
      }
    });
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
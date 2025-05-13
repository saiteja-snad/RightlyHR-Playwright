import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddEventComponent } from './add-event/add-event.component';
import { Observable, of, shareReplay, Subscription, tap } from 'rxjs';
import { HttpService } from '../../services/http.service';
import moment from 'moment';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { OpenModalService } from '../../services/open-modal.service';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../services/rbac.service';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { EventsTabsComponent } from "../../shared/events-tabs/events-tabs.component";
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-upcoming-events',
  imports: [CommonModule, DateformatPipe, ReactiveFormsModule, TranslateModule, NoDataFoundComponent, EventsTabsComponent, DataLoaderContentComponent],
  templateUrl: './upcoming-events.component.html',
  styleUrl: './upcoming-events.component.scss'
})

export class UpcomingEventsComponent {
  subscription!: Subscription
  postEventsData: any
  customEventupdateForm!: FormGroup;
  getEventsData$!: Observable<any>;
  CurrentDate = new Date();
  currentMonth: number = moment().month() + 1;
  currentYear: number = moment().year();
  CustomEventsCount$!: Observable<number>
  setdata: any
  selectedevetid: any;
  spinnerLoader = false
  Employeeinfo: any;
  selectedImagePreview: any;
  selectedCustomEventField: any;
  todaysEvents: any[] = [];
  imageUrl: any;
  eventAttachment: any;
  constructor(private router: Router, private sanitizer: DomSanitizer, private modalService: NgbModal, private http: HttpService,
    private conformationPopup: OpenModalService, private fb: FormBuilder, public rbac: RbacService,) { }
  ngOnInit(): void {
    this.Employeeinfo = JSON.parse(localStorage.getItem("rightlyHrUser") ?? '{}');
    this.getCustomEvents()
    this.initiateForm()

    this.http.eventAdded$.subscribe(() => {
      this.getCustomEvents();
    });
  }


  initiateForm() {
    this.customEventupdateForm = this.fb.group({
      eventDate: [null, [Validators.required, this.futureDateValidator()]],
      eventTitle: [null, [Validators.required, Validators.pattern(/^(?!\s).*$/),Validators.maxLength(50)]],
      eventMessage: [null, [Validators.required, Validators.maxLength(250)]],
      imageUrl: [null]
    });
  }

  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedDate = moment(control.value).format('YYYY-MM-DD');
      const today = moment().format('YYYY-MM-DD');

      return selectedDate < today ? { pastDate: true } : null;
    };
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

  onSelectprofilePicDownload(employee: any): void {
    console.log(employee)
    const filePath = employee.attachmentUrl;
    console.log(filePath)
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', filePath).subscribe({
      next: (res: any) => {
        const blob = new Blob([res['body']], { type: 'image/png' });
        const objectURL = URL.createObjectURL(blob);
        employee.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL)
        console.log('Downloaded Image URL:', this.imageUrl);
      },
      error: (reason: any) => {
        console.error('Error downloading file:', reason);
        employee.imageUrl = 'images/noevents.png'; // Fallback to a default image
      }
    });
  }

  getCustomEvents() {
    this.http.getData(`CustomEvents/Getbyorder?month=${this.currentMonth}&year=${this.currentYear}`)
      .pipe(
        tap((data) => console.log('Fetched Events:', data)), // Debugging
        shareReplay(1)
      )
      .subscribe({
        next: (data: any) => {

          this.getEventsData$ = of(data);
          // Process each event individually using a for loop
          for (let i = 0; i < data.length; i++) {
            const event = data[i];
            if (event.attachmentUrl) {
              this.onSelectprofilePicDownload(event);
            }
          }
          this.CustomEventsCount$ = of(data.length)
          const todayStr = new Date().toDateString();
          this.todaysEvents = (data as any[]).filter((event: { eventDate: string | number | Date; }) =>
            new Date(event.eventDate).toDateString() === todayStr
          );

        },
        error: (err) => console.error('Error fetching events:', err)
      });
  }
  openAddProspective() {
    this.modalService.open(AddEventComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  openmodal(conent: any) {
    this.modalService.open(conent, { size: 'small', centered: true })
  }



  DeleteEvent(eventId: number) {
    const enentid = eventId;

    this.subscription = this.http.getData(`CustomEvents/deletebyid/${enentid}`).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.getCustomEvents()
        this.conformationPopup.openSuccessModal('Event deleted successfully');
        //this.redirectTo(this.router.url);
      },
      error: (err: any) => {
        console.log(err);
      },
    })
  }

  openModalupdate(content: any, eventsdata: any): void {
    this.selectedevetid = eventsdata.eventId
    const localDate = new Date(eventsdata.eventDate);
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const formattedDate = `${localDate.getFullYear()}-${pad(localDate.getMonth() + 1)}-${pad(localDate.getDate())}T${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`;

    this.customEventupdateForm.patchValue({
      eventDate: formattedDate,
      eventTitle: eventsdata.eventTitle || '',
      eventMessage: eventsdata.eventMessage || ''
      // imageUrl is a file input — not directly patchable unless handled as a base64 or URL preview
    });
    this.selectedImagePreview = eventsdata.attachmentUrl || null;
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
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
          this.customEventupdateForm.patchValue({ imageUrl: e.target.result });
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


  private renameFileAttachment(originalFile: File, newName: string): File {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified
    });
  }


  updateEvents(customEventupdateForm: FormGroup): void {
    if (customEventupdateForm.valid) {
      this.spinnerLoader = true;
      const formdata = customEventupdateForm.value;

      const payload = {
        eventId: this.selectedevetid,
        eventDate: formdata.eventDate,
        eventMessage: formdata.eventMessage,
        empId: this.Employeeinfo.employeeId,
        isDeleted: false,
        eventTitle: formdata.eventTitle,
        attachmentUrl: formdata.imageUrl || null
      };

      const file = this.eventAttachment;
      if (file) {
        const filePath = `/Profilepics/${this.Employeeinfo.employeeId}`;
        this.uploadEventAttachmentForUpdate(filePath, file, payload);
      } else {
        this.saveUpdatedEvent(payload);
      }
    } else {
      customEventupdateForm.markAllAsTouched(); // Show validation errors
    }
  }
  uploadEventAttachmentForUpdate(filePath: string, file: File, payload: any): void {
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, file)
      .subscribe({
        next: (data: any) => {
          if (data?.path) {
            payload.attachmentUrl = data.path;
          }
          this.saveUpdatedEvent(payload);
        },
        error: () => {
          this.spinnerLoader = false;
          console.error('Event file upload failed');
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal('File upload failed');
        }
      });
  }

  saveUpdatedEvent(payload: any): void {
    this.subscription = this.http.postdata(`CustomEvents/Update`, payload).subscribe({
      next: (response: any) => {
        this.spinnerLoader = false;
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Event updated successfully');
        this.getCustomEvents(); // Refresh events list
        this.CustomEmail(); // Send email notification
      },
      error: (err: any) => {
        this.spinnerLoader = false;
        this.modalService.dismissAll();
        this.conformationPopup.openErrorModal('Update of event data failed');
      }
    });
  }

  CustomEmail() {
    const formdata = this.customEventupdateForm.value
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
        this.customEventupdateForm.reset()
      }
    })
  }
}




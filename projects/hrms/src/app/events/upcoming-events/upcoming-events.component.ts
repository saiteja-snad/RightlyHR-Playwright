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

@Component({
  selector: 'app-upcoming-events',
  imports: [CommonModule, DateformatPipe, ReactiveFormsModule,TranslateModule],
  templateUrl: './upcoming-events.component.html',
  styleUrl: './upcoming-events.component.scss'
})

export class UpcomingEventsComponent {
  subscription!: Subscription
  postEventsData:any
  customEventupdateForm!: FormGroup;
  getEventsData$!: Observable<any>;
  CurrentDate = new Date();
  currentMonth: number = moment().month() + 1;
  currentYear: number = moment().year();
  CustomEventsCount$!: Observable<number>
  setdata: any
  selectedevetid: any;
  spinnerLoader=false
  Employeeinfo: any;
  selectedImagePreview: any;
  selectedCustomEventField: any;
  constructor(private router: Router, private modalService: NgbModal, private http: HttpService, 
    private conformationPopup: OpenModalService, private fb: FormBuilder,public rbac: RbacService,) { }
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
      eventTitle: [null, [Validators.required, Validators.pattern(/^(?!\s).*$/)]],
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

  getCustomEvents() {

    this.http.getData(`CustomEvents/Getbyorder?month=${this.currentMonth}&year=${this.currentYear}`)
      .pipe(
        tap((data) => console.log('Fetched Events:', data)), // Debugging
        shareReplay(1)
      )
      .subscribe({
        next: (data) => {
          this.getEventsData$ = of(data);
          this.CustomEventsCount$ = of((data as any[]).length);
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
    this.selectedevetid=eventsdata.eventId
    const formattedDate = new Date(eventsdata.eventDate).toISOString().slice(0, 16);
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
  }
  
  updateEvents(customEventupdateForm: FormGroup): void {
    if (customEventupdateForm.valid) {
      this.spinnerLoader=true
      const formdata = customEventupdateForm.value;
  
      const data = {
      eventId: this.selectedevetid.eventId,
        eventDate: formdata.eventDate,
        eventMessage: formdata.eventMessage,
        empId: this.Employeeinfo.employeeId,
        isDeleted: false,
        eventTitle: formdata.eventTitle,
        attachmentUrl:  formdata.imageUrl || null
      };
  
      this.subscription = this.http.postdata(`CustomEvents/Update`, data).subscribe({
        next: (response: any) => {
          this.spinnerLoader=false;
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Event updated successfully');
            this.getCustomEvents()
             this.CustomEmail();
        
        },
        error: (err: any) => {
          this.spinnerLoader=false;
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal('Insertion of data failed');
        }
      });
    } else {
      // Optional: mark all controls as touched to trigger validation UI
      this.customEventupdateForm.markAllAsTouched();
    }
  }
  CustomEmail() {
    const formdata= this.customEventupdateForm.value
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




import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, 
  ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { IOfferLetterDetails } from '../../../Interfaces/documentsHistory';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { OfferletterdashboardpipePipe } from '../../../Pipes/offerletterdashboardpipe.pipe';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import moment from 'moment';
import { DatePicker } from 'primeng/datepicker';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { OnboardingFilterService } from '../../../shared/time-off-module-tabs/pending-approvals-tabs/onboarding-filter.service';
import { SignalsService } from '../../../services/signals.service';
@Component({
  selector: 'app-document-history-intern-offer-letter',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, DateformatPipe, FormsModule, OfferletterdashboardpipePipe,
    NoDataFoundComponent, DataLoaderContentComponent, DatePicker, TableModule],
  templateUrl: './document-history-intern-offer-letter.component.html',
  styleUrl: './document-history-intern-offer-letter.component.scss',
})

export class DocumentHistoryInternOfferLetterComponent {
  @ViewChild('internOfferLetterTable') internOfferLetterTable!: Table;
  subscription!: Subscription;
  searchValue: any;
  rejectDocument!: FormGroup;
  traineeofferletters = [] as IOfferLetterDetails[];
  loginuserdata = {} as any;
  selectedValuesOfOffer = {} as any;
  employeedata = {} as any;
  loading: boolean = false
  selectedDate: Date = new Date();
  selectedMonth: number | null = null;
  selectedYear: number | null = null;
  maxMonth: Date = new Date();
  offerLetters: any[] = [];
  originalOfferLetters = [] as IOfferLetterDetails[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService,
    private authService: AuthService, private conformationPopup: OpenModalService, public rbac: RbacService,private onboardingFilter: OnboardingFilterService,
    private signalService: SignalsService) {
    this.initializeForm();
  }

  ngOnInit(): void {
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1;
    this.selectedYear = today.getFullYear();
    this.loginuserdata = this.authService.getToken();
    this.initializeForm();
    this.getTraineeOfferLetters();
  }

  blockLeadingSpace(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as string;
      if (value && value.startsWith(' ')) {
        return { leadingSpace: true };
      }
      return null;
    };
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
  }

  initializeForm() {
    this.rejectDocument = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250), this.blockLeadingSpace()]],
    });
  }

  getTraineeOfferLetters() {
    this.loading = true;
    this.subscription = this.http.getData('TraineeOfferLetter/getAllNames/approverNames').subscribe({
      next: (data: any) => {
        this.loading = false;
        this.traineeofferletters = data;
        this.originalOfferLetters = [...this.traineeofferletters];
        this.filterByMonth();
      },
      error: (reason: any) => {
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  filterByMonth() {
    if (this.selectedMonth && this.selectedYear) {
      this.offerLetters = this.traineeofferletters.filter(item => {
        const date = moment(item.offerSentDate);
        return date.month() + 1 === this.selectedMonth && date.year() === this.selectedYear;
      });
    } else {
      this.offerLetters = this.traineeofferletters; // show all if no filter
    }
  //this.onboardingFilter.setMonthYear(this.selectedMonth || new Date().getMonth() + 1, this.selectedYear || new Date().getFullYear());

  }

  onMonthChange(value: any) {
    const selected = moment(value);
    this.selectedMonth = selected.month() + 1;
    this.selectedYear = selected.year();
    this.filterByMonth();
     this.onboardingFilter.setMonthYear(this.selectedMonth, this.selectedYear);
  }

  onSelectDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file.documentUrl).subscribe({
      next: (res: any) => {
        let fileName = res.headers.get('content-disposition')?.split(':')[1].split('=')[1];
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        let filename = file.documentUrl.split('/')[file.documentUrl.split('/').length - 1];
        a.download = filename;
        a.click();
      },
      error: (reason) => console.log(reason),
    });
  }

  releaseTraineeOfferLetter(Values: any) {
    let loggedInUser = this.authService.getToken();
    let updateTraineeOfferLetterDetails = {
      id: Values.id,
      employeeId: Values.empId,
      offerSentDate: Values.offerSentDate,
      offerSentStatus: Values.offerSentStatus,
      offerSentBy: Values.offerSentBy,
      documentUrl: Values.documentUrl,
      isdeleted: false,
      status: 'Released',
      approvedDate: new Date(),
      approvedBy: loggedInUser.employeeId,
      approver: Values.approver,
      comments: null,
      requestedDate: null,
      offerExpiryDate: Values.offerExpiryDate,
      offerStartDate: Values.offerStartDate,
      authoritySignature: Values.authoritySignature,
      addressType: Values.addressType,
      note: Values.note,
      durationOfTraining: Values.offerdurationOfTraining,
    };
    this.subscription = this.http.postdata('TraineeOfferLetter/UPDATE', updateTraineeOfferLetterDetails).subscribe({
      next: (data: any) => {
        this.getTraineeOfferLetters();
        this.employeeEmailTrainee(Values);
        if (data) { }
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('Released Failed');
      },
      complete: () => {
          this.signalService.TraineeOfferLetterNavCountSignal.set(true);
          this.getTraineeOfferLetters();
        },
    });
  }

  updateTraineeOfferDetails(Values: any) {
    let loggedInUser = this.authService.getToken();
    let updateTraineeOfferLetterDetails = {
      id: Values.id,
      employeeId: Values.empId,
      offerSentDate: Values.offerSentDate,
      offerSentStatus: Values.offerSentStatus,
      offerSentBy: Values.offerSentBy,
      documentUrl: Values.documentUrl,
      isdeleted: false,
      status: 'Approved',
      approvedDate: new Date(),
      approvedBy: loggedInUser.employeeId,
      approver: Values.approver,
      comments: '',
      requestedDate: '2024-02-20',
      offerExpiryDate: Values.offerExpiryDate,
      offerStartDate: Values.offerStartDate,
      authoritySignature: Values.authoritySignature,
      addressType: Values.addressType,
      note: Values.note,
      durationOfTraining: Values.offerdurationOfTraining,
    };
    this.subscription = this.http.postdata('TraineeOfferLetter/UPDATE', updateTraineeOfferLetterDetails).subscribe({
      next: (data: any) => {
        if (data) {
          this.getTraineeOfferLetters();
          this.ApproveEmailTrainee(Values);
        }
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal('Update Failed');
      },
      complete: () => {
          this.signalService.TraineeOfferLetterNavCountSignal.set(true);
          this.getTraineeOfferLetters();
        },
    });
  }

  ApproveEmailTrainee(personValues: any) {
    let datas = personValues;
    let loggedInUser = this.authService.getToken();
    let emailData = {
      personName: datas.offerSentByName,
      personEmail: datas.offerSentByEmail,
      personRole: datas.jobRole,
      employeeId: datas.offerSentBy,
      documentUrl: personValues.documentUrl,
      workLocation: datas.workLocation,
      senderName: `${loggedInUser.firstName}${loggedInUser.middleName ? ' ' + loggedInUser.middleName : ''} ${loggedInUser.lastName ?? ''}`,
      senderEmail: loggedInUser.workEmail,
      approvedBy: loggedInUser.employeeId,
      approvedByName: `${loggedInUser.firstName}${loggedInUser.middleName ? ' ' + loggedInUser.middleName : ''} ${loggedInUser.lastName ?? ''}`,
      firstName: datas.employeeName,
    };
    this.subscription = this.http.postdata(`CustomEmail/offerApproval`, emailData).subscribe({
      next: (data: any) => {
        if (data) {
          this.conformationPopup.openSuccessModal('Trainee Offer approved successfully');
          this.getTraineeOfferLetters();
          this.ApprovedTaineenotification(datas);
        }
      },
    });
  }

  ApprovedTaineenotification(personname: any) {
    const currentDate = new Date();
    let loggedInUser = this.authService.getToken();
    let senddata = {
      message: `Trainee Offer Letter Approval`,
      sentTo: personname.offerSentByEmail,
      isRead: false,
      isDelete: false,
      notificationDate: currentDate,
      notificationType: `${loggedInUser?.firstName} ${loggedInUser?.middleName ?? ''} 
      ${loggedInUser?.lastName ?? ''} Approved  ${personname.employeeName} Trainee Offer Letter`,
      empId: personname.offerSentByName,
    };
    this.subscription = this.http.postdata(`Notification`, senddata).subscribe({
      next: (data: any) => {
        this.getTraineeOfferLetters();
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  employeeEmailTrainee(Values: any) {
    let loggedInUser = this.authService.getToken();
    let emaildetails = {
      personEmail: Values.emailaddress,
      senderEmail: loggedInUser.workEmail,
      senderName: `${loggedInUser.firstName} ${loggedInUser.middleName ?? ''} ${loggedInUser.lastName ?? ''}`,
      personName: Values.employeeName,
      personRole: Values.jobRole,
      employeeId: Values.empId,
      documentUrl: Values.documentUrl,
      workLocation: Values.workLocation,
      offerStartDat: Values.offerStartDate,
      offerExpiryDate: Values.offerExpiryDate,
      approvedBy: loggedInUser.employeeId
    };
    this.subscription = this.http.postdata(`CustomEmail/offerletter`, emaildetails).subscribe({
      next: (data: any) => {
        if (data) {
          this.conformationPopup.openSuccessModal('Intern offer letter released successfully');
          this.getTraineeOfferLetters();
        }
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  //function to get the data of selected
  SelectData(value: any) {
    this.selectedValuesOfOffer = value;
    this.getEmployeeId(value.empId);
  }

  //function to get the employee details based on the employee id
  getEmployeeId(Values: any) {
    let employeeId = Values;
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.employeedata = data;
      },
      error: (reason) => console.log(reason),
    });
  }

  //post reason to offerletter table
  PostReasonandUpdateTraineeOfferDetails() {
    if (this.rejectDocument.invalid) {
      this.rejectDocument.markAllAsTouched();
      return;
    }

    const comments = (this.rejectDocument.get('comments')?.value ?? '').toString().trim();
    let updateOfferLetterDetails = {
      id: this.selectedValuesOfOffer.id,
      employeeId: this.selectedValuesOfOffer.empId,
      offerSentDate: this.selectedValuesOfOffer.offerSentDate,
      offerSentStatus: 'Obsolete',
      offerSentBy: this.selectedValuesOfOffer.offerSentBy,
      documentUrl: this.selectedValuesOfOffer.documentUrl,
      isdeleted: false,
      status: 'Rejected',
      approvedDate: this.selectedValuesOfOffer.approvedDate,
      approvedBy: this.selectedValuesOfOffer.approvedBy,
      approver: this.selectedValuesOfOffer.approver,
      comments,
      requestedDate: null,
      offerExpiryDate: this.selectedValuesOfOffer.offerExpiryDate,
      offerStartDate: this.selectedValuesOfOffer.offerStartDate,
      authoritySignature: this.selectedValuesOfOffer.authoritySignature,
      addressType: this.selectedValuesOfOffer.addressType,
      note: this.selectedValuesOfOffer.note,
      durationOfTraining: this.selectedValuesOfOffer.offerdurationOfTraining,
    };
    this.subscription = this.http.postdata('TraineeOfferLetter/UPDATE', updateOfferLetterDetails).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.updatetraineeemployeestatus(data);
        this.rejectTraineeEmail(comments);
        this.rejectDocument.reset();
        //this.RejectTraineenotification();
        this.getTraineeOfferLetters();
      },
      error: (reason: any) => {
        console.log(reason);
      },
      complete: () => {
          this.signalService.TraineeOfferLetterNavCountSignal.set(true);
          this.getTraineeOfferLetters();
        },
    });
  }

  //function to update the employee substatus
  updatetraineeemployeestatus(Value: any) {
    (this.employeedata.employeeId = Value.employeeId),
      (this.employeedata.empstatus = 'Trainee Prospective');
    this.employeedata.substatus = 'Offer Letter Rejected By Manager';
    this.subscription = this.http.postdata('Employeedata/UPDATER', this.employeedata).subscribe({
      next: (data: any) => {
        console.log(data);
      },
    });
  }

  //Function for Reject Email
  rejectTraineeEmail(comments: string) {
    let loggedInUser = this.authService.getToken();
    let emaildate = {
      personName: this.selectedValuesOfOffer.offerSentByName,
      personEmail: this.selectedValuesOfOffer.offerSentByEmail,
      personRole: this.selectedValuesOfOffer.jobRole,
      employeeId: this.selectedValuesOfOffer.offerSentBy,
      documentUrl: this.selectedValuesOfOffer.documentUrl,
      workLocation: this.selectedValuesOfOffer.workLocation,
      senderName: `${loggedInUser?.firstName ?? ''} ${loggedInUser?.middleName ?? ''} 
      ${loggedInUser?.lastName ?? ''}`,
      senderEmail: loggedInUser.workEmail,
      approvedBy: this.selectedValuesOfOffer.approvedBy,
      approvedByName: this.selectedValuesOfOffer.approvedByName,
      firstName: this.selectedValuesOfOffer.employeeName,
      // lastName: string,
      comments,
    };
    this.subscription = this.http.postdata(`CustomEmail/OfferRejection`, emaildate).subscribe({
      next: (data: any) => {
        if (data) {
          setTimeout(() => {
            this.conformationPopup.openSuccessModal('Trainee offer letter rejected successfully');
          }, 3000);
          this.getTraineeOfferLetters();
        }
      },
      error: (err: any) => {
        console.log(err);
        this.conformationPopup.openErrorModal('Email Sent Failed');
      },
    });
  }

  //function for reject notification
  Rejectnotification() {
    const currentDate = new Date();
    const loggedInUser = this.authService.getToken();
    const senddata = {
      message: `Offer Letter Rejected`,
      sentTo: this.selectedValuesOfOffer.workEmail,
      isRead: false,
      isDelete: false,
      notificationDate: currentDate,
      notificationType: `${loggedInUser.firstName}${loggedInUser.middleName ? ' ' + loggedInUser.middleName : ''} 
      ${loggedInUser.lastName ?? ''} Rejected ${this.selectedValuesOfOffer.employeeName} Offer Letter`,
      empId: this.selectedValuesOfOffer.offerSentBy,
    };
    this.subscription = this.http.postdata(`Notification`, senddata).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  getFilteredAndSortedOfferLetters(): IOfferLetterDetails[] {
    if (!this.searchValue || this.searchValue.trim() === '') {
      return this.offerLetters;
    }
    
    const searchTerm = this.searchValue.toLowerCase().trim();
    return this.offerLetters.filter((letter: IOfferLetterDetails) => {
      const employeeName = letter.employeeName?.toLowerCase() || '';
      const workLocation = letter.workLocation?.toLowerCase() || '';
      const subLocation = letter.subLocation?.toLowerCase() || '';
      const jobRole = letter.jobRole?.toLowerCase() || '';
      const status = letter.status?.toLowerCase() || '';
      const empSubstatus = letter.empSubstatus?.toLowerCase() || '';
      
      return employeeName.includes(searchTerm) ||
             workLocation.includes(searchTerm) ||
             subLocation.includes(searchTerm) ||
             jobRole.includes(searchTerm) ||
             status.includes(searchTerm) ||
             empSubstatus.includes(searchTerm);
    });
  }

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.offerLetters = [...this.originalOfferLetters];
        this.filterByMonth();
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.internOfferLetterTable) {
          this.internOfferLetterTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any;
      let val2: any;

      // Handle different field types
      if (field === 'offerSentDate') {
        val1 = new Date(a.offerSentDate);
        val2 = new Date(b.offerSentDate);
        return event.order * (val1.getTime() - val2.getTime());
      } else {
        // Handle string sorting for other fields
        val1 = String(a[field] ?? '').trim();
        val2 = String(b[field] ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

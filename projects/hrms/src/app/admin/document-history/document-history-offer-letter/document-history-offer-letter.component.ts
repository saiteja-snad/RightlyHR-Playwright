import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { OfferletterdashboardpipePipe } from '../../../Pipes/offerletterdashboardpipe.pipe';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import moment from 'moment';
import { DatePicker } from 'primeng/datepicker';
import { OnboardingFilterService } from '../../../shared/time-off-module-tabs/pending-approvals-tabs/onboarding-filter.service';
import { SignalsService } from '../../../services/signals.service';
@Component({
  selector: 'app-document-history-offer-letter',
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, FormsModule, DateformatPipe,
    OfferletterdashboardpipePipe, NoDataFoundComponent, DataLoaderContentComponent, DatePicker],
  templateUrl: './document-history-offer-letter.component.html',
  styleUrl: './document-history-offer-letter.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class DocumentHistoryOfferLetterComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  searchValue: any;
  rejectDocument!: FormGroup;
  // offerLetters = [] as IOfferLetterDetails[];
  loginuserdata = {} as any;
  selectedValuesOfOffer = {} as any;
  employeedata = {} as any;
  isloading: boolean = false;
  selectedDate: Date = new Date();
  selectedMonth: number | null = null;
  selectedYear: number | null = null;
  maxMonth: Date = new Date();
  allOfferLetters: any[] = []; // full data
  offerLetters: any[] = []; // filtered data shown in table

  constructor(private router: Router, private modalService: NgbModal, private fb: FormBuilder, private http: HttpService,
    private authService: AuthService, private conformationPopup: OpenModalService, public rbac: RbacService, private onboardingFilter: OnboardingFilterService,
    private signalService: SignalsService) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    const today = new Date();
    this.selectedMonth = today.getMonth() + 1;
    this.selectedYear = today.getFullYear();
    this.loginuserdata = this.authService.getToken();
    this.initializeForm();
    this.getOfferLetters();
  }

  //function to open the popup model
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', keyboard: false });
  }

  //functio to inialize the form
  initializeForm() {
    this.rejectDocument = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250), this.blockLeadingSpace()],],
    });
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

  //to get all offer Letters
  getOfferLetters() {
    this.isloading = true;
    this.subscription = this.http.getData('OfferLetter/getAllNames/approverNames?empType=offer letter').subscribe({
      next: (data: any) => {
        this.isloading = false;
        this.allOfferLetters = data;
        this.filterByMonth(); // Filter immediately if month is selected
      },
      error: (reason: any) => {
        this.isloading = false;
        console.error(reason);
      },
    });
  }

  filterByMonth() {
    if (this.selectedMonth && this.selectedYear) {
      this.offerLetters = this.allOfferLetters.filter((item) => {
        const date = moment(item.offerSentDate);
        return (date.month() + 1 === this.selectedMonth && date.year() === this.selectedYear);
      });
    } else {
      this.offerLetters = this.allOfferLetters; // show all if no filter
    }
    // this.onboardingFilter.setMonthYear(this.selectedMonth || new Date().getMonth() + 1, this.selectedYear || new Date().getFullYear());
  }

  onMonthChange(value: any) {
    const selected = moment(value);
    this.selectedMonth = selected.month() + 1;
    this.selectedYear = selected.year();
    this.filterByMonth();
    // Update the service with new month/year
    this.onboardingFilter.setMonthYear(this.selectedMonth, this.selectedYear);
  }

  //function to download the document
  onSelectDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file.documentUrl).subscribe({
      next: (res: any) => {
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        const filename = this.getDownloadFileName(res?.headers?.get('content-disposition'), file?.documentUrl);
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(a.href);
      },
      error: (reason) => console.log(reason),
    });
  }

  private getDownloadFileName(contentDisposition: string | null, documentUrl?: string): string {
    const fileNameFromHeader = this.extractFileNameFromContentDisposition(contentDisposition);
    if (fileNameFromHeader) {
      return fileNameFromHeader;
    }

    if (typeof documentUrl === 'string' && documentUrl.trim()) {
      const normalizedUrl = documentUrl.split('?')[0];
      const pathParts = normalizedUrl.split('/').filter(Boolean);
      const lastPathPart = pathParts[pathParts.length - 1];
      if (lastPathPart) {
        return decodeURIComponent(lastPathPart);
      }
    }

    return 'document';
  }

  private extractFileNameFromContentDisposition(contentDisposition: string | null): string | null {
    if (!contentDisposition) {
      return null;
    }

    const utfMatch = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) {
      return decodeURIComponent(utfMatch[1].replace(/["']/g, '').trim());
    }

    const standardMatch = contentDisposition.match(/filename="?([^";]+)"?/i);
    if (standardMatch?.[1]) {
      return standardMatch[1].trim();
    }

    return null;
  }

  //function to release the document
  releaseOfferletter(Values: any) {
    let loggedInUser = this.authService.getToken();
    let updateOfferLetterDetails = {
      id: Values.id,
      empId: Values.empId,
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
      rolesAndResponsibilitesId: Values.rolesAndResponsibilitesId,
      documentType: Values.documentType,
      letterType: Values.letterType,
      currencyType: Values.currencyType
    };
    this.subscription = this.http.postdata('OfferLetter/UPDATE', updateOfferLetterDetails).subscribe({
      next: (data: any) => {
        this.employeeEmail(Values);
        this.onboardingFilter.setMonthYear(this.selectedMonth || new Date().getMonth() + 1, this.selectedYear || new Date().getFullYear());

      },
      error: (reason: any) => {
        console.log(reason);
      },
      complete: () => {
          this.signalService.OfferLetterNavCountSignal.set(true);
          this.getOfferLetters();
        },
    });
  }

  employeeEmail(Values: any) {
    const loggedInUser = this.authService.getToken();
    let emaildetails = {
      personEmail: Values.emailaddress,
      senderEmail: loggedInUser.workEmail,
      senderName: `${loggedInUser.firstName}${loggedInUser.middleName ? ' ' +
        loggedInUser.middleName : ''}${loggedInUser.lastName ? ' ' + loggedInUser.lastName : ''}`,
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
        this.conformationPopup.openSuccessModal('Offer letter released successfully ');
        this.getOfferLetters();
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  //function to update OfferLetter Details When Approve
  updateOfferDetails(Values: any) {
    let loggedInUser = this.authService.getToken();
    let updateOfferLetterDetails = {
      id: Values.id,
      empId: Values.empId,
      offerSentDate: Values.offerSentDate,
      offerSentStatus: Values.offerSentStatus,
      offerSentBy: Values.offerSentBy,
      documentUrl: Values.documentUrl,
      isdeleted: false,
      status: 'Approved',
      approvedDate: new Date(),
      approvedBy: loggedInUser.employeeId,
      approver: Values.approver,
      offerExpiryDate: Values.offerExpiryDate,
      offerStartDate: Values.offerStartDate,
      authoritySignature: Values.authoritySignature,
      addressType: Values.addressType,
      note: Values.note,
      rolesAndResponsibilitesId: Values.rolesAndResponsibilitesId,
      documentType: Values.documentType,
      letterType: Values.letterType,
      currencyType: Values.currencyType
    };
    this.subscription = this.http.postdata('OfferLetter/UPDATE', updateOfferLetterDetails).subscribe({
      next: (data: any) => {
        this.getOfferLetters();
        this.ApproveEmail(Values);
          this.onboardingFilter.setMonthYear(this.selectedMonth || new Date().getMonth() + 1, this.selectedYear || new Date().getFullYear());

      },
      error: (reason: any) => {
        console.log(reason);
      },
      complete: () => {
          this.signalService.OfferLetterNavCountSignal.set(true);
          this.getOfferLetters();
        },
    });
  }

  //function for Approve email
  ApproveEmail(personValues: any) {
    let datas = personValues;
    let loggedInUser = this.authService.getToken();
    let emailData = {
      personName: datas.offerSentByName,
      personEmail: datas.offerSentByEmail,
      personRole: datas.jobRole,
      employeeId: datas.offerSentBy,
      documentUrl: personValues.documentUrl,
      workLocation: datas.workLocation,
      senderName: `${loggedInUser.firstName}${loggedInUser.middleName ? ' ' +
        loggedInUser.middleName : ''} ${loggedInUser.lastName ?? ''}`,
      senderEmail: loggedInUser.workEmail,
      approvedBy: loggedInUser.employeeId,
      approvedByName: `${loggedInUser.firstName}${loggedInUser.middleName ? ' ' +
        loggedInUser.middleName : ''}${loggedInUser.lastName ? ' ' + loggedInUser.lastName : ''}`,
      firstName: datas.employeeName,
    };
    this.subscription = this.http.postdata(`CustomEmail/offerApproval`, emailData).subscribe({
      next: (data: any) => {
        this.Approvednotification(datas);
        this.conformationPopup.openSuccessModal('Offer letter approved successfully ');
      },
    });
  }

  //function for approved notification
  Approvednotification(personname: any) {
    const currentDate = new Date();
    let loggedInUser = this.authService.getToken();
    let senddata = {
      message: `Offer Letter Approval`,
      sentTo: personname.OffersentbyEmailaddress,
      isRead: false,
      isDelete: false,
      notificationDate: currentDate,
      notificationType: `${loggedInUser.firstName}${loggedInUser.middleName ? ' ' + loggedInUser.middleName : ''}
      ${loggedInUser.lastName ? ' ' + loggedInUser.lastName : ''} Approved ${personname.employeeName} Offer Letter`,
      empId: personname.offerSentBy,
    };
    this.subscription = this.http.postdata(`Notification`, senddata).subscribe({
      next: (data: any) => {
        this.getOfferLetters();
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
  PostReasonandUpdateOfferDetails() {
    let currentDate = new Date();
    let loggedInUser = this.authService.getToken();
    let updateOfferLetterDetails = {
      id: this.selectedValuesOfOffer.id,
      empId: this.selectedValuesOfOffer.empId,
      offerSentDate: this.selectedValuesOfOffer.offerSentDate,
      offerSentStatus: 'Obsolete',
      offerSentBy: this.selectedValuesOfOffer.offerSentBy,
      documentUrl: this.selectedValuesOfOffer.documentUrl,
      isdeleted: false,
      status: 'Rejected',
      approvedDate: this.selectedValuesOfOffer.approvedDate,
      approvedBy: this.selectedValuesOfOffer.approvedBy,
      approver: this.selectedValuesOfOffer.approver,
      comments: this.rejectDocument.value.reason,
      requestedDate: null,
      offerExpiryDate: this.selectedValuesOfOffer.offerExpiryDate,
      offerStartDate: this.selectedValuesOfOffer.offerStartDate,
      authoritySignature: this.selectedValuesOfOffer.authoritySignature,
      addressType: this.selectedValuesOfOffer.addressType,
      note: this.selectedValuesOfOffer.note,
      rolesAndResponsibilitesId: this.selectedValuesOfOffer.rolesAndResponsibilitesId,
      documentType: this.selectedValuesOfOffer.documentType,
      letterType: this.selectedValuesOfOffer.letterType,
      currencyType: this.selectedValuesOfOffer.currencyType
    };
    this.subscription = this.http.postdata('OfferLetter/UPDATE', updateOfferLetterDetails).subscribe({
      next: (data: any) => {
        this.updateemployeestatus(data);
        this.rejectEmail();
        this.Rejectnotification();
        this.getOfferLetters();
          this.onboardingFilter.setMonthYear(this.selectedMonth || new Date().getMonth() + 1, this.selectedYear || new Date().getFullYear());

      },
      error: (reason: any) => {
        console.log(reason);
      },
      complete: () => {
          this.signalService.OfferLetterNavCountSignal.set(true);
          this.getOfferLetters();
        },
    });
  }

  //function to update the employee substatus
  updateemployeestatus(Value: any) {
    (this.employeedata.employeeId = Value.empId),
      (this.employeedata.empstatus = 'Prospective');
    this.employeedata.substatus = 'Offer Letter Rejected By Manager';
    this.subscription = this.http.postdata('Employeedata/UPDATER', this.employeedata).subscribe({
      next: (data: any) => {
        console.log(data);
      },
    });
  }

  //Function for Reject Email
  rejectEmail() {
    let loggedInUser = this.authService.getToken();
    let emaildate = {
      personName: this.selectedValuesOfOffer.offerSentByName,
      personEmail: this.selectedValuesOfOffer.offerSentByEmail,
      personRole: this.selectedValuesOfOffer.jobRole,
      employeeId: this.selectedValuesOfOffer.offerSentBy,
      documentUrl: this.selectedValuesOfOffer.documentUrl,
      workLocation: this.selectedValuesOfOffer.workLocation,
      senderName: `${loggedInUser.firstName}${loggedInUser.middleName ? ' ' + loggedInUser.middleName : ''}
      ${loggedInUser.lastName ? ' ' + loggedInUser.lastName : ''}`,
      senderEmail: loggedInUser.workEmail,
      approvedBy: this.selectedValuesOfOffer.approvedBy,
      approvedByName: this.selectedValuesOfOffer.approvedByName,
      firstName: this.selectedValuesOfOffer.employeeName,
      // lastName: string,
      comments: this.rejectDocument.value.comments,
    };
    this.subscription = this.http.postdata(`CustomEmail/OfferRejection`, emaildate).subscribe({
      next: (data: any) => {
        if (data) {
          this.rejectDocument.reset();
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Offer letter rejected successfully ');
        }
      },
      error: (err: any) => {
        console.log(err);
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
      ${loggedInUser.lastName ? ' ' + loggedInUser.lastName : ''} Rejected
      ${this.selectedValuesOfOffer.employeeName} Offer Letter`,
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

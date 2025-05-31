import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Subscription } from 'rxjs';
import { IOfferLetterDetails } from '../../../Interfaces/documentsHistory';
import { OfferletterdashboardpipePipe } from '../../../Pipes/offerletterdashboardpipe.pipe';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-document-history-offer-letter',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    FormsModule,
    DateformatPipe,
    OfferletterdashboardpipePipe,
  ],
  templateUrl: './document-history-offer-letter.component.html',
  styleUrl: './document-history-offer-letter.component.scss',
})
export class DocumentHistoryOfferLetterComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  searchValue: any;
  rejectDocument!: FormGroup;
  offerLetters = [] as IOfferLetterDetails[];
  loginuserdata = {} as any;
  selectedValuesOfOffer = {} as any;
  employeedata = {} as any;

  constructor(
    private router: Router,
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private authService: AuthService,
    private conformationPopup: OpenModalService,public rbac: RbacService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    this.loginuserdata = this.authService.getToken();
    this.initializeForm();
    this.getOfferLetters();
  }
  //function to open the popup model
  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      keyboard: false,
    });
  }
  //functio to inialize the form
  initializeForm() {
    this.rejectDocument = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250),this.blockLeadingSpace()]],
    });
  }
  blockLeadingSpace() : ValidatorFn {
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
    this.subscription = this.http
      .getData('OfferLetter/getAllNames/approverNames')
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.offerLetters = data;
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }
  //function to download the document
  onSelectDownload(file: any) {
    this.subscription = this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', file.documentUrl)
      .subscribe({
        next: (res: any) => {
          let fileName = res.headers
            .get('content-disposition')
            ?.split(':')[1]
            .split('=')[1];
          let blob: Blob = res.body as Blob;
          // console.log(fileName);

          let a = document.createElement('a');
          a.href = window.URL.createObjectURL(blob);
          let filename =
            file.documentUrl.split('/')[file.documentUrl.split('/').length - 1];
          a.download = filename;
          a.click();
        },
        error: (reason) => console.log(reason),
      });
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
    };
    this.subscription = this.http
      .postdata('OfferLetter/UPDATE', updateOfferLetterDetails)
      .subscribe({
        next: (data: any) => {
          this.employeeEmail(Values);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }
  employeeEmail(Values: any) {
    const loggedInUser = this.authService.getToken();
    let emaildetails = {
      personEmail: Values.emailaddress,
      senderEmail: loggedInUser.workEmail,
      senderName: `${loggedInUser.firstName ?? ''} ${
        loggedInUser.middleName ?? ''
      } ${loggedInUser.lastName ?? ''}`,
      personName: Values.employeeName,
      personRole: Values.jobRole,
      employeeId: Values.empId,
      documentUrl: Values.documentUrl,
      workLocation: Values.workLocation,
      offerStartDat: Values.offerStartDate,
      offerExpiryDate: Values.offerExpiryDate,
    };
    this.subscription = this.http
      .postdata(`CustomEmail/offerletter`, emaildetails)
      .subscribe({
        next: (data: any) => {
          this.conformationPopup.openSuccessModal(
            'Offer released successfully '
          );
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
    console.log(loggedInUser);
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
    };
    console.log(updateOfferLetterDetails);
    this.subscription = this.http
      .postdata('OfferLetter/UPDATE', updateOfferLetterDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.getOfferLetters();
          this.ApproveEmail(Values);
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  //function for Approve email
  ApproveEmail(personValues: any) {
    let datas = personValues;
    console.log(datas);
    let loggedInUser = this.authService.getToken();
    let emailData = {
      personName: datas.offerSentByName,
      personEmail: datas.offerSentByEmail,
      personRole: datas.jobRole,
      employeeId: datas.offerSentBy,
      documentUrl: personValues.documentUrl,
      workLocation: datas.workLocation,
      senderName: `${loggedInUser.firstName ?? ''} ${
        loggedInUser.middleName ?? ''
      }  ${loggedInUser.lastName ?? ''}`,
      senderEmail: loggedInUser.workEmail,
      approvedBy: loggedInUser.employeeId,
      approvedByName: `${loggedInUser.firstName ?? ''} ${
        loggedInUser.middleName ?? ''
      } ${loggedInUser.lastName ?? ''}`,
      firstName: datas.employeeName,
    };
    console.log(emailData);
    this.subscription = this.http
      .postdata(`CustomEmail/offerApproval`, emailData)
      .subscribe({
        next: (data: any) => {
          this.Approvednotification(datas);
          this.conformationPopup.openSuccessModal(
            'Offer approved successfully '
          );
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
      notificationType: `${loggedInUser?.firstName} ${
        loggedInUser?.middleName ?? ''
      } ${loggedInUser?.lastName} Approved 
         ${personname.employeeName} Offer Letter`,
      empId: personname.offerSentBy,
    };
    this.subscription = this.http.postdata(`Notification`, senddata).subscribe({
      next: (data: any) => {
        console.log(data);
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
    console.log(this.selectedValuesOfOffer);
    this.getEmployeeId(value.empId);
  }

  //function to get the employee details based on the employee id
  getEmployeeId(Values: any) {
    let employeeId = Values;
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.employeedata = data;
        },
        error: (reason) => console.log(reason),
      });
  }

  //post reason to offerletter table
  PostReasonandUpdateOfferDetails() {
    let currentDate = new Date();
    let loggedInUser = this.authService.getToken();
    console.log(loggedInUser);
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
    };
    console.log(updateOfferLetterDetails);
    this.subscription = this.http
      .postdata('OfferLetter/UPDATE', updateOfferLetterDetails)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.updateemployeestatus(data);
          this.rejectEmail();
          this.Rejectnotification();
          this.getOfferLetters();
          
        },
        error: (reason: any) => {
          console.log(reason);
        },
      });
  }

  //function to update the employee substatus
  updateemployeestatus(Value: any) {
    console.log(Value.empId);
    (this.employeedata.employeeId = Value.empId),
      (this.employeedata.empstatus = 'Prospective');
    this.employeedata.substatus = 'Offer Letter Rejected By Manager';
    this.subscription = this.http
      .postdata('Employeedata/UPDATER', this.employeedata)
      .subscribe({
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
      senderName: `${loggedInUser?.firstName ?? ''} ${
        loggedInUser?.middleName ?? ''
      } ${loggedInUser?.lastName ?? ''}`,
      senderEmail: loggedInUser.workEmail,
      approvedBy: this.selectedValuesOfOffer.approvedBy,
      approvedByName: this.selectedValuesOfOffer.approvedByName,
      firstName: this.selectedValuesOfOffer.employeeName,
      // lastName: string,
      comments: this.rejectDocument.value.comments,
    };
    this.subscription = this.http
      .postdata(`CustomEmail/OfferRejection`, emaildate)
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.rejectDocument.reset();
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Offer rejected successfully ');
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
      notificationType: `${loggedInUser?.firstName} ${
        loggedInUser.middleName ?? ''
      } ${loggedInUser?.lastName} Rejected 
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

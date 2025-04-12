import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
  ISeparation,
  ISeparationRequest,
} from '../separation-for-you-request/separation-for-you-request';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Ipersonal } from '../../../interfaces/personal-modal';
import moment from 'moment';

@Component({
  selector: 'app-separation-for-your-role-request',
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
  ],
  templateUrl: './separation-for-your-role-request.component.html',
  styleUrl: './separation-for-your-role-request.component.scss',
})
export class SeparationForYourRoleRequestComponent {
  subscription!: Subscription;
  separation_For_You_Details = new BehaviorSubject<ISeparation[]>([]);
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  selectedSpRequestData: any = {
    noticperiodType: null,
    extend: false,
    discontinue: false,
    extenddate: null,
    trcomments: '', // Add a default value for trcomments
    rejectedReason: '',
    early: false,
  };
  isLoading = false;
  regular = false;
  extend = false;
  early = false;
  buttondisable = false;
  selectedRadio = '';
  islastworking = true;
  lastworkingValidation = true;
  isempeffectivevaild = true;
  requesthandler = {} as any;
  selectedSpRequestDataforheader = {} as any;
  requestType!: string;
  empdata = {} as any;
  jsonData = {} as any;
  myApproverComments = {} as any;
  constructor(
    private authService: AuthService,
    private http: HttpService,
    private router: Router,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal
  ) {}
  ngOnInit(): void {
    this.getseparationforrolerequests();
  }
  resetForm() {
    this.selectedSpRequestData = {};
  }
  //function to get the separation request based on the for you
  getseparationforrolerequests() {
    let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    console.log(EmployeeId);
    this.subscription = this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=13&approvedType=ROLE`
      )
      .subscribe({
        next: (data: any) => {
          console.log(data.data);
          this.separation_For_You_Details.next(
            data.data.filter(
              (item: any) =>
                item.approvalHeader.status != 'Processed' &&
                item.approvalHeader.status != 'Rejected' &&
                item.approvalHeader.status != 'Withdrawn'
            )
          );
        },
        error: (reason) => console.log(reason),
      });
  }

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'lg',
      backdrop: 'static',
    });
  }
  approverCommentsfunction(value: any) {
    this.myApproverComments = value.map((ele: any) => {
      // Parse the metaData and assign it to metadata property
      const parsedMetaData = JSON.parse(ele.metaData);
      return {
        ...ele, // Copy other properties from ele
        metadata: parsedMetaData, // Assign parsed metaData to metadata property
      };
    });
    console.log(this.myApproverComments);
  }
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }
  //function to format the date
  formatDate(date: any) {
    return date?.split('T')[0];
  }
  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122) &&
      charCode !== 32
    ) {
      return false;
    }
    return true;
  }
  //function to get the requried data
  handleRequest(request: ISeparationRequest) {
    console.log(request);
    this.regular = true;
    this.requesthandler = request;
    this.selectedSpRequestData = request.entity;
    this.selectedSpRequestData.noticperiodType = null;
    this.selectedSpRequestDataforheader = request.approvalHeader;
    this.selectedSpRequestData.spRequestLastWorkingDate = this.formatDate(
      this.selectedSpRequestData.spRequestLastWorkingDate
    );
    console.log(this.selectedSpRequestData);
    this.selectedSpRequestData.spMangerEarlyreliveingDate = this.formatDate(
      this.selectedSpRequestData.spearlyReliveingDate
    );
    this.selectedSpRequestData.spExtendedDate = this.formatDate(
      this.selectedSpRequestData.spExtendedDate
    );
    this.getEmployeedatabyid(this.selectedSpRequestData);
    if (
      this.selectedSpRequestData.sprecalledStatus.toLowerCase() == 'separation'
    ) {
      this.requestType = 'Separation Request';
    } else if (
      this.selectedSpRequestData.sprecalledStatus.toLowerCase() ==
      'earlyrelieving'
    ) {
      this.requestType = 'Early Relieving Request';
    }
  }
  //function to get the employeedata
  getEmployeedatabyid(Value: any) {
    let employeeId = Value.spRequestEmployeeId;
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          //console.log(data);
          this.empdata = data as Ipersonal;
          this.empdata.dateOfJoining = this.formatDate(
            this.empdata.dateOfJoining
          );
        },
        error: (err: any) => {
          console.log(err);
          this.conformationPopup.openErrorModal(err.error.message);
        },
      });
  }
  extendCondition(value: any) {
    if (value == true) {
      this.selectedSpRequestData.spExtendedDate = null;
    }
    console.log(value);
  }
  handleAccept(f: NgForm) {
    this.isLoading = true;
    let loggedInUser = this.authService.getToken();
    // submit logic
    if (this.selectedSpRequestData.requestSelectedType == 'Regular') {
      this.jsonData = JSON.stringify({
        splastworkingDate: this.selectedSpRequestData.spRequestLastWorkingDate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Approved',
      });
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Early') {
      this.jsonData = JSON.stringify({
        spearlyReliveingDate:
          this.selectedSpRequestData.spMangerEarlyreliveingDate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Approved',
      });
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Extend') {
      this.jsonData = JSON.stringify({
        spExtendedDate: this.selectedSpRequestData.extenddate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Extend',
      });
    }

    let requestBody = {
      status: 'Approved',
      comments: this.selectedSpRequestData.comments,
      isAcceptEarly:
        this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck ?? false,
      lastWorkingDate: this.selectedSpRequestData.spRequestLastWorkingDate,
      earlyRelievingDate: this.selectedSpRequestData.spMangerEarlyreliveingDate,
      extendedDate: this.selectedSpRequestData.extenddate,
      meta: this.jsonData,
      approvedBy: loggedInUser.employeeId.toString(),
    };

    console.log(requestBody);
    this.subscription = this.http
      .putData(
        `PendingApproval/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.isLoading = false;
          this.modalService.dismissAll();
          if (this.requestType === 'Separation Request') {
            this.conformationPopup.openSuccessModal(
              'Separation Request Approved Successfully'
            );
          } else if (this.requestType === 'Early Relieving Request') {
            this.conformationPopup.openSuccessModal(
              'Early Relieving Request Approved Successfully'
            );
          } else {
            this.conformationPopup.openSuccessModal(
              'Separation Request Approved Successfully'
            );
          }
          this.getseparationforrolerequests();
        },
        error: (reason: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(reason.error.message);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
  //function to send the rejected status and comments

  handleReject(f: NgForm) {
    this.isLoading = true;
    this.jsonData = JSON.stringify({
      status: 'Rejected',
    });
    let loginuserdata = this.authService.getToken();
    let requestBody = {
      status: 'Rejected',
      comments: this.selectedSpRequestData.rejectedReason,
      approvedBy: loginuserdata.employeeId.toString(),
      meta: this.jsonData,
    };

    this.subscription = this.http
      .putData(
        `PendingApproval/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.modalService.dismissAll();
          if (this.requestType === 'Separation Request') {
            this.conformationPopup.openSuccessModal(
              'Separation Request Rejected Successfully'
            );
          } else if (this.requestType === 'Early Relieving Request') {
            this.conformationPopup.openSuccessModal(
              'Early Relieving Request Rejected Successfully'
            );
          } else {
            this.conformationPopup.openSuccessModal(
              'Separation Request Rejected Successfully'
            );
          }
          this.getseparationforrolerequests();
        },

        error: (reason: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(reason.error.message);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
  handleProcess(f: NgForm) {
    this.isLoading = true;
    let loggedInUser = this.authService.getToken();
    if (this.selectedSpRequestData.requestSelectedType == 'Regular') {
      this.jsonData = JSON.stringify({
        splastworkingDate: this.selectedSpRequestData.spRequestLastWorkingDate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Processed',
      });
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Early') {
      this.jsonData = JSON.stringify({
        spearlyReliveingDate:
          this.selectedSpRequestData.spMangerEarlyreliveingDate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Processed',
      });
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Extend') {
      this.jsonData = JSON.stringify({
        spExtendedDate: this.selectedSpRequestData.extenddate,
        isAcceptEarlyRequest: this.selectedSpRequestData.isAcceptEarlyRequest,
        status: 'Processed',
      });
    }
    let requestBody: any = {
      status: 'Processed',
      comments: this.selectedSpRequestData.comments,
      isAcceptEarly:
        this.selectedSpRequestData.spIsAcceptEarlyRelieving ?? false,
      noticePeriodType: this.selectedSpRequestData.noticperiodType,
      noticePeriodTypeDays: this.selectedSpRequestData.noticperioddays,
      salaryhold: this.selectedSpRequestData.spsalaryhold,
      meta: this.jsonData,
      approvedBy: loggedInUser.employeeId.toString(),
    };
    if (this.selectedSpRequestData.requestSelectedType == 'Regular') {
      requestBody.lastWorkingDate =
        this.selectedSpRequestData.spRequestLastWorkingDate;
      requestBody.isAcceptEarly = false;
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Early') {
      requestBody.earlyRelievingDate =
        this.selectedSpRequestData.spMangerEarlyreliveingDate;
      requestBody.isAcceptEarly = true;
    }
    if (this.selectedSpRequestData.requestSelectedType == 'Extend') {
      requestBody.extendedDate = this.selectedSpRequestData.extenddate;
      requestBody.isAcceptEarly = false;
    }

    this.subscription = this.http
      .putData(
        `PendingApproval/process/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.isLoading = false;
          this.modalService.dismissAll();
          this.getseparationforrolerequests();
          this.conformationPopup.openSuccessModal(
            'Separation Request Processed Successfully'
          );
        },
        error: (reason: any) => {
          this.isLoading = false;
          this.conformationPopup.openErrorModal(reason.error.message);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
  getBlockedPastDate(date: string): string {
    const currentDateObj = moment(date).startOf('day'); // Set time to start of day (midnight)

    // Format the date as "YYYY-MM-DD"
    const formattedDate = currentDateObj.format('YYYY-MM-DD');

    return formattedDate;
  }
  getBlockedFutureDate(lastWorkingDate: string): string {
    const lastWorkingDateObj = moment(lastWorkingDate).startOf('day'); // Set time to start of day (midnight)

    // Format the date as "YYYY-MM-DD"
    const formattedDate = lastWorkingDateObj.format('YYYY-MM-DD');

    return formattedDate;
  }
  toggleEarly() {
    if (!this.early) {
      if (this.selectedSpRequestData.spIsEarlyRelieveing == true) {
        this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck = true;
        this.selectedSpRequestData.isAcceptEarlyRequest = 'Yes';
      } else {
        this.selectedSpRequestData.isAcceptEarlyRequest = 'NO';
      }
      this.selectedSpRequestData.requestSelectedType = 'Early';
      this.regular = false;
      this.extend = false;
      this.early = true;
      this.buttondisable = true;
      // Clear data related to Extend and Discontinue
      this.clearExtendData();
      this.clearDiscontinueData();
    } else {
      // Toggle off Early Relieving
      this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck = false;
      this.early = false;
      this.regular = true;
      this.buttondisable = false;
      this.clearEarlyData();
    }
  }

  toggleRegular() {
    this.selectedSpRequestData.spIsAcceptEarlyRelievingcheck = false;
    this.selectedSpRequestData.requestSelectedType = 'Regular';
    this.selectedSpRequestData.isAcceptEarlyRequest = 'NO';
    this.extend = false;
    this.early = false;
    this.regular = true;
    this.buttondisable = true;
    this.selectedRadio = '';
    // Clear data related to Early Relieving and Extend
    this.clearEarlyData();
    this.clearExtendData();
  }

  toggleExtend() {
    this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck = false;
    this.selectedSpRequestData.requestSelectedType = 'Extend';
    this.selectedSpRequestData.isAcceptEarlyRequest = 'NO';
    this.regular = false;
    this.early = false;
    this.extend = true;
    this.buttondisable = true;
    this.selectedRadio = '';
    // Clear data related to Early Relieving and Discontinue
    this.clearEarlyData();
    this.clearDiscontinueData();
  }
  // Function to clear data related to Early Relieving
  clearEarlyData() {
    this.selectedSpRequestData.earlyRelievingDate = null;
    this.selectedSpRequestData.comments = '';
  }

  // Function to clear data related to Extend
  clearExtendData() {
    this.selectedSpRequestData.extenddate = null;
    this.selectedSpRequestData.comments = ''; // Assuming comments is used for Extend
    this.selectedSpRequestData.reasonForExtend = '';
  }

  // Function to clear data related to Discontinue
  clearDiscontinueData() {
    this.selectedSpRequestData.rejectedReason = '';
  }
  earlyRelievingValidationCheck() {
    if (
      this.selectedSpRequestData.spMangerEarlyreliveingDate !=
      this.selectedSpRequestData.spearlyReliveingDate
    ) {
      this.selectedSpRequestData.spIsAcceptEarlyrelievingcheck = false;
      this.selectedSpRequestData.isAcceptEarlyRequest = 'NO';
      this.selectedRadio = 'early';
      this.selectedSpRequestData.requestSelectedType = 'Early';
    }
  }
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Iprobationapproval } from '../../../Interfaces/pendingapprovalsmodel';
import { Subscription } from 'rxjs';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { HttpService } from '../../../services/http.service';
import { ProbationdetailsPipe } from '../../../Pipes/probationdetails.pipe';
import { Ipersonal } from '../../../Interfaces/personal-modal';
import moment from 'moment';
import { ProbationformViewComponent } from '../../../shared/probationform-view/probationform-view.component';
import { RbacService } from '../../../services/rbac.service';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { OpenModalService } from '../../../services/open-modal.service';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { environment } from '../../../../environments/environment';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { FormValidationsService } from '../../../services/form-validations.service';
@Component({
  selector: 'app-probation-pending-approvals',
  imports: [
    CommonModule,
    RouterModule,
    NgbPopoverModule,
    FormsModule,
    NgbPopoverModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    ProbationdetailsPipe,
    ProbationformViewComponent,
    TranslateModule,
    Select,
    DateformatPipe,
    DataLoaderContentComponent,
    InfoIconComponent
],
  templateUrl: './probation-pending-approvals.component.html',
  styleUrl: './probation-pending-approvals.component.scss',
})

export class ProbationPendingApprovalsComponent {
  subscription!: Subscription;
  probationDetails = [] as any;
  probationExtensionDuration!: number;
  probationExtensionTimes!: number;
  searchValue: any;
  LOGIN: any;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  loading: boolean = false;
  isempeffectivevaild: boolean = true;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  managers= [
    {label :'Reporting Manager', value : 'Reproting Manager'},
    {label : 'Team Manager', value : 'Team Manager'}
  ]
  @ViewChild('assessmentForm') assessmentForm!: NgbModal;
  @ViewChild('commentspopup') commentspopup!: NgbModal;

  constructor(
    private modalService: NgbModal,
    private http: HttpService,
    public rbac: RbacService,
    private authService: AuthService,
    private openModalService:OpenModalService, 
    public formsValidation: FormValidationsService,
  ) {}

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    //console.log(this.isformsubmit);
    this.getProbationExtendDays();
    this.getAllPendingApprovals();
  }

  getAllPendingApprovals() {
    this.loading = true;
    let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    this.subscription = this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=20&approvedType=EMP`
      )
      .subscribe({
        next: (data: any) => {
          this.loading = false;
          this.probationDetails = data.data.filter(
            (item: any) =>
              item.approvalHeader.status != 'Processed' &&
              item.approvalHeader.status != 'Rejected'
          );
          // this.filterPendingApprovalsByModule();
        },
        error: (reason) =>{ console.log(reason)
          this.loading = false;
        
        },
      });
  }

  requesthandler = {} as any;
  selectedData = {} as any;
  selectedPrRequestDataforheader = {} as any;
  handleData(request: Iprobationapproval) {
    this.requesthandler = request;
    this.selectedData = request.entity;
    this.selectedPrRequestDataforheader = request.approvalHeader;
  }

  myApproverComments = [] as any;
  approverComments(value: any) {
    this.myApproverComments = value.map((ele: any) => {
      // Parse the metaData and assign it to metadata property
      const parsedMetaData = JSON.parse(ele.meta);
      return {
        ...ele, // Copy other properties from ele
        metadata: parsedMetaData, // Assign parsed metaData to metadata property
      };
    });
    this.modalService.open(this.commentspopup, { size: 'xl', centered: true, backdrop: 'static' })
  }
openModalView(){
  this.modalService.open(this.commentspopup, { size: 'xl', centered: true, backdrop: 'static' })
}
  openview() {
    this.modalService.dismissAll();
    this.modalService.open(this.assessmentForm, { centered: true, backdrop: 'static', size: 'xl' });
  }

  setformView(employeeId: number, responseId: number) {
    this.http.communicationService.next({ employeeId, responseId });
  }

  handleRequests(request: Iprobationapproval,content:any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' })
    this.requesthandler = request;
    this.selectedData = request.entity;
    this.selectedPrRequestDataforheader = request.approvalHeader;
    console.log(this.selectedData);
    this.getEmployeedatabyid(this.selectedData);
  }

  empdata = {} as Ipersonal;
  getEmployeedatabyid(Value: any) {
    let employeeId = Value.employeeId;
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.empdata = data as Ipersonal;
        },
        error: (err: any) => {
          console.log(err);
          alert('Insertion of data faild');
        },
      });
  }

  getComments(value: any) {
    console.log(value);
    this.myApproverComments = value.map((ele: any) => {
      // Parse the metaData and assign it to metadata property
      const parsedMetaData = JSON.parse(ele.meta);
      return {
        ...ele, // Copy other properties from ele
        metadata: parsedMetaData, // Assign parsed metaData to metadata property
      };
    });
  }

  setData(value: any) {
    localStorage.setItem('formdata', JSON.stringify(value) || '{}');
  }

  getProbationExtendDays() {
    const ProbationExtensionId=environment.ProbationExtensionId;
    const extensionPeriodTimes = environment.ProbationExtendPeriodTimes;
    this.subscription = this.http
      .getData(`ProbationFlow/settingsprobationconfiggetall`)
      .subscribe({
        next: (data: any) => {
          let duration = data.find((ele: any) => {
            return ele.configValueId === ProbationExtensionId;
          });
          this.probationExtensionDuration = duration.noOfDays;
              let extendTimes = data.find((ele: any) => {
            return ele.configValueId === extensionPeriodTimes;
          });
          this.probationExtensionTimes = extendTimes.noOfDays;
          console.log(this.probationExtensionTimes);
        },
      });
  }

  onclickproceevalue(value: any) {
    let ProcessedRequest = this.myApproverComments.find((ele: any) => {
      return ele.approverRole === value;
    });
    this.selectedData.responseId = ProcessedRequest.metadata.responseId;
    this.selectedData.overAllRating = ProcessedRequest.metadata.Overallrating;
  }

  discontinue: boolean = false;
  extend: boolean = false;
  approve: boolean = false;
  buttondisable: boolean = false;
  // Function to handle toggling Early Relieving option
  toggleApprove() {
    if (!this.approve) {
      this.discontinue = false;
      this.extend = false;
      this.approve = true;
      this.buttondisable = true;
      this.selectedData.requestSelectedType = 'Approve';
      // Clear data related to Extend and Discontinue
      this.clearExtendData();
      this.clearDiscontinueData();
    }
  }

  toggleExtend() {
    this.discontinue = false;
    this.approve = false;
    this.extend = true;
    this.buttondisable = true;
    this.selectedData.requestSelectedType = 'Extend';
    // Clear data related to approve Relieving and Discontinue
    this.clearApproveData();
    this.clearDiscontinueData();
  }

  // Function to handle toggling Discontinue option
  toggleDiscontinue() {
    this.extend = false;
    this.approve = false;
    this.discontinue = true;
    this.buttondisable = true;
    this.selectedData.requestSelectedType = 'Reject';
    // Clear data related to Early Relieving and Extend
    this.clearApproveData();
    this.clearExtendData();
  }

  clearApproveData() {
    this.selectedData.comments = '';
  }

  // Function to clear data related to Extend
  clearExtendData() {
    this.selectedData.extenddate = null;
    this.selectedData.comments = ''; // Assuming comments is used for Extend
    this.selectedData.reasonForExtend = '';
  }

  // Function to clear data related to Discontinue
  clearDiscontinueData() {
    this.selectedData.comments = '';
    this.selectedData.rejectedReason = '';
  }

  issubmitdiable: boolean = false;
  ifreasonnull(Value: any) {
       const trimmedValue = Value?.trim();
     const startsWithSpecialChar = /^[^a-zA-Z0-9]/.test(trimmedValue);

    if (!trimmedValue || startsWithSpecialChar) {
    this.issubmitdiable = true;
    } else {
    this.issubmitdiable = false;
     }
  }

  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if ((charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122) && charCode !== 32) {
      return false;
    }
    return true;
  }

getBlockedFutureDate(lastWorkingDate: string,extendedDate:string,probationextendedcount:number): string {
     if(extendedDate ){
      lastWorkingDate = extendedDate;
    }
    const lastWorkingDateObj = moment(lastWorkingDate).startOf('day').add(1, 'day');; // Set time to start of day (midnight)
    // Format the date as "YYYY-MM-DD"
    const formattedDate = lastWorkingDateObj.format('YYYY-MM-DD');
    return formattedDate;
  }

  getBlockedFutureDateupto(startDate: string, duration: number,extendedDate:string): string {
      if(extendedDate){
      startDate = extendedDate;
    }
    const startDateObj = moment(startDate).startOf('day'); // Set time to start of day (midnight)
    // Add the duration (e.g., 90 days) to the start date
    const futureDate = startDateObj.add(duration, 'days');
    // Format the future date as "YYYY-MM-DD"
    const formattedFutureDate = futureDate.format('YYYY-MM-DD');
    return formattedFutureDate;
  }
  // getBlockedFutureDate(lastWorkingDate: string): string {
  //   const lastWorkingDateObj = moment(lastWorkingDate).startOf('day'); // Set time to start of day (midnight)

  //   // Format the date as "YYYY-MM-DD"
  //   const formattedDate = lastWorkingDateObj.format('YYYY-MM-DD');

  //   return formattedDate;
  // }

  // getBlockedFutureDateupto(startDate: string, duration: number): string {
  //   const startDateObj = moment(startDate).startOf('day'); // Set time to start of day (midnight)

  //   // Add the duration (e.g., 90 days) to the start date
  //   const futureDate = startDateObj.add(duration, 'days');

  //   // Format the future date as "YYYY-MM-DD"
  //   const formattedFutureDate = futureDate.format('YYYY-MM-DD');

  //   return formattedFutureDate;
  // }
  jsonData = {} as any;
  handleProcess(f: NgForm) {
    this.openModalService.openLoaderModal('Processing....')
    let successMessage = '';
    if (this.selectedData.requestSelectedType == 'Approve') {
      this.jsonData = JSON.stringify({
        status: 'Processed',
        responseId: this.selectedData.responseId,
        Overallrating: this.selectedData.overAllRating,
      });
      successMessage = 'Probation Status Processed Successfully';
    }
    if (this.selectedData.requestSelectedType == 'Reject') {
      this.jsonData = JSON.stringify({
        status: 'Rejected',
        responseId: this.selectedData.responseId,
        Overallrating: this.selectedData.overAllRating,
      });
      successMessage = 'Probation Request Rejected Successfully';
    }
    if (this.selectedData.requestSelectedType == 'Extend') {
      this.jsonData = JSON.stringify({
        status: 'Extended',
        PrExtendedDate: this.selectedData.extenddate,
        responseId: this.selectedData.responseId,
        Overallrating: this.selectedData.overAllRating,
      });
      successMessage = 'Probation Request Extended Successfully';
    }
    let requestBody = {
      status: 'Processed',
      comments: this.selectedData.comments,
      probationExtendedDate: this.selectedData.extenddate,
      meta: this.jsonData,
      responseId: this.selectedData.responseId,
      approvedBy: this.LOGIN.employeeId.toString(),
      currentStage: this.requesthandler.approvalHeader?.currentapprovalStage,
      // currentStage: parseInt(this.requesthandler?.approvalHeader?.currentapprovalStage),
    };
    if (this.selectedData.requestSelectedType == 'Approve') {
      requestBody.status = 'Processed';
      requestBody.comments = this.selectedData.comments;
    }
    if (this.selectedData.requestSelectedType == 'Reject') {
      requestBody.status = 'Rejected';
      requestBody.comments = this.selectedData.rejectedReason;
    }
    if (this.selectedData.requestSelectedType == 'Extend') {
      requestBody.probationExtendedDate = this.selectedData.extenddate;
      requestBody.status = 'Processed';
      requestBody.comments = this.selectedData.comments;
    }
    this.subscription = this.http
      .putData(
        `PendingApproval/process/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.modalService.dismissAll();
          this.openModalService.openSuccessModal(successMessage);
          this.getAllPendingApprovals();
        },
        error: (reason: any) => {
          this.openModalService.openErrorModal(reason.error.message);
        },
        complete: () => {
          this.getAllPendingApprovals();
        },
      });
  }

  reset() {
    this.modalService.dismissAll();
    this.clearApproveData();
    this.clearExtendData();
    this.clearDiscontinueData();
    this.discontinue = false;
    this.extend = false;
    this.approve = false;
    this.selectedData.proccesoption = '';
  }

  close() {
    const modalElement = document.getElementById('rolereq');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

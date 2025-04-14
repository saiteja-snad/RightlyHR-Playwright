import { Component, OnDestroy, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
  ISeparation,
  ISeparationRequest,
} from '../separation-for-you-request/separation-for-you-request';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { Ipersonal } from '../../../Interfaces/members-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { environment } from '../../../../environments/environment.dev';

@Component({
  selector: 'app-recall-for-your-role-request',
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    NgbPopoverModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
  ],
  templateUrl: './recall-for-your-role-request.component.html',
  styleUrl: './recall-for-your-role-request.component.scss',
})
export class RecallForYourRoleRequestComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  recall_For_Your_role_Details = new BehaviorSubject<ISeparation[]>([]);
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  myApproverComments = {} as any;
  requesthandler = {} as any;
  selectedSpRequestDataforheader = {} as any;
  selectedSpRequestData = {} as any;
  requestType!: string;
  empdata = {} as any;
  isLoading = false;
  jsonData = {} as any;
  recallAcceptFormForProcess!:FormGroup;
  recallAcceptForm!:FormGroup;
  rejectSeparationForm!:FormGroup;
  constructor(
    private authService: AuthService,
    private http: HttpService,
    private router: Router,
    private conformationPopup: OpenModalService,
    private modalService: NgbModal,
    private fb:FormBuilder
  ) {}

  ngOnInit(): void {
    this.getAllPendingApprovals();
    this.formInializer();
  }
  //function to initalize the form
  formInializer(){
    this.recallAcceptFormForProcess = this.fb.group({
      recallReason: [null,
        [Validators.required, Validators.maxLength(250), Validators.pattern(/^(?!\s).*$/)]
      ]
    });
    this.recallAcceptForm = this.fb.group({
      AcceptReason: [null,
        [Validators.required, Validators.maxLength(250), Validators.pattern(/^(?!\s).*$/)]
      ]
    });
    this.rejectSeparationForm = this.fb.group({
      notes: [null,[Validators.required, Validators.maxLength(250), Validators.pattern(/^(?!\s).*$/)]
      ]
    });
  }
  //function to open the modal
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
  //function to get the leaves by employee id
  getAllPendingApprovals() {
    let loggedInUser = this.authService.getToken();
    let EmployeeId = loggedInUser.employeeId;
    let moduleId=environment.RecallrequestmoduleId;
    this.subscription = this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=ROLE`
      )
      .subscribe({
        next: (data: any) => {
          console.log(data.data);
          this.recall_For_Your_role_Details.next(
            data.data.filter(
              (item: any) =>
                item.approvalHeader.status != 'Processed' &&
                item.approvalHeader.status != 'Rejected'
            )
          );
        },
        error: (reason) => console.log(reason),
      });
  }
  //function to get the approver comments
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
  //function to handle the approved request  and comments

  handleRequest(request: ISeparationRequest) {
    console.log(request);

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
  //function to format the date
  formatDate(date: any) {
    return date?.split('T')[0];
  }
  handleAccept() {
    let loggedinuser = this.authService.getToken();
    this.isLoading = true;
    this.jsonData = JSON.stringify({
      status: 'Approved',
    });
    let requestBody = {
      status: 'Approved',
      comments: this.recallAcceptForm.get('AcceptReason')?.value,
      isAcceptEarly:
        this.selectedSpRequestData.spIsAcceptEarlyRelieving ?? false,
      lastWorkingDate: this.selectedSpRequestData.spRequestLastWorkingDate,
      meta: this.jsonData,
      approvedBy: loggedinuser.employeeId.toString(),
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
          this.recallAcceptForm.reset();
          this.modalService.dismissAll();
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            recall: true,
          }));
          this.conformationPopup.openSuccessModal(
            'Recall Request Approved Successfully'
          );
          this.getAllPendingApprovals();
        },
        error: (reason: any) => {
          this.conformationPopup.openErrorModal(reason.error.message);
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }
  handlerecallReject() {
    this.jsonData = JSON.stringify({
      status: 'Rejected',
    });
    let loginuserdata = this.authService.getToken();
    let requestBody = {
      status: 'Rejected',
      comments: this.rejectSeparationForm.get('notes')?.value,
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
          this.rejectSeparationForm.reset();
          this.modalService.dismissAll();
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            recall: true,
          }));
          this.conformationPopup.openSuccessModal(
            'Recall Request Rejected Successfully'
          );
          this.getAllPendingApprovals();
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
  handlerecallProcess() {
    let loggedInUser = this.authService.getToken();
    this.isLoading = true;
    this.jsonData = JSON.stringify({
      status: 'Processed',
    });
    let requestBody: any = {
      status: 'Processed',
      comments: this.recallAcceptFormForProcess.get('recallReason')?.value,
      isAcceptEarly:
        this.selectedSpRequestData.spIsAcceptEarlyRelieving ?? false,
      lastWorkingDate: this.selectedSpRequestData.spRequestLastWorkingDate,
      meta: this.jsonData,
      approvedBy: loggedInUser.employeeId.toString(),
    };
    if (this.selectedSpRequestData.spIsAcceptEarlyRelieving === true) {
      requestBody.lastWorkingDate =
        this.selectedSpRequestData.spearlyReliveingDate;
    }
    if (
      this.selectedSpRequestData.spIsAcceptEarlyRelieving === null ||
      this.selectedSpRequestData.spIsAcceptEarlyRelieving === '' ||
      this.selectedSpRequestData.spIsAcceptEarlyRelieving === false
    ) {
      requestBody.lastWorkingDate =
        this.selectedSpRequestData.spRequestLastWorkingDate;
    }
    this.subscription = this.http
      .putData(
        `PendingApproval/process/${this.requesthandler.approvalHeader?.id}`,
        requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.recallAcceptFormForProcess.reset();
          this.modalService.dismissAll();
          this.getAllPendingApprovals();
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            recall: true,
          }));
          this.conformationPopup.openSuccessModal(
            'Recall Request Processed Successfull'
          );
          this.isLoading = false;
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
  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

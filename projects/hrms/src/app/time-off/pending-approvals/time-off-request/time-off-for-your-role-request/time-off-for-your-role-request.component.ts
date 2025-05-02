import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { LeaveApproval, LeaveApproverComment } from '../../../../Interfaces/pendingapprovalsmodel';
import { DateformatPipe } from '../../../../Pipes/dateformat.pipe';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { TimeoffsearchPipe } from '../../../../Pipes/timeoffsearch.pipe';
@Component({
  selector: 'app-time-off-for-your-role-request',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    TranslateModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    TimeoffsearchPipe,
  ],
  templateUrl: './time-off-for-your-role-request.component.html',
  styleUrl: './time-off-for-your-role-request.component.scss',
})

export class TimeOffForYourRoleRequestComponent {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  LOGIN: any;
  subscription!: Subscription;
  leaves = new BehaviorSubject<LeaveApproval[]>([]);
  approverComments = [] as LeaveApproverComment[];
  selectedLeaveData = {} as any;
  issubmitdiable: boolean = false;
  searchValue: any;
  spinnerLoader = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild('commentspopup') modalContent: any;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  onRowsChange() {
    this.first = 0;
  }
  
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }
  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public rbac: RbacService
  ) { }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovals();
  }

  openModal(commentspopup: any) {
    this.modalService.open(commentspopup, {
      centered: true,
      backdrop: 'static',
    });
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=1&approvedType=ROLE`)
      .subscribe({
        next: (response: any) => {
          // this.leaves = response.data as LeaveApproval[];
          this.leaves.next(response.data);
        },
        error: (reason) => console.log(reason),
      });
  }

  comments(value: any) {
    this.approverComments = value;
  }

  ifreasonnull(Value: any) {
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
    } else {
      this.issubmitdiable = false;
    }
  }

  rejectleave(rejectPopup: any, selecteddata: any) {
    this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
    this.approveRequest(selecteddata);
  }

  processleave(selecteddata: any) {
    this.approveRequest(selecteddata);
    this.handleProcess(selecteddata);
  }

  approveRequest(leaveRequest: LeaveApproval) {
    if (leaveRequest) {
      this.subscription = this.http
        .getData(
          `Timeoff/getById/${leaveRequest.approvalHeader.referenceEntityId}`
        )
        .subscribe({
          next: (response: any) => {
            this.selectedLeaveData = response;
            this.selectedLeaveData.request = leaveRequest;
          },
          error: (err) => { },
          complete: () => { },
        });
    }
  }

  handleProcess(data: LeaveApproval) {
    this.conformationPopup.openLoaderModal("Wait untill the request is Processing....");
    let requestBody = {
      status: 'Processed',
      approvedBy: this.LOGIN.employeeId.toString(),
    };
    this.subscription = this.http.putData(`PendingApproval/process/${data.approvalHeader.id}`, requestBody).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Request Processed Successfully');
        this.getAllPendingApprovals();
      },
      error: (reason: any) => {
        this.conformationPopup.openErrorModal('Request Processed Failed');
      },
      complete: () => { },
    });
  }

  handleReject(data: LeaveApproval) {
    this.spinnerLoader = true;
    let requestBody = {
      status: 'Rejected',
      comments: this.selectedLeaveData.comments,
      approvedBy: this.LOGIN.employeeId.toString(),
    };
    this.subscription = this.http
      .putData(`PendingApproval/${data.request.approvalHeader.id}`, requestBody)
      .subscribe({
        next: (respone: any) => {
          this.conformationPopup.openSuccessModal(
            'Request Rejected Successfully'
          );
          setTimeout(() => {
            this.modalService.dismissAll();
            window.location.reload();
          }, 2000);
        },
        error: (reason: any) => {
          this.conformationPopup.openErrorModal('Request Rejected Failed');
          this.spinnerLoader = false;
        },
        complete: () => {
          this.spinnerLoader = false;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
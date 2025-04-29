import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { LeaveApproval, LeaveApproverComment } from '../../../../Interfaces/pendingapprovalsmodel';
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
import { OpenModalService } from '../../../../services/open-modal.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { TimeoffsearchPipe } from "../../../../Pipes/timeoffsearch.pipe";

@Component({
  selector: 'app-time-off-for-your-role-request',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, TranslateModule, DropdownModule, DateformatPipe, NoDataFoundComponent, TimeoffsearchPipe],
  templateUrl: './time-off-for-your-role-request.component.html',
  styleUrl: './time-off-for-your-role-request.component.scss'
})
export class TimeOffForYourRoleRequestComponent {
  totalRecords = 100
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
    { label: 25, value: 25 }
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
    public rbac: RbacService,
  ) {
  }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovals();
  }
  openModal(commentspopup: any) {
    this.modalService.open(commentspopup, { centered: true, backdrop: 'static' });
  }
  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    console.log(EmployeeId);
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=1&approvedType=ROLE`).subscribe({
      next: (response: any) => {
        console.log(response);
        // this.leaves = response.data as LeaveApproval[];
        this.leaves.next(response.data);
        console.log(this.leaves);
      },
      error: (reason) => console.log(reason),
    });
  }

  comments(value: any) {
    this.approverComments = value;
    console.log(this.approverComments);
  }

  ifreasonnull(Value: any) {
    console.log(Value)
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
    //this.modalService.open(approverPopup, { centered: true, backdrop: 'static' });
    this.approveRequest(selecteddata);
    this.handleProcess(selecteddata);
  }
  approveRequest(leaveRequest: LeaveApproval) {
    //this.modalService.open(approverPopup, { centered: true, backdrop: 'static' });
    if (leaveRequest) {

      this.subscription = this.http.getData(`Timeoff/getById/${leaveRequest.approvalHeader.referenceEntityId}`).subscribe({
        next: (response: any) => {
          this.selectedLeaveData = response
          this.selectedLeaveData.request = leaveRequest
          console.log(this.selectedLeaveData.request);

        },
        error: (err) => { },
        complete: () => { }
      })
    }
  }
  handleProcess(data: LeaveApproval) {
    let requestBody = {
      status: "Processed",
      approvedBy: this.LOGIN.employeeId.toString()
    }
    console.log(data);
    console.log(data.approvalHeader.id);
    console.log(requestBody)
    this.subscription = this.http.putData(`PendingApproval/process/${data.approvalHeader.id}`, requestBody).subscribe({
      next: (respone: any) => {
        console.log(respone);
        this.conformationPopup.openSuccessModal(
          'Request Processed Successfully');
        setTimeout(() => {
          this.modalService.dismissAll();
          window.location.reload();
        }, 2000);
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal(
          'Request Processed Failed');
      },
      complete: () => {
      },
    })
  }

  handleReject(data: LeaveApproval) {
    this.spinnerLoader = true;
    let requestBody = {
      status: "Rejected",
      comments: this.selectedLeaveData.comments,
      approvedBy: this.LOGIN.employeeId.toString()
    }
    console.log(data);
    console.log(requestBody)
    this.subscription = this.http.putData(`PendingApproval/${data.request.approvalHeader.id}`, requestBody).subscribe({
      next: (respone: any) => {
        console.log(respone);
        this.conformationPopup.openSuccessModal(
          'Request Rejected Successfully');
        setTimeout(() => {
          this.modalService.dismissAll();
          window.location.reload();
        }, 2000);
      },
      error: (reason: any) => {
        console.log(reason);
        this.conformationPopup.openErrorModal(
          'Request Rejected Failed');
        this.spinnerLoader = false;
      },
      complete: () => {
        this.spinnerLoader = false;
      },
    })
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

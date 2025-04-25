import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../../Interfaces/letters-model';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { DateformatPipe } from '../../../../Pipes/dateformat.pipe';
import {
  AttendanceRequest,
  ICategoryDetails,
} from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { IPendingApprovals } from '../../../../Interfaces/pendingapprovalsmodel';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';
import { noWhitespaceValidator } from '../../../../shared/nowhitespace/nowhitespace.component';
import { WfhsearchfilterPipe } from "../../../../Pipes/wfhsearchfilter.pipe";

@Component({
  selector: 'app-compoff-for-you-request',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    ReactiveFormsModule,
    TranslateModule,
    WfhsearchfilterPipe
],
  templateUrl: './compoff-for-you-request.component.html',
  styleUrl: './compoff-for-you-request.component.scss',
})
export class CompoffForYouRequestComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  // leaves = [] as AttendanceRequest[];
  leaves = new BehaviorSubject<AttendanceRequest[]>([]);
  approverComments = [] as any[];
  selectedLeaveData = {} as AttendanceRequest;
  // approverComments = [] as AttendanceRequestC[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  searchValue: any;
  spinnerLoader = false;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
  ) {}
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPendingApprovals();
    this.intializeApproveForm();
  }

  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250),noWhitespaceValidator]],
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250),noWhitespaceValidator]],
    });
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=3&approvedType=EMP`
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          // this.leaves = response.data as AttendanceRequest[];
          this.leaves.next(response.data);
          console.log(this.leaves);
        },
        error: (reason) => console.log(reason),
      });
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openApproveModal(content: any, request: AttendanceRequest) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.selectedLeaveData = request;
  }

  openRejectModal(content: any, request: AttendanceRequest) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeRejectForm();
    this.selectedLeaveData = request;
  }
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  handleProcess(request: AttendanceRequest): void {
    const requestBody = {
      status: 'Processed',
      approvedBy: this.empinfo.employeeId.toString(),
    };
    this.http
      .putData(
        `PendingApproval/process/${request.approvalHeader.id}`,
        requestBody
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.sharedModalService.openSuccessModal(
            'Request Processed Successfully'
          );
        },
        error: (reason: any) => {
          this.sharedModalService.openErrorModal(reason.error.Message);
        },
        complete: () => {
          this.getAllPendingApprovals();
        },
      });
  }

  handleAccept(approveForm: FormGroup): void {
    this.spinnerLoader = true;
    if (approveForm.valid) {
      const formData = approveForm.value;
      const requestBody = {
        status: 'Approved',
        comments: formData.comments,
        approvedBy: this.empinfo.employeeId.toString(),
      };

      this.http
        .putData(
          `PendingApproval/${this.selectedLeaveData.approvalHeader.id}`,
          requestBody
        ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request Approved Successfully'
            );
            this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              compOff: true,
            }));
          },
          error: (reason: any) => {
            this.sharedModalService.openErrorModal(reason.error.Message);
            this.spinnerLoader = false;
          },
          complete: () => {
            this.getAllPendingApprovals();
            this.spinnerLoader = false;
          },
        });
    }
  }

  handleReject(rejectForm: FormGroup): void {
    this.spinnerLoader = true;
    if (rejectForm.valid) {
      const formData = rejectForm.value;
      const requestBody = {
        status: 'Rejected',
        comments: formData.comments,
      };

      this.http
        .putData(
          `PendingApproval/${this.selectedLeaveData.approvalHeader.id}`,
          requestBody
        ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request Rejected Successfully'
            );
            this.rejectForm.reset();
            this.selectedLeaveData = {} as AttendanceRequest;
            this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              compOff: true,
            }));
          },
          error: (reason: any) => {
            this.sharedModalService.openErrorModal(reason.error.Message);
            this.spinnerLoader = false;
          },
          complete: () => {
            this.getAllPendingApprovals();
            this.spinnerLoader = false;
          },
        });
    }
  }

  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    this.approverComments = value;
    console.log(this.approverComments);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { AttendanceRequest, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { IJob } from '../../../Interfaces/letters-model';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { WfhsearchfilterPipe } from "../../../Pipes/wfhsearchfilter.pipe";

@Component({
  selector: 'app-wfh-for-your-role-requset',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    TranslateModule,
    ReactiveFormsModule,
    WfhsearchfilterPipe
],
  templateUrl: './wfh-for-your-role-requset.component.html',
  styleUrl: './wfh-for-your-role-requset.component.scss',
})
export class WfhForYourRoleRequsetComponent implements OnInit, OnDestroy {
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
  leaves = new BehaviorSubject<AttendanceRequest[]>([]);
  approverComments = [] as any[];
  // approverComments = [] as AttendanceRequestC[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  selectedLeaveData = {} as AttendanceRequest;
  searchValue: any;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService
  ) {}
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPendingApprovals();
  }



  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    console.log(EmployeeId);
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=2&approvedType=ROLE`
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.leaves.next(response.data);
          console.log(this.leaves);
        },
        error: (reason) => console.log(reason),
      });
  }
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

  
  openApproveModal(content: any, request: AttendanceRequest) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeApproveForm();
    this.selectedLeaveData = request;
  }

  openRejectModal(content: any, request: AttendanceRequest) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeRejectForm();
    this.selectedLeaveData = request;
  }

  handleAccept(approveForm: FormGroup): void {
    if (approveForm.valid) {
      const formData = approveForm.value;
      const requestBody = {
        status: 'Approved',
        comments: formData.comments,
        approvedBy: this.empinfo.employeeId.toString(),
      };
      this.sharedModalService.openLoaderModal(
        'Approving Request, Please wait...');
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
            this.approveForm.reset();
            this.selectedLeaveData = {} as AttendanceRequest;
            this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              wfh: true,
            }));
          },
          error: (reason: any) => {
            this.modalService.dismissAll();
            this.sharedModalService.openErrorModal(reason.error.Message);
          },
          complete: () => {
            this.getAllPendingApprovals();
          },
        });
    }
  }

  handleReject(rejectForm: FormGroup): void {
    if (rejectForm.valid) {
      const formData = rejectForm.value;
      const requestBody = {
        status: 'Rejected',
        comments: formData.comments,
      };
      this.sharedModalService.openLoaderModal(
        'Rejecting Request, Please wait...');
      this.http
        .putData(
          `PendingApproval/${this.selectedLeaveData.approvalHeader.id}`,
          requestBody
        ).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request Rejcted Successfully'
            );
            this.rejectForm.reset();
            this.selectedLeaveData = {} as AttendanceRequest;
            this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              wfh: true,
            }));
           
          },
          error: (reason: any) => {
            this.modalService.dismissAll();
            this.sharedModalService.openErrorModal(reason.error.Message);
          },
          complete: () => {
            this.getAllPendingApprovals();
          },
        });
    }
  }

  handleProcess(request: AttendanceRequest) {
    let requestBody = {
      status: 'Processed',
      approvedBy: this.empinfo.employeeId.toString(),
    };
    this.sharedModalService.openLoaderModal(
      'Processing Request, Please wait...');
    this.http
      .putData(
        `PendingApproval/process/${request.approvalHeader.id}`,
        requestBody
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respone: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal(
            'Request Processed Successfully'
          );
          this.selectedLeaveData = {} as AttendanceRequest;
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            wfh: true,
          }));
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openErrorModal(
            reason.error.Message
          );
        },
        complete: () => {
          this.getAllPendingApprovals();
        },
      });
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

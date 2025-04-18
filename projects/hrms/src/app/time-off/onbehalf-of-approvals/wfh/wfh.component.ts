import { CommonModule } from '@angular/common';
import { Component, effect, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, BehaviorSubject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { AttendanceRequest, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { WfhsearchfilterPipe } from '../../../Pipes/wfhsearchfilter.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-wfh',
  imports: [CommonModule,
    RouterModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    ReactiveFormsModule,
    TranslateModule,
    WfhsearchfilterPipe],
  templateUrl: './wfh.component.html',
  styleUrl: './wfh.component.scss'
})
export class WfhComponent {
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
  LOGIN: any;
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  selectedLeaveData = {} as AttendanceRequest;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  searchValue: any;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
  ) {
    // React to trigger signal from shared service
  effect(() => {
    if (this.http.trigger()) {
      const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
      if (data && Object.keys(data).length > 0) {
        this.LOGIN = data;
        this.getAllPendingApprovals();
      } else {
        this.leaves.next([]);
      }

      this.http.resetTriggerSignal();
    }
  });
  }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    const storedEmployee = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');

  if (storedEmployee && Object.keys(storedEmployee).length > 0) {
    this.LOGIN = storedEmployee;
    this.getAllPendingApprovals();
  } else {
    this.leaves.next([]);
  }
  
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
        `PendingApproval/employee/${EmployeeId}?moduleId=2&approvedType=EMP`
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.leaves.next(response.data);
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

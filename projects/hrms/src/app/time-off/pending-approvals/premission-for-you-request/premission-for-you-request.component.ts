import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { ICategoryDetails, PermissionRequestResponse, } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { PermissionsearchPipe } from "../../../Pipes/permissionsearch.pipe";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { SignalsService } from '../../../services/signals.service';
import { TableModule } from 'primeng/table';
import { LeaveApproval } from '../../../Interfaces/pendingapprovalsmodel';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-premission-for-you-request',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    ReactiveFormsModule,
    TranslateModule,
    PermissionsearchPipe,
    DataLoaderContentComponent,
    TableModule,
  ],
  templateUrl: './premission-for-you-request.component.html',
  styleUrl: './premission-for-you-request.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PremissionForYouRequestComponent implements OnInit, OnDestroy {
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
  leaves = new BehaviorSubject<PermissionRequestResponse[]>([]);
  approverComments = [] as any[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  @ViewChild('leaveSummary') leaveSummary: any;
  requestSummary!:any;
  selectedLeaveData = {} as PermissionRequestResponse;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  searchValue: any;
  spinnerLoader = false;
  dataload = false;
  permissionsselect!: LeaveApproval[];
  selectedLeavesItems!: LeaveApproval[];
  multiSelect = false;
  requestBody = {} as any;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    private signalService: SignalsService
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPendingApprovals();
  }
  selectCheck(Value: any) {
    this.multiSelect = Array.isArray(Value) && Value.length > 0;
  }
  bulkapprove(approverPopup: any) {
    this.intializeApproveForm();
    this.modalService.open(approverPopup, {
      centered: true,
      backdrop: 'static',
    });
  }
  bulkReject(rejectPopup: any) {
    this.intializeRejectForm();
    this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
  }
  bulkProcess() {
    this.handleProcess(this.permissionsselect);
  }
  canBulkApprove(): boolean {
    return this.selectedLeavesItems?.every(
      (item) =>
        item.approvalHeader.currentapprovalStage !==
          item.approvalHeader.finalapprovalStage
    );
  }
  canBulkProcess(): boolean {
    return this.selectedLeavesItems?.every(
      (item) =>
        item.approvalHeader.currentapprovalStage ===
          item.approvalHeader.finalapprovalStage
    );
  }
  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: [
        '',
        [Validators.required, Validators.maxLength(250), noWhitespaceValidator],
      ],
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: [
        '',
        [Validators.required, Validators.maxLength(250), noWhitespaceValidator],
      ],
    });
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.dataload = true;
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=18&approvedType=EMP`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.leaves.next(response.data);
          this.permissionsselect = response.data;
        },
        error: (reason) => {
          console.error(reason);
          this.dataload = false;
        },
        complete: () => {
          this.dataload = false;
        },
      });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static',size:'lg' });
  }

  openApproveModal(content: any, request: PermissionRequestResponse) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeApproveForm();
    this.selectedLeaveData = request;
  }

  openRejectModal(content: any, request: PermissionRequestResponse) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeRejectForm();
    this.selectedLeaveData = request;
  }

  handleAccept(approveForm: FormGroup): void {
    this.spinnerLoader = true;
    if (approveForm.valid) {
      const formData = approveForm.value;
      let approvedBy = this.empinfo.employeeId.toString();
      let comments = formData.comments;
      if (this.selectedLeavesItems && this.selectedLeavesItems.length > 0) {
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: 'Approved',
          comments: comments,
          moduleId: environment.permissionsModuleId,
          headerRequests: this.selectedLeavesItems.map((item) => ({
            headerID: item.approvalHeader.id,
            currentStage: item.approvalHeader.currentapprovalStage,
          })),
        };
      } else {
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: 'Approved',
          comments: comments,
          moduleId: environment.permissionsModuleId,
          headerRequests: [
            {
              headerID: this.selectedLeaveData.approvalHeader.id,
              currentStage:
                this.selectedLeaveData.approvalHeader.currentapprovalStage,
            },
          ],
        };
      }
      this.http
        .putData(`v2/PendingApproval/multiapprovals`, this.requestBody)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            if (
              this.selectedLeavesItems &&
              this.selectedLeavesItems.length <= 0
            ) {
              this.sharedModalService.openSuccessModal(
                'Request Approved Successfully'
              );
            } else {
              this.requestSummary = response.data;
              this.openModal(this.leaveSummary);
            }
            this.selectedLeavesItems = [];
            this.multiSelect = false;
            this.approveForm.reset();
            this.selectedLeaveData = {} as PermissionRequestResponse;
            this.signalService.permissionForYouTriggerSignal.set(true);
            this.signalService.permissionSidNavCountTriggerSignal.set(true);
          },
          error: (reason: any) => {
            console.error(reason);
            this.modalService.dismissAll();
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

  handleProcess(request: any) {
    this.selectedLeaveData = request;
    let approvedBy = this.empinfo.employeeId.toString();
    let message = null;
    if (this.selectedLeavesItems && this.selectedLeavesItems.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.permissionsModuleId,
        headerRequests: this.selectedLeavesItems.map((item) => ({
          headerID: item.approvalHeader.id,
          currentStage: item.approvalHeader.currentapprovalStage,
        })),
      };
      message =  'Processing Requests, Please wait...';
    } else {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.permissionsModuleId,
        headerRequests: [
          {
            headerID: this.selectedLeaveData.approvalHeader.id,
            currentStage:
              this.selectedLeaveData.approvalHeader.currentapprovalStage,
          },
        ],
      };
      message =  'Processing Request, Please wait...';
    }
    this.sharedModalService.openLoaderModal(
      message
    );
    this.http
      .putData(`v2/PendingApproval/multiapprovals`, this.requestBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          if (
            this.selectedLeavesItems &&
            this.selectedLeavesItems.length <= 0
          ) {
            this.sharedModalService.openSuccessModal(
              'Request Processed Successfully'
            );
          } else {
            this.requestSummary = response.data;
            this.openModal(this.leaveSummary);
          }
          this.selectedLeavesItems = [];
          this.multiSelect = false;
          this.signalService.permissionForYouTriggerSignal.set(true);
          this.signalService.permissionSidNavCountTriggerSignal.set(true);
        },
        error: (reason: any) => {
          console.error(reason);
          this.modalService.dismissAll();
          this.sharedModalService.openErrorModal(reason.error.Message);
        },
        complete: () => {
          this.getAllPendingApprovals();
        },
      });
  }

  handleReject(rejectForm: FormGroup): void {
    this.spinnerLoader = true;
    if (rejectForm.valid) {
      const formData = rejectForm.value;
      let approvedBy = this.empinfo.employeeId.toString();
      let comments = formData.comments;
      if (this.selectedLeavesItems && this.selectedLeavesItems.length > 0) {
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: 'Rejected',
          comments: comments,
          moduleId: environment.permissionsModuleId,
          headerRequests: this.selectedLeavesItems.map((item) => ({
            headerID: item.approvalHeader.id,
            currentStage: item.approvalHeader.currentapprovalStage,
          })),
        };
      } else {
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: 'Rejected',
          comments: comments,
          moduleId: environment.permissionsModuleId,
          headerRequests: [
            {
              headerID: this.selectedLeaveData.approvalHeader.id,
              currentStage:
                this.selectedLeaveData.approvalHeader.currentapprovalStage,
            },
          ],
        };
      }
      this.http
        .putData(`v2/PendingApproval/multiapprovals`, this.requestBody)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            if (
              this.selectedLeavesItems &&
              this.selectedLeavesItems.length <= 0
            ) {
              this.sharedModalService.openSuccessModal(
                'Request Rejected Successfully'
              );
            } else {
              this.requestSummary = response.data;
              this.openModal(this.leaveSummary);
            }
            this.selectedLeavesItems = [];
            this.multiSelect = false;
            this.rejectForm.reset();
            this.selectedLeaveData = {} as PermissionRequestResponse;
            this.signalService.permissionForYouTriggerSignal.set(true);
            this.signalService.permissionSidNavCountTriggerSignal.set(true);
          },
          error: (reason: any) => {
            console.error(reason);
            this.modalService.dismissAll();
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
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IJob } from '../../../Interfaces/letters-model';
import { PermissionRequestResponse, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { PermissionsearchPipe } from "../../../Pipes/permissionsearch.pipe";
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TableModule } from 'primeng/table';
import { LeaveApproval } from '../../../Interfaces/pendingapprovalsmodel';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
@Component({
  selector: 'app-regularization-for-your-role-request',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    ReactiveFormsModule,
    TranslateModule,
    PermissionsearchPipe,
    DataLoaderContentComponent,
    TableModule,
    NoDataFoundComponent
],
  templateUrl: './regularization-for-your-role-request.component.html',
  styleUrl: './regularization-for-your-role-request.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RegularizationForYourRoleRequestComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  multiSelect = false;
  searchValue: any;
  dataLoad = false;
  spinnerLoader= false;
  responseSummary!: any;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  empinfo = {} as IJob;
  regularization = [] as PermissionRequestResponse[];
  approverComments = [] as any[];
  regularizationselect!: LeaveApproval[];
  selectedProducts!: LeaveApproval[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  @ViewChild('leaveSummary') leaveSummary: any;
  selectedLeaveData = {} as PermissionRequestResponse;
  leaves = new BehaviorSubject<PermissionRequestResponse[]>([]);
  destroy$: Subject<boolean> = new Subject<boolean>();

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    private signalService: SignalsService
  ) { }

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
    this.handleProcess(this.regularizationselect);
  }

  canBulkApprove(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader.currentapprovalStage !==
        item.approvalHeader.finalapprovalStage
    );
  }

  canBulkProcess(): boolean {
    return this.selectedProducts?.every(
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
    let moduleId = environment.attendanceRegularizationModuleId;
    this.dataLoad = true;
    this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=ROLE`).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          response.data as PermissionRequestResponse[];
          this.leaves.next(response.data);
          this.regularizationselect = response.data;
          this.dataLoad = false;
        },
        error: (reason) => {
          console.log(reason);
          this.dataLoad = false;
        },
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
    if (approveForm.valid) {
      this.spinnerLoader= true;
      const formData = approveForm.value;
      let approvedBy = this.empinfo.employeeId.toString();
      let comments = formData.comments;

      let requestBody = {
        requestProcessedBy: approvedBy,
        status: "Approved",
        comments: comments,
        moduleId: environment.attendanceRegularizationModuleId,
        headerRequests: this.selectedProducts.map((item) => ({
          headerID: item.approvalHeader.id,
          currentStage: item.approvalHeader.currentapprovalStage
        }))
      }

      // this.sharedModalService.openLoaderModal('Approving Request, Please wait...');
      this.http.putData(`v2/PendingApproval/multiapprovals`, requestBody).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.selectedProducts = [];
            this.responseSummary= response.data;
            this.modalService.dismissAll();
            this.openModal(this.leaveSummary)
            // if (response && response.data.failureRecords.length <= 0) {
            //   this.sharedModalService.openSuccessModal('Request Approved Successfully');
            // }
            // else if (response.data.failureRecords.length > 0) {
            //   this.sharedModalService.openSuccessModal(`Total Records Approved: ${response.data.totalRecordCount}
            //      Failed:${response.data.failureRecordsCount} ${response.data.failureRecords[0].message ? response.data.failureRecords[0].message : ''} Successed:${response.data.successRecordsCount}`)
            // }
          },
          error: (reason: any) => {
            this.spinnerLoader= false;
            this.modalService.dismissAll();
            if (reason.error.statusCode == 400) {
              this.sharedModalService.openErrorModal(reason.error.message)
            }
            else if (reason.error.statusCode == 400) {
              this.sharedModalService.openErrorModal(reason.error.message)
            }
            else {
              this.sharedModalService.openErrorModal('Request Approval Failed');
            }
          },
          complete: () => {
            this.spinnerLoader= false;
            this.approveForm.reset();
            this.selectedLeaveData = {} as PermissionRequestResponse;
            this.signalService.regularizationForYouTriggerSignal.set(true);
            this.signalService.regularizationSidNavCountTriggerSignal.set(true);
            this.getAllPendingApprovals();
          },
        });
    }
  }

  handleProcess(request: any) {
    this.selectedLeaveData = request;
    let approvedBy = this.empinfo.employeeId.toString();
    let requestBody = {
      requestProcessedBy: approvedBy,
      status: 'Processed',
      moduleId: environment.attendanceRegularizationModuleId,
      headerRequests: this.selectedProducts.map((item) => ({
        headerID: item.approvalHeader.id,
        currentStage: item.approvalHeader.currentapprovalStage
      }))
    }

    this.sharedModalService.openLoaderModal('Processing Request, Please wait...');
    this.http.putData(`v2/PendingApproval/multiapprovals`, requestBody).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.selectedProducts = [];
          this.responseSummary= response.data;
          this.modalService.dismissAll();
          this.openModal(this.leaveSummary);
          // if (respone && respone.data.failureRecords.length <= 0) {
          //   this.sharedModalService.openSuccessModal('Request Processed Successfully');
          // }
          // else if (respone.data.failureRecords.length > 0) {
          //   this.sharedModalService.openSuccessModal(`Total Records Processed: ${respone.data.totalRecordCount}
          //      Failed:${respone.data.failureRecordsCount} ${respone.data.failureRecords[0].message ? respone.data.failureRecords[0].message : ''} Successed:${respone.data.successRecordsCount}`)
          // }
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          if (reason.error.statusCode == 400) {
            this.sharedModalService.openErrorModal(reason.error.message)
          }
          else if (reason.error.statusCode == 400) {
            this.sharedModalService.openErrorModal(reason.error.message)
          }
          else {
            this.sharedModalService.openErrorModal('Request Processed Failed');
          }
        },
        complete: () => {
          this.signalService.regularizationForYouTriggerSignal.set(true);
          this.signalService.regularizationSidNavCountTriggerSignal.set(true);
          this.getAllPendingApprovals();
        },
      });
  }

  handleReject(rejectForm: FormGroup): void {
    if (rejectForm.valid) {
      this.spinnerLoader= true;
      const formData = rejectForm.value;
      let approvedBy = this.empinfo.employeeId.toString();
      let comments = formData.comments;
      let requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: comments,
        moduleId: environment.attendanceRegularizationModuleId,
        headerRequests: this.selectedProducts.map((item) => ({
          headerID: item.approvalHeader.id,
          currentStage: item.approvalHeader.currentapprovalStage
        }))
      }

      // this.sharedModalService.openLoaderModal('Rejecting Request, Please wait...');
      this.http.putData(`v2/PendingApproval/multiapprovals`, requestBody).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.selectedProducts = [];
            this.responseSummary= response.data;
            this.modalService.dismissAll();
            this.openModal(this.leaveSummary)
            // if (response && response.data.failureRecords.length <= 0) {
            //   this.sharedModalService.openSuccessModal('Request Rejected Successfully')
            // }
            // else if (response.data.failureRecords.length > 0) {
            //   this.sharedModalService.openSuccessModal(`Total Records Rejected: ${response.data.totalRecordCount}
            //    Failed:${response.data.failureRecordsCount} ${response.data.failureRecords[0].message ? response.data.failureRecords[0].message : ''} Successed:${response.data.successRecordsCount}`)
            // }
          },
          error: (reason: any) => {
            this.spinnerLoader= false;
            this.modalService.dismissAll();
            if (reason.error.statusCode == 400) {
              this.sharedModalService.openErrorModal(reason.error.message)
            }
            else if (reason.error.statusCode == 400) {
              this.sharedModalService.openErrorModal(reason.error.message)
            }
            else {
              this.sharedModalService.openErrorModal('Request Rejected Failed');
            }
          },
          complete: () => {
            this.spinnerLoader= false;
            this.rejectForm.reset();
            this.selectedLeaveData = {} as PermissionRequestResponse;
            this.signalService.regularizationForYouTriggerSignal.set(true);
            this.signalService.regularizationSidNavCountTriggerSignal.set(true);
            this.getAllPendingApprovals();
          },
        });
    }
  }

  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, { centered: true, backdrop: 'static', size: 'lg' });
    this.approverComments = value;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

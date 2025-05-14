import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IJob } from '../../../Interfaces/letters-model';
import { PermissionRequestResponse, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../services/rbac.service';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { PermissionsearchPipe } from "../../../Pipes/permissionsearch.pipe";
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TableModule } from 'primeng/table';
import { LeaveApproval } from '../../../Interfaces/pendingapprovalsmodel';
@Component({
  selector: 'app-regularization-for-your-role-request',
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
    PermissionsearchPipe,
    DataLoaderContentComponent,
    TableModule,
],
  templateUrl: './regularization-for-your-role-request.component.html',
  styleUrl: './regularization-for-your-role-request.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RegularizationForYourRoleRequestComponent
  implements OnInit, OnDestroy
{
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
  regularization = [] as PermissionRequestResponse[];
  approverComments = [] as any[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  selectedLeaveData = {} as PermissionRequestResponse;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  leaves = new BehaviorSubject<PermissionRequestResponse[]>([]);
  searchValue: any;
  dataLoad = false;
  regularizationselect!: LeaveApproval[];
  selectedProducts!: LeaveApproval[];
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
    console.log(this.multiSelect);
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
          item.approvalHeader.finalapprovalStage &&
        this.rbac.allowedToAccess('Timeoff Tab.update')
    );
  }
  canBulkProcess(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader.currentapprovalStage ===
          item.approvalHeader.finalapprovalStage &&
        this.rbac.allowedToAccess('Timeoff Tab.update')
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
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=ROLE`
      )
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
      const formData = approveForm.value;
        if (this.selectedProducts && this.selectedProducts.length > 0) {
        let approvedBy = this.empinfo.employeeId.toString();
        let comments = formData.comments;
        this.requestBody = this.selectedProducts.map((item) => ({
          id: item.approvalHeader.id,
          status: 'Approved',
          comments: comments,
          approvedBy: approvedBy,
             currentapprovalStage:item.approvalHeader.currentapprovalStage
        }));
      } else {
        this.requestBody = [
          {
            id: this.selectedLeaveData.approvalHeader.id,
            status: 'Approved',
            comments: formData.comments,
            approvedBy: this.empinfo.employeeId.toString(),
            currentapprovalStage:this.selectedLeaveData.approvalHeader.currentapprovalStage
          },
        ];
      }
      this.sharedModalService.openLoaderModal(
        'Approving Request, Please wait...'
      );
      this.http
        .putData(
         `PendingApproval/multiapprovereject`, this.requestBody
        )
        .subscribe({
          next: (response: any) => {
            this.selectedProducts = [];
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request Approved Successfully'
            );
            this.approveForm.reset();
            this.selectedLeaveData = {} as PermissionRequestResponse;
            this.signalService.regularizationForYouTriggerSignal.set(true);
            this.signalService.regularizationSidNavCountTriggerSignal.set(true);
          },
          error: (reason: any) => {
            this.sharedModalService.openErrorModal(reason.error.Message);
          },
          complete: () => {
            this.getAllPendingApprovals();
          },
        });
    }
  }

  handleProcess(request: any) {
    this.selectedLeaveData=request;
     if (this.selectedProducts && this.selectedProducts.length > 0) {
      let approvedBy = this.empinfo.employeeId.toString();
      this.requestBody = this.selectedProducts.map((item) => ({
        id: item.approvalHeader.id,
        status: 'Processed',
        approvedBy: approvedBy,
           currentapprovalStage:item.approvalHeader.currentapprovalStage
      }));
    } else {
      this.requestBody = [
        {
          id: this.selectedLeaveData.approvalHeader.id,
          status: 'Processed',
          approvedBy: this.empinfo.employeeId.toString(),
          currentapprovalStage:this.selectedLeaveData.approvalHeader.currentapprovalStage
        },
      ];
    }
    this.sharedModalService.openLoaderModal(
      'Processing Request, Please wait...'
    );
    this.http
      .putData(
        `PendingApproval/multiprocess`, this.requestBody
      )
      .subscribe({
        next: (respone: any) => {
          this.selectedProducts = [];
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal(
            'Request Processed Successfully'
          );
          this.signalService.regularizationForYouTriggerSignal.set(true);
          this.signalService.regularizationSidNavCountTriggerSignal.set(true);
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

  handleReject(rejectForm: FormGroup): void {
    if (rejectForm.valid) {
      const formData = rejectForm.value;
         if (this.selectedProducts && this.selectedProducts.length > 0) {
        let approvedBy = this.empinfo.employeeId.toString();
        let comments = formData.comments;
        this.requestBody = this.selectedProducts.map((item) => ({
          id: item.approvalHeader.id,
          status: 'Rejected',
          comments: comments,
          approvedBy: approvedBy,
             currentapprovalStage:item.approvalHeader.currentapprovalStage
        }));
      } else {
        this.requestBody = [
          {
            id: this.selectedLeaveData.approvalHeader.id,
            status: 'Rejected',
            comments: formData.comments,
            approvedBy: this.empinfo.employeeId.toString(),
            currentapprovalStage:this.selectedLeaveData.approvalHeader.currentapprovalStage
          },
        ];
      }
      this.sharedModalService.openLoaderModal(
        'Rejecting Request, Please wait...'
      );
      this.http
        .putData(
          `PendingApproval/multiapprovereject`, this.requestBody
        )
        .subscribe({
          next: (response: any) => {
             this.selectedProducts = [];
            this.modalService.dismissAll();
            this.sharedModalService.openSuccessModal(
              'Request Rejected Successfully'
            );
            this.rejectForm.reset();
            this.selectedLeaveData = {} as PermissionRequestResponse;
            this.signalService.regularizationForYouTriggerSignal.set(true);
            this.signalService.regularizationSidNavCountTriggerSignal.set(true);
          },
          error: (reason: any) => {
            this.sharedModalService.openErrorModal(reason.error.Message);
          },
          complete: () => {
            this.getAllPendingApprovals();
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

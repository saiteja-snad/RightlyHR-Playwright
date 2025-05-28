import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import {
  AttendanceRequest,
  ICategoryDetails,
} from '../../../Interfaces/timoff-model';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { IJob } from '../../../Interfaces/letters-model';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../services/rbac.service';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { SignalsService } from '../../../services/signals.service';
import { TableModule } from 'primeng/table';
import { LeaveApproval } from '../../../Interfaces/pendingapprovalsmodel';
import { environment } from '../../../../environments/environment';
import { FormValidationsService } from '../../../services/form-validations.service';

@Component({
  selector: 'app-wfh-for-your-role-requset',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    TranslateModule,
    ReactiveFormsModule,
    DataLoaderContentComponent,
    TableModule,
  ],
  templateUrl: './wfh-for-your-role-requset.component.html',
  styleUrl: './wfh-for-your-role-requset.component.scss',
  encapsulation: ViewEncapsulation.None,
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
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  @ViewChild('failureRecordModal') failureRecordModal: any;
  selectedLeaveData = {} as AttendanceRequest;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  spinnerLoader = false;
  searchValue: any | null;
  dataload = false;
  wfhsselect!: LeaveApproval[];
  selectedLeavesItems: LeaveApproval[] = [];
  multiSelect = false;
  requestBody = {} as any;
  requestSummary!:any;
  @ViewChild('leaveSummary') leaveSummary: any;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    private signalService: SignalsService,
    public formsValidation:FormValidationsService
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
    this.handleProcess(this.wfhsselect);
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
        `PendingApproval/employee/${EmployeeId}?moduleId=2&approvedType=ROLE`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if(response.data.length > 0){
            this.leaves.next(response.data);
            this.wfhsselect = response.data;
          }else{
            this.leaves.next([]);
            this.wfhsselect  = [];
          }
        },
        error: (reason) => {
          this.dataload = false;
          console.error(reason)},
        complete: () => {
          this.dataload = false;
        },
      });
  }
  getFilteredAndSortedLeaves(): AttendanceRequest[] {
  const search = this.searchValue?.toLowerCase() ?? '';
  const allLeaves = this.leaves?.getValue() ?? [];

  // Filter
  let filteredLeaves = allLeaves;
  if (search) {
    filteredLeaves = filteredLeaves.filter((item: AttendanceRequest) =>
      item.entity?.attendanceRequestFusionEmployeeId?.toLowerCase().includes(search) ||
      item.entity?.attendanceRequesterName?.toLowerCase().includes(search) ||
      item.entity?.attendanceRequestDurationType?.toLowerCase().includes(search)
    );
  }

  // Sort
  if (!this.selectedLeavesItems || this.selectedLeavesItems.length === 0) {
    return filteredLeaves;
  }

  const selectedIds = new Set(this.selectedLeavesItems.map(item => item.approvalHeader?.id));
  const selected = filteredLeaves.filter(item => selectedIds.has(item.approvalHeader?.id));
  const unselected = filteredLeaves.filter(item => !selectedIds.has(item.approvalHeader?.id));

  return [...selected, ...unselected];
}
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static',size:'lg' });
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
          moduleId: environment.wfhModuleId,
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
          moduleId: environment.wfhModuleId,
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
            this.requestSummary = response.data;
            if (
              this.selectedLeavesItems &&
              this.selectedLeavesItems.length <= 0
            ) {
               this.signalService.handleResponse(this.requestSummary, 'Request Approved Successfully');
            } else {
              this.openModal(this.leaveSummary);
            }
          },
          error: (reason: any) => {
            this.modalService.dismissAll();
            this.approveForm.reset();
            this.sharedModalService.openErrorModal(reason.error.Message);
            this.spinnerLoader = false;
          },
          complete: () => {
            this.spinnerLoader = false;
            this.searchValue = null;
            this.selectedLeavesItems = [];
            this.multiSelect = false;
            this.approveForm.reset();
            this.selectedLeaveData = {} as AttendanceRequest;
            this.signalService.wfhForYouTriggerSignal.set(true);
            this.signalService.wfhSidNavCountTriggerSignal.set(true);
            this.getAllPendingApprovals();
          },
        });
    }
  }

  handleReject(rejectForm: FormGroup): void {
    this.spinnerLoader = true;
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
          moduleId: environment.wfhModuleId,
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
          moduleId: environment.wfhModuleId,
          headerRequests: [
            {
              headerID: this.selectedLeaveData.approvalHeader.id,
              currentStage:
                this.selectedLeaveData.approvalHeader.currentapprovalStage,
            },
          ],
        };
      }
      this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            this.requestSummary = response.data;
            if (
              this.selectedLeavesItems &&
              this.selectedLeavesItems.length <= 0
            ) {
               this.signalService.handleResponse(this.requestSummary, 'Request Rejected Successfully');
            } else {
              this.openModal(this.leaveSummary);
            }
           
          },
          error: (reason: any) => {
            this.rejectForm.reset();
            this.modalService.dismissAll();
            this.sharedModalService.openErrorModal(reason.error.Message);
            this.spinnerLoader = false;
          },
          complete: () => {
            this.spinnerLoader = false;
            this.searchValue = null;
             this.selectedLeavesItems = [];
            this.multiSelect = false;
            this.selectedLeaveData = {} as AttendanceRequest;
            this.signalService.wfhForYouTriggerSignal.set(true);
            this.signalService.wfhSidNavCountTriggerSignal.set(true);
            this.getAllPendingApprovals();
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
        moduleId: environment.wfhModuleId,
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
        moduleId: environment.wfhModuleId,
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
    this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.requestSummary = response.data;
          if (
            this.selectedLeavesItems &&
            this.selectedLeavesItems.length <= 0
          ) {
             this.signalService.handleResponse(this.requestSummary, 'Request Processed Successfully');
          } else {
            this.openModal(this.leaveSummary);
          }
         
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openErrorModal(reason.error.Message);
        },
        complete: () => {
          this.selectedLeavesItems = [];
          this.multiSelect = false;
          this.signalService.wfhForYouTriggerSignal.set(true);
          this.signalService.wfhSidNavCountTriggerSignal.set(true);
          this.getAllPendingApprovals();
          this.searchValue = null;
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
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

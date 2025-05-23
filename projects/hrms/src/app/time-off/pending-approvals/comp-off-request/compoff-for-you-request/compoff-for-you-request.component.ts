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
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';
import { noWhitespaceValidator } from '../../../../shared/nowhitespace/nowhitespace.component';
import { WfhsearchfilterPipe } from '../../../../Pipes/wfhsearchfilter.pipe';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { SignalsService } from '../../../../services/signals.service';
import { Table, TableModule } from 'primeng/table';
import { LeaveApproval } from '../../../../Interfaces/pendingapprovalsmodel';
import { environment } from '../../../../../environments/environment';
import { FormValidationsService } from '../../../../services/form-validations.service';

@Component({
  selector: 'app-compoff-for-you-request',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    DropdownModule,
    NoDataFoundComponent,
    DateformatPipe,
    ReactiveFormsModule,
    TranslateModule,
    WfhsearchfilterPipe,
    DataLoaderContentComponent,
    TableModule,
  ],
  templateUrl: './compoff-for-you-request.component.html',
  styleUrl: './compoff-for-you-request.component.scss',
  encapsulation: ViewEncapsulation.None,
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
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  @ViewChild('leaveSummary') leaveSummary: any;
  @ViewChild('dt') table!: Table; 
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  searchValue: any | null;
  spinnerLoader = false;
  dataload = false;
  compOffselect!: LeaveApproval[];
  selectedLeavesItems: LeaveApproval[] = [];
  multiSelect = false;
  requestBody = {} as any;
 
  requestSummary!:any;
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
    this.intializeApproveForm();
  }
  selectCheck(value: any) {
  this.multiSelect = Array.isArray(value) && value.length > 0;

  if (!value || value.length === 0) {
    this.selectedLeavesItems = [];
    return;
  }

  const stageMap: { [stage: string]: any[] } = {};

  // Group items by their approval stage
  value.forEach((item: any) => {
    const stage = item.approvalHeader?.currentapprovalStage;
    if (!stageMap[stage]) {
      stageMap[stage] = [];
    }
    stageMap[stage].push(item);
  });

  const stages = Object.keys(stageMap);
  const totalAvailable = this.leaves?.getValue().length || 0;
  const totalSelected = value.length;
  const isBulkSelect = totalSelected === totalAvailable;

  // Get the dominant stage (most frequent)
  let dominantStage = stages[0];
  let maxCount = stageMap[dominantStage].length;
  for (const stage of stages) {
    const count = stageMap[stage].length;
    if (count > maxCount) {
      dominantStage = stage;
      maxCount = count;
    } else if (count === maxCount && stage === '1') {
      dominantStage = stage;
    }
  }

  const lastSelected = value[value.length - 1];
  const lastSelectedStage = lastSelected.approvalHeader?.currentapprovalStage;

  // Scenario 1: Progressive Selection (mixing stages)
  const existingStage = this.selectedLeavesItems[0]?.approvalHeader?.currentapprovalStage;
  if (
    this.selectedLeavesItems.length > 0 &&
    lastSelectedStage &&
    existingStage &&
    lastSelectedStage !== existingStage
  ) {
    this.sharedModalService.openErrorModal('You can only select records from the same approval stage');
    const newSelection = this.selectedLeavesItems.filter(
      item => item.approvalHeader?.id !== lastSelected.approvalHeader?.id
    );
    this.selectedLeavesItems = [...newSelection];
    setTimeout(() => this.updateTableSelectionState(newSelection));
    return;
  }

  // Scenario 2: Bulk select - filter by dominant stage only
  if (isBulkSelect && stages.length > 1) {
    const dominantItems = [...stageMap[dominantStage]];
    this.selectedLeavesItems = dominantItems;


    setTimeout(() => this.updateTableSelectionState(dominantItems));
    return;
  }

  // Valid multi-select with same stage
  this.selectedLeavesItems = [...value];
}


private updateTableSelectionState(selectedItems: any[]) {
    // Create a new array reference to force change detection
    this.selectedLeavesItems = [...selectedItems];
    
    // If using PrimeNG table with dataKey
    if (this.table) {
      // Clear and reset selection to ensure checkbox states update
      this.table.selection = null;
      setTimeout(() => {
        this.table.selection = selectedItems;
      });
    }
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
    this.handleProcess(this.compOffselect);
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
        `PendingApproval/employee/${EmployeeId}?moduleId=3&approvedType=EMP`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.leaves.next(response.data);
          this.compOffselect = response.data;
        },
        error: (reason) => console.error(reason),
        complete: () => {
          this.dataload = false;
        },
      });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static',size:'lg' });
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


  handleProcess(request: any): void {
    this.selectedLeaveData = request;
    let approvedBy = this.empinfo.employeeId.toString();
    let message = null;
    if (this.selectedLeavesItems && this.selectedLeavesItems.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.compoffModuleId,
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
        moduleId: environment.compoffModuleId,
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
          this.signalService.compOffForYouTriggerSignal.set(true);
          this.signalService.compOffSidNavCountTriggerSignal.set(true);
        },
        error: (reason: any) => {
          console.error(reason);
          this.modalService.dismissAll();
          this.sharedModalService.openErrorModal(reason.error.Message);
        },
        complete: () => {
          this.getAllPendingApprovals();
          this.searchValue = null;
        },
      });
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
          moduleId: environment.compoffModuleId,
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
          moduleId: environment.compoffModuleId,
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
            this.approveForm.reset();
            this.multiSelect = false;
            this.signalService.compOffForYouTriggerSignal.set(true);
            this.signalService.compOffSidNavCountTriggerSignal.set(true);
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
            this.searchValue = null;
          },
        });
    }
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
          moduleId: environment.compoffModuleId,
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
          moduleId: environment.compoffModuleId,
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
            this.selectedLeaveData = {} as AttendanceRequest;
            this.signalService.compOffForYouTriggerSignal.set(true);
            this.signalService.compOffSidNavCountTriggerSignal.set(true);
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
            this.searchValue = null;
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

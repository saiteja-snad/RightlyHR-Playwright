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
import { Table, TableModule } from 'primeng/table';
import { LeaveApproval } from '../../../Interfaces/pendingapprovalsmodel';
import { environment } from '../../../../environments/environment';
import { FormValidationsService } from '../../../services/form-validations.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";

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
    InfoIconComponent
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
  wfhsselect!: AttendanceRequest;
  wfhsselects!: AttendanceRequest[];
  selectedLeavesItems: AttendanceRequest[] = [];
  multiSelect = false;
  requestBody = {} as any;
  requestSummary!: any;
  @ViewChild('leaveSummary') leaveSummary: any;
  @ViewChild('dt') table!: Table;
  hasSelectedAllOnce = false;
  previousSearchValue: string = '';

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    private signalService: SignalsService,
    public formsValidation: FormValidationsService
  ) { }
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPendingApprovals();
  }
  selectCheck(value: any) {
    this.multiSelect = Array.isArray(value) && value.length > 0;

    if (!value || value.length === 0) {
      this.selectedLeavesItems = [];
      this.hasSelectedAllOnce = false;
      return;
    }

    const stageMap: { [stage: string]: any[] } = {};

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

    if (isBulkSelect && stages.length > 1) {
      if (this.hasSelectedAllOnce) {
        this.sharedModalService.openErrorModal('You can only select records from the same approval stage');
      }

      this.hasSelectedAllOnce = true;

      let dominantStage = stages[0];
      let maxCount = stageMap[dominantStage].length;

      for (const stage of stages) {
        const count = stageMap[stage].length;
        if (count > maxCount || (count === maxCount && stage === '1')) {
          dominantStage = stage;
          maxCount = count;
        }
      }

      const dominantItems = stageMap[dominantStage];
      this.selectedLeavesItems = [...dominantItems];
      setTimeout(() => this.updateTableSelectionState(dominantItems));
      return;
    }

    if (!isBulkSelect && stages.length > 1) {
      this.sharedModalService.openErrorModal('You can only select records from the same approval stage');
      const validStage = this.selectedLeavesItems[0]?.approvalHeader?.currentapprovalStage;
      const newSelection = value.filter(
        (item: { approvalHeader: { currentapprovalStage: string; }; }) => item.approvalHeader?.currentapprovalStage === validStage
      );
      this.selectedLeavesItems = [...newSelection];
      setTimeout(() => this.updateTableSelectionState(newSelection));
      return;
    }

    this.selectedLeavesItems = [...value];
  }


  private updateTableSelectionState(selectedItems: any[]) {
    this.selectedLeavesItems = [...selectedItems];

    if (this.table) {
      this.table.selection = null;
      setTimeout(() => {
        this.table.selection = selectedItems;
      });
    }
  }

  onSearchChange(): void {
    if (this.searchValue !== this.previousSearchValue) {
      this.previousSearchValue = this.searchValue;
      this.selectedLeavesItems = [];
      this.hasSelectedAllOnce = false;
      this.multiSelect = false;
      this.updateTableSelectionState([]);
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
          if (response.data.length > 0) {
            this.leaves.next(response.data);
            this.wfhsselects = response.data;
          } else {
            this.leaves.next([]);
            this.wfhsselects = [];
          }
        },
        error: (reason) => {
          this.dataload = false;
          console.error(reason)
        },
        complete: () => {
          this.dataload = false;
        },
      });
  }
  getFilteredAndSortedLeaves(): AttendanceRequest[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    let leaves = this.wfhsselects ?? [];

    if (search) {
      leaves = leaves.filter(item =>
        item.entity?.attendanceRequestFusionEmployeeId?.toLowerCase().includes(search) ||
        item.entity?.attendanceRequesterName?.toLowerCase().includes(search) ||
        item.entity?.attendanceRequestDurationType?.toLowerCase().includes(search)
      );
    }

    // Sort (preserve original sorting logic)
    if (!this.selectedLeavesItems || this.selectedLeavesItems.length === 0) {
      this.leaves.next(leaves);
      return this.leaves.getValue();
    }

    const selectedIds = new Set(this.selectedLeavesItems.map(item => item.approvalHeader?.id));
    const selected = leaves.filter(item => selectedIds.has(item.approvalHeader?.id));
    const unselected = leaves.filter(item => !selectedIds.has(item.approvalHeader?.id));
    this.leaves.next([...selected, ...unselected]);
    return this.leaves.getValue();
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
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
               if (this.selectedLeavesItems.length > 1) {
                this.signalService.handleResponse(this.requestSummary, 'Selected WFH Requests Approved Successfully');
              } else {
                this.signalService.handleResponse(this.requestSummary, 'Selected WFH Request Approved Successfully');
              }
            } else {
              this.openModal(this.leaveSummary);
              setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
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
               if (this.selectedLeavesItems.length > 1) {
                this.signalService.handleResponse(this.requestSummary, 'Selected WFH Requests Rejected Successfully');
              } else {
                this.signalService.handleResponse(this.requestSummary, 'Selected WFH Request Rejected Successfully');
              }
            } else {
              this.openModal(this.leaveSummary);
              setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
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
      message = 'Processing Selected WFH Requests...';
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
      message = 'Processing Selected WFH Requests...';
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
             if (this.selectedLeavesItems.length > 1) {
              this.signalService.handleResponse(this.requestSummary, 'Selected Requests Processed Successfully');
            } else {
              this.signalService.handleResponse(this.requestSummary, 'Selected Request Processed Successfully');
            }
          } else {
            this.openModal(this.leaveSummary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
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
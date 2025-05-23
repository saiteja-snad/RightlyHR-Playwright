import { CommonModule } from '@angular/common';
import { Component, effect, ViewChild } from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import {
  PermissionRequestResponse,
  ICategoryDetails,
} from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { environment } from '../../../../environments/environment';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { Table, TableModule } from 'primeng/table';
import { LeaveApproval } from '../../../Interfaces/pendingapprovalsmodel';
import { FormValidationsService } from '../../../services/form-validations.service';
@Component({
  selector: 'app-permissions',
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
    TableModule,
  ],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
})
export class PermissionsComponent {
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
  LOGIN: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  leaves = new BehaviorSubject<PermissionRequestResponse[]>([]);
  approverComments = [] as any[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  @ViewChild('leaveSummary') leaveSummary: any;
  @ViewChild('dt') table!: Table; 
  selectedLeaveData = {} as PermissionRequestResponse;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  spinnerLoader = false;
  multiSelect = false;
  selectedLeavesItems: LeaveApproval[] = [];
  permissionsselect!: PermissionRequestResponse;
  requestBody = {} as any;
  requestSummary!: any;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    public formValidation: FormValidationService,
    public formsValidation: FormValidationsService
  ) {
    effect(() => {
      if (this.http.trigger()) {
        const data = JSON.parse(
          localStorage.getItem('onbehalfofaproverData') || '{}'
        );
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
    const storedEmployee = JSON.parse(
      localStorage.getItem('onbehalfofaproverData') || '{}'
    );
    if (storedEmployee && Object.keys(storedEmployee).length > 0) {
      this.LOGIN = storedEmployee;
      this.getAllPendingApprovals();
    } else {
      this.leaves.next([]);
    }
    this.intializeApproveForm();
  }

  getFilteredAndSortedLeaves(): PermissionRequestResponse[] {
    const allLeaves = this.leaves?.getValue() ?? [];

    // Filter
    let filteredLeaves = allLeaves;
    // Sort
    if (!this.selectedLeavesItems || this.selectedLeavesItems.length === 0) {
      return filteredLeaves;
    }

    const selectedIds = new Set(
      this.selectedLeavesItems.map((item) => item.approvalHeader?.id)
    );
    const selected = filteredLeaves.filter((item) =>
      selectedIds.has(item.approvalHeader?.id)
    );
    const unselected = filteredLeaves.filter(
      (item) => !selectedIds.has(item.approvalHeader?.id)
    );

    return [...selected, ...unselected];
  }

 selectCheck(value: any) {
  this.multiSelect = Array.isArray(value) && value.length > 0;

  if (!value || value.length === 0) {
    this.selectedLeavesItems = [];
    return;
  }

  if (this.multiSelect) {
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

    const lastSelected = value[value.length - 1];
    const lastSelectedStage = lastSelected.approvalHeader?.currentapprovalStage;

    // 🆕 Check if there is already a selection with a different stage
    const existingStage = this.selectedLeavesItems[0]?.approvalHeader?.currentapprovalStage;
    if (
      this.selectedLeavesItems.length > 0 &&
      existingStage &&
      lastSelectedStage &&
      existingStage !== lastSelectedStage
    ) {
      this.sharedModalService.openErrorModal('You can only select records from the same approval stage');

      const newSelection = this.selectedLeavesItems.filter(
        item => item.approvalHeader?.id !== lastSelected.approvalHeader?.id
      );

      this.selectedLeavesItems = [...newSelection];

      setTimeout(() => {
        this.updateTableSelectionState(newSelection);
      });

      return;
    }

    // 🔁 Continue existing logic
    const totalAvailable = this.leaves?.getValue().length || 0;
    const totalSelected = value.length;
    const isBulkSelect = totalSelected === totalAvailable;

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

    if (stages.length > 1 && lastSelectedStage !== dominantStage) {
      this.sharedModalService.openErrorModal('You can only select records from the same approval stage');

      const newSelection = this.selectedLeavesItems.filter(
        item => item.approvalHeader?.id !== lastSelected.approvalHeader?.id
      );

      this.selectedLeavesItems = [...newSelection];

      setTimeout(() => {
        this.updateTableSelectionState(newSelection);
      });

      return;
    }

    if (isBulkSelect) {
      const dominantStageItems = [...stageMap[dominantStage]];
      this.selectedLeavesItems = dominantStageItems;

      setTimeout(() => {
        this.updateTableSelectionState(dominantStageItems);
      });
    } else {
      this.selectedLeavesItems = [...value];
    }
  } else {
    this.selectedLeavesItems = [value];
  }
}


  // Helper method to force update table selection state
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
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=${environment.permissionsModuleId}`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.leaves.next(response.data);
          this.permissionsselect = response.data;
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
            this.http.triggerActionSignal();
          },
          error: (reason: any) => {
            this.spinnerLoader = false;
            this.sharedModalService.openErrorModal(reason.error.Message);
          },
          complete: () => {
            this.getAllPendingApprovals();
            this.spinnerLoader = false;
          },
        });
    }
  }

  handleProcess(request: PermissionRequestResponse) {
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
      message = 'Processing Requests, Please wait...';
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
      message = 'Processing Request, Please wait...';
    }
    this.sharedModalService.openLoaderModal(message);
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
          this.http.triggerActionSignal();
          this.getAllPendingApprovals();
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openErrorModal(reason.error.Message);
        },
        complete: () => {},
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
            this.http.triggerActionSignal();
            this.getAllPendingApprovals();
          },
          error: (reason: any) => {
            this.spinnerLoader = false;
            this.sharedModalService.openErrorModal(reason.error.Message);
          },
          complete: () => {
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

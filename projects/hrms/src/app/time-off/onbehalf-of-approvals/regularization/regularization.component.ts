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
import { Table, TableModule } from 'primeng/table';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { environment } from '../../../../environments/environment';
import { FormValidationsService } from '../../../services/form-validations.service';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { SignalsService } from '../../../services/signals.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";

interface RegularizationRequest {
  approvalHeader: {
    id: number;
    currentapprovalStage: string;
    finalapprovalStage: string;
  };
  entity: {
    fusionempId: string;
    raisedForName: string;
    createdDate: string;
    requestedDate: string;
    duration: string;
    type: string;
    notes: string;
    regularizationApproverComments?: any[];
  };
}

@Component({
  selector: 'app-regularization',
  standalone: true,
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TableModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    InfoIconComponent
  ],
  templateUrl: './regularization.component.html',
  styleUrl: './regularization.component.scss',
})
export class RegularizationComponent {
  @ViewChild('dt') table!: Table;
  @ViewChild('commentspopup') commentspopup: any;
  @ViewChild('leaveSummary') leaveSummary: any;

  leaves = new BehaviorSubject<RegularizationRequest[]>([]);
  permissionsselects: RegularizationRequest[] = [];
  selectedLeavesItems: RegularizationRequest[] = [];
  selectedLeaveData = {} as RegularizationRequest;

  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  spinnerLoader = false;
  multiSelect = false;
  dataload = false;
  searchValue: string | null = null;
  previousSearchValue = '';
  hasSelectedAllOnce = false;
  approverComments: any[] = [];
  requestSummary: any;
  requestBody = {} as any;

  LOGIN: any;
  empinfo: any;

  destroy$ = new Subject<boolean>();

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    public formsValidation: FormValidationsService,
    private signalService: SignalsService
  ) {
    effect(() => {
      if (this.http.trigger()) {
        const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
        if (data && Object.keys(data).length > 0) {
          this.LOGIN = data;
          this.getAllPendingApprovals();
        } else {
          this.leaves.next([]);
          this.permissionsselects = [];
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
    }
    this.intializeApproveForm();
  }

  getAllPendingApprovals() {
    const employeeId = this.LOGIN.employeeId;
    this.dataload = true;

    this.http.getData(`PendingApproval/employee/${employeeId}?moduleId=${environment.attendanceRegularizationModuleId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const data = response.data || [];
          this.leaves.next(data);
          this.permissionsselects = data;
          this.dataload = false;
        },
        error: () => {
          this.leaves.next([]);
          this.permissionsselects = [];
          this.dataload = false;
        }
      });
  }

  getFilteredAndSortedLeaves(): RegularizationRequest[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    let filtered = this.permissionsselects;

    if (search) {
      filtered = filtered.filter(item =>
        item.entity?.fusionempId?.toLowerCase().includes(search) ||
        item.entity?.raisedForName?.toLowerCase().includes(search) ||
        item.entity?.type?.toLowerCase().includes(search)
      );
    }

    if (!this.selectedLeavesItems.length) {
      this.leaves.next(filtered);
      return filtered;
    }

    const selectedIds = new Set(this.selectedLeavesItems.map(i => i.approvalHeader.id));
    const selected = filtered.filter(i => selectedIds.has(i.approvalHeader.id));
    const unselected = filtered.filter(i => !selectedIds.has(i.approvalHeader.id));
    const result = [...selected, ...unselected];
    this.leaves.next(result);
    return result;
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
      if (!stageMap[stage]) stageMap[stage] = [];
      stageMap[stage].push(item);
    });

    const stages = Object.keys(stageMap);
    const totalAvailable = this.leaves.getValue().length;
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
        if (stageMap[stage].length > maxCount) {
          dominantStage = stage;
          maxCount = stageMap[stage].length;
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
      const newSelection = value.filter((item: any) => item.approvalHeader.currentapprovalStage === validStage);
      this.selectedLeavesItems = [...newSelection];
      setTimeout(() => this.updateTableSelectionState(newSelection));
      return;
    }

    this.selectedLeavesItems = [...value];
  }

  private updateTableSelectionState(items: any[]) {
    this.selectedLeavesItems = [...items];
    if (this.table) {
      this.table.selection = null;
      setTimeout(() => this.table.selection = items);
    }
  }

  onSearchChange() {
    if (this.searchValue !== this.previousSearchValue) {
      this.previousSearchValue = this.searchValue || '';
      this.selectedLeavesItems = [];
      this.hasSelectedAllOnce = false;
      this.multiSelect = false;
      this.updateTableSelectionState([]);
    }
  }

  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250), noWhitespaceValidator]]
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250), noWhitespaceValidator]]
    });
  }

  openApproveModal(content: any, request: RegularizationRequest) {
    this.intializeApproveForm();
    this.selectedLeaveData = request;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  openRejectModal(content: any, request: RegularizationRequest) {
    this.intializeRejectForm();
    this.selectedLeaveData = request;
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  bulkapprove(modal: any) {
    this.intializeApproveForm();
    this.modalService.open(modal, { centered: true, backdrop: 'static' });
  }

  bulkReject(modal: any) {
    this.intializeRejectForm();
    this.modalService.open(modal, { centered: true, backdrop: 'static' });
  }

  bulkProcess() {
    this.handleProcess(); // Now consistent with Permissions
  }

  canBulkApprove() {
    return this.selectedLeavesItems.every(i =>
      i.approvalHeader.currentapprovalStage !== i.approvalHeader.finalapprovalStage
    );
  }

  canBulkProcess() {
    return this.selectedLeavesItems.every(i =>
      i.approvalHeader.currentapprovalStage === i.approvalHeader.finalapprovalStage
    );
  }

  // Approve Action (with comments)
  handleAccept(approveForm: FormGroup) {
    this.spinnerLoader = true;
    if (!approveForm.valid) return;

    const comments = approveForm.value.comments;
    const approvedBy = this.empinfo.employeeId;

    if (this.selectedLeavesItems.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Approved',
        comments: comments,
        moduleId: environment.attendanceRegularizationModuleId,
        onBehalfOfApproval: true,
        approvedPersonaType: 'onBehalfOf',
        headerRequests: this.selectedLeavesItems.map(item => ({
          headerID: item.approvalHeader.id,
          currentStage: item.approvalHeader.currentapprovalStage
        }))
      };
    } else {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Approved',
        comments: comments,
        moduleId: environment.attendanceRegularizationModuleId,
        onBehalfOfApproval: true,
        approvedPersonaType: 'onBehalfOf',
        headerRequests: [{
          headerID: this.selectedLeaveData.approvalHeader.id,
          currentStage: this.selectedLeaveData.approvalHeader.currentapprovalStage
        }]
      };
    }

    this.submitApprovalRequest('Regularization request approved successfully');
  }

  // Process Action (final stage - no comments needed)
  handleProcess(request?: RegularizationRequest) {
    if (request) this.selectedLeaveData = request;

    const approvedBy = this.empinfo.employeeId;

    if (this.selectedLeavesItems.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.attendanceRegularizationModuleId,
        onBehalfOfApproval: true,
        approvedPersonaType: 'onBehalfOf',
        headerRequests: this.selectedLeavesItems.map(item => ({
          headerID: item.approvalHeader.id,
          currentStage: item.approvalHeader.currentapprovalStage
        }))
      };
    } else {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.attendanceRegularizationModuleId,
        onBehalfOfApproval: true,
        approvedPersonaType: 'onBehalfOf',
        headerRequests: [{
          headerID: this.selectedLeaveData.approvalHeader.id,
          currentStage: this.selectedLeaveData.approvalHeader.currentapprovalStage
        }]
      };
    }

    this.sharedModalService.openLoaderModal(
      this.selectedLeavesItems.length > 1 ? 'Processing Requests, Please wait...' : 'Processing Request, Please wait...'
    );

    this.submitApprovalRequest('Regularization request processed successfully');
  }

  // Reject Action (with comments)
  handleReject(rejectForm: FormGroup) {
    this.spinnerLoader = true;
    if (!rejectForm.valid) return;

    const comments = rejectForm.value.comments;
    const approvedBy = this.empinfo.employeeId;

    if (this.selectedLeavesItems.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: comments,
        moduleId: environment.attendanceRegularizationModuleId,
        onBehalfOfApproval: true,
        approvedPersonaType: 'onBehalfOf',
        headerRequests: this.selectedLeavesItems.map(item => ({
          headerID: item.approvalHeader.id,
          currentStage: item.approvalHeader.currentapprovalStage
        }))
      };
    } else {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: comments,
        moduleId: environment.attendanceRegularizationModuleId,
        onBehalfOfApproval: true,
        approvedPersonaType: 'onBehalfOf',
        headerRequests: [{
          headerID: this.selectedLeaveData.approvalHeader.id,
          currentStage: this.selectedLeaveData.approvalHeader.currentapprovalStage
        }]
      };
    }

    this.submitApprovalRequest('Regularization request rejected successfully');
  }

  private submitApprovalRequest(successMessage: string) {
    this.http.putData('v2/PendingApproval/multiapprovals', this.requestBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.modalService.dismissAll();
          this.requestSummary = res.data;

          if (this.selectedLeavesItems.length <= 0) {
            this.signalService.handleResponse(this.requestSummary, successMessage);
          } else {
            this.modalService.open(this.leaveSummary, {centered: true, size: 'lg', backdrop: 'static'});
            setTimeout(() => this.modalService.dismissAll(), 5000);
          }

          this.resetAfterAction();
          this.http.triggerActionSignal();
          this.getAllPendingApprovals();
        },
        error: (err: any) => {
          this.spinnerLoader = false;
          this.modalService.dismissAll();
          this.sharedModalService.openErrorModal(err.error?.Message || 'Operation failed');
        }
      });
  }

  private resetAfterAction() {
    this.selectedLeavesItems = [];
    this.multiSelect = false;
    this.selectedLeaveData = {} as RegularizationRequest;
    this.searchValue = null;
    this.spinnerLoader = false;
    this.approveForm?.reset();
    this.rejectForm?.reset();
  }

  comments(comments: any[], modal: any) {
    this.approverComments = comments;
    this.modalService.open(modal, { centered: true, backdrop: 'static', size: 'lg' });
  }

  onRejectChipClick() {
  this.rejectForm.patchValue({
    comments: 'Rejected'
  });
}

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}

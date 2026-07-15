import { Component, effect, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, BehaviorSubject, takeUntil } from 'rxjs';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { environment } from '../../../../environments/environment';
import { IJob } from '../../../Interfaces/letters-model';
import { AttendanceRequest, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { SignalsService } from '../../../services/signals.service';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { Table, TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-remote-login-requests',
    imports: [CommonModule, RouterModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, NoDataFoundComponent, DateformatPipe,
    ReactiveFormsModule, TranslateModule, TableModule, DataLoaderContentComponent, InfoIconComponent],
  templateUrl: './remote-login-requests.component.html',
  styleUrl: './remote-login-requests.component.scss'
})
export class RemoteLoginRequestsComponent {
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
  @ViewChild('leaveSummary') leaveSummary: any;
  @ViewChild('dt') table!: Table;

  // Sorting properties
  originalData: AttendanceRequest[] = [];
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  selectedLeaveData = {} as AttendanceRequest;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  searchValue: any | null;
  spinnerLoader = false;
  multiSelect = false;
  selectedLeavesItems: AttendanceRequest[] = [];
  wfhsselect!: AttendanceRequest;
  wfhsSelects: AttendanceRequest[] = [];
  requestBody = {} as any;
  dataload = false;
  requestSummary!: any;
  hasSelectedAllOnce = false;
  previousSearchValue: string = '';
  selectedLeaveStatus: any;
  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    public rbac: RbacService,
    public formValidation: FormValidationService,
    public formsValidation: FormValidationsService,
    private signalService: SignalsService,
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
          this.wfhsSelects = [];
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


  onStatusApproveSelect(status: string) {
    this.selectedLeaveStatus = status;
    if (status === 'approved') {
      this.approveForm.get('comments')?.setValue('Approved');
    } else if (status === 'planned') {
      this.approveForm.get('comments')?.setValue(' Planned Remote Login');
    } else if (status === 'unplanned') {
      this.approveForm.get('comments')?.setValue('Unplanned Remote Login');
    }
  }

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;
    if (status === 'reject') {
      this.rejectForm.get('comments')?.setValue('Rejected');
    } else if (status === 'planned') {
      this.rejectForm.get('comments')?.setValue(' Planned Remote Login');
    } else if (status === 'unplanned') {
      this.rejectForm.get('comments')?.setValue('Unplanned Remote Login');
    }
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

  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250), noWhitespaceValidator]],
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250), noWhitespaceValidator]],
    });
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    this.dataload = true;
    this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=${environment.remoteLoginModuleId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.data.length > 0) {
          this.leaves.next(response.data);
          this.wfhsSelects = response.data;
          this.originalData = [...response.data]; // Store original data
        } else {
          this.leaves.next([]);
          this.wfhsSelects = [];
          this.originalData = [];
        }
      },
      error: (reason) => {
        this.dataload = false;
        console.log(reason)
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }


  getFilteredAndSortedLeaves(): AttendanceRequest[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    let leaves = this.wfhsSelects ?? [];

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

  customSort(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.currentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.currentSortOrder === 1) {
        // Currently ascending, change to descending
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        // Currently descending, reset to original order
        this.wfhsSelects = [...this.originalData];
        this.leaves.next(this.wfhsSelects);
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.table) {
          this.table.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let aValue = this.getNestedProperty(a, field);
      let bValue = this.getNestedProperty(b, field);

      // Handle date fields
      if (field.includes('Date') || field.includes('Time')) {
        aValue = aValue ? new Date(aValue).getTime() : 0;
        bValue = bValue ? new Date(bValue).getTime() : 0;
      }
      // Handle string fields
      else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return -1 * event.order;
      if (aValue > bValue) return 1 * event.order;
      return 0;
    });
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current && current[prop], obj);
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

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
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
          moduleId: environment.remoteLoginModuleId,
          onBehalfOfApproval: true,
          approvedPersonaType: 'onBehalfOf',
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
          moduleId: environment.remoteLoginModuleId,
          onBehalfOfApproval: true,
          approvedPersonaType: 'onBehalfOf',
          headerRequests: [
            {
              headerID: this.selectedLeaveData.approvalHeader.id,
              currentStage:
                this.selectedLeaveData.approvalHeader.currentapprovalStage,
            },
          ],
        };
      }
      this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.requestSummary = response.data;
          if (
            this.selectedLeavesItems &&
            this.selectedLeavesItems.length <= 0
          ) {
            this.signalService.handleResponse(this.requestSummary, 'Remote Login request approved successfully');
          } else {
            this.openModal(this.leaveSummary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
          }
          this.selectedLeavesItems = [];
          this.multiSelect = false;
          this.approveForm.reset();
          this.selectedLeaveData = {} as AttendanceRequest;
          this.http.triggerActionSignal();
          this.getAllPendingApprovals();
        },
        error: (reason: any) => {
          this.spinnerLoader = false;
          this.modalService.dismissAll();
          this.approveForm.reset();
          this.sharedModalService.openErrorModal(reason.error.Message);
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
          moduleId: environment.remoteLoginModuleId,
          onBehalfOfApproval: true,
          approvedPersonaType: 'onBehalfOf',
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
          moduleId: environment.remoteLoginModuleId,
          onBehalfOfApproval: true,
          approvedPersonaType: 'onBehalfOf',
          headerRequests: [
            {
              headerID: this.selectedLeaveData.approvalHeader.id,
              currentStage:
                this.selectedLeaveData.approvalHeader.currentapprovalStage,
            },
          ],
        };
      }
      this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.requestSummary = response.data;
          if (
            this.selectedLeavesItems &&
            this.selectedLeavesItems.length <= 0
          ) {
            this.signalService.handleResponse(this.requestSummary, 'Remote Login request rejected successfully');
          } else {
            this.openModal(this.leaveSummary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
          }
          this.selectedLeavesItems = [];
          this.multiSelect = false;
          this.rejectForm.reset();
          this.selectedLeaveData = {} as AttendanceRequest;
          this.http.triggerActionSignal();
          this.getAllPendingApprovals();
        },
        error: (reason: any) => {
          this.spinnerLoader = false;
          this.modalService.dismissAll();
          this.rejectForm.reset();
          this.sharedModalService.openErrorModal(reason.error.Message);
        },
        complete: () => {
          this.getAllPendingApprovals();
          this.spinnerLoader = false;
          this.searchValue = null;
        },
      });
    }
  }

  handleProcess(request: AttendanceRequest) {
    this.selectedLeaveData = request;
    let approvedBy = this.empinfo.employeeId.toString();
    let message = null;
    if (this.selectedLeavesItems && this.selectedLeavesItems.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.remoteLoginModuleId,
        onBehalfOfApproval: true,
        approvedPersonaType: 'onBehalfOf',
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
        moduleId: environment.remoteLoginModuleId,
        onBehalfOfApproval: true,
        approvedPersonaType: 'onBehalfOf',
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
    this.sharedModalService.openLoaderModal(
      message
    );
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
            this.signalService.handleResponse(this.requestSummary, 'Remote Login request processed successfully');
          } else {
            this.openModal(this.leaveSummary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
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
        complete: () => {
          this.searchValue = null;
        },
      });
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
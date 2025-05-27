import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { PermissionRequestResponse, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { environment } from '../../../../environments/environment';
import { RbacService } from '../../../services/rbac.service';
import { PermissionsearchPipe } from '../../../Pipes/permissionsearch.pipe';
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { LeaveApproval } from '../../../Interfaces/pendingapprovalsmodel';
import { Table, TableModule } from 'primeng/table';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
@Component({
  selector: 'app-regularization-for-you-request',
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
  templateUrl: './regularization-for-you-request.component.html',
  styleUrl: './regularization-for-you-request.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RegularizationForYouRequestComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  multiSelect = false;
  searchValue: any | null;
  dataLoad = false;
  spinnerLoader = false;
  responseSummary!: any;
  empinfo = {} as IJob;
  regularization = [] as PermissionRequestResponse[];
  approverComments = [] as any[];
  leaveEntitlementsList = {} as ICategoryDetails;
  selectedLeaveData = {} as PermissionRequestResponse;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  requestBody = {} as any;
  leaves = new BehaviorSubject<PermissionRequestResponse[]>([]);
  regularizationselect!: PermissionRequestResponse[];
  selectedProducts!: PermissionRequestResponse[];
  @ViewChild('commentspopup') modalContent: any;
  @ViewChild('leaveSummary') leaveSummary: any;
  @ViewChild('dt') table!: Table;
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

  // selectCheck(Value: any) {
  //   this.multiSelect = Array.isArray(Value) && Value.length > 0;
  // }

  bulkapprove(approverPopup: any) {
    this.intializeApproveForm();
    this.modalService.open(approverPopup, { centered: true, backdrop: 'static' });
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

  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, { centered: true, backdrop: 'static', size: 'lg' });
    this.approverComments = value;
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
    let moduleId = environment.attendanceRegularizationModuleId;
    this.dataLoad = true;
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=EMP`
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          response.data as PermissionRequestResponse[];
          this.leaves.next(response.data);
          this.regularizationselect = response.data;
          this.dataLoad = false;
        },
        error: (reason) => {
          this.dataLoad = false;
        },
      });
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

  hasSelectedAllOnce = false;
  selectCheck(value: any) {
    this.multiSelect = Array.isArray(value) && value.length > 0;

    if (!value || value.length === 0) {
      this.selectedProducts = [];
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
      this.selectedProducts = [...dominantItems];
      setTimeout(() => this.updateTableSelectionState(dominantItems));
      return;
    }

    if (!isBulkSelect && stages.length > 1) {
      this.sharedModalService.openErrorModal('You can only select records from the same approval stage');
      const validStage = this.selectedProducts[0]?.approvalHeader?.currentapprovalStage;
      const newSelection = value.filter(
        (item: { approvalHeader: { currentapprovalStage: string; }; }) => item.approvalHeader?.currentapprovalStage === validStage
      );
      this.selectedProducts = [...newSelection];
      setTimeout(() => this.updateTableSelectionState(newSelection));
      return;
    }

    this.selectedProducts = [...value];
  }


  private updateTableSelectionState(selectedItems: any[]) {
    this.selectedProducts = [...selectedItems];

    if (this.table) {
      this.table.selection = null;
      setTimeout(() => {
        this.table.selection = selectedItems;
      });
    }
  }

  previousSearchValue: string = '';
  onSearchChange(): void {
    if (this.searchValue !== this.previousSearchValue) {
      this.previousSearchValue = this.searchValue;
      this.selectedProducts = [];
      this.hasSelectedAllOnce = false;
      this.updateTableSelectionState([]);
    }
  }

  getFilteredAndSortedLeaves(): any[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    let leaves = this.regularizationselect ?? [];

    if (search) {
      leaves = leaves.filter(item =>
        item.entity?.fusionempId.toLowerCase().includes(search) ||
        item.entity?.raisedForName?.toLowerCase().includes(search) ||
        item.entity?.type?.toLowerCase().includes(search)
      );
    }

    if (!this.selectedProducts || this.selectedProducts.length === 0) {
      this.leaves.next(leaves);
      return this.leaves.getValue();
    }

    const selectedIds = new Set(this.selectedProducts.map(item => item.approvalHeader?.id));
    const selected = leaves.filter(item => selectedIds.has(item.approvalHeader?.id));
    const unselected = leaves.filter(item => !selectedIds.has(item.approvalHeader?.id));
    this.leaves.next([...selected, ...unselected]);
    return this.leaves.getValue();
  }

  // getFilteredAndSortedLeaves(): any[] {
  //   const search = this.searchValue?.toLowerCase() ?? '';
  //   let leaves = this.regularizationselect ?? [];
  //   // Filter
  //   if (search) {
  //     leaves = leaves.filter(item =>
  //       item.entity?.leavefusionempId?.toLowerCase().includes(search) ||
  //       item.entity?.employeeName?.toLowerCase().includes(search) ||
  //       item.entity?.leaveDurationType?.toLowerCase().includes(search) ||
  //       item.entity?.leaveCategoryName?.toLowerCase().includes(search)
  //     );
  //   }

  //   // Sort (preserve original sorting logic)
  //   if (!this.selectedProducts || this.selectedProducts.length === 0) {
  //     return leaves;
  //   }

  //   const selectedIds = new Set(this.selectedProducts.map(item => item.approvalHeader?.id));
  //   const selected = leaves.filter(item => selectedIds.has(item.approvalHeader?.id));
  //   const unselected = leaves.filter(item => !selectedIds.has(item.approvalHeader?.id));
  //   return [...selected, ...unselected];
  // }

  removeLeadingWhitespace(control: AbstractControl | null): void {
    if (control) {
      const originalValue = control.value || '';
      const trimmedValue = originalValue.replace(/^\s+/, '');
      if (originalValue !== trimmedValue) {
        control.setValue(trimmedValue, { emitEvent: false });
      }
    }
  }

  handleAccept(approveForm: FormGroup): void {
    if (approveForm.valid) {
      this.spinnerLoader = true;
      const formData = approveForm.value;
      let approvedBy = this.empinfo.employeeId.toString();
      let comments = formData.comments;

      if (this.selectedProducts && this.selectedProducts.length > 0) {
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: 'Approved',
          comments: comments,
          moduleId: environment.attendanceRegularizationModuleId,
          headerRequests: this.selectedProducts.map((item) => ({
            headerID: item.approvalHeader.id,
            currentStage: item.approvalHeader.currentapprovalStage,
          })),
        };
      } else {
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: 'Approved',
          comments: comments,
          moduleId: environment.attendanceRegularizationModuleId,
          headerRequests: [
            {
              headerID: this.selectedLeaveData.approvalHeader.id,
              currentStage: this.selectedLeaveData.approvalHeader.currentapprovalStage,
            },
          ],
        };
      }

      this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            this.responseSummary = response.data;
            if (this.selectedProducts && this.selectedProducts.length <= 0) {
              this.signalService.handleResponse(this.responseSummary, 'Request Approved Successfully');
            } else {
              this.openModal(this.leaveSummary);
            }
          },
          error: (reason: any) => {
            this.spinnerLoader = false;
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
            this.spinnerLoader = false;
            this.approveForm.reset();
            this.multiSelect = false;
            this.selectedLeaveData = {} as PermissionRequestResponse;
            this.signalService.regularizationForYouTriggerSignal.set(true);
            this.signalService.regularizationSidNavCountTriggerSignal.set(true);
            this.getAllPendingApprovals();
            this.selectedProducts = [];
            this.searchValue = null;

          },
        });
    }
  }

  handleProcess(request: any) {
    this.selectedLeaveData = request;
    let approvedBy = this.empinfo.employeeId.toString();
    let message = null;
    if (this.selectedProducts && this.selectedProducts.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.attendanceRegularizationModuleId,
        headerRequests: this.selectedProducts.map((item) => ({
          headerID: item.approvalHeader.id,
          currentStage: item.approvalHeader.currentapprovalStage,
        })),
      };
      message = 'Processing Requests, Please wait...';
    } else {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.attendanceRegularizationModuleId,
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
    this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.responseSummary = response.data;
          if (this.selectedProducts && this.selectedProducts.length <= 0) {
            this.sharedModalService.openSuccessModal('Request Processed Successfully');
          } else {
            this.openModal(this.leaveSummary);
          }
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
          this.multiSelect = false;
          this.signalService.regularizationForYouTriggerSignal.set(true);
          this.signalService.regularizationSidNavCountTriggerSignal.set(true);
          this.getAllPendingApprovals();
          this.selectedProducts = [];
          this.searchValue = null;

        },
      });
  }

  handleReject(rejectForm: FormGroup): void {
    if (rejectForm.valid) {
      this.spinnerLoader = true;
      const formData = rejectForm.value;
      let approvedBy = this.empinfo.employeeId.toString();
      let comments = formData.comments;

      if (this.selectedProducts && this.selectedProducts.length > 0) {
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: 'Rejected',
          comments: comments,
          moduleId: environment.attendanceRegularizationModuleId,
          headerRequests: this.selectedProducts.map((item) => ({
            headerID: item.approvalHeader.id,
            currentStage: item.approvalHeader.currentapprovalStage,
          })),
        };
      } else {
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: 'Rejected',
          comments: comments,
          moduleId: environment.attendanceRegularizationModuleId,
          headerRequests: [
            {
              headerID: this.selectedLeaveData.approvalHeader.id,
              currentStage: this.selectedLeaveData.approvalHeader.currentapprovalStage,
            },
          ],
        };
      }

      this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.modalService.dismissAll();
            this.responseSummary = response.data;
            if (this.selectedProducts && this.selectedProducts.length <= 0) {
              this.signalService.handleResponse(this.responseSummary, 'Request Rejected Successfully');
            } else {
              this.openModal(this.leaveSummary);
            }
          },
          error: (reason: any) => {
            this.modalService.dismissAll();
            this.spinnerLoader = false;
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
            this.spinnerLoader = false;
            this.rejectForm.reset();
            this.multiSelect = false;
            this.selectedLeaveData = {} as PermissionRequestResponse;
            this.signalService.regularizationForYouTriggerSignal.set(true);
            this.signalService.regularizationSidNavCountTriggerSignal.set(true);
            this.getAllPendingApprovals();
            this.selectedProducts = [];
            this.searchValue = null;

          },
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}

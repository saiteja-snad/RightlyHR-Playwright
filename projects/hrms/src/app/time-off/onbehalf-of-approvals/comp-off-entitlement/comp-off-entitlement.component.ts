import { CommonModule } from '@angular/common';
import { Component, effect, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { AttendanceRequest, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { environment } from '../../../../environments/environment';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { Table, TableModule } from 'primeng/table';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { FormValidationsService } from '../../../services/form-validations.service';
import { SignalsService } from '../../../services/signals.service';
@Component({
  selector: 'app-comp-off-entitlement',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule,
    NoDataFoundComponent, DateformatPipe, ReactiveFormsModule, TranslateModule, TableModule, DataLoaderContentComponent],
  templateUrl: './comp-off-entitlement.component.html',
  styleUrl: './comp-off-entitlement.component.scss'
})

export class CompOffEntitlementComponent {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  LOGIN: any;
  empinfo = {} as IJob;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  leaves = new BehaviorSubject<AttendanceRequest[]>([]);
  leavesselect!: AttendanceRequest[];
  approverComments = [] as any[];
  selectedLeaveData = {} as AttendanceRequest;
  // approverComments = [] as AttendanceRequestC[];
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  spinnerLoader = false;
  searchValue: any | null;
  selectedLeavesItems: AttendanceRequest[] = [];
  dataLoad = false;
  responseSummary!: any;
  multiSelect = false;
  requestBody = {} as any;
  @ViewChild('leaveSummary') leaveSummary: any;
  @ViewChild('dt') table!: Table;

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
    public formsValidation: FormValidationsService,
    private signalService: SignalsService,
  ) {
    effect(() => {
      if (this.http.trigger()) {
        const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
        if (data && Object.keys(data).length > 0) {
          this.LOGIN = data;
          this.getAllPendingApprovals();
        } else {
          this.leaves.next([]);
        }
        this.http.resetTriggerSignal(); // Reset after handling
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
    this.intializeApproveForm();
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
    this.dataLoad = true;
    this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=${environment.compoffModuleId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.leaves.next(response.data);
        this.leavesselect = response.data;
      },
      error: (reason) => {
        this.dataLoad = false;
      },
      complete: () => {
        this.dataLoad = false;
      }
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
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

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  hasSelectedAllOnce = false;
  selectCheck(value: any) {
    // debugger
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
        this.conformationPopup.openErrorModal('You can only select records from the same approval stage');
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
      this.conformationPopup.openErrorModal('You can only select records from the same approval stage');
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

  previousSearchValue: string = '';
  onSearchChange(): void {
    if (this.searchValue !== this.previousSearchValue) {
      this.multiSelect= false;
      this.previousSearchValue = this.searchValue;
      this.selectedLeavesItems = [];
      this.hasSelectedAllOnce = false;
      this.updateTableSelectionState([]);
    }
  }

  getFilteredAndSortedLeaves(): AttendanceRequest[] {
    const search = this.searchValue?.toLowerCase() ?? '';
     let leaves = this.leavesselect ?? [];

    if (search) {
      leaves = leaves.filter((item: AttendanceRequest) =>
        item.entity?.attendanceRequestFusionEmployeeId?.toLowerCase().includes(search) ||
        item.entity?.attendanceRequesterName?.toLowerCase().includes(search) ||
        item.entity?.attendanceRequestDurationType?.toLowerCase().includes(search)
      );
    }

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
    this.handleProcess(this.leaves);
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

  // getFilteredAndSortedLeaves(): AttendanceRequest[] {
  //   const search = this.searchValue?.toLowerCase() ?? '';
  //   const allLeaves = this.leaves ?? [];

  //   // Filter
  //   let filteredLeaves = allLeaves;
  //   if (search) {
  //     filteredLeaves = filteredLeaves.filter((item: AttendanceRequest) =>
  //       item.entity?.attendanceRequestFusionEmployeeId?.toLowerCase().includes(search) ||
  //       item.entity?.attendanceRequesterName?.toLowerCase().includes(search) ||
  //       item.entity?.attendanceRequestDurationType?.toLowerCase().includes(search)
  //     );
  //   }

  //   // Sort
  //   if (!this.selectedLeavesItems || this.selectedLeavesItems.length === 0) {
  //     return filteredLeaves;
  //   }

  //   const selectedIds = new Set(this.selectedLeavesItems.map(item => item.approvalHeader?.id));
  //   const selected = filteredLeaves.filter(item => selectedIds.has(item.approvalHeader?.id));
  //   const unselected = filteredLeaves.filter(item => !selectedIds.has(item.approvalHeader?.id));

  //   return [...selected, ...unselected];
  // }

  // handleProcess(request: AttendanceRequest): void {
  //   const requestBody = {
  //     status: 'Processed',
  //     approvedBy: this.empinfo.employeeId.toString(),
  //   };
  //   this.sharedModalService.openLoaderModal('Processing Request, Please wait...');
  //   this.http.putData(`PendingApproval/process/${request.approvalHeader.id}`, requestBody).pipe(takeUntil(this.destroy$)).subscribe({
  //     next: (response: any) => {
  //       this.modalService.dismissAll();
  //       this.sharedModalService.openSuccessModal('Request Processed Successfully');
  //       this.getAllPendingApprovals();
  //     },
  //     error: (reason: any) => {
  //       this.modalService.dismissAll();
  //       this.sharedModalService.openErrorModal(reason.error.Message);
  //     },
  //     complete: () => {
  //       this.http.triggerActionSignal();
  //       this.getAllPendingApprovals();
  //     },
  //   });
  // }

  // handleAccept(approveForm: FormGroup): void {
  //   if (approveForm.valid) {
  //     const formData = approveForm.value;
  //     const requestBody = {
  //       status: 'Approved',
  //       comments: formData.comments,
  //       approvedBy: this.empinfo.employeeId?.toString(),
  //     };
  //     this.spinnerLoader = true;
  //     this.http.putData(`PendingApproval/${this.selectedLeaveData.approvalHeader.id}`, requestBody).pipe(takeUntil(this.destroy$)).subscribe({
  //       next: (response: any) => {
  //         this.modalService.dismissAll();
  //         this.sharedModalService.openSuccessModal('Request Accepted Successfully');
  //         this.getAllPendingApprovals();
  //         this.http.triggerActionSignal();
  //       },
  //       error: (reason: any) => {
  //         this.spinnerLoader = false;
  //         this.sharedModalService.openErrorModal(reason.error.Message);
  //       },
  //       complete: () => {
  //         this.getAllPendingApprovals();
  //         this.spinnerLoader = false;
  //       },
  //     });
  //   }
  // }

  // handleReject(rejectForm: FormGroup): void {
  //   if (rejectForm.valid) {
  //     const formData = rejectForm.value;
  //     const requestBody = {
  //       status: 'Rejected',
  //       comments: formData.comments,
  //     };
  //     this.spinnerLoader = true;
  //     this.http.putData(`PendingApproval/${this.selectedLeaveData.approvalHeader.id}`, requestBody).pipe(takeUntil(this.destroy$)).subscribe({
  //       next: (response: any) => {
  //         this.modalService.dismissAll();
  //         this.sharedModalService.openSuccessModal('Request Rejected Successfully');
  //         this.rejectForm.reset();
  //         this.selectedLeaveData = {} as AttendanceRequest;
  //         this.http.triggerActionSignal();
  //         this.getAllPendingApprovals();
  //       },
  //       error: (reason: any) => {
  //         this.spinnerLoader = true;
  //         this.sharedModalService.openErrorModal(reason.error.Message);
  //       },
  //       complete: () => {
  //         this.getAllPendingApprovals();
  //         this.spinnerLoader = false;
  //       },
  //     });
  //   }
  // }

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
      message = 'Processing Requests, Please wait...';
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
      message = 'Processing Request, Please wait...';
    }
    this.conformationPopup.openLoaderModal(message);
    this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.responseSummary = response.data;
          if (this.selectedLeavesItems && this.selectedLeavesItems.length <= 0) {
            this.signalService.handleResponse(this.responseSummary, 'Request Processed Successfully');
          } else {
            this.openModal(this.leaveSummary);
          }
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal(reason.error.Message);
        },
        complete: () => {
          this.selectedLeavesItems = [];
          this.multiSelect = false;
          this.getAllPendingApprovals();
          this.http.triggerActionSignal();
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
            if (this.selectedLeavesItems && this.selectedLeavesItems.length <= 0) {
              this.signalService.handleResponse(this.responseSummary, 'Request Approved Successfully');
            } else {
              this.openModal(this.leaveSummary);
            }
          },
          error: (reason: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openErrorModal(reason.error.Message);
            this.spinnerLoader = false;
          },
          complete: () => {
            this.spinnerLoader = false;
            this.selectedLeavesItems = [];
            this.approveForm.reset();
            this.multiSelect = false;
            this.getAllPendingApprovals();
            this.http.triggerActionSignal();
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
            if (this.selectedLeavesItems && this.selectedLeavesItems.length <= 0) {
              this.signalService.handleResponse(this.responseSummary, 'Request Rejected Successfully');
            } else {
              this.openModal(this.leaveSummary);
            }
          },
          error: (reason: any) => {
            this.modalService.dismissAll();
            this.conformationPopup.openErrorModal(reason.error.Message);
            this.spinnerLoader = false;
          },
          complete: () => {
            this.selectedLeavesItems = [];
            this.multiSelect = false;
            this.spinnerLoader = false;
            this.rejectForm.reset();
            this.selectedLeaveData = {} as AttendanceRequest;
            this.getAllPendingApprovals();
            this.http.triggerActionSignal();
            this.searchValue = null;
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
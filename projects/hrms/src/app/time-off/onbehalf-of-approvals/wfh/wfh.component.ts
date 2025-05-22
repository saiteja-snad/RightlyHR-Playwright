import { CommonModule } from '@angular/common';
import { Component, effect, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, BehaviorSubject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { AttendanceRequest, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { WfhsearchfilterPipe } from '../../../Pipes/wfhsearchfilter.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { environment } from '../../../../environments/environment';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { LeaveApproval } from '../../../Interfaces/pendingapprovalsmodel';
import { TableModule } from 'primeng/table';
@Component({
  selector: 'app-wfh',
  imports: [CommonModule, RouterModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, NoDataFoundComponent, DateformatPipe,
     ReactiveFormsModule, TranslateModule,TableModule,],
  templateUrl: './wfh.component.html',
  styleUrl: './wfh.component.scss'
})

export class WfhComponent {
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
  selectedLeaveData = {} as AttendanceRequest;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  searchValue: any;
  spinnerLoader = false;
  multiSelect = false;
  selectedLeavesItems: LeaveApproval[] =[];
  wfhsselect!: AttendanceRequest;
  requestBody = {} as any;
  requestSummary!:any;
  constructor(
    private modalService: NgbModal, 
    private fb: FormBuilder, 
    private http: HttpService,
    private sharedModalService: OpenModalService, 
    public rbac: RbacService,
    public formValidation:FormValidationService
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

  // selectCheck(Value: any) {
  //   this.multiSelect = Array.isArray(Value) && Value.length > 0;
  // }

  selectCheck(Value: any) {
    this.multiSelect = Array.isArray(Value) && Value.length > 0;
    if (!Value || Value.length === 0) {
      this.selectedLeavesItems = [];
      return;
    }
 
    if (this.multiSelect) {
      const stageMap: { [stage: string]: any[] } = {};
 
      Value.forEach((item: any) => {
        const stage = item.approvalHeader?.currentapprovalStage;
        if (!stageMap[stage]) {
          stageMap[stage] = [];
        }
        stageMap[stage].push(item);
      });
 
      const stages = Object.keys(stageMap);
 
      if (stages.length > 1) {
        const totalAvailable = this.leaves?.getValue().length || 0;
        const totalSelected = Value.length;
        const isBulkSelect = totalSelected === totalAvailable;
        if (isBulkSelect) {
          let maxStage = stages[0];
          let maxCount = stageMap[maxStage].length;
 
          for (const stage of stages) {
            const count = stageMap[stage].length;
            if (count > maxCount) {
              maxStage = stage;
              maxCount = count;
            } else if (count === maxCount && stage === '1') {
              maxStage = stage;
            }
          }
 
          this.selectedLeavesItems = [];
          setTimeout(() => {
            this.selectedLeavesItems = [...stageMap[maxStage]];
          });
 
        } else {
          this.sharedModalService.openErrorModal('You can only select records from the same approval stage');
          if (this.selectedLeavesItems.length > 0) {
            const lastSelected = Value[Value.length - 1];
 
            // Remove the specific item from selectedProducts
            this.selectedLeavesItems = this.selectedLeavesItems.filter(
              item => item.approvalHeader?.id !== lastSelected.approvalHeader?.id
            );
     
            // Force update (optional, but helps)
            setTimeout(() => {
              this.selectedLeavesItems = [...this.selectedLeavesItems];
            });
            console.log(this.selectedLeavesItems);

          }
          return;
        }
      } else {
        this.selectedLeavesItems = [...Value];
      }
    } else {
      this.selectedLeavesItems = [Value];
    }
  }

  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250),noWhitespaceValidator]],
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250),noWhitespaceValidator]],
    });
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=${environment.wfhModuleId}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        console.log(response.data);
        this.leaves.next(response.data);
        this.wfhsselect = response.data;
      },
      error: (reason) => console.log(reason),
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
    this.modalService.open(content, { centered: true, backdrop: 'static',size:'lg' });
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
      this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$)).subscribe({
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
          this.selectedLeaveData = {} as AttendanceRequest;
          this.http.triggerActionSignal();
          this.getAllPendingApprovals();
        },
        error: (reason: any) => {
          this.spinnerLoader = false;
          this.modalService.dismissAll();
          this.sharedModalService.openErrorModal(reason.error.Message);
        },
        complete: () => {
          this.getAllPendingApprovals();
          this.spinnerLoader = false;
        },
      });
    }
  }

  handleReject(rejectForm: FormGroup): void {
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
      this.spinnerLoader = true;
      this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$)).subscribe({
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
          this.http.triggerActionSignal();
          this.getAllPendingApprovals();
        },
        error: (reason: any) => {
          this.spinnerLoader = false;
          this.modalService.dismissAll();
          this.sharedModalService.openErrorModal(reason.error.Message);
        },
        complete: () => {
          this.getAllPendingApprovals();
          this.spinnerLoader = false;
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
      'Processing Request, Please wait...'
    );
    this.http.putData(`PendingApproval/process/${request.approvalHeader.id}`, this.requestBody).pipe(takeUntil(this.destroy$)).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll();
        this.sharedModalService.openSuccessModal('Request Processed Successfully');
        this.http.triggerActionSignal();
        this.getAllPendingApprovals();
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

  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, {centered: true, backdrop: 'static', size: 'lg'});
    this.approverComments = value;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import {
  LeaveApproval,
  LeaveApproverComment,
} from '../../../../Interfaces/pendingapprovalsmodel';
import { DateformatPipe } from '../../../../Pipes/dateformat.pipe';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { TimeoffsearchPipe } from '../../../../Pipes/timeoffsearch.pipe';
import { TableModule } from 'primeng/table';
import { ICategoryDetails } from '../../../../Interfaces/timoff-model';
import moment from 'moment';
import { environment } from '../../../../../environments/environment';
import { SignalsService } from '../../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-time-off-for-your-role-request',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    TranslateModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    TimeoffsearchPipe,
    TableModule,
    DataLoaderContentComponent
  ],
  templateUrl: './time-off-for-your-role-request.component.html',
  styleUrl: './time-off-for-your-role-request.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TimeOffForYourRoleRequestComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  LOGIN: any;
  searchValue: any | null;
  spinnerLoader = false;
  multiSelect = false;
  issubmitdiable = false;
  dataLoad = false;
  responseSummary!: any;
  leaves = new BehaviorSubject<LeaveApproval[]>([]);
  approverComments = [] as LeaveApproverComment[];
  leaveEntitlementsList = {} as ICategoryDetails;
  selectedLeaveData = {} as any;
  leavesselect!: LeaveApproval[];
  selectedProducts: LeaveApproval[]=[];
    requestBody = {} as any;
  @ViewChild('commentspopup') modalContent: any;
  @ViewChild('leaveSummary') leaveSummary: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public rbac: RbacService, private signalService: SignalsService
  ) { }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovals();
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    let moduleId = environment.leavesModuleId;
    this.dataLoad = true;
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=ROLE`
      ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.leaves.next(response.data);
          this.leavesselect = response.data;
        },
        error: (reason) => {
          this.dataLoad = false;
        },
        complete: () => {
          this.dataLoad = false;
        },
      });
  }

  checkLeaveBalance(Value: any, checkbalancepopup: any) {
    this.modalService.open(checkbalancepopup, {
      centered: true,
      backdrop: 'static',
    });
    let employeeId = Value.entity.leaveempId;
    this.http.getData(`LeaveEntitlements/employee/${employeeId}`).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          // Find the category based on leaveCategoryId
          this.leaveEntitlementsList = res.data.find(
            (ele: any) => ele.category.id === Value.entity.leaveCategoryId
          );
          // Check if isProbationAllowed is explicitly true or null
          const isProbationAllowed =
            this.leaveEntitlementsList?.category?.isProbationAllowed;
          if (isProbationAllowed) {
            this.calculateProbationLeaves();
          } else {
            // Optionally, handle the case where probation is not allowed
          }
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }

  calculateProbationLeaves() {
    if (this.LOGIN.probationEndDate) {
      // Check if the employee is still on probation
      let currentDate = moment();
      let probationEndDate = moment(this.LOGIN.probationEndDate);
      // Create new Moment objects without time information
      let currentDateWithoutTime = currentDate.startOf('day');
      let probationEndDateWithoutTime = probationEndDate.startOf('day');

      if (currentDateWithoutTime.isSameOrBefore(probationEndDateWithoutTime)) {
        // The employee is still on probation
        // Calculate the number of probation days
        let dateOfJoining = moment(this.LOGIN.dateOfJoining);
        let probationDays = currentDate.diff(dateOfJoining, 'days');
        // Divide by 30 and round down to the nearest 0.5 or whole number
        let months = Math.floor(probationDays / 30);
        this.leaveEntitlementsList.probationLeaves =
          months * this.leaveEntitlementsList.category.probationDays;
        if (
          this.leaveEntitlementsList.probationLeaves >=
          this.leaveEntitlementsList.allowedDays
        ) {
          this.leaveEntitlementsList.probationLeaves =
            this.leaveEntitlementsList.allowedDays;
        }
      } else {
        console.log('Employee is no longer on probation.');
      }
    } else {
      console.log('No probation end date provided.');
    }
  }

  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, {
      centered: true,
      backdrop: 'static',
    });
    this.approverComments = value;
  }

  ifreasonnull(Value: any) {
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
    } else {
      this.issubmitdiable = false;
    }
  }

  selectCheck(Value: any) {
    this.multiSelect = Array.isArray(Value) && Value.length > 0;
  }

  canBulkApprove(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader.currentapprovalStage !==
        item.approvalHeader.finalapprovalStage
    );
  }

  canBulkProcess(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader.currentapprovalStage ===
        item.approvalHeader.finalapprovalStage
    );
  }

  allAtFinalStage(): boolean {
    return this.selectedProducts?.length > 0 &&
      this.selectedProducts.every(
        item => item.approvalHeader.currentapprovalStage === item.approvalHeader.finalapprovalStage
      );
  }

  allInPast(): boolean {
    return this.selectedProducts?.length > 0 &&
      this.selectedProducts.every(item => this.isPastLeave(item));
  }

  isMixedDateSelection(): boolean {
    if (!this.selectedProducts?.length) return false;

    let hasPast = false;
    let hasNonPast = false;

    for (const item of this.selectedProducts) {
      if (this.isPastLeave(item)) {
        hasPast = true;
      } else {
        hasNonPast = true;
      }

      if (hasPast && hasNonPast) {
        return true; // Mixed detected
      }
    }

    return false;
  }

  isPastLeave(item: any): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(item.entity.leaveStartDate);
    const endDate = new Date(item.entity.leaveEndDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return startDate < today && endDate < today;
  }

  rejectleave(rejectPopup: any, selecteddata: LeaveApproval) {
    this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
   this.selectedLeaveData = selecteddata;
  }

  bulkapprove(approverPopup: any) {
    this.modalService.open(approverPopup, {
      centered: true,
      backdrop: 'static',
    });
  }

  bulkReject(rejectPopup: any) {
    this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
  }

  bulkProcess() {
    this.handleProcess(this.leaves);
  }

  approveleave(approverPopup: any, selecteddata: LeaveApproval) {
    this.modalService.open(approverPopup, {
      centered: true,
      backdrop: 'static',
    });
    this.selectedLeaveData = selecteddata;
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
  }

  getFilteredAndSortedLeaves(): any[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    let leaves = this.leavesselect ?? [];
    // Filter
    if (search) {
      leaves = leaves.filter(item =>
        item.entity?.leavefusionempId?.toLowerCase().includes(search) ||
        item.entity?.employeeName?.toLowerCase().includes(search) ||
        item.entity?.leaveDurationType?.toLowerCase().includes(search) ||
        item.entity?.leaveCategoryName?.toLowerCase().includes(search)
      );
    }

    // Sort (preserve original sorting logic)
    if (!this.selectedProducts || this.selectedProducts.length === 0) {
      return leaves;
    }

    const selectedIds = new Set(this.selectedProducts.map(item => item.approvalHeader?.id));
    const selected = leaves.filter(item => selectedIds.has(item.approvalHeader?.id));
    const unselected = leaves.filter(item => !selectedIds.has(item.approvalHeader?.id));
    return [...selected, ...unselected];
  }

  handleAccept(form: any) {
    this.spinnerLoader = true;
    let approvedBy = this.LOGIN.employeeId.toString();
    let comments = this.selectedLeaveData?.comments || '';

   if (this.selectedProducts && this.selectedProducts.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: "Approved",
        comments: comments,
        moduleId: environment.leavesModuleId,
        isPlannedLeave: this.selectedLeaveData.isPlannedLeave,
        headerRequests: this.selectedProducts.map((item) => ({
          headerID: item.approvalHeader.id,
          currentStage: item.approvalHeader.currentapprovalStage
        }))
      }
    } else {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Approved',
        comments: comments,
        moduleId: environment.leavesModuleId,
        isPlannedLeave: this.selectedLeaveData.isPlannedLeave,
        headerRequests: [
          {
            headerID: this.selectedLeaveData.approvalHeader?.id,
            currentStage: this.selectedLeaveData.approvalHeader?.currentapprovalStage,
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
          this.modalService.dismissAll();
          form.resetForm();
          if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else {
            this.conformationPopup.openErrorModal('Request Approval Failed');
          }
          this.spinnerLoader = false;
        },
        complete: () => {
          this.spinnerLoader = false;
          this.multiSelect= false;
          this.signalService.timeOffsidenavCountSignal.set(true);
          this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
          this.getAllPendingApprovals();
          this.selectedProducts = [];
          this.searchValue = null;
        },
      });
  }

  handleReject(form: any) {
    this.spinnerLoader = true;
    let approvedBy = this.LOGIN.employeeId.toString();
    let comments = this.selectedLeaveData?.comments || '';
    if (this.selectedProducts && this.selectedProducts.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: comments,
        isPlannedLeave: false,
        moduleId: environment.leavesModuleId,
        headerRequests: this.selectedProducts.map((item) => ({
          headerID: item.approvalHeader.id,
          currentStage: item.approvalHeader.currentapprovalStage
        }))
      }
    } else {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: comments,
        isPlannedLeave: false,
        moduleId: environment.leavesModuleId,
        headerRequests: [
          {
            headerID: this.selectedLeaveData.approvalHeader?.id,
            currentStage: this.selectedLeaveData.approvalHeader?.currentapprovalStage,
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
           form.resetForm();
          if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else {
            this.conformationPopup.openErrorModal('Request Rejected Failed');
          }
          this.spinnerLoader = false;
        },
        complete: () => {
          form.resetForm();
          this.spinnerLoader = false;
          this.multiSelect= false;
          this.signalService.timeOffsidenavCountSignal.set(true);
          this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
          this.getAllPendingApprovals();
          this.selectedProducts = [];
          this.searchValue = null;
        },
      });
  }

  handleProcess(selecteddata: any) {
     this.selectedLeaveData = selecteddata;
    let approvedBy = this.LOGIN.employeeId.toString();
    let message = null;
     if (this.selectedProducts && this.selectedProducts.length > 0) {
        this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.leavesModuleId,
        headerRequests: this.selectedProducts.map((item) => ({
          headerID: item.approvalHeader.id,
          currentStage: item.approvalHeader.currentapprovalStage
        }))
      }
      message = 'Processing Requests, Please wait...';
     }else {
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: 'Processed',
          moduleId: environment.leavesModuleId,
          headerRequests: [
            {
              headerID: this.selectedLeaveData.approvalHeader?.id,
              currentStage: this.selectedLeaveData.approvalHeader?.currentapprovalStage,
            },
          ],
        };
        message = 'Processing Request, Please wait...';
    }

    this.conformationPopup.openLoaderModal(message);
    this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.responseSummary = response.data;
          if (this.selectedProducts && this.selectedProducts.length <= 0) {
            this.signalService.handleResponse(this.responseSummary, 'Request Processed Successfully');
          } else {
            this.openModal(this.leaveSummary);
          }
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else {
            this.conformationPopup.openErrorModal('Request Processed Failed');
          }
        },
        complete: () => {
          this.multiSelect= false;
          this.signalService.timeOffsidenavCountSignal.set(true);
          this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
          this.getAllPendingApprovals();
          this.selectedProducts = [];
          this.searchValue = null;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
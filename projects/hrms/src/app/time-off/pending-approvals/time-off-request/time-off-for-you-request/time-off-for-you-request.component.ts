import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { LeaveApproval, LeaveApproverComment } from '../../../../Interfaces/pendingapprovalsmodel';
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
import moment from 'moment';
import { ICategoryDetails } from '../../../../Interfaces/timoff-model';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { Table, TableModule } from 'primeng/table';
import { environment } from '../../../../../environments/environment';
import { SignalsService } from '../../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { FormValidationsService } from '../../../../services/form-validations.service';
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
@Component({
  selector: 'app-time-off-for-you-request',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    TranslateModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    TableModule,
    DataLoaderContentComponent,
    InfoIconComponent
  ],
  templateUrl: './time-off-for-you-request.component.html',
  styleUrl: './time-off-for-you-request.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class TimeOffForYouRequestComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  LOGIN: any;
  searchValue: any | null;
  spinnerLoader = false;
  multiSelect = false;
  issubmitdiable = false;
  dataLoad = false;
  isSelectAll: boolean = false;
  leaves = new BehaviorSubject<LeaveApproval[]>([]);
  approverComments = [] as LeaveApproverComment[];
  leaveEntitlementsList = {} as ICategoryDetails;
  selectedLeaveData = {} as any;
  leavesselect!: LeaveApproval[];
  selectedProducts: LeaveApproval[] = [];
  responseSummary!: any;
  requestBody = {} as any;
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
    public formsValidation: FormValidationsService,
    public rbac: RbacService, private signalService: SignalsService
  ) { }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllPendingApprovals();
  }

  // selectCheck(Value: any) {
  //   this.multiSelect = Array.isArray(Value) && Value.length > 0;
  //   if (!Value || Value.length === 0) {
  //     this.selectedProducts = [];
  //     return;
  //   }

  //   if (this.multiSelect) {
  //     const stageMap: { [stage: string]: any[] } = {};

  //     Value.forEach((item: any) => {
  //       const stage = item.approvalHeader?.currentapprovalStage;
  //       if (!stageMap[stage]) {
  //         stageMap[stage] = [];
  //       }
  //       stageMap[stage].push(item);
  //     });

  //     const stages = Object.keys(stageMap);

  //     if (stages.length > 1) {
  //       const totalAvailable = this.leavesselect?.length || 0;
  //       const totalSelected = Value.length;
  //       const isBulkSelect = totalSelected === totalAvailable;
  //       if (isBulkSelect) {
  //         let maxStage = stages[0];
  //         let maxCount = stageMap[maxStage].length;

  //         for (const stage of stages) {
  //           const count = stageMap[stage].length;
  //           if (count > maxCount) {
  //             maxStage = stage;
  //             maxCount = count;
  //           } else if (count === maxCount && stage === '1') {
  //             maxStage = stage;
  //           }
  //         }

  //         this.selectedProducts = [];
  //         setTimeout(() => {
  //           this.selectedProducts = [...stageMap[maxStage]];
  //         });

  //       } else {
  //         this.conformationPopup.openErrorModal('You can only select records from the same approval stage');
  //         if (this.selectedProducts.length > 0) {
  //           const lastSelected = Value[Value.length - 1];

  //           // Remove the specific item from selectedProducts
  //           this.selectedProducts = this.selectedProducts.filter(
  //             item => item.approvalHeader?.id !== lastSelected.approvalHeader?.id
  //           );
  //           // Force update (optional, but helps)
  //           setTimeout(() => {
  //             this.selectedProducts = [...this.selectedProducts];
  //           });
  //         }
  //         return;
  //       }
  //     } else {
  //       this.selectedProducts = [...Value];
  //     }
  //   } else {
  //     this.selectedProducts = [Value];
  //   }
  // }

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
      this.selectedProducts = [...dominantItems];
      setTimeout(() => this.updateTableSelectionState(dominantItems));
      return;
    }

    if (!isBulkSelect && stages.length > 1) {
      this.conformationPopup.openErrorModal('You can only select records from the same approval stage');
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
      this.multiSelect = false;
      this.selectedProducts = [];
      this.hasSelectedAllOnce = false;
      this.updateTableSelectionState([]);
    }
  }

  getFilteredAndSortedLeaves(): any[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    let leaves = this.leavesselect ?? [];

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
      this.leaves.next(leaves);
      return this.leaves.getValue();
    }

    const selectedIds = new Set(this.selectedProducts.map(item => item.approvalHeader?.id));
    const selected = leaves.filter(item => selectedIds.has(item.approvalHeader?.id));
    const unselected = leaves.filter(item => !selectedIds.has(item.approvalHeader?.id));
    this.leaves.next([...selected, ...unselected]);
    return this.leaves.getValue();
  }


  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    let moduleId = environment.leavesModuleId;
    this.dataLoad = true;
    this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=EMP`).pipe(takeUntil(this.destroy$))
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
        }
      });
  }

  checkLeaveBalance(Value: any, checkbalancepopup: any) {
    this.modalService.open(checkbalancepopup, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
    let employeeId = Value.entity.leaveempId;
    this.http
      .getData(`LeaveEntitlements/employee/${employeeId}`).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          // Find the category based on leaveCategoryId
          this.leaveEntitlementsList = res.data.find(
            (ele: any) => ele.category.id === Value.entity.leaveCategoryId
          );
          console.log(this.leaveEntitlementsList)
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
    this.modalService.open(commentspopup, { centered: true, backdrop: 'static' });
    this.approverComments = value;
  }

  ifreasonnull(Value: any) {
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
    } else {
      this.issubmitdiable = false;
    }
  }

  canBulkApprove(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader?.currentapprovalStage !==
        item.approvalHeader?.finalapprovalStage

    );
  }

  canBulkProcess(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader?.currentapprovalStage ===
        item.approvalHeader?.finalapprovalStage
    );
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

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
  }

  approveleave(approverPopup: any, selecteddata: LeaveApproval) {
    this.modalService.open(approverPopup, {
      centered: true,
      backdrop: 'static',
    });
    this.selectedLeaveData = selecteddata;
  }

  // processleave(selecteddata: any) {
  //   this.selectedProducts = [selecteddata];
  //   setTimeout(() => {
  //     this.handleProcess();
  //   }, 500);
  // }

  handleAccept(form: any) {
    console.log(this.selectedLeaveData)
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
            if(this.selectedProducts.length > 1){
              this.signalService.handleResponse(this.responseSummary, 'Selected Leave Requests Approved Successfully');
            }else{
              this.signalService.handleResponse(this.responseSummary, 'Selected Leave Request Approved Successfully');
            }            
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
            this.conformationPopup.openErrorModal('Leave Request Approval Failed');
          }
          this.spinnerLoader = false;
        },
        complete: () => {
          form.resetForm();
          this.spinnerLoader = false;
          this.multiSelect = false;
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
            if(this.selectedProducts.length > 1){
            this.signalService.handleResponse(this.responseSummary, 'Selected Leave Requests Rejected Successfully');
            } else{
            this.signalService.handleResponse(this.responseSummary, 'Selected Leave Request Rejected Successfully');
            }
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
            this.conformationPopup.openErrorModal('Leave Request Rejected Failed');
          }
          this.spinnerLoader = false;
          form.resetForm();
        },
        complete: () => {
          form.resetForm();
          this.spinnerLoader = false;
          this.multiSelect = false;
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
      message = 'Processing Selected Leave Requests...';
    } else {
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
      message = 'Processing Selected Leave Requests...';
    }
    this.conformationPopup.openLoaderModal(message);
    this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.responseSummary = response.data;
          if (this.selectedProducts && this.selectedProducts.length <= 0) {
            if(this.selectedProducts.length > 1){
            this.signalService.handleResponse(this.responseSummary, 'Selected Requests Processed Successfully');
            }else{
            this.signalService.handleResponse(this.responseSummary, 'Selected Request Processed Successfully');
            }
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
            this.conformationPopup.openErrorModal('Leave Request Processed Failed');
          }
        },
        complete: () => {
          this.multiSelect = false;
          this.signalService.timeOffsidenavCountSignal.set(true);
          this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
          this.getAllPendingApprovals();
          this.selectedProducts = [];
          this.searchValue = null;
        },
      });
  }

  closeSummary() {
    this.modalService.dismissAll();
    this.responseSummary = null;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
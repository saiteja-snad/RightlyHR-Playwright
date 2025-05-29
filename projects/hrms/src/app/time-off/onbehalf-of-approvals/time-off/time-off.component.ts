import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import moment from 'moment';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { LeaveApproval, LeaveApproverComment } from '../../../Interfaces/pendingapprovalsmodel';
import { ICategoryDetails } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { IemployeeDetails } from '../../../Interfaces/job-model';
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { Table, TableModule } from 'primeng/table';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { SignalsService } from '../../../services/signals.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
@Component({
  selector: 'app-time-off',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe,
    NoDataFoundComponent, TranslateModule, TableModule, DataLoaderContentComponent, InfoIconComponent],
  templateUrl: './time-off.component.html',
  styleUrl: './time-off.component.scss'
})

export class TimeOffComponent implements OnInit, OnDestroy {
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  LOGIN: any;
  subscription!: Subscription;
  searchValue: any;
  leaves = new BehaviorSubject<LeaveApproval[]>([]);
  leavesselect!: LeaveApproval[];
  empinfo = {} as IemployeeDetails
  responseSummary!: any;
  approverComments = [] as LeaveApproverComment[];
  leaveEntitlementsList = {} as ICategoryDetails;
  selectedLeaveData = {} as any;
  spinnerLoader = false;
  multiSelect = false;
  dataLoad = false;
  requestBody = {} as any;
  selectedProducts: LeaveApproval[] = [];
  @ViewChild('commentspopup') modalContent: any;
  @ViewChild('leaveSummary') leaveSummary: any;
  @ViewChild('dt') table!: Table;
  destroy$: Subject<boolean> = new Subject<boolean>();
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
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
    public rbac: RbacService,
    public formValidation: FormValidationService,
    private signalService: SignalsService,
  ) {
    // Signal reaction for employee switch
    effect(() => {
      if (this.http.trigger()) {
        const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
        if (data && Object.keys(data).length > 0) {
          this.LOGIN = data;
          console.log('const')
          this.getAllPendingApprovals();
        } else {
          this.leaves.next([]);
        }
        this.http.resetTriggerSignal();
        if (this.selectedProducts?.length > 0) {
          this.selectedProducts = [];
        }
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    const storedEmployee = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
    //  console.log('onInit')
    //  if(this.selectedProducts?.length > 0){
    //       this.selectedProducts= [];
    //     }
    if (storedEmployee && Object.keys(storedEmployee).length > 0) {
      this.LOGIN = storedEmployee;
      this.getAllPendingApprovals();
    } else {
       this.leaves.next([]);
    }
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    this.dataLoad = true;
    this.subscription = this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=${environment.leavesModuleId}`).subscribe({
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
    this.modalService.open(checkbalancepopup, { centered: true, backdrop: 'static' });
    let employeeId = Value.entity.leaveempId;
    this.subscription = this.http.getData(`LeaveEntitlements/employee/${employeeId}`).subscribe({
      next: (res: any) => {
        // Find the category based on leaveCategoryId
        this.leaveEntitlementsList = res.data.find((ele: any) => ele.category.id === Value.entity.leaveCategoryId);
        // Check if isProbationAllowed is explicitly true or null
        const isProbationAllowed = this.leaveEntitlementsList?.category?.isProbationAllowed;
        if (isProbationAllowed) {
          this.calculateProbationLeaves();
        } else {
          // Optionally, handle the case where probation is not allowed
        }
      },
      error: (err: any) => {
        console.log(err);
      }
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
        this.leaveEntitlementsList.probationLeaves = months * this.leaveEntitlementsList.category.probationDays;
        if (this.leaveEntitlementsList.probationLeaves >= this.leaveEntitlementsList.allowedDays) {
          this.leaveEntitlementsList.probationLeaves = this.leaveEntitlementsList.allowedDays
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

  issubmitdiable: boolean = false;
  ifreasonnull(Value: any) {
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
    } else {
      this.issubmitdiable = false;
    }
  }

  rejectleave(rejectPopup: any, selecteddata: LeaveApproval) {
    this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
    // this.approveRequest(selecteddata);
    this.selectedLeaveData = selecteddata;
    console.log(this.selectedLeaveData)
  }

  approveleave(approverPopup: any, selecteddata: LeaveApproval) {
    this.modalService.open(approverPopup, { centered: true, backdrop: 'static' });
    // this.approveRequest(selecteddata);
    this.selectedLeaveData = selecteddata;
    console.log(this.selectedLeaveData)
  }

  // processleave(selecteddata: any) {
  //   //this.modalService.open(approverPopup, { centered: true, backdrop: 'static' });
  //   this.approveRequest(selecteddata);
  //   this.handleProcess(selecteddata);
  // }

  // processleave(selecteddata: LeaveApproval) {
  //   this.selectedLeaveData = selecteddata;
  //   setTimeout(() => {
  //     this.approveRequest(selecteddata);
  //     this.handleProcess();
  //   }, 500);
  // }

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
  //       const totalAvailable = this.leaves?.length || 0;
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
      this.multiSelect= false;
      this.selectedProducts = [];
      this.hasSelectedAllOnce = false;
      this.updateTableSelectionState([]);
    }
  }

  getFilteredAndSortedLeaves(): LeaveApproval[] {
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


  // approveRequest(leaveRequest: LeaveApproval) {
  //   //this.modalService.open(approverPopup, { centered: true, backdrop: 'static' });
  //   if (leaveRequest) {
  //     this.subscription = this.http.getData(`Timeoff/getById/${leaveRequest.approvalHeader.referenceEntityId}`).subscribe({
  //       next: (response: any) => {
  //         this.selectedLeaveData = response
  //         this.selectedLeaveData.request = leaveRequest
  //       },
  //       error: (err) => { },
  //       complete: () => {
  //         this.http.triggerActionSignal()
  //       }
  //     })
  //   }
  // }

  // handleAccept(data: LeaveApproval) {
  //   this.spinnerLoader = true;
  //   let approvedBy = this.LOGIN.employeeId.toString();
  //   let comments = this.selectedLeaveData?.comments || '';

  //   let requestBody = {
  //     requestProcessedBy: approvedBy,
  //     status: "Approved",
  //     comments: comments,
  //     moduleId: environment.leavesModuleId,
  //     isPlannedLeave: this.selectedLeaveData.isPlannedLeave,
  //     headerRequests: this.selectedProducts.map((item) => ({
  //       headerID: item.approvalHeader.id,
  //       currentStage: item.approvalHeader.currentapprovalStage
  //     }))
  //   }

  //   this.subscription = this.http.putData(`v2/PendingApproval/multiapprovals`, requestBody).subscribe({
  //     next: (respone: any) => {
  //       this.modalService.dismissAll();
  //       this.sharedModalService.openSuccessModal('Request Accepted Successfully');
  //       setTimeout(() => {
  //         this.modalService.dismissAll();
  //         this.getAllPendingApprovals();
  //       }, 2000);
  //     },
  //     error: (reason: any) => {
  //       this.spinnerLoader = false;
  //       this.sharedModalService.openErrorModal('Request Accepted Failed');
  //     },
  //     complete: () => {
  //       this.multiSelect = false;
  //       this.spinnerLoader = false;
  //       this.http.triggerActionSignal();
  //       this.getAllPendingApprovals();
  //       this.selectedProducts = [];
  //     },
  //   })
  // }

  // handleReject(data: LeaveApproval) {
  //   let requestBody = {
  //     status: "Rejected",
  //     comments: this.selectedLeaveData.comments,
  //     approvedBy: this.empinfo.employeeId.toString()
  //   }
  //   this.spinnerLoader = true;
  //   this.subscription = this.http.putData(`PendingApproval/${data.request.approvalHeader.id}`, requestBody).subscribe({
  //     next: (respone: any) => {
  //       this.modalService.dismissAll();
  //       this.sharedModalService.openSuccessModal('Request Rejected Successfully');
  //       setTimeout(() => {
  //         this.modalService.dismissAll();
  //         this.getAllPendingApprovals();
  //       }, 2000);
  //     },
  //     error: (reason: any) => {
  //       this.spinnerLoader = false;
  //       this.sharedModalService.openErrorModal('Request Rejected Failed');
  //     },
  //     complete: () => {
  //       this.http.triggerActionSignal();
  //       this.spinnerLoader = false;
  //       this.getAllPendingApprovals();
  //       this.multiSelect = false;
  //       this.selectedProducts = [];
  //     },
  //   })
  // }

  // handleProcess() {
  //   let approvedBy = this.LOGIN.employeeId.toString();
  //   let requestBody = {
  //     requestProcessedBy: approvedBy,
  //     status: 'Processed',
  //     moduleId: environment.leavesModuleId,
  //     headerRequests: this.selectedProducts.map((item) => ({
  //       headerID: item.approvalHeader.id,
  //       currentStage: item.approvalHeader.currentapprovalStage
  //     }))
  //   }
  //   // let requestBody = {
  //   //   status: "Processed",
  //   //   approvedBy: this.empinfo.employeeId.toString()
  //   // }
  //   this.sharedModalService.openLoaderModal('Processing Request, Please wait...');
  //   this.subscription = this.http.putData(`v2/PendingApproval/multiapprovals`, requestBody).subscribe({
  //     next: (respone: any) => {
  //       this.modalService.dismissAll();
  //       this.sharedModalService.openSuccessModal('Request Processed Successfully');
  //       setTimeout(() => {
  //         this.modalService.dismissAll();
  //         this.getAllPendingApprovals();
  //       }, 2000);
  //     },
  //     error: (reason: any) => {
  //       this.sharedModalService.openSuccessModal('Request Processed Failed');
  //     },
  //     complete: () => {
  //       this.http.triggerActionSignal();
  //       this.getAllPendingApprovals();
  //       this.multiSelect = false;
  //       this.selectedProducts = [];
  //     }
  //   })
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
            this.signalService.handleResponse(this.responseSummary, 'Request Approved Successfully');
          } else {
            this.openModal(this.leaveSummary);
          }
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          this.spinnerLoader = false;
          if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else {
            this.conformationPopup.openErrorModal('Request Approval Failed');
          }
        },
        complete: () => {
          form.resetForm();
          this.spinnerLoader = false;
          this.multiSelect = false;
          this.getAllPendingApprovals();
          this.selectedProducts = [];
          this.http.triggerActionSignal();
          this.searchValue = null;
        },
      });
  }

  handleReject(form: any) {
    console.log(this.selectedLeaveData)
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
          this.multiSelect = false;
          this.selectedProducts = [];
          this.getAllPendingApprovals();
          this.http.triggerActionSignal();
          this.searchValue = null;
        },
      });
  }

  handleProcess(selecteddata: any) {
    this.selectedLeaveData = selecteddata;
    console.log(this.selectedLeaveData)
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
          this.multiSelect = false;
          this.getAllPendingApprovals();
          this.selectedProducts = [];
          this.http.triggerActionSignal();
          this.searchValue = null;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IJob } from '../../../Interfaces/letters-model';
import { PermissionRequestResponse, ICategoryDetails } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { PermissionsearchPipe } from "../../../Pipes/permissionsearch.pipe";
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TableModule } from 'primeng/table';
import { LeaveApproval } from '../../../Interfaces/pendingapprovalsmodel';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
@Component({
  selector: 'app-regularization-for-your-role-request',
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
    NoDataFoundComponent,
    InfoIconComponent
],
  templateUrl: './regularization-for-your-role-request.component.html',
  styleUrl: './regularization-for-your-role-request.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class RegularizationForYourRoleRequestComponent implements OnInit, OnDestroy {
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  multiSelect = false;
  searchValue: any | null;
  dataLoad = false;
  spinnerLoader = false;
  responseSummary!: any;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  empinfo = {} as IJob;
  regularization = [] as PermissionRequestResponse[];
  approverComments = [] as any[];
  regularizationselect!: PermissionRequestResponse[];
  selectedProducts!: PermissionRequestResponse[];
  requestBody = {} as any;
  leaveEntitlementsList = {} as ICategoryDetails;
  @ViewChild('commentspopup') modalContent: any;
  @ViewChild('leaveSummary') leaveSummary: any;
  selectedLeaveData = {} as PermissionRequestResponse;
  leaves = new BehaviorSubject<PermissionRequestResponse[]>([]);
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

  selectCheck(Value: any) {
    this.multiSelect = Array.isArray(Value) && Value.length > 0;
  }

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

  canBulkProcess(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader.currentapprovalStage ===
        item.approvalHeader.finalapprovalStage
    );
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
    let EmployeeId = parseInt(this.empinfo.employeeId);
    let moduleId = environment.attendanceRegularizationModuleId;
    this.dataLoad = true;
    this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=${moduleId}&approvedType=ROLE`).pipe(takeUntil(this.destroy$))
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

  previousSearchValue: string = '';
  hasSelectedAllOnce = false;
  onSearchChange(): void {
    if (this.searchValue !== this.previousSearchValue) {
      this.previousSearchValue = this.searchValue;
      this.multiSelect = false;
      this.selectedProducts = [];
      this.hasSelectedAllOnce = false;
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

  // getFilteredAndSortedLeaves(): any[] {
  //   const search = this.searchValue?.toLowerCase() ?? '';
  //   let leaves = this.regularizationselect ?? [];

  //   if (search) {
  //     leaves = leaves.filter(item =>
  //       item.entity?.fusionempId.toLowerCase().includes(search) ||
  //       item.entity?.raisedForName?.toLowerCase().includes(search) ||
  //       item.entity?.type?.toLowerCase().includes(search)
  //     );
  //   }

  //   if (!this.selectedProducts || this.selectedProducts.length === 0) {
  //     this.leaves.next(leaves);
  //     return this.leaves.getValue();
  //   }

  //   const selectedIds = new Set(this.selectedProducts.map(item => item.approvalHeader?.id));
  //   const selected = leaves.filter(item => selectedIds.has(item.approvalHeader?.id));
  //   const unselected = leaves.filter(item => !selectedIds.has(item.approvalHeader?.id));
  //   this.leaves.next([...selected, ...unselected]);
  //   return this.leaves.getValue();
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

  // handleAccept(approveForm: FormGroup): void {
  //   if (approveForm.valid) {
  //     this.spinnerLoader = true;
  //     const formData = approveForm.value;
  //     let approvedBy = this.empinfo.employeeId.toString();
  //     let comments = formData.comments;

  //     let requestBody = {
  //       requestProcessedBy: approvedBy,
  //       status: "Approved",
  //       comments: comments,
  //       moduleId: environment.attendanceRegularizationModuleId,
  //       headerRequests: this.selectedProducts.map((item) => ({
  //         headerID: item.approvalHeader.id,
  //         currentStage: item.approvalHeader.currentapprovalStage
  //       }))
  //     }

  //     this.http.putData(`v2/PendingApproval/multiapprovals`, requestBody).pipe(takeUntil(this.destroy$))
  //       .subscribe({
  //         next: (respone: any) => {
  //           this.modalService.dismissAll();
  //         if(this.selectedProducts.length > 1){
  //           this.responseSummary = respone.data;
  //           this.openModal(this.leaveSummary);
  //         }else{
  //           this.sharedModalService.openSuccessModal('Request Approved Successfully')
  //         }
  //         },
  //         error: (reason: any) => {
  //           this.spinnerLoader = false;
  //           this.modalService.dismissAll();
  //           if (reason.error.statusCode == 400) {
  //             this.sharedModalService.openErrorModal(reason.error.message)
  //           }
  //           else if (reason.error.statusCode == 400) {
  //             this.sharedModalService.openErrorModal(reason.error.message)
  //           }
  //           else {
  //             this.sharedModalService.openErrorModal('Request Approval Failed');
  //           }
  //         },
  //         complete: () => {
  //           this.spinnerLoader = false;
  //           this.approveForm.reset();
  //           this.multiSelect = false;
  //           this.selectedLeaveData = {} as PermissionRequestResponse;
  //           this.signalService.regularizationForYouTriggerSignal.set(true);
  //           this.signalService.regularizationSidNavCountTriggerSignal.set(true);
  //           this.getAllPendingApprovals();
  //            this.selectedProducts = [];
  //         },
  //       });
  //   }
  // }

  // handleProcess(request: any) {
  //   this.selectedLeaveData = request;
  //   let approvedBy = this.empinfo.employeeId.toString();
  //   let requestBody = {
  //     requestProcessedBy: approvedBy,
  //     status: 'Processed',
  //     moduleId: environment.attendanceRegularizationModuleId,
  //     headerRequests: this.selectedProducts.map((item) => ({
  //       headerID: item.approvalHeader.id,
  //       currentStage: item.approvalHeader.currentapprovalStage
  //     }))
  //   }

  //   this.sharedModalService.openLoaderModal('Processing Request, Please wait...');
  //   this.http.putData(`v2/PendingApproval/multiapprovals`, requestBody).pipe(takeUntil(this.destroy$))
  //     .subscribe({
  //       next: (response: any) => {
  //         this.modalService.dismissAll();
  //         if(this.selectedProducts.length > 1){
  //           this.responseSummary = response.data;
  //           this.openModal(this.leaveSummary);
  //         }else{
  //           this.sharedModalService.openSuccessModal('Request Processed Successfully')
  //         }
  //       },
  //       error: (reason: any) => {
  //         this.modalService.dismissAll();
  //         if (reason.error.statusCode == 400) {
  //           this.sharedModalService.openErrorModal(reason.error.message)
  //         }
  //         else if (reason.error.statusCode == 400) {
  //           this.sharedModalService.openErrorModal(reason.error.message)
  //         }
  //         else {
  //           this.sharedModalService.openErrorModal('Request Processed Failed');
  //         }
  //       },
  //       complete: () => {
  //         this.multiSelect = false;
  //         this.signalService.regularizationForYouTriggerSignal.set(true);
  //         this.signalService.regularizationSidNavCountTriggerSignal.set(true);
  //         this.getAllPendingApprovals();
  //          this.selectedProducts = [];
  //       },
  //     });
  // }

  // handleReject(rejectForm: FormGroup): void {
  //   if (rejectForm.valid) {
  //     this.spinnerLoader = true;
  //     const formData = rejectForm.value;
  //     let approvedBy = this.empinfo.employeeId.toString();
  //     let comments = formData.comments;
  //     let requestBody = {
  //       requestProcessedBy: approvedBy,
  //       status: 'Rejected',
  //       comments: comments,
  //       moduleId: environment.attendanceRegularizationModuleId,
  //       headerRequests: this.selectedProducts.map((item) => ({
  //         headerID: item.approvalHeader.id,
  //         currentStage: item.approvalHeader.currentapprovalStage
  //       }))
  //     }

  //     this.http.putData(`v2/PendingApproval/multiapprovals`, requestBody).pipe(takeUntil(this.destroy$))
  //       .subscribe({
  //         next: (response: any) => {
  //          this.modalService.dismissAll();
  //         if(this.selectedProducts.length > 1){
  //           this.responseSummary = response.data;
  //           this.openModal(this.leaveSummary);
  //         }else{
  //           this.sharedModalService.openSuccessModal('Request Rejected Successfully')
  //         }
  //         },
  //         error: (reason: any) => {
  //           this.spinnerLoader = false;
  //           this.modalService.dismissAll();
  //           if (reason.error.statusCode == 400) {
  //             this.sharedModalService.openErrorModal(reason.error.message)
  //           }
  //           else if (reason.error.statusCode == 400) {
  //             this.sharedModalService.openErrorModal(reason.error.message)
  //           }
  //           else {
  //             this.sharedModalService.openErrorModal('Request Rejected Failed');
  //           }
  //         },
  //         complete: () => {
  //           this.spinnerLoader = false;
  //           this.rejectForm.reset();
  //           this.multiSelect = false;
  //           this.selectedLeaveData = {} as PermissionRequestResponse;
  //           this.signalService.regularizationForYouTriggerSignal.set(true);
  //           this.signalService.regularizationSidNavCountTriggerSignal.set(true);
  //           this.getAllPendingApprovals();
  //            this.selectedProducts = [];
  //         },
  //       });
  //   }
  // }

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
              if (this.selectedProducts.length > 1) {
               this.signalService.handleResponse(this.responseSummary, 'Selected Regularization Requests Approved Successfully');
              } else {
                this.signalService.handleResponse(this.responseSummary, 'Selected Regularization Request Approved Successfully');
              }
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
              this.sharedModalService.openErrorModal('Regularization Request Approval Failed');
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
            if (this.selectedProducts.length > 1) {
               this.signalService.handleResponse(this.responseSummary, 'Selected Regularization Requests Processed Successfully');
              } else {
                this.signalService.handleResponse(this.responseSummary, 'Selected Regularization Request Processed Successfully');
              }
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
            this.sharedModalService.openErrorModal('Regularization Request Processed Failed');
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
              if (this.selectedProducts.length > 1) {
               this.signalService.handleResponse(this.responseSummary, 'Selected Regularization Requests Rejected Successfully');
              } else {
                this.signalService.handleResponse(this.responseSummary, 'Selected Regularization Request Rejected Successfully');
              }
            } else {
              this.openModal(this.leaveSummary);
            }
          },
          error: (reason: any) => {
            this.modalService.dismissAll();
            this.rejectForm.reset();
            this.spinnerLoader = false;
            if (reason.error.statusCode == 400) {
              this.sharedModalService.openErrorModal(reason.error.message)
            }
            else if (reason.error.statusCode == 400) {
              this.sharedModalService.openErrorModal(reason.error.message)
            }
            else {
              this.sharedModalService.openErrorModal('Regularization Request Rejected Failed');
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

  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, { centered: true, backdrop: 'static', size: 'lg' });
    this.approverComments = value;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

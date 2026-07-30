import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { Subject, Subscription, combineLatest, takeUntil } from 'rxjs';
import { Ilpid } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { RbacService } from '../../../services/rbac.service';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../../services/open-modal.service';
import moment from 'moment';
import { SignalsService } from '../../../services/signals.service';
import { FormValidationsService } from '../../../services/form-validations.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { environment } from '../../../../environments/environment';
@Component({
  selector: 'app-leaves-waiting-for-approval',
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, NgbNavModule, NgbPopoverModule, FormsModule,
    PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent, InfoIconComponent, DataLoaderContentComponent, TableModule],
  templateUrl: './leaves-waiting-for-approval.component.html',
  styleUrl: './leaves-waiting-for-approval.component.scss'
})

export class LeavesWaitingForApprovalComponent implements OnInit, OnDestroy {
  @ViewChild('leavesWaitingTable') leavesWaitingTable!: Table;
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  loggedinuser = {} as any;
  empdata = {} as any;
  subscription!: Subscription;
  lpdata = [] as Ilpid[];
  multiSelect = false;
  selectedProducts: any[] = [];
  searchText: string = '';
  originalLpdata = [] as Ilpid[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  cancelForm!: FormGroup;
  selectedFields = {} as any;
  loading: boolean = false;
  selectedSandwichItem: any = null;
  permissionForLoggedInUser: boolean = true;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  selectempid: any;
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }
  isLoading = false;
  selectedYear: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  selectedLeaveData: any;
  spinnerLoader = false;
  selectedLeaveStatus: any;
  responseSummary: any;
  requestBody: any = {};
  @ViewChild('leaveSummary') leaveSummary: any;




  leaveEntitlementsList: any = {};
  employeeLeaveEntitlementsList: any[] = [];

  LOGIN: any = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

  constructor(private http: HttpService, public formsValidation: FormValidationsService, private signalService: SignalsService,
    private modalService: NgbModal, private conformationPopup: OpenModalService, private authService: AuthService, public rbac: RbacService, private fb: FormBuilder,
    private TimeoffYearFilterService: TimeoffYearFilterService) { }

  ngOnInit(): void {
    this.selectedYear = this.TimeoffYearFilterService.getSelectedYear() ?? new Date().getFullYear();
    this.formInializer();

    this.TimeoffYearFilterService.selectedYear$.pipe(takeUntil(this.destroy$)).subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        if (this.selectempid) {
          this.getDataByLPEMPID();
        } else {
          this.getDataByLPID();
        }
      }
    });

    this.http.selectedEmployeeIdTimeoff$.pipe(takeUntil(this.destroy$)).subscribe((id) => {
      if (id) {
        this.selectempid = id;
        this.permissionForLoggedInUser = false;
        this.getDataByLPEMPID();
      } else {
        this.selectempid = null;
        this.permissionForLoggedInUser = true;
        this.loggedinuser = this.authService.getToken();
        this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
        this.getDataByLPID();
      }
    });
  }

  formInializer() {
    this.cancelForm = this.fb.group({
      cancelReason: [null,
        [Validators.required, Validators.maxLength(250)]
      ]
    });
  }

  isBeforeToday(date: string | Date): boolean {
    return moment().isSameOrBefore(moment(date), 'day');
  }

  onClick(data: any, content: any) {
    console.log('Opening cancel popup');
    console.log('Received data =>', data);
    console.log('selectedFields before =>', this.selectedFields);

    this.selectedFields = data;

    console.log('selectedFields after =>', this.selectedFields);

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static'
    });
  }

  //function to cancle the leave
  cancelLeaveSubmit() {
    this.isLoading = true;
    const currentDate = moment()
    const payload = {
      "cancelledDate": currentDate,
      "rejectedReason": this.cancelForm.get('cancelReason')?.value,
      "cancelledBy": this.empdata.employeeId
    }
    this.subscription = this.http.putData(`Timeoff/cancel?id=${this.selectedFields.id}`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res) {

            this.cancelForm.reset();
            this.modalService.dismissAll();

            this.conformationPopup.openSuccessModal('Leave cancelled successfully');

            this.selectedProducts = [];

            if (this.selectempid) {
              this.getDataByLPEMPID();   // Manager View
            } else {
              this.getDataByLPID();      // Employee View
            }
          }

          this.signalService.timecountTriggerSignal.update(count => count + 1);
          this.signalService.timeOffsidenavCountSignal.set(true);
          this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
        },

        error: (err: any) => {

          this.isLoading = false;

          this.cancelForm.reset();
          this.modalService.dismissAll();

          if (this.selectempid) {
            this.getDataByLPEMPID();
          } else {
            this.getDataByLPID();
          }

          this.signalService.timecountTriggerSignal.update(count => count + 1);

          this.conformationPopup.openErrorModal(
            err?.error?.message || 'Leave cancellation failed'
          );
        },

        complete: () => {

          this.isLoading = false;

          if (this.selectempid) {
            this.getDataByLPEMPID();
          } else {
            this.getDataByLPID();
          }
        }
      });
  }

  getDataByLPID() {
    this.loading = true;
    let empid = this.empdata.employeeId;
    this.permissionForLoggedInUser = true;
    this.subscription = this.http.getFilteredleavesDataByID(empid, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Waiting for Approval');
          console.log('Logged in user leaves:', this.lpdata);
          if (this.lpdata.length > 0) {
            console.log('Sample leave item structure:', this.lpdata[0]);
          }
          this.originalLpdata = [...this.lpdata]; // Store original unsorted data
          console.error("Invalid response this lpdata ", this.lpdata);
        } else {
          console.error("Invalid response format");
          this.lpdata = [];
        }
      },
      error: (reason: any) => {
        this.loading = false;
        this.lpdata = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getDataByLPEMPID() {
    let empid = this.selectempid;
    if (!empid) {
      return;
    }

    this.permissionForLoggedInUser = false;
    this.loading = true;
    this.subscription = this.http.getFilteredleavesDataByID(empid, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status === 'Waiting for Approval');
          console.log('Selected employee leaves:', this.lpdata);
          console.log('Current login user:', this.LOGIN);
          if (this.lpdata.length > 0) {
            console.log('Sample leave item structure:', this.lpdata[0]);
            console.log('PendingApprovalsHeader:', this.lpdata[0]?.pendingApprovalsHeader);
          }
          this.originalLpdata = [...this.lpdata]; // Store original unsorted data
          console.error("Invalid response this lpdata ", this.lpdata);
        } else {
          console.error("Invalid response format");
          this.lpdata = [];
        }
      },
      error: (reason: any) => {
        console.log(reason);
        this.loading = false;
        this.lpdata = [];
      }
    });
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
        this.lpdata = [...this.originalLpdata];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.leavesWaitingTable) {
          this.leavesWaitingTable.reset();
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
      let val1: any;
      let val2: any;

      if (field === 'date' || field === 'startdate' || field === 'enddate') {
        // Handle date sorting
        val1 = new Date(a[field]);
        val2 = new Date(b[field]);
        return event.order * (val1.getTime() - val2.getTime());
      } else if (field === 'duration') {
        // Handle numeric sorting
        val1 = parseFloat(a[field]) || 0;
        val2 = parseFloat(b[field]) || 0;
        return event.order * (val1 - val2);
      } else {
        // Handle string sorting for all other fields
        val1 = String(a[field] ?? '').trim();
        val2 = String(b[field] ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }
    });
  }

  openSandwichBreakdown(item: any, modal: any) {
    this.selectedSandwichItem = item;
    this.modalService.open(modal, { centered: true, backdrop: 'static', size: 'lg' });
  }

  checkLeaveBalance(item: any, checkbalancepopup: any) {

    let employeeId = item.employeeId || item.leaveempId;

    this.http.getData(`LeaveEntitlements/employee/${employeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {


          console.log('Leave Balance API Response', res.data);

          this.employeeLeaveEntitlementsList = [...res.data];

          console.log('employeeLeaveEntitlementsList',
            this.employeeLeaveEntitlementsList);

          this.modalService.open(checkbalancepopup, {
            centered: true,
            backdrop: 'static',
            size: 'lg'
          });
        },
        error: (err: any) => {
          console.log(err);
        }
      });
  }

  canApprove(item: any): boolean {
  const loginEmployeeId = Number(this.empdata?.employeeId);
  const currentApproverId = Number(item?.currentApproverId);

  return (
    loginEmployeeId === currentApproverId &&
    !this.shouldHideApproval(item)
  );
}

  calculateProbationLeaves() {

    if (this.LOGIN.probationEndDate) {

      let currentDate = moment();
      let probationEndDate = moment(this.LOGIN.probationEndDate);

      if (
        currentDate.startOf('day')
          .isSameOrBefore(probationEndDate.startOf('day'))
      ) {

        let dateOfJoining = moment(this.LOGIN.dateOfJoining);

        let probationDays = currentDate.diff(dateOfJoining, 'days');

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
      }
    }
  }
  approveleave(approverPopup: any, item: any) {
    console.log('selectedLeaveData', item);
    this.selectedLeaveData = item;

    this.modalService.open(approverPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  rejectleave(rejectPopup: any, item: any) {
    console.log('REJECT ITEM =>', item);
    this.selectedLeaveData = item;

    this.modalService.open(rejectPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  ifreasonnull(value: any) {
    if (!value || !value.trim()) {
      this.selectedLeaveStatus = null;
    }
  }

  onStatusApproveSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'approved') {
      this.selectedLeaveData.comments = 'Approved';
    } else if (status === 'planned') {
      this.selectedLeaveData.comments = 'Planned Leave';
    } else if (status === 'unplanned') {
      this.selectedLeaveData.comments = 'Unplanned Leave';
    }
  }

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'reject') {
      this.selectedLeaveData.comments = 'Rejected';
    } else if (status === 'planned') {
      this.selectedLeaveData.comments = 'Planned Leave';
    } else if (status === 'unplanned') {
      this.selectedLeaveData.comments = 'Unplanned Leave';
    }
  }

  handleAccept(form: any) {

    this.spinnerLoader = true;

    const payload = {
      requestProcessedBy: this.LOGIN.employeeId.toString(),
      status: 'Approved',
      comments: this.selectedLeaveData?.comments || '',
      moduleId: 1,
      isPlannedLeave: false,
      headerRequests:
        this.selectedProducts.length > 0
          ? this.selectedProducts.map(item => ({
            headerID: item.pendingApprovalsHeader?.id,
            currentStage: item.pendingApprovalsHeader?.currentapprovalStage
          }))
          : [
            {
              headerID: this.selectedLeaveData.pendingApprovalsHeader?.id,
              currentStage: this.selectedLeaveData.pendingApprovalsHeader?.currentapprovalStage
            }
          ]
    };



    this.http.putData(`v2/PendingApproval/multiapprovals`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {

          const selectedCount = this.selectedProducts.length;

          this.selectedProducts = [];
          this.modalService.dismissAll();

          this.responseSummary = response.data;

          if (selectedCount > 1) {

            this.modalService.open(this.leaveSummary, {
              centered: true,
              backdrop: 'static',
              size: 'lg'
            });

            setTimeout(() => {
              this.modalService.dismissAll();
            }, 3000);

          } else {

            this.conformationPopup.openSuccessModal(
              'Leave request approved successfully'
            );

          }


          if (this.selectempid) {
            this.getDataByLPEMPID();
          } else {
            this.getDataByLPID();
          }
          this.signalService.timecountTriggerSignal.update(count => count + 1);
          this.signalService.timeOffsidenavCountSignal.set(true);
          this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
        },

        error: (err: any) => {

          this.modalService.dismissAll();

          this.conformationPopup.openErrorModal(
            err?.error?.message || 'Leave Request Approval Failed'
          );
        },

        complete: () => {
          this.spinnerLoader = false;
          form?.resetForm?.();
        }
      });
  }

  handleReject(form: any) {

    this.spinnerLoader = true;

    const payload = {
      requestProcessedBy: this.LOGIN.employeeId.toString(),
      status: 'Rejected',
      comments: this.selectedLeaveData?.comments || '',
      moduleId: 1,
      isPlannedLeave: false,
      headerRequests:
        this.selectedProducts.length > 0
          ? this.selectedProducts.map(item => ({
            headerID: item.pendingApprovalsHeader?.id,
            currentStage: item.pendingApprovalsHeader?.currentapprovalStage
          }))
          : [
            {
              headerID: this.selectedLeaveData.pendingApprovalsHeader?.id,
              currentStage: this.selectedLeaveData.pendingApprovalsHeader?.currentapprovalStage
            }
          ]
    };

    console.log('Payload =>', payload);

    this.http.putData(`v2/PendingApproval/multiapprovals`, payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {

          const selectedCount = this.selectedProducts.length;

          this.selectedProducts = [];
          this.modalService.dismissAll();

          this.responseSummary = response.data;

          if (selectedCount > 1) {

            this.modalService.open(this.leaveSummary, {
              centered: true,
              backdrop: 'static',
              size: 'lg'
            });

            setTimeout(() => {
              this.modalService.dismissAll();
            }, 3000);

          } else {

            this.conformationPopup.openSuccessModal(
              'Leave request rejected successfully'
            );

          }



          if (this.selectempid) {
            this.getDataByLPEMPID();
          } else {
            this.getDataByLPID();
          }
          this.signalService.timecountTriggerSignal.update(count => count + 1);
          this.signalService.timeOffsidenavCountSignal.set(true);
          this.signalService.timeoffForYouTriggerSignal.set(true);
          this.signalService.timeoffForRoleTriggerSignal.set(true);
        },

        error: (err: any) => {

          this.modalService.dismissAll();

          this.conformationPopup.openErrorModal(
            err?.error?.message || 'Leave Request Rejected Failed'
          );
        },

        complete: () => {
          this.spinnerLoader = false;
          form?.resetForm?.();
        }
      });
  }

  selectCheck(value: any) {
    this.multiSelect = Array.isArray(value) && value.length > 0;

    if (!value || value.length === 0) {
      this.selectedProducts = [];
      return;
    }

    this.selectedProducts = [...value];
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  shouldHideApproval(item: any): boolean {
  const loginEmployeeId = Number(this.empdata?.employeeId);
  const currentApproverId = Number(item?.currentApproverId);
  const reportingManagerId = Number(item?.reportingManagerId);
  const teamManagerId = Number(item?.teamManagerId);

  return (
    loginEmployeeId > 0 &&
    currentApproverId > 0 &&
    reportingManagerId > 0 &&
    teamManagerId > 0 &&
    reportingManagerId === teamManagerId &&
    teamManagerId === loginEmployeeId &&
    loginEmployeeId === currentApproverId
  );
}

hasApprovableItems(): boolean {
  return this.lpdata.some((item: any) =>
    this.canApprove(item) && !this.shouldHideApproval(item)
  );
}

}
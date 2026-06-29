import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators, } from '@angular/forms';
import { NgbModal, NgbPopoverModule, } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../Interfaces/letters-model';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { ICompOff } from '../../comp-off/compoff.modal';
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { environment } from '../../../../environments/environment';
import { TranslateModule } from '@ngx-translate/core';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';

import { FormValidationsService } from '../../../services/form-validations.service';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-remote-waiting-for-approval',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    DateformatPipe,
    TranslateModule,
    ReactiveFormsModule,
    TableModule,
    NoDataFoundComponent, DataLoaderContentComponent, InfoIconComponent],
  templateUrl: './remote-waiting-for-approval.component.html',
  styleUrl: './remote-waiting-for-approval.component.scss'
})
export class RemoteWaitingForApprovalComponent implements OnInit, OnDestroy {
  @ViewChild('remoteWaitingTable') remoteWaitingTable!: Table;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  approvedRemotes: ICompOff[] = [];
  remoteLogin = [] as any;
  approvedRemotesCount = 0;
  empinfo = {} as IJob;
  dataLoad = false;
  destroy$: Subject<boolean> = new Subject<boolean>();

  // Sorting properties
  originalApprovedRemotes = [] as ICompOff[];
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  selectempid: any;
  selectedYear: any;
  selectedRemoteData: any;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  spinnerLoader = false;
  selectedLeaveStatus: any;
  requestSummary: any;
  requestBody: any = {};
  approverComments: any[] = [];
  permissionForLoggedInUser = true;
  showActions = false;
  multiSelect = false;
  selectedProducts: any[] = [];
  searchText: string = '';

  @ViewChild('leaveSummary') leaveSummary: any;
  LOGIN: any = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');


  constructor(
    private http: HttpService,
    public rbac: RbacService,
    private signalService: SignalsService,
    private TimeoffYearFilterService: TimeoffYearFilterService,
    private modalService: NgbModal,
    private fb: FormBuilder,
    public formsValidation: FormValidationsService
  ) {
    effect(() => {
      if (this.signalService.remoteLoginRequestTriggerSignal()) {
        this.getRemoteRequests();
      }

    })
  }

  ngOnInit(): void {
    this.initializeApproveForm();
    this.initializeRejectForm();

    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdRemoteLogin$.subscribe((id) => {
          if (id) {

            this.selectempid = id;

            // Manager View
            this.permissionForLoggedInUser = false;
            this.showActions = true;

            this.getRemoteLoginEMPRequests();

          } else {

            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');

            // Employee View
            this.permissionForLoggedInUser = true;
            this.showActions = false;

            this.getRemoteRequests();
          }
        });
      }
    });
  }

  initializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  initializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]]
    });
  }

  canApprove(item: any): boolean {

    const currentApproverId =
      item?.pendingApprovalsHeader?.currentApproverId?.toString();

    const loginId =
      this.LOGIN.employeeId?.toString();

    return currentApproverId === loginId;
  }

  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  getRemoteRequests() {
    let empId = this.empinfo.employeeId;
    this.dataLoad = true;
    this.http
      .getFilterRemoteLoginDataByID(
        empId,
        this.selectedYear
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response);

          this.remoteLogin = response;
          console.log('remoteLogin length:', this.remoteLogin.length);
          this.dataLoad = false;

          console.log(
            this.remoteLogin.map((x: any) => ({
              id: x.id,
              status: x.status
            }))
          );
          this.approvedRemotes = this.remoteLogin?.filter(
            (element: { status: string }) =>
              element.status === 'Waiting for Approval'
          );
          this.originalApprovedRemotes = [...this.approvedRemotes]; // Store original data
          this.selectedProducts = [];
          this.multiSelect = false;

          if (this.remoteWaitingTable) {
            this.remoteWaitingTable.selection = [];
          }
          this.approvedRemotesCount = this.approvedRemotes.length;
        },
        error: (error) => {
          this.dataLoad = false;
          console.error('Error fetching data:', error);
          this.approvedRemotes = []; // Set to empty array on error
          this.originalApprovedRemotes = [];
        },
      });
  }

  getRemoteLoginEMPRequests() {
    let empId = this.selectempid;
    this.http
      .getFilterRemoteLoginDataByID(
        empId, this.selectedYear
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          this.remoteLogin = response;

          console.log(
            this.remoteLogin.map((x: any) => ({
              id: x.id,
              status: x.status
            }))
          );
          this.approvedRemotes = this.remoteLogin.filter(
            (element: { status: string }) => element.status === 'Waiting for Approval'
          );
          this.originalApprovedRemotes = [...this.approvedRemotes]; // Store original data
          this.selectedProducts = [];
          this.multiSelect = false;

          if (this.remoteWaitingTable) {
            this.remoteWaitingTable.selection = [];
          }
          this.approvedRemotesCount = this.approvedRemotes.length;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
          this.approvedRemotes = []; // Set to empty array on error
          this.originalApprovedRemotes = [];
        },
      });
  }

  approveRemote(approvalPopup: any, item: any) {

    this.selectedRemoteData =
      this.selectedProducts.length > 0
        ? [...this.selectedProducts]
        : item;

    this.selectedLeaveStatus = '';
    this.approveForm.reset();

    this.modalService.open(approvalPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  rejectRemote(rejectPopup: any, item: any) {

    this.selectedRemoteData =
      this.selectedProducts.length > 0
        ? [...this.selectedProducts]
        : item;

    this.selectedLeaveStatus = '';
    this.rejectForm.reset();

    this.modalService.open(rejectPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  onStatusApproveSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'approved') {
      this.approveForm.get('comments')?.setValue('Approved');
    }
  }

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'reject') {
      this.rejectForm.get('comments')?.setValue('Rejected');
    }
  }

  handleAccept(form: FormGroup): void {

    this.spinnerLoader = true;

    if (form.valid) {

      let approvedBy = this.empinfo.employeeId.toString();
      const isMultiSelection = Array.isArray(this.selectedRemoteData);
      const selectedItems = Array.isArray(this.selectedRemoteData)
        ? this.selectedRemoteData
        : [this.selectedRemoteData];

      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Approved',
        comments: form.value.comments,
        moduleId: environment.remoteLoginModuleId,
        headerRequests: selectedItems.map(item => ({
          headerID: item.pendingApprovalsHeader.id,
          currentStage: item.pendingApprovalsHeader.currentapprovalStage
        }))
      };

      this.http.putData(
        `v2/PendingApproval/multiapprovals`,
        this.requestBody
      ).subscribe({
        next: (response: any) => {
          this.spinnerLoader = false;
          this.modalService.dismissAll();

          console.log('Before approve:', this.approvedRemotes.length);

          // Remove approved/rejected record immediately
          const ids = selectedItems.map(x => x.id);

          this.approvedRemotes = this.approvedRemotes.filter(
            x => !ids.includes(x.id)
          );

          console.log('After approve:', this.approvedRemotes.length);

          this.selectedProducts = [];
          this.multiSelect = false;
          // Update count immediately
          this.approvedRemotesCount = this.approvedRemotes.length;

          this.requestSummary = response.data;

          if (isMultiSelection) {
            this.openModal(this.leaveSummary);

            setTimeout(() => {
              this.modalService.dismissAll();
            }, 3000);

          } else {

            this.signalService.handleResponse(
              this.requestSummary,
              'Remote Login request approved successfully'
            );
          }

          // Refresh sidebar counts immediately
          this.signalService.remoteLoginSidNavCountTriggerSignal.update(count => count + 1);
        },
        error: (err: any) => {
          console.error(err);
        },
        complete: () => {
          this.spinnerLoader = false;

          if (this.selectempid) {
            this.getRemoteLoginEMPRequests();
          } else {
            this.getRemoteRequests();
          }
        }
      });
    }
  }

  handleReject(form: FormGroup): void {

    this.spinnerLoader = true;

    if (form.valid) {

      let approvedBy = this.empinfo.employeeId.toString();
      const selectedItems = Array.isArray(this.selectedRemoteData)
        ? this.selectedRemoteData
        : [this.selectedRemoteData];
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: form.value.comments,
        moduleId: environment.remoteLoginModuleId,
        headerRequests: selectedItems.map(item => ({
          headerID: item.pendingApprovalsHeader.id,
          currentStage: item.pendingApprovalsHeader.currentapprovalStage
        }))
      };
      this.http.putData(
        `v2/PendingApproval/multiapprovals`,
        this.requestBody
      ).subscribe({
        next: (response: any) => {
          this.spinnerLoader = false;
          this.modalService.dismissAll();

          // Remove record immediately
          const ids = selectedItems.map(x => x.id);

          this.approvedRemotes = this.approvedRemotes.filter(
            x => !ids.includes(x.id)
          );

          // Update count immediately
          this.approvedRemotesCount = this.approvedRemotes.length;
          console.log('Updated waiting count:', this.approvedRemotesCount);
          this.requestSummary = response.data;

          if (this.selectedProducts && this.selectedProducts.length > 0) {

            this.openModal(this.leaveSummary);

            setTimeout(() => {
              this.modalService.dismissAll();
            }, 3000);

          } else {

            this.signalService.handleResponse(
              this.requestSummary,
              'Remote Login request rejected successfully'
            );

          }

          this.rejectForm.reset();

          // Refresh sidebar counts immediately
          this.signalService.remoteLoginSidNavCountTriggerSignal.update(count => count + 1);
        },
        error: (err: any) => {
          console.error(err);
        },
        complete: () => {
          console.log('Reject Complete');
          console.log('selectempid', this.selectempid);
          this.spinnerLoader = false;

          if (this.selectempid) {
            this.getRemoteLoginEMPRequests();
          } else {
            this.getRemoteRequests();
          }
        }
      });
    }
  }

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
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

  showMultiSelectAndSearch(): boolean {
    return this.approvedRemotes.some(item =>
      this.canApprove(item)
    );
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
        this.approvedRemotes = [...this.originalApprovedRemotes];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.remoteWaitingTable) {
          this.remoteWaitingTable.reset();
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

      // Handle different field types
      switch (field) {
        case 'startTime':
        case 'requestedDate':
          val1 = new Date(a[field]).getTime();
          val2 = new Date(b[field]).getTime();
          return event.order * (val1 - val2);

        case 'durationType':
          // Map durationType numbers to sortable values for proper sorting
          const durationMap: { [key: number]: number } = {
            1: 1, // First Half
            2: 3, // Full Day (should come last)
            3: 2  // Second Half
          };
          val1 = durationMap[a[field]] || 0;
          val2 = durationMap[b[field]] || 0;
          return event.order * (val1 - val2);

        case 'status':
        case 'requestedComments':
        default:
          val1 = a[field];
          val2 = b[field];
          break;
      }

      // Handle string sorting for non-date/duration fields
      if (field !== 'startTime' && field !== 'requestedDate' && field !== 'durationType') {
        val1 = String(val1 ?? '').trim();
        val2 = String(val2 ?? '').trim();
        return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      }

      return 0; // Fallback
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { HttpService } from '../../../services/http.service';
import { IJob } from '../../../Interfaces/letters-model';
import { Subject, takeUntil } from 'rxjs';
import { ICompOff } from '../../../Interfaces/compoff.modal';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { RbacService } from '../../../services/rbac.service';
import { SignalsService } from '../../../services/signals.service';
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { TranslateModule } from '@ngx-translate/core';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Validators } from '@angular/forms';
@Component({
  selector: 'app-comp-off-waiting-for-approval',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    TableModule,
    DateformatPipe,
    NoDataFoundComponent,
    DataLoaderContentComponent,
    TranslateModule,
    InfoIconComponent,
    ReactiveFormsModule,
    TableModule,
  ],
  templateUrl: './comp-off-waiting-for-approval.component.html',
  styleUrl: './comp-off-waiting-for-approval.component.scss',
})

export class CompOffWaitingForApprovalComponent implements OnInit, OnDestroy {
  @ViewChild('compOffWaitingTable') compOffWaitingTable!: Table;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  waitingForApprovalCompOff: ICompOff[] = [];
  compOff = [] as any;
  waitingForApprovalCompOffCount = 0;
  empinfo = {} as IJob;
  destroy$: Subject<boolean> = new Subject<boolean>();
  dataload = false;
  selectemp: any;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  selectedYear: any;
  selectedCompOffData: any;
  selectedProducts: any[] = [];
  searchText: string = '';
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  showActions = false;

  spinnerLoader = false;
  selectedLeaveStatus: any;
  requestSummary: any;
  approverComments: any[] = [];

  originalWaitingForApprovalCompOff = [] as ICompOff[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc
  @ViewChild('leaveSummary') leaveSummary: any;
  requestBody: any = {};
  LOGIN: any = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');


  constructor(private http: HttpService, public rbac: RbacService, private signalService: SignalsService, private TimeoffYearFilterService: TimeoffYearFilterService, private modalService: NgbModal,
    private fb: FormBuilder) {
    effect(() => {
      if (this.http.compOffTriggerSignal()) {
        this.getCompOffRequest();
      }
    });
  }

  ngOnInit(): void {
    this.initializeApproveForm();
    this.initializeRejectForm();
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdCompOff$.subscribe((id) => {
          if (id) {
            this.selectemp = id;
            this.showActions = true; // Manager View
            this.getCompOffRequest();
          } else {
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.showActions = false; // Employee View
            this.getCompOffRequest();
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
    console.log('currentApproverId:', currentApproverId);
    console.log('loginId:', loginId);
    console.log('item:', item);


    return currentApproverId === loginId;
  }

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  getCompOffRequest() {
    let empId = this.selectemp ?? this.empinfo.employeeId;
    this.dataload = true;
    this.http.getFilterCompoffDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.compOff = response;

        this.waitingForApprovalCompOff = this.compOff.filter(
          (element: { status: string }) =>
            element.status === 'Waiting for Approval'
        );

        this.waitingForApprovalCompOffCount =
          this.waitingForApprovalCompOff.length;

        this.selectedProducts = []; // ADD THIS
        this.originalWaitingForApprovalCompOff = [...this.waitingForApprovalCompOff];
        this.waitingForApprovalCompOffCount = this.waitingForApprovalCompOff.length;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.waitingForApprovalCompOff = [];
        this.originalWaitingForApprovalCompOff = [];
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }

  approveCompOff(approvalPopup: any, item: any) {
    this.selectedCompOffData = item;

    this.selectedLeaveStatus = '';   // add this
    this.approveForm.reset();        // add this

    this.modalService.open(approvalPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  rejectCompOff(rejectPopup: any, item: any) {
    this.selectedCompOffData = item;

    this.selectedLeaveStatus = '';   // add this
    this.rejectForm.reset();         // add this

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

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      backdrop: 'static',
      size: 'lg'
    });
  }

  handleAccept(form: FormGroup): void {
    this.spinnerLoader = true;

    if (form.valid) {

      let approvedBy = this.empinfo.employeeId.toString();
      const isMultiSelection = this.selectedProducts.length > 0;
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Approved',
        comments: form.value.comments,
        moduleId: 3,
        headerRequests: isMultiSelection
          ? this.selectedProducts.map(x => ({
            headerID: x.pendingApprovalsHeader.id,
            currentStage: x.pendingApprovalsHeader.currentapprovalStage
          }))
          : [
            {
              headerID: this.selectedCompOffData.pendingApprovalsHeader.id,
              currentStage:
                this.selectedCompOffData.pendingApprovalsHeader.currentapprovalStage
            }
          ]
      };




      this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {

            this.modalService.dismissAll();
            this.waitingForApprovalCompOff =
              this.waitingForApprovalCompOff.filter(
                x => x.id !== this.selectedCompOffData.id
              );

            this.waitingForApprovalCompOffCount =
              this.waitingForApprovalCompOff.length;
            this.requestSummary = response.data;

            if (isMultiSelection) {

              this.selectedProducts = [];

              this.openModal(this.leaveSummary);

              setTimeout(() => {
                this.modalService.dismissAll();
              }, 5000);

            } else {

              this.selectedProducts = [];

              this.signalService.handleResponse(
                this.requestSummary,
                'Comp Off request approved successfully'
              );
            }
            this.approveForm.reset();
          },

          error: (err: any) => {
            this.modalService.dismissAll();
            console.error(err);
          },

          complete: () => {
            this.spinnerLoader = false;
            this.getCompOffRequest();
            this.http.tirggerCountSignal.update((status) => ({
              ...status,
              compOff: true,
            }));
          }
        });
    }
  }

  handleReject(form: FormGroup): void {



    this.spinnerLoader = true;

    if (form.valid) {



      let approvedBy = this.empinfo.employeeId.toString();
      const isMultiSelection = this.selectedProducts.length > 0;
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: form.value.comments,
        moduleId: 3,
        headerRequests: isMultiSelection
          ? this.selectedProducts.map(x => ({
            headerID: x.pendingApprovalsHeader.id,
            currentStage: x.pendingApprovalsHeader.currentapprovalStage
          }))
          : [
            {
              headerID: this.selectedCompOffData.pendingApprovalsHeader.id,
              currentStage:
                this.selectedCompOffData.pendingApprovalsHeader.currentapprovalStage
            }
          ]
      };

      console.log('Step 4', this.requestBody);


      console.log(JSON.stringify(this.requestBody, null, 2));

      this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            console.log('SUCCESS', response);

            this.modalService.dismissAll();

            this.waitingForApprovalCompOff =
              this.waitingForApprovalCompOff.filter(
                x => x.id !== this.selectedCompOffData.id
              );

            this.waitingForApprovalCompOffCount =
              this.waitingForApprovalCompOff.length;

            this.requestSummary = response.data;

            if (isMultiSelection) {

              this.selectedProducts = [];

              this.openModal(this.leaveSummary);

              setTimeout(() => {
                this.modalService.dismissAll();
              }, 5000);

            } else {

              this.selectedProducts = [];

              this.signalService.handleResponse(
                this.requestSummary,
                'Comp Off request rejected successfully'
              );
            }

            this.rejectForm.reset();
          },

          error: (err: any) => {
            this.modalService.dismissAll();
            console.error(err);
          },

          complete: () => {
            this.spinnerLoader = false;
            this.getCompOffRequest();
            this.http.tirggerCountSignal.update((status) => ({
              ...status,
              compOff: true,
            }));
          }
        });
    }
  }

  selectCheck(event: any) {
    this.selectedProducts = event;
  }


  showMultiSelectAndSearch(): boolean {
    return this.waitingForApprovalCompOff.some(item =>
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
        this.waitingForApprovalCompOff = [...this.originalWaitingForApprovalCompOff];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.compOffWaitingTable) {
          this.compOffWaitingTable.reset();
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

      // Handle direct fields
      val1 = a[field];
      val2 = b[field];

      // Handle date sorting
      if (field === 'startTime' || field === 'requestedDate') {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle numeric sorting for durationType
      if (field === 'durationType') {
        const num1 = Number(val1) || 0;
        const num2 = Number(val2) || 0;
        return event.order * (num1 - num2);
      }

      // Handle string sorting for other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
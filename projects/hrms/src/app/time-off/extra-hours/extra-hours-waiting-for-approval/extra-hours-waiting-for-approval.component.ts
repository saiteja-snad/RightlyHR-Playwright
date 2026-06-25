import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';
import { Subject, takeUntil } from 'rxjs';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { IJob } from '../../../Interfaces/letters-model';
import { RegularizationRequest } from '../../../Interfaces/timoff-model';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { environment } from '../../../../environments/environment';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-extra-hours-waiting-for-approval',
  imports: [
    CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    DropdownModule,
    TableModule,
    NoDataFoundComponent,
    DateformatPipe,
    DataLoaderContentComponent,
    TranslateModule,
    InfoIconComponent,
    ReactiveFormsModule,
    TableModule
  ],
  templateUrl: './extra-hours-waiting-for-approval.component.html',
  styleUrl: './extra-hours-waiting-for-approval.component.scss'
})
export class ExtraHoursWaitingForApprovalComponent implements OnInit, OnDestroy {
  @ViewChild('extraHoursWaitingTable') extraHoursWaitingTable!: Table;
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  selectempid: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  waitingForApprovalPerimisions: RegularizationRequest[] =
    [] as RegularizationRequest[];
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  dataLoad = false;
  selectedYear: any;
  selectedExtraHourData: any;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  spinnerLoader = false;
  selectedLeaveStatus: any;
  responseSummary: any;
  requestBody: any = {};
  approverComments: any[] = [];
  permissionForLoggedInUser = true;
  selectedProducts: any[] = [];
  searchText: string = '';
  @ViewChild('leaveSummary') leaveSummary: any;
  LOGIN: any = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
  originalWaitingForApprovalPerimisions = [] as RegularizationRequest[]; // Store original unsorted data
  currentSortField: string = '';
  currentSortOrder: number = 0; // 0 = no sort, 1 = asc, -1 = desc

  constructor(private http: HttpService, public rbac: RbacService, private TimeoffYearFilterService: TimeoffYearFilterService, private modalService: NgbModal,
    private fb: FormBuilder,private sharedModalService: OpenModalService) {
    effect(() => {
      if (this.http.tirggerCountSignal().permission) {
        this.getDataPermissions();
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          permission: false,
        }));
      }
    });
  }

  ngOnInit(): void {
    this.initializeApproveForm();
    this.initializeRejectForm();
    this.TimeoffYearFilterService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;
        this.http.selectedEmployeeIdRegularization$.subscribe((id) => {
          if (id) {
            this.selectempid = id;

            // Manager selected an employee
            this.permissionForLoggedInUser = false;

            this.getDataEMPPermissions();
          } else {
            this.empinfo = JSON.parse(
              localStorage.getItem('rightlyHrUser') ?? '{}'
            );

            // Logged-in employee view
            this.permissionForLoggedInUser = true;

            this.getDataPermissions();
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

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  getDataPermissions() {
    let empId = this.empinfo.employeeId;
    this.dataLoad = true;
    this.http.getFilterExtraHoursDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.waitingForApprovalPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        );
        this.originalWaitingForApprovalPerimisions = [...this.waitingForApprovalPerimisions];
        this.dataLoad = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.dataLoad = false;
        this.waitingForApprovalPerimisions = []; // Set to empty array on error
        this.originalWaitingForApprovalPerimisions = [];
      },
    });
  }

  getDataEMPPermissions() {
    let empId = this.selectempid;
    this.dataLoad = true;
    this.http.getFilterExtraHoursDataByID(empId, this.selectedYear).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.waitingForApprovalPerimisions = response.filter(
          (element: { status: string }) => element.status === 'Waiting for Approval'
        );
        this.originalWaitingForApprovalPerimisions = [...this.waitingForApprovalPerimisions];
        this.dataLoad = false;
      },
      error: (error) => {
        console.error('Error fetching data:', error);
        this.dataLoad = false;
        this.waitingForApprovalPerimisions = []; // Set to empty array on error
        this.originalWaitingForApprovalPerimisions = [];
      },
    });
  }

  approveExtraHours(approvalPopup: any, item: any) {
    this.selectedExtraHourData = item;

    this.modalService.open(approvalPopup, {
      centered: true,
      backdrop: 'static'
    });
  }

  rejectExtraHours(rejectPopup: any, item: any) {
    this.selectedExtraHourData = item;

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

      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Approved',
        comments: form.value.comments,
        moduleId: environment.extraHoursModuleId,
        headerRequests: [
          {
            headerID: this.selectedExtraHourData.pendingApprovalsHeader.id,
            currentStage: this.selectedExtraHourData.pendingApprovalsHeader.currentapprovalStage
          }
        ]
      };

      this.http.putData(
        `v2/PendingApproval/multiapprovals`,
        this.requestBody
      ).subscribe({
        next: (response: any) => {

          this.modalService.dismissAll();

          this.waitingForApprovalPerimisions =
            this.waitingForApprovalPerimisions.filter(
              x => x.id !== this.selectedExtraHourData.id
            );
          this.selectedProducts =
            this.selectedProducts.filter(
              x => x.id !== this.selectedExtraHourData.id
            );

          this.responseSummary = response.data;

          if (this.selectedProducts && this.selectedProducts.length > 0) {

            this.openModal(this.leaveSummary);

            setTimeout(() => {
              this.modalService.dismissAll();
            }, 3000);

          } else {

            this.sharedModalService.openSuccessModal(
              'Extra Hour request approved successfully'
            );

          }
        },
        complete: () => {
          this.spinnerLoader = false;
        }
      });
    }
  }

  handleReject(form: FormGroup): void {

    this.spinnerLoader = true;

    if (form.valid) {

      let approvedBy = this.empinfo.employeeId.toString();

      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: form.value.comments,
        moduleId: environment.extraHoursModuleId,
        headerRequests: [
          {
            headerID: this.selectedExtraHourData.pendingApprovalsHeader.id,
            currentStage: this.selectedExtraHourData.pendingApprovalsHeader.currentapprovalStage
          }
        ]
      };

      this.http.putData(
        `v2/PendingApproval/multiapprovals`,
        this.requestBody
      ).subscribe({
        next: (response: any) => {

          this.modalService.dismissAll();

          // Remove from waiting list immediately
          this.waitingForApprovalPerimisions =
            this.waitingForApprovalPerimisions.filter(
              x => x.id !== this.selectedExtraHourData.id
            );

          this.selectedProducts =
            this.selectedProducts.filter(
              x => x.id !== this.selectedExtraHourData.id
            );

          this.responseSummary = response.data;

          if (this.selectedProducts && this.selectedProducts.length > 0) {

            this.openModal(this.leaveSummary);

            setTimeout(() => {
              this.modalService.dismissAll();
            }, 3000);

          } else {

            this.sharedModalService.openSuccessModal(
              'Extra Hour request rejected successfully'
            );

          }
          this.rejectForm.reset();
        },

        error: (err: any) => {
          console.error(err);
          this.spinnerLoader = false;
        },

        complete: () => {
          this.spinnerLoader = false;
        }
      });
    }
  }

  removeLeadingWhitespace(control: any): void {
    if (control) {
      const value = control.value || '';
      control.setValue(value.replace(/^\s+/, ''), {
        emitEvent: false
      });
    }
  }

  canApprove(item: any): boolean {
    const currentApproverId =
      item?.pendingApprovalsHeader?.currentApproverId?.toString();

    const loginId =
      this.LOGIN.employeeId?.toString();

    return currentApproverId === loginId;
  }

  selectCheck(event: any) {
    this.selectedProducts = event;
  }

  showMultiSelectAndSearch(): boolean {
  return this.waitingForApprovalPerimisions.some(item =>
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
        this.waitingForApprovalPerimisions = [...this.originalWaitingForApprovalPerimisions];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.extraHoursWaitingTable) {
          this.extraHoursWaitingTable.reset();
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
      if (field === 'createdDate' || field === 'requestedDate') {
        const date1 = val1 ? new Date(val1) : new Date(0);
        const date2 = val2 ? new Date(val2) : new Date(0);
        return event.order * (date1.getTime() - date2.getTime());
      }

      // Handle numeric sorting for duration
      if (field === 'duration') {
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

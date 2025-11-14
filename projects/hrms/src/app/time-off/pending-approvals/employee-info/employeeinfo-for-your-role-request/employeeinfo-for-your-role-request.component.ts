import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Table, TableModule } from "primeng/table";
import { PaginatorModule } from 'primeng/paginator';
import { Router } from '@angular/router';
import { Skeleton } from "primeng/skeleton";
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { noWhitespaceValidator } from '../../../../shared/nowhitespace/nowhitespace.component';
import { environment } from '../../../../../environments/environment';
import { OpenModalService } from '../../../../services/open-modal.service';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { ConfirmationIconComponent } from '../../../../icons/confirmation-icon/confirmation-icon.component';
import { TimesheetDay } from '../../../../Interfaces/timoff-model';
import { HttpService } from '../../../../services/http.service';
import { InfoIconComponent } from '../../../../icons/info-icon/info-icon.component';

@Component({
  selector: 'app-employeeinfo-for-your-role-request',
  imports: [AccordionModule, CommonModule, PaginatorModule, ReactiveFormsModule, TableModule, TranslateModule, InfoIconComponent, NgbPopover,
    ConfirmationIconComponent, FormsModule, NoDataFoundComponent, Skeleton],
  templateUrl: './employeeinfo-for-your-role-request.component.html',
  styleUrl: './employeeinfo-for-your-role-request.component.scss'
})
export class EmployeeinfoForYourRoleRequestComponent {
  timesheetData: TimesheetDay[] = [];
  subscription!: Subscription;
  empinfo: any;
  //requestSummary!: any;
  //moduleId = 25;
  selectedLeaveData = {} as TimesheetDay;
  selectedLeavesItems: TimesheetDay[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  requestBody = {} as any;
  responseSummary!: any;
  // approveReason: string = '';
  spinnerLoader = false;
  conformationstatus: any;
  timeSheetApproveForm!: FormGroup;
  timeSheetRejectForm!: FormGroup;
  // multiSelect = false;
  // hasSelectedAllOnce = false;
  totalRecordCount: number = 0;
  successRecordsCount: number = 0;
  failureRecordsCount: number = 0;
  @ViewChild('leaveSummary') leaveSummary: any;
  @ViewChild('dt') table!: Table;
  employeeid: any;
  totalRecordCountitem: any;
  showhideaction = true;
  selectedEntries: any[] = [];
  selectedMap: { [key: number]: any[] } = {};
  phaseId!: number;
  dataload = false;
  employeeresource: any;
  timesheetrecord: any;
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  startdate: any;
  enddate: any;
  globalSelectedEntries: any[] = [];
  employeeName: any;
  employeeEntries: any;
  allFields: any;
  allPendingApprovals: any;
  allPendingApprovalItems: any;
  emp: any;

  constructor(private http: HttpService, public formsValidation: FormValidationsService, private modalService: NgbModal,
    private conformationPopup: OpenModalService, public router: Router, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeid = parseInt(this.empinfo.employeeId);
    this.loadClientsAndProjects(this.page, this.pageSize);
    this.http.selectedEmployeeIdTimesheet$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data && data.request) {
          this.employeeresource = data.request.resourceId;
          this.phaseId = data.request.phaseId;

          if (data.request && data.request.dateRange) {
            this.startdate = data.request.dateRange.startDate;
            this.enddate = data.request.dateRange.endDate;
          }

          this.loadClientsAndProjects(this.page, this.pageSize);
        } else {
          this.startdate = null;
          this.enddate = null;
          this.loadClientsAndProjects(this.page, this.pageSize);
        }
      });

    this.intializeApproveForm();
  }

  intializeApproveForm() {
    this.timeSheetApproveForm = this.fb.group({
      comments: [null, [Validators.required, Validators.maxLength(250)]]
    });
    this.timeSheetRejectForm = this.fb.group({
      comments: [
        null,
        [Validators.required, Validators.maxLength(250), noWhitespaceValidator],
      ],
    });
  }

  // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.loadClientsAndProjects(this.page, this.pageSize);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.loadClientsAndProjects(this.page, this.pageSize);
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.loadClientsAndProjects(this.page, this.pageSize);
  }

  // bulk data approve method
  bulkApprove(popup: any) {
    this.selectedLeavesItems = this.selectedEntries;
    this.conformationstatus = 'Processed';
    this.openModal(popup, null, this.conformationstatus);
  }

  // bulk data reject method
  bulkReject(popup: any) {
    this.selectedLeavesItems = this.selectedEntries;  // collect selected
    this.conformationstatus = 'Rejected';
    this.openModal(popup, null, this.conformationstatus);
  }


loadClientsAndProjects(page: number, pageSize: number): void {
  this.dataload = true;

  const url = `PendingApproval/getEmployeeInfoPendingApprovals?moduleId=${environment.pendingapprovalemployeid}&approvedType=ROLE&employeeId=${this.empinfo?.employeeId}&page=${page}&pageSize=${pageSize}`;

  this.http.getData(url).subscribe({
    next: (res: any) => {
      this.dataload = false;

      if (!res.success || !res.data?.items?.length) {
        this.emp = [];
        return;
      }
 this.collectionSize = res.data.totalCount;
      const finalEmployees: any[] = [];

      // LOOP ALL EMPLOYEES (your previous code only used items[0])
      res.data.items.forEach((empBlock: any) => {

        const flatEntries: any[] = [];

        // Loop entries of this employee
        empBlock.entries.forEach((entry: any) => {

          // Loop fields inside entry
          entry.fields.forEach((f: any) => {
            const pa = f.pendingApproval;

            flatEntries.push({
              // FIELD DETAILS
              id: f.itemId,
              fieldName: f.fieldName,
              oldValue: f.oldValue,
              newValue: f.newValue,
              requestedDate: f.createdDate,

              // HEADER (employeeFieldHeader)
              headerId: entry.employeeFieldHeader?.headerId,
              moduleName: entry.employeeFieldHeader?.moduleName,
              displayName: entry.employeeFieldHeader?.displayName,
              headerRequestedBy: entry.employeeFieldHeader?.requestedBy,
              headerRequestedDate: entry.employeeFieldHeader?.requestedDate,

              // APPROVAL HEADER
              pendingApprovalHeader: pa?.header ?? null,

              // APPROVAL ITEMS (array)
              approvalItems: pa?.items ?? [],

              // COMMENTS (array)
              comments: pa?.comments ?? []
            });
          });
        });

        // Push employee + flattened entries into final array
        finalEmployees.push({
          employeeId: empBlock.employeeId,
          employeeName: empBlock.employeeName,
          entries: flatEntries
        });
      });

      // Assign to your view model
      this.emp = finalEmployees;

      console.log("FINAL EMP DATA FOR TABLE:", this.emp);
    },

    error: () => {
      this.dataload = false;
      this.emp = [];
    }
  });
}


  // called by p-table (row select)
  onRowSelect(dayIndex: number, event: any) {
    this.showhideaction = false;
    const row = event.data;
    if (!this.selectedMap[dayIndex]) this.selectedMap[dayIndex] = [];
    // add row if not already selected
    if (!this.selectedMap[dayIndex].some(s => s.id === row.id)) {
      this.selectedMap[dayIndex].push(row);
    }
    this.syncGlobalSelectedEntries();
  }

  // checkbox unselectedselected
  onRowUnselect(dayIndex: number, event: any) {
    this.showhideaction = false;
    const row = event.data;
    this.selectedMap[dayIndex] = (this.selectedMap[dayIndex] || []).filter(s => s.id !== row.id);
    this.syncGlobalSelectedEntries();
  }

  syncGlobalSelectedEntries() {
    this.selectedEntries = Object.values(this.selectedMap).filter(arr => Array.isArray(arr)).flat();
    // used for checkbox uncheck show approve,reject button indivisually
    this.showhideaction = this.selectedEntries.length === 0;
  }

  // HEADER checkbox helpers (per-day)
  // areAllSelected(dayIndex: number): boolean {
  //   const day = this.emp?.[dayIndex];
  //   const sel = this.selectedMap[dayIndex] || [];
  //   if (!day || !day.entries) return false;
  //   return day.entries.every(e => sel.some(s => s.id === e.id));
  // }
// areAllSelected(dayIndex: number): boolean {
//   const day = this.emp?.[dayIndex];
//   const sel = this.selectedMap[dayIndex] || [];
//   if (!day || !day.entries) return false;
//   return day.entries.every(e => sel.some(s => s.id === e.id));
// }
areAllSelected(dayIndex: number): boolean {
  const day: any = this.emp?.[dayIndex];
  const sel: any[] = this.selectedMap[dayIndex] || [];

  if (!day || !day.entries) return false;

  return day.entries.every((e: any) =>
    sel.some((s: any) => s.id === e.id)
  );
}
  // used for check box show indeterminate state
  isIndeterminate(dayIndex: number): boolean {
    const day = this.emp?.[dayIndex];
    const sel = this.selectedMap[dayIndex] || [];
    if (!day || !day.entries) return false;
    return sel.length > 0 && sel.length < day.entries.length;
  }

  // checkbox select,unselect all
  toggleSelectAll(dayIndex: number, isChecked: boolean) {
    const day = this.emp[dayIndex];
    if (!day) return;
    if (isChecked) {
      this.showhideaction = false;
      // Select all rows
      this.selectedMap[dayIndex] = [...day.entries];
    } else {
      // Deselect all rows
      this.selectedMap[dayIndex] = [];
      this.showhideaction = true;
    }
    this.syncGlobalSelectedEntries();
  }

  // open approva and reject popup
  openModal(modal: any, request: any, conformationstatus: string) {
    this.modalService.open(modal, { centered: true, backdrop: 'static' });
    if (request) {
      // single row case
      this.selectedLeaveData = request;
      this.selectedLeavesItems = [];
    }
    this.conformationstatus = conformationstatus;
    this.timeSheetApproveForm.get('comments')?.reset();
    this.timeSheetRejectForm.get('comments')?.reset();
  }

  // approve submit post method
  handleAccept(timeSheetApproveForm: FormGroup): void {
    this.spinnerLoader = true;
    if (timeSheetApproveForm.valid) {
      const formData = timeSheetApproveForm.value;
      const approvedBy = this.empinfo.employeeId.toString();
      const comments = formData.comments;
      if (this.selectedLeavesItems && this.selectedLeavesItems.length > 0) {
        // Bulk selection
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: this.conformationstatus,
          comments: comments,
          moduleId: environment.pendingapprovalemployeid,
          onBehalfOfApproval: true,
          headerRequests: this.selectedLeavesItems.map((item) => ({
            headerID: item.pendingApprovalHeader.id,
            currentStage: item.pendingApprovalHeader.currentapprovalStage,
          })),
        };
      } else if (this.selectedLeaveData) {
        // Single selection
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: this.conformationstatus,
          comments: comments,
          onBehalfOfApproval: true,
          moduleId: environment.pendingapprovalemployeid,
          headerRequests: [
            {
              headerID: this.selectedLeaveData.pendingApprovalHeader.id,
              currentStage: this.selectedLeaveData.pendingApprovalHeader.currentapprovalStage,
            },
          ],
        };
      }
      console.log("payload",this.requestBody)

      // Same API call
      this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.responseSummary = response.data;
          this.totalRecordCount = this.responseSummary.totalRecordCount;
          this.successRecordsCount = this.responseSummary.successRecordsCount;
          this.failureRecordsCount = this.responseSummary.failureRecordsCount;
          if (!this.selectedLeavesItems || this.selectedLeavesItems.length === 0) {
            // Single
            this.conformationPopup.openSuccessModal(
              this.conformationstatus === 'Processed'
                ? 'Timesheet request approved successfully'
                : 'Timesheet request rejected successfully'
            );
          } else {
            // this.openModal(this.leaveSummary, null, this.conformationstatus);
            const modalRef = this.modalService.open(this.leaveSummary, {
              centered: true, size: 'lg',
              beforeDismiss: () => false // prevents manual close by ESC/backdrop
            });
            setTimeout(() => modalRef.close(), 3000);
          }
        },
        error: (reason: any) => {
          this.spinnerLoader = false;
          this.timeSheetApproveForm.reset();
          this.timeSheetRejectForm.reset();
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal(reason.error.message);
        },
        complete: () => {
          this.spinnerLoader = false;
          this.loadClientsAndProjects(this.page, this.pageSize);
          this.selectedLeavesItems = [];
          this.selectedEntries = [];
          this.selectedMap = {};
          this.showhideaction = true;
          this.timeSheetApproveForm.reset();
          this.timeSheetRejectForm.reset();
          this.http.triggerActionSignal();
        },
      });
    }
  }

  // reject submit post method
  handlereject(timeSheetRejectForm: FormGroup): void {
    this.spinnerLoader = true;
    if (timeSheetRejectForm.valid) {
      const formData = timeSheetRejectForm.value;
      const approvedBy = this.empinfo.employeeId.toString();
      const comments = formData.comments;
      if (this.selectedLeavesItems && this.selectedLeavesItems.length > 0) {
        // Bulk selection
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: this.conformationstatus,
          comments: comments,
          moduleId: environment.pendingapprovalemployeid,
          onBehalfOfApproval: true,
          headerRequests: this.selectedLeavesItems.map((item) => ({
            headerID: item.pendingApprovalHeader.id,
            currentStage: item.pendingApprovalHeader.currentapprovalStage,
          })),
        };
      } else if (this.selectedLeaveData) {
        // Single selection
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: this.conformationstatus,
          comments: comments,
          onBehalfOfApproval: true,
          moduleId: environment.pendingapprovalemployeid,
          headerRequests: [
            {
              headerID: this.selectedLeaveData.pendingApprovalHeader.id,
              currentStage: this.selectedLeaveData.pendingApprovalHeader.currentapprovalStage,
            },
          ],
        };
      }

      // Same API call
      this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.responseSummary = response.data;
          this.totalRecordCount = this.responseSummary.totalRecordCount;
          this.successRecordsCount = this.responseSummary.successRecordsCount;
          this.failureRecordsCount = this.responseSummary.failureRecordsCount;
          if (!this.selectedLeavesItems || this.selectedLeavesItems.length === 0) {
            // Single
            this.conformationPopup.openSuccessModal(
              this.conformationstatus === 'Processed'
                ? 'Timesheet request approved successfully'
                : 'Timesheet request rejected successfully'
            );
          } else {
            // this.openModal(this.leaveSummary, null, this.conformationstatus);
            const modalRef = this.modalService.open(this.leaveSummary, {
              centered: true, size: 'lg',
              beforeDismiss: () => false // prevents manual close by ESC/backdrop
            });
            setTimeout(() => modalRef.close(), 3000);
          }
        },
        error: (reason: any) => {
          this.spinnerLoader = false;
          this.timeSheetApproveForm.reset();
          this.timeSheetRejectForm.reset();
          this.modalService.dismissAll();
          this.conformationPopup.openErrorModal(reason.error.message);
        },
        complete: () => {
          this.spinnerLoader = false;
          this.loadClientsAndProjects(this.page, this.pageSize);
          this.selectedLeavesItems = [];
          this.selectedEntries = [];
          this.selectedMap = {};
          this.showhideaction = true;
          this.timeSheetApproveForm.reset();
          this.timeSheetRejectForm.reset();
          this.http.triggerActionSignal();
        },
      });
    }
  }

  // select all Check if ALL entries in ALL days are selected
  // areAllDaysSelected(): boolean {
  //   if (!this.emp || this.emp.length === 0) return false;
  //   return this.emp.every(
  //     (day, i) =>
  //       day.entries &&
  //       this.selectedMap[i] &&
  //       day.entries.length === this.selectedMap[i].length
  //   );
  // }
areAllDaysSelected(): boolean {
  return this.emp.every((d: any, i: number) =>
    (this.selectedMap[i]?.length || 0) === d.entries.length
  );
}
  //select all Show indeterminate when partial selection exists
  // isGlobalIndeterminate(): boolean {
  //   if (!this.emp || this.emp.length === 0) return false;
  //   const totalEntries = this.emp.reduce(
  //     (acc, day) => acc + (day.entries?.length || 0),
  //     0
  //   );
  //   const selectedCount = Object.values(this.selectedMap)
  //     .filter(Array.isArray)
  //     .reduce((acc, arr) => acc + arr.length, 0);

  //   return selectedCount > 0 && selectedCount < totalEntries;
  // }
isGlobalIndeterminate(): boolean {
  if (!this.emp || this.emp.length === 0) return false;

  const totalEntries = this.emp.reduce(
    (acc: number, day: any) => acc + (day.entries?.length || 0),
    0
  );

  const selectedCount = Object.values(this.selectedMap)
    .filter((arr: any) => Array.isArray(arr))
    .reduce((acc: number, arr: any[]) => acc + arr.length, 0);

  return selectedCount > 0 && selectedCount < totalEntries;
}
  //select all Toggle all entries across all days
  // toggleSelectAllDays(isChecked: boolean): void {
  //   if (!this.emp || this.emp.length === 0) return;
  //   if (isChecked) {
  //     this.showhideaction = false;
  //     this.emp.forEach((day, i) => {
  //       this.selectedMap[i] = [...day.entries];
  //     });
  //   } else {
  //     this.showhideaction = true;
  //     this.selectedMap = {};
  //   }
  //   this.syncGlobalSelectedEntries();
  // }
toggleSelectAllDays(isChecked: boolean): void {
  if (!this.emp || this.emp.length === 0) return;

  if (isChecked) {
    this.showhideaction = false;

    this.emp.forEach((day: any, i: number) => {
      this.selectedMap[i] = [...(day.entries || [])];
    });

  } else {
    this.showhideaction = true;
    this.selectedMap = {};
  }

  this.syncGlobalSelectedEntries();
}
  // destroy the component
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.subscription?.unsubscribe();
    this.http.setEmployeeIdTimesheet({}, 0, null);
  }
}



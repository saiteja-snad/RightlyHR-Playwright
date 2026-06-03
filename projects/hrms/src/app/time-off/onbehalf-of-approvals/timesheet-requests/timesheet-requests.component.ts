import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbPopover, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { Table, TableModule } from 'primeng/table';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { TimesheetDay } from '../../../Interfaces/timoff-model';
import { FormValidationsService } from '../../../services/form-validations.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { SignalsService } from '../../../services/signals.service';

@Component({
  selector: 'app-timesheet-requests',
  imports: [AccordionModule, CommonModule, PaginatorModule, ReactiveFormsModule, TableModule, TranslateModule, InfoIconComponent, NgbPopover,
    ConfirmationIconComponent, FormsModule, NoDataFoundComponent, Skeleton],
  templateUrl: './timesheet-requests.component.html',
  styleUrl: './timesheet-requests.component.scss'
})
export class TimesheetRequestsComponent implements OnInit,OnDestroy {
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
  // searchValue: any;
  employeeid: any;
  totalRecordCountitem: any;
  showhideaction = true;
  selectedEntries: any[] = [];
  selectedMap: { [key: number]: any[] } = {};
  //projectsData:any[]=[];
  //employeeData:any[]=[];
  phaseId!: number | null;
  dataload = false;
  //employeeflag:any;
  employeeresource: any;
  taskId!:any;
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
  selectedLeaveStatus: any;
  totalCount: any;
  LOGIN: any;

  constructor(private http: HttpService, 
              public formsValidation: FormValidationsService, 
              private modalService: NgbModal,
              private conformationPopup: OpenModalService, 
              public router: Router, 
              private fb: FormBuilder, 
              public rbac: RbacService,
              private signalService: SignalsService) {

      // React to trigger signal from shared service
    effect(() => {
      if (this.http.trigger()) {
        const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
        if (data && Object.keys(data).length > 0) {
          this.LOGIN = data;
          // this.getAllPendingApprovals();
           this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
        } else {
          this.timesheetData = [];
          this.collectionSize = 0;
        }
        this.http.resetTriggerSignal();
      }
    });
     }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeid = parseInt(this.empinfo.employeeId);

    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    const storedEmployee = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
    if (storedEmployee && Object.keys(storedEmployee).length > 0) {
      this.LOGIN = storedEmployee;
      // this.getAllPendingApprovals();
      this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
    } else {
      this.timesheetData = [];
    }
    // this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
    this.http.selectedEmployeeIdTimesheet$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data && data.request) {
          this.employeeresource = data.request.resourceId || null;
          this.phaseId = data.request.phaseId || null;
          this.taskId=data.request.taskId||null;
          if (data.request.dateRange) {
            this.startdate = data.request.dateRange.startDate;
            this.enddate = data.request.dateRange.endDate;
          } else {
            this.startdate = null;
            this.enddate = null;
          }

          this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
        } else {
          this.employeeresource = null;
          this.phaseId = null;
          this.startdate = null;
          this.enddate = null;
          this.taskId=null;
          this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
        }
      });

    this.intializeApproveForm();
  }
  onStatusApproveSelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'approved') {
      this.timeSheetApproveForm.get('comments')?.setValue('Approved');
    }
  }

  onStatusRejectSelect(status: string) {
    this.selectedLeaveStatus = status;
    if (status === 'reject') {
      this.timeSheetRejectForm.get('comments')?.setValue('Rejected');
    }
  }
  intializeApproveForm() {
    this.timeSheetApproveForm = this.fb.group({
      comments: [null, [Validators.required, Validators.maxLength(250)]]
    });
    this.timeSheetApproveForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null; // remove chip highlight if cleared
      }
    });
    this.timeSheetRejectForm = this.fb.group({
      comments: [
        null,
        [Validators.required, Validators.maxLength(250), noWhitespaceValidator],
      ],
    });
    this.timeSheetRejectForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null; // remove chip highlight if cleared
      }
    });
  }

  // called for pagination 
  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
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

  // load timesheet data based on project and employee
  loadClientsAndProjects(page: number, pageSize: number, startdate: any, enddate: any): void {
    this.dataload = true;

    if(this.LOGIN?.employeeId == null || this.LOGIN?.employeeId == undefined){
      this.dataload = false;
      return
    }
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    
    let url = `v2/PendingApproval/employee/${EmployeeId}?moduleId=${environment.timesheetModuleId}&page=${page}&pageSize=${pageSize}`;
    if (this.employeeresource) url += `&requestedBy=${this.employeeresource}`;
    if (this.phaseId !== undefined && this.phaseId !== null ) {
      url += `&phaseId=${this.phaseId}`;
    }
    if (this.taskId) url += `&taskId=${this.taskId}`;
    if (this.startdate && this.enddate) url += `&startDate=${this.startdate}&endDate=${this.enddate}`;
    this.http.getData(url).subscribe({
      next: (res: any) => {
        this.dataload = false;
        this.collectionSize = res.data.totalCount;
        if (res.success) {
          // flatten all day entities into one array of entries (optional for counts)
          const allEntries = res.data.items
            .flatMap((item: any) => item.entity)
            .flatMap((entity: any) => entity.entries);
          this.totalRecordCountitem = allEntries.length;
          // assign timesheetData for UI
          this.timesheetData = res.data.items.flatMap((item: any) => item.entity) as TimesheetDay[];
          this.timesheetrecord = res.data.items;
          // Add unique `id` for each entry (important for PrimeNG selection)
          this.timesheetData.forEach(day => {
            if (Array.isArray(day.entries)) {
              day.entries.forEach((entry: any) => {
                if (entry && typeof entry === 'object') {
                  entry.id = entry.approvalHeader?.id; // or generate a string if null
                }
              });
            }
          });
          // Restore selection from globalSelectedEntries
          this.selectedMap = {};
          this.timesheetData.forEach((day, i) => {
            const selectedForDay = day.entries.filter(entry =>
              this.globalSelectedEntries.some(sel => sel.id === entry.id)
            );
            this.selectedMap[i] = selectedForDay;
          });
          //Sync overall selection state
          this.syncGlobalSelectedEntries();
        }
      },
      error: (err) => {
        this.collectionSize = 0;
        if (this.employeeresource != null && this.phaseId != 0) {
          // this.conformationPopup.openErrorModal(err.error.message);
          this.collectionSize = 0;
        }
        if (this.employeeresource == null && this.phaseId != 0) {
          this.collectionSize = 0;
        }
        if (this.enddate == "Invalid Date") {
          this.conformationPopup.openErrorModal(err.error.errors.endDate[0]);
          this.collectionSize = 0;
        }
        this.timesheetData = [];
        this.timesheetrecord = [];
        this.totalRecordCountitem = 0;
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
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
  areAllSelected(dayIndex: number): boolean {
    const day = this.timesheetData?.[dayIndex];
    const sel = this.selectedMap[dayIndex] || [];
    if (!day || !day.entries) return false;
    return day.entries.every(e => sel.some(s => s.id === e.id));
  }

  // used for check box show indeterminate state
  isIndeterminate(dayIndex: number): boolean {
    const day = this.timesheetData?.[dayIndex];
    const sel = this.selectedMap[dayIndex] || [];
    if (!day || !day.entries) return false;
    return sel.length > 0 && sel.length < day.entries.length;
  }

  // checkbox select,unselect all
  toggleSelectAll(dayIndex: number, isChecked: boolean) {
    const day = this.timesheetData[dayIndex];
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
          moduleId: environment.timesheetModuleId,
          onBehalfOfApproval: true,
          approvedPersonaType: 'onBehalfOf',
          headerRequests: this.selectedLeavesItems.map((item) => ({
            headerID: item.approvalHeader.id,
            currentStage: item.approvalHeader.currentapprovalStage,
          })),
        };
      } else if (this.selectedLeaveData) {
        // Single selection
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: this.conformationstatus,
          comments: comments,
          onBehalfOfApproval: true,
          approvedPersonaType: 'onBehalfOf',
          moduleId: environment.timesheetModuleId,
          headerRequests: [
            {
              headerID: this.selectedLeaveData.approvalHeader.id,
              currentStage: this.selectedLeaveData.approvalHeader.currentapprovalStage,
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
            this.openlgModal(this.leaveSummary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);

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
          this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
          this.selectedLeavesItems = [];
          this.selectedEntries = [];
          this.selectedMap = {};
          this.showhideaction = true;
          this.timeSheetApproveForm.reset();
          this.timeSheetRejectForm.reset();
          this.getApprovalStatusCounts();
          this.http.triggerActionSignal();
          this.signalService.onBhehalfOfApprovalSignal.set(true);

        },
      });
    }
  }
  openlgModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
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
          moduleId: environment.timesheetModuleId,
          onBehalfOfApproval: true,
          approvedPersonaType: 'onBehalfOf',
          headerRequests: this.selectedLeavesItems.map((item) => ({
            headerID: item.approvalHeader.id,
            currentStage: item.approvalHeader.currentapprovalStage,
          })),
        };
      } else if (this.selectedLeaveData) {
        // Single selection
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: this.conformationstatus,
          comments: comments,
          onBehalfOfApproval: true,
          approvedPersonaType: 'onBehalfOf',
          moduleId: environment.timesheetModuleId,
          headerRequests: [
            {
              headerID: this.selectedLeaveData.approvalHeader.id,
              currentStage: this.selectedLeaveData.approvalHeader.currentapprovalStage,
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
              this.openlgModal(this.leaveSummary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
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
          this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
          this.selectedLeavesItems = [];
          this.selectedEntries = [];
          this.selectedMap = {};
          this.showhideaction = true;
          this.timeSheetApproveForm.reset();
          this.timeSheetRejectForm.reset();
          this.getApprovalStatusCounts();
          this.http.triggerActionSignal();
          this.signalService.onBhehalfOfApprovalSignal.set(true);

        },
      });
    }
  }
  getApprovalStatusCounts() {
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=${environment.timesheetModuleId}&EmployeeId=${this.empinfo.employeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
      this.http.updatePendingApprovalCounts(this.totalCount);
      //Map counts to tabs
    });
  }

  // select all Check if ALL entries in ALL days are selected
  areAllDaysSelected(): boolean {
    if (!this.timesheetData || this.timesheetData.length === 0) return false;
    return this.timesheetData.every(
      (day, i) =>
        day.entries &&
        this.selectedMap[i] &&
        day.entries.length === this.selectedMap[i].length
    );
  }

  //select all Show indeterminate when partial selection exists
  isGlobalIndeterminate(): boolean {
    if (!this.timesheetData || this.timesheetData.length === 0) return false;
    const totalEntries = this.timesheetData.reduce(
      (acc, day) => acc + (day.entries?.length || 0),
      0
    );
    const selectedCount = Object.values(this.selectedMap)
      .filter(Array.isArray)
      .reduce((acc, arr) => acc + arr.length, 0);

    return selectedCount > 0 && selectedCount < totalEntries;
  }

  //select all Toggle all entries across all days
  toggleSelectAllDays(isChecked: boolean): void {
    if (!this.timesheetData || this.timesheetData.length === 0) return;
    if (isChecked) {
      this.showhideaction = false;
      this.timesheetData.forEach((day, i) => {
        this.selectedMap[i] = [...day.entries];
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
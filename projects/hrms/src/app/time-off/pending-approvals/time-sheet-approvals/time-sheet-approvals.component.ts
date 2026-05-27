import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { TimesheetDay } from '../../../Interfaces/timoff-model';
import { ConfirmationIconComponent } from "../../../icons/confirmation-icon/confirmation-icon.component";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidationsService } from '../../../services/form-validations.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { environment } from '../../../../environments/environment';
import { noWhitespaceValidator } from '../../../shared/nowhitespace/nowhitespace.component';
import { Table, TableModule } from "primeng/table";
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { PaginatorModule } from 'primeng/paginator';
import { Router } from '@angular/router';
import { Skeleton } from "primeng/skeleton";
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
@Component({
  selector: 'app-time-sheet-approvals',
  imports: [AccordionModule, CommonModule, PaginatorModule, ReactiveFormsModule, TableModule, TranslateModule, InfoIconComponent, NgbPopover,
    ConfirmationIconComponent, FormsModule, NoDataFoundComponent, Skeleton, DateformatPipe],
  templateUrl: './time-sheet-approvals.component.html',
  styleUrl: './time-sheet-approvals.component.scss',
  // encapsulation: ViewEncapsulation.None,
})

export class TimeSheetApprovalsComponent implements OnInit {
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
  phaseId!: number|null;
  taskId!:any;
  dataload = false;
  //employeeflag:any;
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
  selectedLeaveStatus: any;
  showBulkSelectionBanner = false;
  allPagesSelected = false;
  currentPageItemCount = 0;
  totalrequestRecordCount=0;
  selectedSummaryEntries: any[] = [];
  requestType!:string;
  constructor(private http: HttpService, public formsValidation: FormValidationsService, private modalService: NgbModal,
    private conformationPopup: OpenModalService, public router: Router, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.employeeid = parseInt(this.empinfo.employeeId);
    this.loadClientsAndProjects(this.page, this.pageSize,  this.startdate, this.enddate );
    this.http.selectedEmployeeIdTimesheet$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.phaseId=null;
        this.employeeresource=null;
        this.selectedMap = {};
        this.selectedEntries = [];
        this.globalSelectedEntries = [];
        this.allPagesSelected = false;
        this.showBulkSelectionBanner = false;
        this.page = 1;
        this.pageSize = 10;
        this.first = 0;
        this.rows = 10;
        if (data && data.request) {
          this.employeeresource = data.request.resourceId;
          this.phaseId = data.request.phaseId;
          this.taskId=data.request.taskId;
          if (data.request && data.request.dateRange) {
            this.startdate = data.request.dateRange.startDate;
            this.enddate = data.request.dateRange.endDate;
          }
          this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
        } else {
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
    this.globalSelectedEntries = [...this.selectedEntries];
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.globalSelectedEntries = [...this.selectedEntries];
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
  }

  // bulk data approve method
  bulkApprove(popup: any) {
    this.selectedLeavesItems = this.selectedEntries as TimesheetDay[];
    this.conformationstatus = 'Processed';
    this.openModal(popup, null, this.conformationstatus);
  }

  // bulk data reject method
  bulkReject(popup: any) {
    this.selectedLeavesItems = this.selectedEntries as TimesheetDay[];
    this.conformationstatus = 'Rejected';
    this.openModal(popup, null, this.conformationstatus);
  }

  // load timesheet data based on project and employee
  loadClientsAndProjects(page: number | null, pageSize: number | null, startdate:any,enddate:any): void {
    this.dataload = true;
    let url = `v2/PendingApproval/employee/${this.empinfo?.employeeId}?moduleId=${environment.timesheetModuleId}`;
    if (page !== null) url += `&page=${page}`;
    if (pageSize !== null) url += `&pageSize=${pageSize}`;
    if (this.employeeresource) url += `&requestedBy=${this.employeeresource}`;
    if (this.phaseId !== undefined && this.phaseId !== null) {
      url += `&phaseId=${this.phaseId}`;
    }
    if(this.taskId!==undefined && this.taskId !=null && this.taskId !=''){
      url+=`&taskId=${this.taskId}`
    }
    if (this.startdate && this.enddate) url += `&startDate=${this.startdate}&endDate=${this.enddate}`;
    this.http.getData(url).subscribe({
      next: (res: any) => {
        this.dataload = false;
        this.collectionSize = res.data.totalCount;
        this.totalrequestRecordCount = res?.data?.items[0]?.totalRecords? res.data.items[0].totalRecords : 0;
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
          if (this.allPagesSelected) {
            this.timesheetData.forEach((day, i) => {
              this.selectedMap[i] = [...day.entries];
            });
          }
          this.syncGlobalSelectedEntries();
          this.updateBulkSelectionBanner();
        }
      },
      error: (err) => {
        this.selectedEntries = [];
         this.collectionSize = 0;
         this.totalrequestRecordCount=0;
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
    this.showhideaction = this.selectedEntries.length === 0;
    setTimeout(() => this.updateBulkSelectionBanner(), 0);
  }

  // updateBulkSelectionBanner() {
  //   this.currentPageItemCount = this.timesheetData.reduce((acc, day) => acc + (day.entries?.length || 0), 0);
  //   const allCurrentPageSelected = this.selectedEntries.length > 0 && this.selectedEntries.length === this.currentPageItemCount;
  //   this.showBulkSelectionBanner = allCurrentPageSelected && !this.allPagesSelected;
  // console.log('Banner Debug:', {
  //   currentPageItemCount: this.currentPageItemCount,
  //   selectedCount: this.selectedEntries.length,
  //   collectionSize: this.collectionSize,
  //   allCurrentPageSelected,
  //   showBanner: this.showBulkSelectionBanner
  // });
  updateBulkSelectionBanner() {
    this.currentPageItemCount = this.timesheetData.reduce((acc, day) => acc + (day.entries?.length || 0), 0);
    const allCurrentPageSelected = this.selectedEntries.length > 0 && this.selectedEntries.length === this.currentPageItemCount;
    this.showBulkSelectionBanner = allCurrentPageSelected && !this.allPagesSelected;
    // console.log('Banner Debug:', {
    //   currentPageItemCount: this.currentPageItemCount,
    //   selectedCount: this.selectedEntries.length,
    //   collectionSize: this.collectionSize,
    //   allCurrentPageSelected,
    //   showBanner: this.showBulkSelectionBanner,
    // });
  }

  selectAllPages() {
    this.allPagesSelected = true;
    this.showBulkSelectionBanner = false;
    this.pageSize = this.totalrequestRecordCount;
    this.rows = this.collectionSize;
    this.page = 1;
    this.first = 0;
    this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
  }

  clearAllSelection() {
    this.selectedMap = {};
    this.selectedEntries = [];
    this.allPagesSelected = false;
    this.showBulkSelectionBanner = false;
    this.showhideaction = true;
    this.pageSize = 10;
    this.rows = 10;
    this.page = 1;
    this.first = 0;
    this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
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
      console.log('Selected Data for Modal:', this.selectedLeaveData);
      console.log('selected entries:', this.selectedSummaryEntries);
      this.selectedLeavesItems = [];
    }
    this.conformationstatus = conformationstatus;
    this.timeSheetApproveForm.get('comments')?.reset();
    this.timeSheetRejectForm.get('comments')?.reset();
    const filterEntries =this.selectedSummaryEntries?.filter((ele:any) => ele.exclude === false);
    console.log('Filtered Entries with Exclude false:', filterEntries);
    const allowedEntryIds = new Set(
      filterEntries.flatMap((item: any) => item.entryIds)
    );
     let filteredSelectedEntries=[] as any[];
     filteredSelectedEntries = this.selectedEntries.filter((entry: any) =>
      allowedEntryIds.has(entry.timesheetEntryId)
    );
    console.log('Selected Entries Filter:', filteredSelectedEntries);
     this.selectedLeavesItems=filteredSelectedEntries;
  }

  // approve submit post method
  handleAccept(timeSheetApproveForm: FormGroup): void {
    this.spinnerLoader = true;
    if (timeSheetApproveForm.valid) {
      const formData = timeSheetApproveForm.value;
      const approvedBy = this.empinfo?.employeeId?.toString();
      const comments = formData.comments;
      if (this.selectedLeavesItems && this.selectedLeavesItems?.length > 0) {
        // Bulk selection
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: this.conformationstatus,
          comments: comments,
          moduleId: environment.timesheetModuleId,
          headerRequests: this.selectedLeavesItems?.map((item) => ({
            headerID: item?.approvalHeader?.id,
            currentStage: item?.approvalHeader?.currentapprovalStage,
          })),
        };
      } else if (this.selectedLeaveData) {
        // Single selection
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: this.conformationstatus,
          comments: comments,
          onBehalfOfApproval: true,
          moduleId: environment.timesheetModuleId,
          headerRequests: [
            {
              headerID: this.selectedLeaveData?.approvalHeader?.id,
              currentStage: this.selectedLeaveData?.approvalHeader?.currentapprovalStage,
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
          this.allPagesSelected = false;
          this.showBulkSelectionBanner = false;
          this.rows = 10;
          this.first = 0;
          this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
          this.selectedLeavesItems = [];
          this.selectedEntries = [];
          this.selectedMap = {};
          this.allPagesSelected = false;
          this.showBulkSelectionBanner = false;
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
      if (this.selectedLeavesItems && this?.selectedLeavesItems?.length > 0) {
        // Bulk selection
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: this.conformationstatus,
          comments: comments,
          moduleId: environment.timesheetModuleId,
          headerRequests: this.selectedLeavesItems?.map((item) => ({
            headerID: item?.approvalHeader?.id,
            currentStage: item?.approvalHeader?.currentapprovalStage,
          })),
        };
      } else if (this.selectedLeaveData) {
        // Single selection
        this.requestBody = {
          requestProcessedBy: approvedBy,
          status: this.conformationstatus,
          comments: comments,
          moduleId: environment?.timesheetModuleId,
          headerRequests: [
            {
              headerID: this.selectedLeaveData?.approvalHeader?.id,
              currentStage: this.selectedLeaveData?.approvalHeader?.currentapprovalStage,
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
          this.allPagesSelected = false;
          this.showBulkSelectionBanner = false;
          this.rows = 10;
          this.first = 0;
          this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
          this.selectedLeavesItems = [];
          this.selectedEntries = [];
          this.selectedMap = {};
          this.allPagesSelected = false;
          this.showBulkSelectionBanner = false;
          this.showhideaction = true;
          this.timeSheetApproveForm.reset();
          this.timeSheetRejectForm.reset();
          this.http.triggerActionSignal();
        },
      });
    }
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
      if (this.allPagesSelected) {
        this.allPagesSelected = false;
        this.pageSize = 10;
        this.rows = 10;
        this.page = 1;
        this.first = 0;
        this.loadClientsAndProjects(this.page, this.pageSize, this.startdate, this.enddate);
        return;
      }
    }
    this.syncGlobalSelectedEntries();
  }
  getLighterColor(color: string, amount: number = 0.9): string {
    if (!color) return color || '#d8d8daff'; // Default color if none provided;
    // Remove # if present
    const hex = color.replace('#', '');
    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    // Calculate lighter values
    const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
    const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
    const newB = Math.min(255, Math.floor(b + (255 - b) * amount));
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }
    openModalforsummary(entries: any, content?: any,requestType?:string) {
     this.filteresdata=false;
    this.requestType=requestType || '';
    this.selectedSummaryEntries=[];
    this.selectedLeavesItems = this.selectedEntries;
    console.log('Selected Entries for Summary:', this.selectedEntries);
    this.getSummaryData(entries);
    this.conformationstatus = 'Processed';
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }
  getSummaryData(entired:any){
    const Ids=[...new Set(entired.map((item: any) => item.timesheetEntryId))];
    const payload = {
      entryIds:Ids
    };
    console.log('Payload for Summary API:', payload);
    this.http.postdata(`v2/Timesheet/approval-summary`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next:(response:any)=>{
        console.log(response);
         const rows: any[] = [];

        response.data.forEach((project: any) => {

          project.phase?.forEach((phase: any) => {

            phase.employees?.forEach((emp: any, empIndex: number) => {

              rows.push({
                projectName: project.projectName,
                phaseName: phase.phaseName,
                employeeName: `${emp.name} (${emp.fusionEmpId})`,
                numberOfDays: emp.noOfDays,
                hours: emp.hoursHHMMFormat,
                exclude: false,
                showProject: empIndex === 0,
                showPhase: empIndex === 0,
                projectRowSpan: phase.employees.length,
                phaseRowSpan: phase.employees.length,
                entryIds:emp.entryIds
              });

            });

          });
  
        });

        this.selectedSummaryEntries = rows;
        console.log(this.selectedSummaryEntries);
      },
      error:(reason:any)=>{
        this.conformationPopup.openErrorModal(reason.error.message);}
    });
  }
  filteresdata: boolean = false;
  toggleExclude(entry: any, event: any) {
  entry.exclude = event.target.checked;
  if(this.selectedSummaryEntries){
    this.filteresdata = this.selectedSummaryEntries.every((ele:any) => ele.exclude === true);
    console.log('All entries excluded:', this.filteresdata);
  }
}
  // destroy the component
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.subscription?.unsubscribe();
    this.http.setEmployeeIdTimesheet({}, 0, null);
  }
}
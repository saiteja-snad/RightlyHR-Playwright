import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Table } from 'exceljs';
import { Subscription, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { TimesheetDay } from '../../../../Interfaces/timoff-model';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { noWhitespaceValidator } from '../../../../shared/nowhitespace/nowhitespace.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';
import { Skeleton } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ConfirmationIconComponent } from '../../../../icons/confirmation-icon/confirmation-icon.component';
import { InfoIconComponent } from '../../../../icons/info-icon/info-icon.component';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { OffboardingReloadService } from '../../../../services/offboarding-reload.service';
import { SignalsService } from '../../../../services/signals.service';

@Component({
  selector: 'app-time-sheet-entires-approvals',
  imports: [AccordionModule, CommonModule, PaginatorModule, ReactiveFormsModule, TableModule, TranslateModule, InfoIconComponent, NgbPopover,
    ConfirmationIconComponent, FormsModule, NoDataFoundComponent, Skeleton],
  templateUrl: './time-sheet-entires-approvals.component.html',
  styleUrl: './time-sheet-entires-approvals.component.scss'
})
export class TimeSheetEntiresApprovalsComponent implements OnInit,OnDestroy {
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
  phaseId!: number;
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
  totalCount: any;
 checklistdata:any;
  constructor(private http: HttpService, public formsValidation: FormValidationsService, private modalService: NgbModal,
    private conformationPopup: OpenModalService, public router: Router, private fb: FormBuilder, public rbac: RbacService,private reloadService: OffboardingReloadService,private signalService: SignalsService,) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
    this.employeeid = parseInt(this.empinfo.employeeId);
    this.loadClientsAndProjects( );
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

          this.loadClientsAndProjects( );
        } else {
          this.startdate = null;
          this.enddate = null;
          this.loadClientsAndProjects( );
        }
      });

    this.intializeApproveForm();
    this.getinitateoffboardingdata();
  }
   getinitateoffboardingdata(){
  this.http.getData(`OffboardingTracker/employee/${this.empinfo.employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
    next:(data:any)=>{
    console.log('Offboarding data:', data);
    this.checklistdata = data.data ||[];
    },
    error:(err:any)=>{
      console.log(err)
    }
  });

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
    this.loadClientsAndProjects();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.loadClientsAndProjects();
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.loadClientsAndProjects( );
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
  loadClientsAndProjects(): void {
    // this.dataload = true;
    // let url = `v2/PendingApproval/employee/${this.empinfo?.employeeId}?moduleId=${environment.timesheetModuleId}&page=${page}&pageSize=${pageSize}`;
    // if (this.empinfo?.employeeId) url += `&requestedBy=${this.empinfo?.employeeId}`;
    // if (this.phaseId !== undefined && this.phaseId !== null) {
    //   url += `&phaseId=${this.phaseId}`;
    // }
    // if (this.startdate && this.enddate) url += `&startDate=${this.startdate}&endDate=${this.enddate}`;
    let url:any;
    let EmployeeId = parseInt(this.empinfo.employeeId);
    let moduleId = environment.timesheetModuleId;
    this.dataload = true;
      if(this.isActive('/approval-requests')){
       url = `Timeoff/GetEmployeeDataByModule?moduleId=${moduleId}&employeeId=${EmployeeId}&reportingManagerId=${EmployeeId}`;
      }else{
       url = `Timeoff/GetEmployeeDataByModule?moduleId=${moduleId}&employeeId=${EmployeeId}`;
      }
    this.http.getData(url).subscribe({
      next: (res: any) => {
        this.dataload = false;
        this.collectionSize = res?.modules[0]?.data?.totalCount;
        console.log(res,"data");

        if (res) {
          const moduleData = res.modules[0];

          // FIX: flatten all items from data array
          const allItems = moduleData?.data?.flatMap((d: any) => d.items) || [];

          // FIX: totalCount should come from summing all pages (or module totalCount)
          this.collectionSize = moduleData?.data?.reduce(
            (sum: number, d: any) => sum + (d.totalCount || 0),
            0,
          );

          // Extract all entities
          const allEntities = allItems.flatMap(
            (item: any) => item.entity || [],
          );

          // Extract all entries (for approve/reject)
          const allEntries = allEntities.flatMap(
            (entity: any) => entity.entries || [],
          );

          this.totalRecordCountitem = allEntries.length;

          // Assign for UI
          this.timesheetData = allEntities as TimesheetDay[];
          this.timesheetrecord = allItems;

          // Ensure each entry has unique id (important)
          this.timesheetData?.forEach((day) => {
            if (Array.isArray(day.entries)) {
              day.entries.forEach((entry: any, index: number) => {
                entry.id = entry?.approvalHeader?.id;
              });
            }
          });

          // Restore selection
          this.selectedMap = {};
          this.timesheetData?.forEach((day, i) => {
            const selectedForDay = (day.entries || []).filter((entry) =>
              this.globalSelectedEntries.some((sel) => sel.id === entry.id),
            );
            this.selectedMap[i] = selectedForDay;
          });

          console.log(this.timesheetData, 'final data');
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
          this.updateStageStatus();
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
          this.loadClientsAndProjects();
          this.selectedLeavesItems = [];
          this.selectedEntries = [];
          this.selectedMap = {};
          this.showhideaction = true;
          this.timeSheetApproveForm.reset();
          this.timeSheetRejectForm.reset();
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
          this.updateStageStatus();
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
          this.loadClientsAndProjects();
          this.selectedLeavesItems = [];
          this.selectedEntries = [];
          this.selectedMap = {};
          this.showhideaction = true;
          this.timeSheetApproveForm.reset();
          this.timeSheetRejectForm.reset();
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
  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }
  // destroy the component
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.subscription?.unsubscribe();
    this.http.setEmployeeIdTimesheet({}, 0, null);
  }
  //funtion to update the stage status of the leave request
  updateStageStatus() {
    let data= this.checklistdata;
    let id = data.find((item: any) => item.moduleId === environment.timesheetModuleId).id;
    let paylod={
      id:id,
      employeeId: this.empinfo.employeeId,
      moduleId: environment.timesheetModuleId,
      reportingManagerId:this.empinfo.employeeId
    }
    this.http.putData(`OffboardingTracker/${id}`, paylod).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {

          // Trigger layout reload
          this.reloadService.triggerReload();
          this.signalService.offboardingReloadTriggerSignal.set(true);
        },
        error: (reason: any) => { },
      });
  }
}

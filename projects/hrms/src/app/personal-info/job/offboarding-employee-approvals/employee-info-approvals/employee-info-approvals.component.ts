import { CommonModule } from "@angular/common";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { NgbPopover, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { NgxDocViewerModule } from "ngx-doc-viewer";
import { AccordionModule } from "primeng/accordion";
import { PaginatorModule } from "primeng/paginator";
import { Skeleton } from "primeng/skeleton";
import { Table, TableModule } from "primeng/table";
import { Subscription, Subject, takeUntil } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { ConfirmationIconComponent } from "../../../../icons/confirmation-icon/confirmation-icon.component";
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { EMPLOYEEINFO } from "../../../../Interfaces/timoff-model";
import { DateformatPipe } from "../../../../pipes/dateformat.pipe";
import { FormValidationsService } from "../../../../services/form-validations.service";
import { HttpService } from "../../../../services/http.service";
import { OpenModalService } from "../../../../services/open-modal.service";
import { SignalsService } from "../../../../services/signals.service";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { noWhitespaceValidator } from "../../../../shared/nowhitespace/nowhitespace.component";
import { OffboardingReloadService } from "../../../../services/offboarding-reload.service";


@Component({
  selector: 'app-employee-info-approvals',
  imports: [AccordionModule, CommonModule, ReactiveFormsModule, TableModule, TranslateModule, InfoIconComponent, NgbPopover,
      ConfirmationIconComponent, FormsModule, NoDataFoundComponent, Skeleton, DateformatPipe,NgxDocViewerModule
  ],
  templateUrl: './employee-info-approvals.component.html',
  styleUrl: './employee-info-approvals.component.scss'
})
export class EmployeeInfoApprovalsComponent implements OnInit, OnDestroy {
    empinfodata: EMPLOYEEINFO[] = [];
  subscription!: Subscription;
  empinfo: any;
  selectedLeaveData = {} as EMPLOYEEINFO;
  selectedLeavesItems: EMPLOYEEINFO[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  requestBody = {} as any;
  responseSummary!: any;
  spinnerLoader = false;
  conformationstatus: any;
  timeSheetApproveForm!: FormGroup;
  timeSheetRejectForm!: FormGroup;
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
  startdate: any;
  enddate: any;
  globalSelectedEntries: any[] = [];
  employeeName: any;
  employeeEntries: any;
  allFields: any;
  allPendingApprovals: any;
  allPendingApprovalItems: any;
     selectedLeaveStatus: any;
  totalCount: any;
  //emp: any;
ImageUrl: any;
 ViewURL:any;
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  @ViewChild('popupforaction') private popupforaction!: NgbModal;
  @ViewChild('popupforcurrentaction') private popupforcurrentaction!: NgbModal;
  checklistdata:any;
  constructor(private http: HttpService, public formsValidation: FormValidationsService, private modalService: NgbModal,
   private sanitizer: DomSanitizer, private conformationPopup: OpenModalService, public router: Router, private fb: FormBuilder,private reloadService: OffboardingReloadService,private signalService: SignalsService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') || '{}');
    this.employeeid = parseInt(this.empinfo.employeeId);
    this.getinitateoffboardingdata();
    this.getemployeeinfoapprovals();
    this.intializeApproveForm();
  }

  getinitateoffboardingdata(): void {
    this.http.getData(`OffboardingTracker/employee/${this.empinfo.employeeId}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => { this.checklistdata = data.data || []; },
        error: () => {}
      });
  }
  // initialization
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
    this.timeSheetApproveForm.get('comments')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
    }
  });
  this.timeSheetRejectForm.get('comments')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
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
  // called for pagination
  onRowsChange() {}
  onPageChange(event: any) {}
  onPageSizeChange(newPageSize: number) {}

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

  getemployeeinfoapprovals(): void {
    this.dataload = true;
    // const url = `PendingApproval/getEmployeeInfoPendingApprovals?moduleId=${environment.pendingapprovalemployeid}&approvedType=EMP&employeeId=${this.empinfo?.employeeId}&page=${page}&pageSize=${pageSize}`;
      let url:any;
    let EmployeeId = parseInt(this.empinfo.employeeId);
    let moduleId = environment.pendingapprovalemployeid;
    this.dataload = true;
      if(this.isActive('/approval-requests')){
       url = `Timeoff/GetEmployeeDataByModule?moduleId=${moduleId}&employeeId=${EmployeeId}&reportingManagerId=${EmployeeId}`;
      }else{
       url = `Timeoff/GetEmployeeDataByModule?moduleId=${moduleId}&employeeId=${EmployeeId}`;
      }

    this.http.getData(url).subscribe({next: (res: any) => {
        this.dataload = false;
        if (!res.modules[0].data || !res.modules[0].data?.length) {
          this.empinfodata = [];
          return;
        }
        this.collectionSize = res.modules[0].totalCount;
        const finalEmployees: any[] = [];
        // LOOP ALL EMPLOYEES
        res.modules[0].data.forEach((empBlock: any) => {
          const flatEntries: any[] = [];
          empBlock.entries.forEach((entry: any) => {
            // entry.fields
            //   //  FILTER: ONLY WAITING FOR APPROVAL RECORDS
            //   .filter((f: any) =>
            //     f.pendingApproval?.header?.status === "Waiting for Approval"
            //   )
            entry.fields.filter((fields: any) => {
                const pandingapproval = fields.pendingApproval;
                if (!pandingapproval) return false;
                const headerWaiting = pandingapproval.header?.status === "Waiting for Approval";
                const anyItemWaiting = pandingapproval.items?.some((items: any) => items.approvedStatus === "Waiting for Approval");
                return headerWaiting || anyItemWaiting;
              }).forEach((fieldname: any) => {
                const padingapprovaldata = fieldname.pendingApproval;
                flatEntries.push({
                  id: fieldname.itemId,
                  fieldName: fieldname.fieldName,
                  oldValue: fieldname.oldValue,
                  newValue: fieldname.newValue,
                  sourceFieldName: fieldname.sourceFieldName,
                  requestedDate: fieldname.createdDate,
                  headerId: entry.employeeFieldHeader?.headerId,
                  moduleName: entry.employeeFieldHeader?.moduleName,
                  displayName: entry.employeeFieldHeader?.displayName,
                  headerRequestedBy: entry.employeeFieldHeader?.requestedBy,
                  headerRequestedDate: entry.employeeFieldHeader?.requestedDate,
                  pendingApprovalHeader: padingapprovaldata?.header ?? null,
                  approvalItems: padingapprovaldata?.items ?? [],
                  comments: padingapprovaldata?.comments ?? [],
                  approvalScope: fieldname?.approvalScope ?? '',
                  meta: fieldname?.meta ?? ''
                });
              });
          });

          // ONLY PUSH EMPLOYEE IF THEY HAVE ANY WAITING RECORDS
          if (flatEntries.length > 0) {
            finalEmployees.push({
              employeeName: empBlock.employeeName,
              entries: flatEntries
            });
          }
        });
        this.empinfodata = finalEmployees;
        console.log("FILTERED EMP TABLE DATA:", this.empinfodata);
      },

      error: () => {
        this.dataload = false;
        this.empinfodata = [];
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
    const day = this.empinfodata?.[dayIndex];
    const sel = this.selectedMap[dayIndex] || [];
    if (!day || !day.entries) return false;
    return day.entries.every((e:any) => sel.some(s => s.id === e.id));
  }

  // used for check box show indeterminate state
  isIndeterminate(dayIndex: number): boolean {
    const day = this.empinfodata?.[dayIndex];
    const sel = this.selectedMap[dayIndex] || [];
    if (!day || !day.entries) return false;
    return sel.length > 0 && sel.length < day.entries.length;
  }

  // checkbox select,unselect all
  toggleSelectAll(dayIndex: number, isChecked: boolean) {
    const day = this.empinfodata[dayIndex];
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
  actionsDetails={} as any;
 openModalforaction(modal: any, request: any,){
  console.log("request",request)
  //this.actionsDetails=request;
     let parsedOldValue = {};

  if (request.oldValue) {
    try {
      parsedOldValue = JSON.parse(request.oldValue);
    } catch (e) {
      console.error("Parsing error for oldValue:", request.oldValue);
    }
  }

  this.actionsDetails = {
    ...request,
    oldValue: parsedOldValue
  };
  this.actionsDetails.fieldName=request.fieldName;
  this.actionsDetails.moduleName=request.moduleName;
  console.log("this.actionsDetails",this.actionsDetails)
    this.modalService.open(modal, { centered: true, backdrop: 'static' });
 }
mergedValues: any[] = [];
openModalfornewvalueAction(modal: any, request: any) {
  // Parse oldValue and newValue
  let parsedOldValue = {};
  let parsedNewValue = {};
  if (request.oldValue) {
    parsedOldValue = JSON.parse(request.oldValue);
  }
  if (request.newValue) {
    parsedNewValue = JSON.parse(request.newValue);
  }
  // Parse meta (ChangedFields)
  let parsedMeta: any = {};
  if (request.meta) {
    parsedMeta = JSON.parse(request.meta);
  }
  this.actionsDetails = {
    ...request,
    oldValue: parsedOldValue,
    newValue: parsedNewValue,
    changedFields: parsedMeta?.ChangedFields ?? {}  // <<--- Correct extraction
  };
  const oldVal = this.actionsDetails.oldValue ?? {};
  const newVal = this.actionsDetails.newValue ?? {};
  const changedFields = this.actionsDetails.changedFields ?? {}; // <<--- Correct reference
  // Merge keys
  const keys = new Set([
    ...Object.keys(oldVal),
    ...Object.keys(newVal),
  ]);

  // Build merged list
  this.mergedValues = Array.from(keys).map(key => ({
    key,
    oldValue: oldVal[key],
    newValue: newVal[key],
    isChanged: this.isFieldChanged(key, changedFields)
  }));
  this.modalService.open(modal, { centered: true, backdrop: 'static' });
}
isFieldChanged(objectKey: string, changedFields: any): boolean {
  if (!changedFields) return false;

  const normalizedKey = objectKey.replace(/\s+/g, "").toLowerCase();
  const changedKeys = Object.keys(changedFields).map(k =>
    k.replace(/\s+/g, "").toLowerCase()
  );

  return changedKeys.includes(normalizedKey);
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
      console.log("payload", this.requestBody)

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
                ? 'Employee Info request approved successfully'
                : 'Employee Info request rejected successfully'
            );
          } else {
            // this.openModal(this.leaveSummary, null, this.conformationstatus);
               this.openlgModal(this.leaveSummary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);

          }
             this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              employeinfo: true,
            }));
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
          this.getemployeeinfoapprovals();
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
          this.updateStageStatus();
          this.responseSummary = response.data;
          this.totalRecordCount = this.responseSummary.totalRecordCount;
          this.successRecordsCount = this.responseSummary.successRecordsCount;
          this.failureRecordsCount = this.responseSummary.failureRecordsCount;
          if (!this.selectedLeavesItems || this.selectedLeavesItems.length === 0) {
            // Single
            this.conformationPopup.openSuccessModal(
              this.conformationstatus === 'Processed'
                ? 'Employee Info request approved successfully'
                : 'Employee Info request rejected successfully'
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
          this.getemployeeinfoapprovals();
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
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=${environment.pendingapprovalemployeid}&EmployeeId=${this.empinfo.employeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
       this.http.updatePendingApprovalCounts(this.totalCount);
   //Map counts to tabs
    });
  }

  // select all Check if ALL entries in ALL days are selected
  areAllDaysSelected(): boolean {
    if (!this.empinfodata || this.empinfodata.length === 0) return false;
    return this.empinfodata.every(
      (day, i) =>
        day.entries &&
        this.selectedMap[i] &&
        day.entries.length === this.selectedMap[i].length
    );
  }

  //select all Show indeterminate when partial selection exists
  isGlobalIndeterminate(): boolean {
    if (!this.empinfodata || this.empinfodata.length === 0) return false;
    const totalEntries = this.empinfodata.reduce(
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
    if (!this.empinfodata || this.empinfodata.length === 0) return;
    if (isChecked) {
      this.showhideaction = false;
      this.empinfodata.forEach((day, i) => {
        this.selectedMap[i] = [...day.entries];
      });
    } else {
      this.showhideaction = true;
      this.selectedMap = {};
    }
    this.syncGlobalSelectedEntries();
  }
    showdate(data:any):boolean{
    if(data?.sourceFieldName =='Dob' && data.oldValue && data.oldValue!='-'){
      return true
    }
    return false
  }
  showdatefornew(data:any):boolean{
  if(data?.sourceFieldName =='Dob' && data.newValue && data.newValue!='-'){
      return true
    }
    return false
  }

    onViewAttachement(url: any,content:any) {
    const lowerUrl = url?.toLowerCase();
    if (lowerUrl?.endsWith('jpg') || lowerUrl?.endsWith('jpeg') || lowerUrl?.endsWith('png')) {
      this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', url).subscribe({
        next: (res: any) => {
          const blob = new Blob([res['body']], { type: 'image/png' });
          const objectURL = URL.createObjectURL(blob);
          this.ImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.ViewURL = null;
          this.toggleViewModal(content);
        },
        error: (err) => console.error('Error downloading image:', err),
      });
    } else if (lowerUrl?.endsWith('pdf')) {
      this.ImageUrl = null;
      this.ViewURL = `${environment.viewUrl}${url}`; // assumed to be full URL
      this.toggleViewModal(content);
    } else {
      // fallback for other types if needed
      this.ImageUrl = null;
      this.ViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModal(content);
    }
  }

  toggleViewModal(content:any) {
    this.modalService.dismissAll();
    this.modalService.open(content, { size: 'xl', centered: true, backdrop: 'static', keyboard: false });
  }
  // destroy the component

  closeonlyattemchment(){
    this.modalService.dismissAll();
    this.ImageUrl = null;
    this.ViewURL = null;
    this.modalService.open(this.popupforaction, {  centered: true, backdrop: 'static', keyboard: false });
  }
 closeonlyattemchmentforcurrent(){
    this.modalService.dismissAll();
    this.ImageUrl = null;
    this.ViewURL = null;
    this.modalService.open(this.popupforcurrentaction, {  centered: true, backdrop: 'static', keyboard: false });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    this.subscription?.unsubscribe();
    this.http.setEmployeeIdTimesheet({}, 0, null);
  }
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
    //funtion to update the stage status of the leave request
  updateStageStatus() {
    let data= this.checklistdata;
    let id = data.find((item: any) => item.moduleId === environment.pendingapprovalemployeid).id;
    let paylod={
      id:id,
      employeeId: this.empinfo.employeeId,
      moduleId: environment.pendingapprovalemployeid,
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

import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbPopoverModule, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Table, TableModule } from 'primeng/table';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ConfirmationIconComponent } from '../../../../icons/confirmation-icon/confirmation-icon.component';
import { InfoIconComponent } from '../../../../icons/info-icon/info-icon.component';
import { DateformatPipe } from '../../../../pipes/dateformat.pipe';
import { AuthService } from '../../../../services/auth.service';
import { FormValidationsService } from '../../../../services/form-validations.service';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { ExpenseApprovalResponse, IExpenseHeaders } from '../../../../Interfaces/claimsandexpenses.model';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxDocViewerModule } from "ngx-doc-viewer";
import { Router } from '@angular/router';
import { OffboardingReloadService } from '../../../../services/offboarding-reload.service';
import moment from 'moment';

@Component({
  selector: 'app-expenses-approvals',
  imports: [CommonModule,
    NgbPopoverModule,
    FormsModule,
    PaginatorModule,
    TranslateModule,
    DropdownModule,
    DateformatPipe,
    NoDataFoundComponent,
    TableModule,
    DataLoaderContentComponent,
    InfoIconComponent, ConfirmationIconComponent, ReactiveFormsModule,
    FormsModule, NgxDocViewerModule],
  templateUrl: './expenses-approvals.component.html',
  styleUrl: './expenses-approvals.component.scss'
})
export class ExpensesApprovalsComponent {
 totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  LOGIN: any;
  searchValue: any | null;
  spinnerLoader = false;
  multiSelect = false;
  issubmitdiable = false;
  dataLoad = false;
  isSelectAll: boolean = false;
  expensess = new BehaviorSubject<any[]>([]);
  selectedexpensesData = {} as any;
  selectedSandwichItem: any = null;
  expensessselect=[] as any;
  selectedProducts= [] as any[];
  responseSummary!: any;
  requestBody = {} as any;
  @ViewChild('expensesSummary') expensesSummary: any;
  @ViewChild('dt') table!: Table;
 selectedexpensesStatus: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
dataforprocess:any;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  totalCount: any;

  onRowsChange() {
    this.first = 0;
  }

  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }
  checklistdata:any;
  expenseImageUrl: any;
  expenseViewURL: any;
  expenseheaderiteams!: IExpenseHeaders;
  updataid!: number;
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  verifiedExpenseIds: number[] = [];
  verifyModalRef: NgbModalRef | null = null;
  isVerified: boolean = false;
  verifyForm!: FormGroup;
  subscription!:Subscription;
  rejectForm!:FormGroup
  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public formsValidation: FormValidationsService,
    public rbac: RbacService, private signalService: SignalsService,
    private auth:AuthService, private sanitizer: DomSanitizer, private sharedModalService: OpenModalService,  private fb: FormBuilder,public router: Router,
    private reloadService: OffboardingReloadService
  ) { }

  ngOnInit(): void {
    this.LOGIN = JSON.parse(localStorage.getItem('personaldata') || '{}');
    this.getinitateoffboardingdata()
    this.getAllPendingApprovals();
  }
 getinitateoffboardingdata(){
  this.http.getData(`OffboardingTracker/employee/${this.LOGIN.employeeId}`).pipe(takeUntil(this.destroy$)).subscribe({
    next:(data:any)=>{
    console.log('Offboarding data:', data);
    this.checklistdata = data.data ||[];
    },
    error:(err:any)=>{
      console.log(err)
    }
  });

}
onStatusRejectSelect(status: string) {
  this.selectedexpensesStatus = status;
  if (status === 'reject') {
    this.selectedexpensesData.comments = 'Rejected';
  }
  // else if (status === 'planned') {
  //   this.selectedexpensesData.comments = 'Planned expenses';
  // } else if (status === 'unplanned') {
  //   this.selectedexpensesData.comments = 'Unplanned expenses';
  // }
}
onStatusRejectSelect2(status: string) {
  this.selectedexpensesStatus = status;
  if (status === 'reject') {
      this.rejectForm.get('comments')?.setValue('Rejected');
    }
  // else if (status === 'planned') {
  //   this.selectedexpensesData.comments = 'Planned expenses';
  // } else if (status === 'unplanned') {
  //   this.selectedexpensesData.comments = 'Unplanned expenses';
  // }
}
//select check
  hasSelectedAllOnce = false;
  selectCheck(value: any) {
    this.multiSelect = Array.isArray(value) && value.length > 0;

    if (!value || value.length === 0) {
      this.selectedProducts = [];
      this.hasSelectedAllOnce = false;
      return;
    }

    const stageMap: { [stage: string]: any[] } = {};

    value.forEach((item: any) => {
      const stage = item.approvalHeader?.currentapprovalStage;
      if (!stageMap[stage]) {
        stageMap[stage] = [];
      }
      stageMap[stage].push(item);
    });

    const stages = Object.keys(stageMap);
    const totalAvailable = this.expensess?.getValue().length || 0;
    const totalSelected = value.length;
    const isBulkSelect = totalSelected === totalAvailable;

    if (isBulkSelect && stages.length > 1) {
      if (this.hasSelectedAllOnce) {
        this.conformationPopup.openErrorModal('You can only select records from the same approval stage');
      }

      this.hasSelectedAllOnce = true;

      let dominantStage = stages[0];
      let maxCount = stageMap[dominantStage].length;

      for (const stage of stages) {
        const count = stageMap[stage].length;
        if (count > maxCount || (count === maxCount && stage === '1')) {
          dominantStage = stage;
          maxCount = count;
        }
      }

      const dominantItems = stageMap[dominantStage];
      this.selectedProducts = [...dominantItems];
      setTimeout(() => this.updateTableSelectionState(dominantItems));
      return;
    }

    if (!isBulkSelect && stages.length > 1) {
      this.conformationPopup.openErrorModal('You can only select records from the same approval stage');
      const validStage = this.selectedProducts[0]?.approvalHeader?.currentapprovalStage;
      const newSelection = value.filter(
        (item: { approvalHeader: { currentapprovalStage: string; }; }) => item.approvalHeader?.currentapprovalStage === validStage
      );
      this.selectedProducts = [...newSelection];
      setTimeout(() => this.updateTableSelectionState(newSelection));
      return;
    }

    this.selectedProducts = [...value];
  }


  private updateTableSelectionState(selectedItems: any[]) {
    this.selectedProducts = [...selectedItems];

    if (this.table) {
      this.table.selection = null;
      setTimeout(() => {
        this.table.selection = selectedItems;
      });
    }
  }

  previousSearchValue: string = '';
  onSearchChange(): void {
    if (this.searchValue !== this.previousSearchValue) {
      this.previousSearchValue = this.searchValue;
      this.multiSelect = false;
      this.selectedProducts = [];
      this.hasSelectedAllOnce = false;
      this.updateTableSelectionState([]);
    }
  }

  getFilteredAndSortedexpensess(): any[] {
    const search = this.searchValue?.toLowerCase() ?? '';
    let expensess = this.expensessselect ?? [];

    if (search) {
      expensess = expensess.filter((item: any) =>
        item.empId?.toString().toLowerCase().includes(search) ||
        item.employeeName?.toLowerCase().includes(search) ||
        item.expenses_Title?.toLowerCase().includes(search) ||
        item.applied_date?.toLowerCase().includes(search) ||
        item.totalExpenseAmount?.toString().toLowerCase().includes(search)
      );
    }

    // Sort (preserve original sorting logic)
    if (!this.selectedProducts || this.selectedProducts.length === 0) {
      this.expensess.next(expensess);
      return this.expensess.getValue();
    }

    const selectedIds = new Set(this.selectedProducts.map(item => item.approvalHeader?.id));
    const selected = expensess.filter((item:any) => selectedIds.has(item.approvalHeader?.id));
    const unselected = expensess.filter((item:any) => !selectedIds.has(item.approvalHeader?.id));
    this.expensess.next([...selected, ...unselected]);
    return this.expensess.getValue();
  }

//get all pending approvals
  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.LOGIN.employeeId);
    let moduleId = environment.expensesModuleId;
    this.dataLoad = true;
     let url:any;
    if(this.isActive('/approval-requests')){
       url = `Timeoff/GetEmployeeDataByModule?moduleId=${moduleId}&employeeId=${EmployeeId}&reportingManagerId=${EmployeeId}`;
      }else{
       url = `Timeoff/GetEmployeeDataByModule?moduleId=${moduleId}&employeeId=${EmployeeId}`;
      }
    this.http.getData(url).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.expensess.next(response?.modules[0].data);
          console.log(response?.modules);

          this.expensessselect = response?.modules[0].data;
        },
        error: (reason) => {
          this.dataLoad = false;
        },
        complete: () => {
          this.dataLoad = false;
        }
      });
  }

  ifreasonnull(Value: any) {
    if (!Value || !Value.trim()) {
      this.issubmitdiable = true;
       this.selectedexpensesStatus = null;
    } else {
      this.issubmitdiable = false;
    }
  }

  canBulkApprove(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader?.currentapprovalStage !==
        item.approvalHeader?.finalapprovalStage

    );
  }

  canBulkProcess(): boolean {
    return this.selectedProducts?.every(
      (item) =>
        item.approvalHeader?.currentapprovalStage ===
        item.approvalHeader?.finalapprovalStage
    );
  }

  rejectexpenses(rejectPopup: any, selecteddata: any) {
    this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
    this.selectedexpensesData = selecteddata;
  }

  bulkapprove(approverPopup: any) {
    this.modalService.open(approverPopup, {
      centered: true,
      backdrop: 'static',
    });
  }
processpopup(approverPopup: any, selecteddata?: any) {
  this.dataforprocess=selecteddata;
  console.log(this.dataforprocess);

this.modalService.open(approverPopup, { centered: true, backdrop: 'static' });
}
  bulkReject(rejectPopup: any) {
    this.modalService.open(rejectPopup, { centered: true, backdrop: 'static' });
  }

  bulkProcess() {
    this.handleProcess(this.expensess);
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
  }
//reject expenses
  handleReject(form: any) {
    let loggedinuser= this.auth.getToken()
    this.spinnerLoader = true;
    let approvedBy =loggedinuser.employeeId.toString();
    let comments = this.selectedexpensesData?.comments || '';
    if (this.selectedProducts && this.selectedProducts.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: comments,
        isPlannedexpenses: false,
        moduleId: environment.expensesModuleId,
        headerRequests: this.selectedProducts.map((item) => ({
          headerID: item.pendingApprovalsHeader.id,
          currentStage: item.pendingApprovalsHeader.currentapprovalStage
        }))
      }
    } else {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Rejected',
        comments: comments,
        isPlannedexpenses: false,
        moduleId: environment.expensesModuleId,
        headerRequests: [
          {
            headerID: this.selectedexpensesData.pendingApprovalsHeader?.id,
            currentStage: this.selectedexpensesData.pendingApprovalsHeader?.currentapprovalStage,
          },
        ],
      };
    }
    this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.responseSummary = response.data;
          this.updateStageStatus();
          if (this.selectedProducts && this.selectedProducts.length <= 0) {
            if(this.selectedProducts.length > 1){
            this.signalService.handleResponse(this.responseSummary, 'Selected expenses requests rejected successfully');
            } else{
            this.signalService.handleResponse(this.responseSummary, 'Expenses request rejected successfully');
            }
          } else {
            this.openModal(this.expensesSummary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
          }
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else {
            this.conformationPopup.openErrorModal('expenses Request Rejected Failed');
          }
          this.spinnerLoader = false;
          form.resetForm();
        },
        complete: () => {
          form.resetForm();
          this.spinnerLoader = false;
          this.multiSelect = false;
          this.signalService.timeOffsidenavCountSignal.set(true);
          this.getAllPendingApprovals();
          this.selectedProducts = [];
          this.searchValue = null;

          // Trigger layout reload
          this.reloadService.triggerReload();
        },
      });
  }

  handleProcess(selecteddata: any) {
    let loggedinuser= this.auth.getToken()
    this.selectedexpensesData = selecteddata;
    let approvedBy = loggedinuser.employeeId.toString();
    let message = null;
    if (this.selectedProducts && this.selectedProducts.length > 0) {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.expensesModuleId,
        headerRequests: this.selectedProducts.map((item) => ({
          headerID: item.pendingApprovalsHeader.id,
          currentStage: item.pendingApprovalsHeader.currentapprovalStage
        }))
      }
      message = 'Processing Selected Expenses Requests...';
    } else {
      this.requestBody = {
        requestProcessedBy: approvedBy,
        status: 'Processed',
        moduleId: environment.expensesModuleId,
        headerRequests: [
          {
            headerID: this.selectedexpensesData.pendingApprovalsHeader?.id,
            currentStage: this.selectedexpensesData.pendingApprovalsHeader?.currentapprovalStage,
          },
        ],
      };
      message = 'Processing Selected Expenses Requests...';
    }
    this.conformationPopup.openLoaderModal(message);
    this.http.putData(`v2/PendingApproval/multiapprovals`, this.requestBody).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.responseSummary = response.data;
          this.updateStageStatus();
          if (this.selectedProducts && this.selectedProducts.length <= 0) {
            if(this.selectedProducts.length > 1){
            this.signalService.handleResponse(this.responseSummary, 'Selected expenses requests processed successfully');
            }else{
            this.signalService.handleResponse(this.responseSummary, 'Expenses request processed successfully');
            }
          } else {
            this.openModal(this.expensesSummary);
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 5000);
          }
        },
        error: (reason: any) => {
          this.modalService.dismissAll();
          if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else if (reason.error.statusCode == 400) {
            this.conformationPopup.openErrorModal(reason.error.message)
          }
          else {
            this.conformationPopup.openErrorModal('Expenses Request Processed Failed');
          }
        },
        complete: () => {
          this.multiSelect = false;
          this.signalService.timeOffsidenavCountSignal.set(true);
          this.getAllPendingApprovals();
          this.selectedProducts = [];
          this.searchValue = null;
        },
      });
  }

  closeSummary() {
    this.modalService.dismissAll();
    this.responseSummary = null;
  }
//funtion to update the stage status of the leave request
  updateStageStatus() {
    let loggedInUserId = this.auth.getToken();
    let data= this.checklistdata;
    let id = data.find((item: any) => item.moduleId === environment.expensesModuleId).id;
    let paylod={
      id:id,
      employeeId: this.LOGIN.employeeId,
      moduleId: environment.expensesModuleId,
      reportingManagerId:this.LOGIN.employeeId,
      completedBy:loggedInUserId.employeeId,
      completedAt:moment().format('YYYY-MM-DD'),
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
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
  viewItem(expid: number) {
    this.updataid = expid;
    this.http
      .getitembyid(`Expenses_Header/getby_Expense_ID`, expid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.expenseheaderiteams = data;
        },
        error(err) {
          console.log('expensesheadererror', err);
        },
      });
  }
  openSandwichBreakdown(item: any, modal: any) {
    this.selectedSandwichItem = item;
    this.modalService.open(modal, { centered: true, backdrop: 'static', size: 'lg' });
  }

  onViewAttachement(url: any) {
    const lowerUrl = url?.toLowerCase();

    if (
      lowerUrl?.endsWith('jpg') ||
      lowerUrl?.endsWith('jpeg') ||
      lowerUrl?.endsWith('png')
    ) {
      this.subscription = this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', url)
        .subscribe({
          next: (res: any) => {
            const blob = new Blob([res['body']], { type: 'image/png' });
            const objectURL = URL.createObjectURL(blob);
            this.expenseImageUrl =
              this.sanitizer.bypassSecurityTrustUrl(objectURL);
            this.expenseViewURL = null;
            this.toggleViewModal();
          },
          error: (err) => console.error('Error downloading image:', err),
        });
    } else if (lowerUrl?.endsWith('pdf')) {
      this.expenseImageUrl = null;
      this.expenseViewURL = `${environment.viewUrl}${url}`; // assumed to be full URL
      this.toggleViewModal();
    } else {
      // fallback for other types if needed
      this.expenseImageUrl = null;
      this.expenseViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModal();
    }
  }
  toggleViewModal() {
    this.modalService.dismissAll();
    this.openModal(this.viewattamchment);
  }
  isImageFile(url: any): boolean {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return (
      lowerUrl.endsWith('.jpg') ||
      lowerUrl.endsWith('.jpeg') ||
      lowerUrl.endsWith('.png')
    );
  }
     selectedItem: any = null;
  openVerifyModal(item: any, content: any) {
    this.verifyModalRef = this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeVerifyForm();
    this.selectedItem = item; // store clicked item
  }
    intializeVerifyForm() {
    this.verifyForm = this.fb.group({
      comments: [
        '',
        [Validators.required, Validators.maxLength(250)],
      ],
    });
  }
 handleVerify(verifyForm: FormGroup): void {
  if (!verifyForm.valid || !this.selectedItem) return;

  const formData = verifyForm.value;
  const verifiedItem = this.selectedItem;

  const requestBody = {
    isVerified: true,
    verifiedBy: this.LOGIN.employeeId?.toString(),
    verifiedByName: `${this.LOGIN.firstName || ''} ${this.LOGIN.lastName || ''}`.trim(),
    comments: formData.comments
  };

  this.http.putData(`Expenses_Header/ExpensesItemUpdate/${verifiedItem.expenseitem_id}`, requestBody)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        // Close only the Verify modal
        this.verifyModalRef?.close();

        // Show success popup
        this.sharedModalService.openSuccessModal('Expense item verified successfully');

        // Update local UI immediately
        if (this.expenseheaderiteams?.expenseitem?.length) {
          const idx = this.expenseheaderiteams.expenseitem.findIndex(
            it => it.expenseitem_id === verifiedItem.expenseitem_id
          );
          if (idx > -1) {
            this.expenseheaderiteams.expenseitem[idx].isVerified = true;
          }
        }

        this.selectedItem = null;

        // Update verified IDs for template checks
        this.verifiedExpenseIds.push(verifiedItem.expenseitem_id);

        // Refresh headers in background, but the modal stays open
        this.getAllPendingApprovals();
      },
      error: (err: any) => {
        this.verifyModalRef?.close();
        this.sharedModalService.openErrorModal(err?.error?.Message || 'Verification failed');
      }
    });
}
 onSelectDownload(file: any): void {
    this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file).subscribe({
      next: (res: any) => {
        // Check if the response body is of type Blob
        const blob: Blob = res.body as Blob;
        if (!blob) {
          return;
        }
        // Extract filename from 'content-disposition' header if available
        const contentDisposition = res.headers.get('content-disposition');
        let fileName = 'defaultFileName.pdf'; // Default filename
        if (contentDisposition) {
          const fileNameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
            contentDisposition
          );
          if (fileNameMatch !== null && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
          }
        } else {
          // Extract filename from the original file path if 'content-disposition' is not available
          const filePath = file;
          const parts = filePath.split('/');
          fileName = parts[parts.length - 1] || 'defaultFileName.pdf';
        }
        // Create a link element and trigger the download
        const a = document.createElement('a');
        const url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        // Clean up
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: (reason) => {
        console.error('File download error:', reason);
      },
    });
  }
    openRejectModal(content: any, request: ExpenseApprovalResponse | IExpenseHeaders) {
      this.modalService.open(content, { centered: true, backdrop: 'static' });
      this.intializeRejectForm();
      this.selectedexpensesData = request as any;
    }
      intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
     this.rejectForm.get('comments')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedexpensesStatus = null; // remove chip highlight if cleared
    }
  });
  }
   onStatusVerifySelect(status: string) {
    this.selectedexpensesStatus = status;

    if (status === 'verified') {
      this.verifyForm.get('comments')?.setValue('Verified');
    }
  }
  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

}

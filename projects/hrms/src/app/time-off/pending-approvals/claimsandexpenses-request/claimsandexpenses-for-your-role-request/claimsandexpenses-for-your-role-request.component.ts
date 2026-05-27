import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IJob } from '../../../../Interfaces/letters-model';
import { NgbModal, NgbModalRef, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../../services/open-modal.service';
import { HttpService } from '../../../../services/http.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { DateformatPipe } from '../../../../Pipes/dateformat.pipe';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ExpenseApprovalResponse } from '../../../../Interfaces/timoff-model';
import { TranslateModule } from '@ngx-translate/core';
import { IExpenseHeaders, IExpensePolicy } from '../../../../Interfaces/claimsandexpenses.model';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { RbacService } from '../../../../services/rbac.service';
import { SignalsService } from '../../../../services/signals.service';
import { SearchfordeskPipe } from "../../../../Pipes/searchfordesk.pipe";
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { FormValidationsService } from '../../../../services/form-validations.service';
import { ConfirmationIconComponent } from "../../../../icons/confirmation-icon/confirmation-icon.component";
import { Router, RouterOutlet } from '@angular/router';
import moment from 'moment';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-claimsandexpenses-for-your-role-request',
  imports: [
    DateformatPipe,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NoDataFoundComponent,
    PaginatorModule,
    DropdownModule,
    NgbPopoverModule,
    TranslateModule,
    NgxDocViewerModule,
    SearchfordeskPipe,
    InfoIconComponent,
    DataLoaderContentComponent,
    ConfirmationIconComponent,
    SelectModule
],

  templateUrl: './claimsandexpenses-for-your-role-request.component.html',
  styleUrl: './claimsandexpenses-for-your-role-request.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ClaimsandexpensesForYourRoleRequestComponent
  implements OnInit, OnDestroy {
  totalRecords = 100;
  searchValue: any;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  expenseheaderpending = [] as ExpenseApprovalResponse[];
  approverComments = [] as any[];
  loading: boolean = false;
  selectedLeaveData = {} as ExpenseApprovalResponse;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  markAsPaidForm!: FormGroup;
  checklistdata: IExpensePolicy[] = [];
  expenseImageUrl: any;
  expenseViewURL: any;
  storeapprovalRequest!: ExpenseApprovalResponse;
  expenseheaderiteams!: IExpenseHeaders;
  updataid!: number;
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  // approverComments = [] as AttendanceRequestC[];
  @ViewChild('commentspopup') modalContent: any;
  @ViewChild('checklistconfirmationmodal') checklistconfirmationmodal: any;
  subscription!: Subscription;
  verifiedExpenseIds: number[] = [];
  verifyModalRef: NgbModalRef | null = null;
  isVerified: boolean = false;
  verifyForm!: FormGroup;
  selectedLeaveStatus: any;
  totalCount: any;
  paymentmodedata= [] as any[];
  currentOpenExpensesId: number | null = null;
  allVerifiedMap: Map<number, boolean> = new Map<number, boolean>();
  constructor(
    private modalService: NgbModal,
    private signalService: SignalsService,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    private sanitizer: DomSanitizer,
    public rbac: RbacService,
    public formsValidation: FormValidationsService,
    private router: Router
  ) { }
isloading: boolean = false;
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPendingApprovals();
    this.getCheckListData();
    this.getpaymentmode();
  }
   getpaymentmode() {
    this.subscription = this.http.getData("entityAttributeValues?entity=ExpensesPaymentModeConfiguration&attribute=PaymentMode").subscribe({
      next: (data: any) => {
        this.paymentmodedata = data as any[];
      },
      error: () => {
 
      },
      complete: () => {
 
      },
    })
  }
 getCheckListData() {
    this.http
      .getData(`ExpensesCheckListConfiguration/getall`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.checklistdata = response.data
        },
        error: () => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        }
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
  onStatusVerifySelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'verified') {
      this.verifyForm.get('comments')?.setValue('Verified');
    }
  }


  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: [
        '',
        [Validators.required, Validators.maxLength(250)],
      ],
    });
    this.approveForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null; // remove chip highlight if cleared
      }
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: [
        '',
        [Validators.required, Validators.maxLength(250)],
      ],
    });
    this.rejectForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null; // remove chip highlight if cleared
      }
    });
  }
 intializeMarkAsPaidForm() {
    this.markAsPaidForm = this.fb.group({
      paymentDate: ['', [Validators.required]],
      paymentMode: ['', [Validators.required]],
      transactionId: ['', [ Validators.maxLength(50), Validators.pattern(/^[^\s].*$/)]],
      comments: ['', [Validators.maxLength(500)]]
    });
  }
  getAllPendingApprovals() {
    this.loading = true;
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=19&approvedType=ROLE`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          this.expenseheaderpending = (
            response.data as ExpenseApprovalResponse[]
          ).filter(
            (item) =>
              item.approvalHeader.status != 'Processed' &&
              item.approvalHeader.status != 'Rejected'
          );
          if (this.currentOpenExpensesId) {
            this.viewItem(this.currentOpenExpensesId);
          }
          this.refreshAllVerifiedStates();
        },
        error: (reason) => {
          this.loading = false;
        },
        complete: () => {
          this.loading = false;
        },
      });
  }

  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });
  }

  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  openApproveModal(content: any, request: ExpenseApprovalResponse) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeApproveForm();
    this.selectedLeaveData = request;
  }
  minPaymentDate!: string;
  openMarkAsPaidModal(content: any, request: ExpenseApprovalResponse) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeMarkAsPaidForm();
    this.selectedLeaveData = request;
    const appliedDate = moment(request.entity.applied_date);
    const today = moment();
  // Get latest date between applied date and today
  this.minPaymentDate = moment.max(appliedDate, today).format('YYYY-MM-DD');
    console.log("selectedLeaveDatagvhcvbn",this.selectedLeaveData)
  }
  openRequiredCalrificationModal(content: any, request: ExpenseApprovalResponse) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeApproveForm();
    this.selectedLeaveData = request;
  }
  openRejectModal(content: any, request: ExpenseApprovalResponse | IExpenseHeaders) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeRejectForm();
    this.selectedLeaveData = request as any;
  }

  handleAccept(approveForm: FormGroup): void {
    this.isloading= true;
    if (approveForm.valid) {
      const formData = approveForm.value;
      const requestBody = {
        status: 'Approved',
        comments: formData.comments,
        approvedBy: this.empinfo.employeeId.toString(),
        currentStage: parseInt(
          this.selectedLeaveData.approvalHeader.currentapprovalStage
        ),
      };
      this.sharedModalService.openLoaderModal(
        'Approving Request, Please wait...'
      );
      this.http
        .putData(
          `PendingApproval/${this.selectedLeaveData.approvalHeader.id}`,
          requestBody
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.isloading=false;
            this.modalService.dismissAll();
            this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
            this.sharedModalService.openSuccessModal(
              'Expense request approved successfully'
            );
            this.approveForm.reset();
            this.http.setnewcountDetails();
            this.selectedLeaveData = {} as ExpenseApprovalResponse;
            this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              expenses: true,
            }));
          },
          error: (reason: any) => {
            this.isloading=false;
            this.modalService.dismissAll();
            this.sharedModalService.openErrorModal(reason.error.Message);
          },
          complete: () => {
            this.http.triggerActionSignal();
            this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            this.getAllPendingApprovals();
            this.getApprovalStatusCounts();
          },
        });
    }
  }

  handleReject(rejectForm: FormGroup): void {
    this.isloading = true;
    if (rejectForm.valid) {
      const formData = rejectForm.value;
      const requestBody = {
        status: 'Rejected',
        comments: formData.comments,
        approvedBy: this.empinfo.employeeId.toString(),
        currentStage: parseInt(
          this.selectedLeaveData.approvalHeader.currentapprovalStage
        ),
      };
      this.sharedModalService.openLoaderModal(
        'Rejecting Request, Please wait...'
      );
      this.http
        .putData(
          `PendingApproval/${this.selectedLeaveData.approvalHeader.id}`,
          requestBody
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.isloading=false;
            this.modalService.dismissAll();
            this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
            this.sharedModalService.openSuccessModal(
              'Expense request rejected successfully'
            );
            this.rejectForm.reset();
            this.http.setnewcountDetails();
            this.selectedLeaveData = {} as ExpenseApprovalResponse;
            this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              expenses: true,
            }));
          },
          error: (reason: any) => {
            this.isloading=false;
            this.modalService.dismissAll();
            this.sharedModalService.openErrorModal(reason.error.Message);
          },
          complete: () => {
            this.http.triggerActionSignal();
            this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            this.getAllPendingApprovals();
            this.getApprovalStatusCounts();
          },
        });
    }
  }


  expensesCheckList(request: ExpenseApprovalResponse,action?: string): void {
    this.storeapprovalRequest = request;
     this.storeapprovalRequest.action=action || '';
     this.intializeApproveForm();
     this.selectedLeaveData = request;
     this.modalService.open(this.checklistconfirmationmodal, {
       centered: true,
       backdrop: 'static'
     });
  }

  isAllChecked(): boolean {
    return this.checklistdata.some(x => x.checked);
  }


  handleProcess(request: ExpenseApprovalResponse) {
    let requestBody = {
      status: 'Processed',
      approvedBy: this.empinfo.employeeId.toString(),
      currentStage: parseInt(
        this.selectedLeaveData?.approvalHeader?.currentapprovalStage
      ),
    };
    // this.sharedModalService.openLoaderModal(
    //   'Processing Request, Please wait...'
    // );
    this.http
      .putData(
        `PendingApproval/process/${request?.approvalHeader?.id}`,
        requestBody
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respone: any) => {
          this.isloading = false;
          this.modalService.dismissAll();
          this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
          this.http.setnewcountDetails();
          this.sharedModalService.openSuccessModal(
            'Expense request processed successfully'
          );
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            expenses: true,
          }));
        },
        error: (reason: any) => {
          this.isloading=false;
          this.modalService.dismissAll();
          reason.error.Message = reason.error.Message
            .replace(/^One or more errors occurred\.\s*/i, '')
            .replace(/[()]/g, '');
          this.sharedModalService.openErrorModal(reason.error.Message);
        },
        complete: () => {
          this.http.triggerActionSignal();
          this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
          this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          this.getAllPendingApprovals();
          this.getApprovalStatusCounts();
        },
      });
  }
  getApprovalStatusCounts() {
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=19&EmployeeId=${this.empinfo.employeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
       this.http.updatePendingApprovalCounts(this.totalCount);
    });
  }
 

  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, {
      centered: true,
      backdrop: 'static',
    });
    this.approverComments = value;
  }

  viewItem(expid: number) {
    this.updataid = expid;
    this.currentOpenExpensesId = expid;
    this.http
      .getitembyid(`Expenses_Header/getby_Expense_ID`, expid)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.expenseheaderiteams = data;
          const allDone = this.expenseheaderiteams.expenseitem?.length > 0 &&
            this.expenseheaderiteams.expenseitem.every((item: any) => item.isVerified === true);
          if (allDone) {
            this.allVerifiedMap.set(this.expenseheaderiteams.expenses_ID, true);
          }
        },
        error(err) {
          console.log('expensesheadererror', err);
        },
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
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });

    // Remove chip highlight if comment is cleared manually
    this.verifyForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null;
      }
    });
  }

  handleClarification(approveForm: FormGroup): void {
    this.isloading= true;
    if (approveForm.valid) {
      const formData = approveForm.value;
      const requestBody = {
        status: 'Required Clarification',
        comments: formData.comments,
        approvedBy: this.empinfo.employeeId.toString(),
        currentStage: parseInt(
          this.selectedLeaveData.approvalHeader.currentapprovalStage
        ),
      };
      this.sharedModalService.openLoaderModal(
        'Sending for Clarification, Please wait...'
      );
      this.http
        .putData(
          `PendingApproval/${this.selectedLeaveData.approvalHeader.id}`,
          requestBody
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            this.isloading=false;
            this.modalService.dismissAll();
            this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
            this.sharedModalService.openSuccessModal(
              'Expense request sent for clarification successfully'
            );
            this.approveForm.reset();
            this.http.setnewcountDetails();
            this.selectedLeaveData = {} as ExpenseApprovalResponse;
            this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              expenses: true,
            }));
          },
          error: (reason: any) => {
            this.isloading=false;
            this.modalService.dismissAll();
            this.sharedModalService.openErrorModal(reason.error.Message);
          },
          complete: () => {
            this.getAllPendingApprovals();
          },
        });
    }
  }
  refreshAllVerifiedStates(): void {
    this.expenseheaderpending.forEach(record => {
      const expId = record.entity.expenses_ID;
      if (!this.allVerifiedMap.has(expId)) {
        this.http.getitembyid(`Expenses_Header/getby_Expense_ID`, expId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (data: any) => {
              const allDone = data.expenseitem?.length > 0 &&
                data.expenseitem.every((item: any) => item.isVerified === true);
              if (allDone) {
                this.allVerifiedMap.set(expId, true);
              }
            }
          });
      }
    });
  }

  isAllVerifiedForRecord(expensesId: number): boolean {
    return this.allVerifiedMap.get(expensesId) === true;
  }

  handleVerify(verifyForm: FormGroup): void {
    this.isloading=true;
    if (!verifyForm.valid || !this.selectedItem) return;

    const formData = verifyForm.value;
    const verifiedItem = this.selectedItem;

    const requestBody = {
      isVerified: true,
      verifiedBy: this.empinfo.employeeId?.toString(),
      status: 'Verified',
      meta: JSON.stringify({
        addedBy: this.empinfo.employeeId?.toString(),
        addedComments: formData.comments,
        addedOn: moment().format('YYYY-MM-DD')
      })
    };

    this.http.putData(`Expenses_Header/ExpensesItemUpdate/${verifiedItem.expenseitem_id}`, requestBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isloading=false;
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

          this.verifiedExpenseIds.push(verifiedItem.expenseitem_id);

          if (this.expenseheaderiteams?.expenseitem?.length) {
            const allDone = this.expenseheaderiteams.expenseitem.every(
              it => it.isVerified === true || this.verifiedExpenseIds.includes(it.expenseitem_id)
            );
            if (allDone) {
              this.allVerifiedMap.set(this.expenseheaderiteams.expenses_ID, true);
            }
          }

          this.getAllPendingApprovals();
        },
        error: (err: any) => {
          this.isloading=false;
          this.verifyModalRef?.close();
          this.sharedModalService.openErrorModal(err?.error?.Message || 'Verification failed');
        }
      });
  }
confirmApproval(modal: any) {
this.isloading = true;
    const payload = this.checklistdata.map((item: any) => ({
      expenseHeaderId: this.storeapprovalRequest.approvalHeader.referenceEntityId,   // expense header id
      employeeId: this.storeapprovalRequest.entity.employeeId,            // current employee id
      checklistConfigurationId: item.id,          // checklist item id
      isChecked: item.checked || false,
      checkedBy: this.empinfo.employeeId,
      checkedAt: moment().format('YYYY-MM-DD'),
      comments: item.comments || '',
      createdAt: moment().format('YYYY-MM-DD'),
    }));
    this.http.postdata('ExpensesCheckListTracking', payload).subscribe({
      next: (res) => {
      if (res) {
        if(this.storeapprovalRequest.action === 'Approve') {
          this.handleAccept(this.approveForm);
        }
        else{
          this.handleProcess(this.storeapprovalRequest);
        }
      }
        this.storeapprovalRequest = {} as ExpenseApprovalResponse;
        modal.close();
      },
      error: (err) => {
        this.isloading=false;
        console.error(err);
      }
    });
  }
   markasPaid(modal: any) {
    this.isloading = true;
    if (!this.markAsPaidForm.valid || !this.selectedLeaveData) return;
    console.log(this.selectedLeaveData);
    
    const formData = this.markAsPaidForm.value;
    const verifiedItem = this.selectedLeaveData;

    const requestBody = {
      expenses_ID: this.selectedLeaveData.entity.expenses_ID,
      applied_date: this.selectedLeaveData.entity.applied_date || new Date().toISOString(),
      expenses_Title: this.selectedLeaveData.entity.expenses_Title || '',
      additional_details: '',
      status: 'Processed',
      expenseName: this.selectedLeaveData.entity.expenseType || '',
      currentRole: '',
      totalamount: this.selectedLeaveData.entity.totalExpenseAmount || 0,
      employeeId: this.selectedLeaveData.entity.employeeId,
      submissionDate: new Date().toISOString(),
      expense_Amount: this.selectedLeaveData.entity.totalExpenseAmount || 0,
      attachment_url: '',
      currentApprover: this.selectedLeaveData.currentApprover || '',
      nextApprover: '',
      approverEmail: '',
      comments: formData.comments || 'Marked as paid',
      isCheckListRequired: false,
      paymentDate: formData.paymentDate || new Date().toISOString(),
      paymentMode: formData.paymentMode || '',
      refTransactionId: formData.transactionId || '',
      expenseitem: []
    };

    this.http.putData(`Expenses_Header/updateexpenses?id=${this.selectedLeaveData.entity.expenses_ID}`, requestBody)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          if (res) {
            this.handleProcess(this.selectedLeaveData);
          }
          this.storeapprovalRequest = {} as ExpenseApprovalResponse;
          modal.close();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
onCancel(modal: any) {
  // 1. Reset form
  this.approveForm.reset();
  // 2. Reset checklist selection
  this.checklistdata.forEach(item => item.checked = false);
  // 4. Close modal
  modal.dismiss();
}

handleVerifyReject(verifyForm: FormGroup): void {
  if (!verifyForm.valid || !this.selectedItem) return;

  const formData = verifyForm.value;
  const verifiedItem = this.selectedItem;

  const requestBody = {
    isVerified: true,
    status: 'Rejected',
    meta: JSON.stringify({
    addedBy: this.empinfo.employeeId?.toString(),
    addedComments: formData.comments,
    addedOn: moment().format('YYYY-MM-DD')
  })
  };

  this.http.putData(`Expenses_Header/ExpensesItemUpdate/${verifiedItem.expenseitem_id}`, requestBody)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => {
        // Close only the Verify modal
        this.verifyModalRef?.close();

        // Show success popup
        this.sharedModalService.openSuccessModal('Expense item rejected successfully');

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
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
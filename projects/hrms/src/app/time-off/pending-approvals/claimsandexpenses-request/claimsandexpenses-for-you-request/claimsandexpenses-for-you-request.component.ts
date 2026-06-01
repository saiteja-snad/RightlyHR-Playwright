import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { IJob } from '../../../../Interfaces/letters-model';
import { NgbModal, NgbModalRef, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../../services/open-modal.service';
import { HttpService } from '../../../../services/http.service';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../../pipes/dateformat.pipe";
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ExpenseApprovalResponse } from '../../../../Interfaces/timoff-model';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';
import { environment } from '../../../../../environments/environment';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { RbacService } from '../../../../services/rbac.service';
import { noWhitespaceValidator } from '../../../../shared/nowhitespace/nowhitespace.component';
import { IExpenseHeaders } from '../../../../Interfaces/claimsandexpenses.model';
import { SignalsService } from '../../../../services/signals.service';
import { SearchfordeskPipe } from "../../../../pipes/searchfordesk.pipe";
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { FormValidationsService } from '../../../../services/form-validations.service';
import { ConfirmationIconComponent } from "../../../../icons/confirmation-icon/confirmation-icon.component";
import { DocumentViewIconComponent } from "../../../../icons/document-view-icon/document-view-icon.component";
@Component({
  selector: 'app-claimsandexpenses-for-you-request',
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
    DocumentViewIconComponent
],
  templateUrl: './claimsandexpenses-for-you-request.component.html',
  styleUrl: './claimsandexpenses-for-you-request.component.scss',
})
export class ClaimsandexpensesForYouRequestComponent
  implements OnInit, OnDestroy
{
  totalRecords = 100;
  first: any = 0;
  rows: any = 10;
  empinfo = {} as IJob;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  subscription!: Subscription;
  destroy$: Subject<boolean> = new Subject<boolean>();
  loading: boolean = false;
  expenseheaderpending = [] as ExpenseApprovalResponse[];
  approverComments = [] as any[];
  selectedLeaveData = {} as ExpenseApprovalResponse;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  searchValue: any;
  expenseImageUrl: any;
  expenseViewURL: any;
  expenseheaderiteams!: IExpenseHeaders;
  updataid!: number;
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  // approverComments = [] as AttendanceRequestC[];
  @ViewChild('commentspopup') modalContent: any;

  verifiedExpenseIds: number[] = [];
    verifyModalRef: NgbModalRef | null = null;
    isVerified: boolean = false;
    verifyForm!: FormGroup;

  selectedLeaveStatus: any;
  totalCount: any;


  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    private sanitizer: DomSanitizer,
    public rbac: RbacService,
    private signalService: SignalsService,
    public formsValidation: FormValidationsService,
  ) {}

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPendingApprovals();
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
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
     this.approveForm.get('comments')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
    }
  });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });
     this.rejectForm.get('comments')?.valueChanges.subscribe((value: string) => {
    if (!value || value.trim() === '') {
      this.selectedLeaveStatus = null; // remove chip highlight if cleared
    }
  });
  }

  getAllPendingApprovals() {
    this.loading = true;
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.http
      .getData(
        `PendingApproval/employee/${EmployeeId}?moduleId=19&approvedType=EMP`
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
        },
        error: (reason) => {
          this.loading = false;
        },
      });
  }
 getApprovalStatusCounts() {
    this.http.get(`PendingApproval/getApprovalStatusCounts?moduleId=19&EmployeeId=${this.empinfo.employeeId}`).subscribe((res: any) => {
      this.totalCount = res.reduce((acc: number, curr: any) => acc + curr.totalCount, 0);
       this.http.updatePendingApprovalCounts(this.totalCount);
    });
  }
  openModal(content: any) {
    this.modalService.open(content, {
      centered: true,
      size: 'xl',
      backdrop: 'static',
    });
  }

  openModalview(content: any) {
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

  openRejectModal(content: any, request: ExpenseApprovalResponse | IExpenseHeaders) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeRejectForm();
    this.selectedLeaveData = request as any;
  }

  handleAccept(approveForm: FormGroup): void {
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
            this.modalService.dismissAll();
            this.http.setnewcountDetails();
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            this.sharedModalService.openSuccessModal(
              'Expense request approved successfully'
            );
            this.approveForm.reset();
            this.selectedLeaveData = {} as ExpenseApprovalResponse;
            this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              expenses: true,
            }));
          },
          error: (reason: any) => {
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
            this.modalService.dismissAll();
            this.http.setnewcountDetails();
            this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
            this.sharedModalService.openSuccessModal(
              'Expense request rejected successfully'
            );
            this.rejectForm.reset();
            this.selectedLeaveData = {} as ExpenseApprovalResponse;
            this.http.tirggerPendingApprovalCountSignal.update((status) => ({
              ...status,
              expenses: true,
            }));
          },
          error: (reason: any) => {
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

  handleProcess(request: ExpenseApprovalResponse) {
    let requestBody = {
      status: 'Processed',
      approvedBy: this.empinfo.employeeId.toString(),
      currentStage: parseInt(
        this.selectedLeaveData?.approvalHeader?.currentapprovalStage
      ),
    };
    this.sharedModalService.openLoaderModal(
      'Processing Request, Please wait...'
    );
    this.http
      .putData(
        `PendingApproval/process/${request.approvalHeader?.id}`,
        requestBody
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respone: any) => {
          this.modalService.dismissAll();
          this.http.setnewcountDetails();
          this.signalService.clamisandexpensesForYouTriggerSignal.set(true);
          this.sharedModalService.openSuccessModal(
            'Expense request processed successfully'
          );
          this.http.tirggerPendingApprovalCountSignal.update((status) => ({
            ...status,
            expenses: true,
          }));
        },
        error: (reason: any) => {
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

  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, {
      centered: true,
      backdrop: 'static',
    });
    this.approverComments = value;
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
    verifiedBy: this.empinfo.employeeId?.toString(),
    verifiedByName: `${this.empinfo.firstName || ''} ${this.empinfo.lastName || ''}`.trim(),
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


  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
import { Component, OnInit, OnDestroy, ViewChild, effect } from '@angular/core';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { NgbModalRef, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { SearchfordeskPipe } from '../../../Pipes/searchfordesk.pipe';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { CommonModule } from '@angular/common';
import { IJob } from '../../../Interfaces/letters-model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subject, Subscription, takeUntil } from 'rxjs';
import { IExpenseHeaders } from '../../../Interfaces/claimsandexpenses.model';
import { DomSanitizer } from '@angular/platform-browser';
import { RbacService } from '../../../services/rbac.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../../services/http.service';
import { ExpenseApprovalResponse } from '../../../Interfaces/timoff-model';
import { SignalsService } from '../../../services/signals.service';
import { FormValidationsService } from '../../../services/form-validations.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { environment } from '../../../../environments/environment';
import { ConfirmationIconComponent } from '../../../icons/confirmation-icon/confirmation-icon.component';

@Component({
  selector: 'app-expenses',
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
    ConfirmationIconComponent
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent implements OnInit, OnDestroy {
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
  expenses = new BehaviorSubject<ExpenseApprovalResponse[]>([]);
  approverComments = [] as any[];
  loading: boolean = false;
  selectedLeaveData = {} as ExpenseApprovalResponse;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  verifyForm!: FormGroup;

  expenseImageUrl: any;
  expenseViewURL: any;
  expenseheaderiteams: IExpenseHeaders = {} as IExpenseHeaders;
  updataid!: number;
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  // approverComments = [] as AttendanceRequestC[];
  @ViewChild('commentspopup') modalContent: any;
  subscription!: Subscription;
  LOGIN: any;
  verifiedExpenseIds: number[] = [];
  verifyModalRef: NgbModalRef | null = null;
  isVerified: boolean = false;
  selectedLeaveStatus: any;

  constructor(
    private modalService: NgbModal,
    private signalService: SignalsService,
    private fb: FormBuilder,
    private http: HttpService,
    private sharedModalService: OpenModalService,
    private sanitizer: DomSanitizer,
    public rbac: RbacService,
    public formsValidation: FormValidationsService,
  ) {
    effect(() => {
      if (this.http.trigger()) {
        const data = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');
        if (data && Object.keys(data).length > 0) {
          this.LOGIN = data;
          this.getAllPendingApprovals();
        } else {
          this.expenses.next([]);
          this.expenseheaderpending = [];
        }
        this.http.resetTriggerSignal();
      }
    });
  }


  ngOnInit(): void {
    this.LOGIN = null;
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    const storedEmployee = JSON.parse(localStorage.getItem('onbehalfofaproverData') || '{}');

    if (storedEmployee && Object.keys(storedEmployee).length > 0) {
      this.LOGIN = storedEmployee;
      this.getAllPendingApprovals();
    } else {
      this.expenseheaderpending = [];
      this.expenses.next([]);
    }
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

  onStatusVerifySelect(status: string) {
    this.selectedLeaveStatus = status;

    if (status === 'verified') {
      this.verifyForm.get('comments')?.setValue('Verified');
    }
  }

  getAllPendingApprovals() {
    if (!this.LOGIN || !this.LOGIN.employeeId) {
      this.expenseheaderpending = [];
      this.expenses.next([]);
      this.loading = false;
      return;
    }

    this.loading = true;
    let EmployeeId = parseInt(this.LOGIN.employeeId);

    this.http
      .getData(`PendingApproval/employee/${EmployeeId}?moduleId=19`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.loading = false;

          if (response?.data?.length > 0) {
            this.expenseheaderpending = (response.data as ExpenseApprovalResponse[])
              .filter(item =>
                item.approvalHeader.status !== 'Processed' &&
                item.approvalHeader.status !== 'Rejected'
              );
          } else {
            this.expenseheaderpending = [];
            this.expenses.next([]);
          }
        },
        error: () => { this.loading = false; },
        complete: () => { this.loading = false; },
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

  openRejectModal(content: any, request: ExpenseApprovalResponse) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
    this.intializeRejectForm();
    this.selectedLeaveData = request;
  }

  handleAccept(approveForm: FormGroup): void {
    if (approveForm.valid) {
      const formData = approveForm.value;
      const requestBody = {
        status: 'Approved',
        comments: formData.comments,
        onBehalfOfApproval: true,
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
            this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
            this.sharedModalService.openSuccessModal(
              'Expense request approved successfully'
            );
            this.approveForm.reset();
            this.http.setnewcountDetailsforonBehalfof();
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
            this.getAllPendingApprovals();
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
        onBehalfOfApproval: true,
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
            this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
            this.sharedModalService.openSuccessModal(
              'Expense request rejected successfully'
            );
            this.rejectForm.reset();
            this.http.setnewcountDetailsforonBehalfof();
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
            this.getAllPendingApprovals();
          },
        });
    }
  }

  handleProcess(request: ExpenseApprovalResponse) {
    let requestBody = {
      status: 'Processed',
      approvedBy: this.empinfo.employeeId.toString(),
      onBehalfOfApproval: true,
      currentStage: parseInt(
        this.selectedLeaveData?.approvalHeader?.currentapprovalStage
      ),
    };
    this.sharedModalService.openLoaderModal(
      'Processing Request, Please wait...'
    );
    this.http
      .putData(
        `PendingApproval/process/${request?.approvalHeader?.id}`,
        requestBody
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (respone: any) => {
          this.modalService.dismissAll();
          this.signalService.claimsandexpensesForRoleTriggerSignal.set(true);
          this.http.setnewcountDetailsforonBehalfof();
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
          this.getAllPendingApprovals();
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
  loadingDetails = false;

  viewItem(expid: number) {
    this.updataid = expid;
    this.loadingDetails = true;
    const queryParams = { Expenses_ID: expid };
    this.http
      .getItembyid(`Expenses_Header/getby_Expense_ID`, queryParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          // ensure expense items array exists
          this.expenseheaderiteams = data || ({} as IExpenseHeaders);
          // normalize item fields if necessary
          this.expenseheaderiteams.expenseitem = this.expenseheaderiteams.expenseitem || [];
          this.loadingDetails = false;
        },
        error: (err) => {
          console.log('expensesheadererror', err);
          this.loadingDetails = false;
        },
      });
  }

  onSelectDownload(file: any): void {
    this.http
      .DownloadDataWithQuery('FileSystem/Downloadfile', file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
          this.verifyModalRef?.close();
          this.sharedModalService.openSuccessModal('Expense item verified successfully');
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
          this.getAllPendingApprovals();
        },
        error: (err: any) => {
          this.verifyModalRef?.close();
          this.sharedModalService.openErrorModal(err?.error?.message || 'Verification failed');
        }
      });
  }



  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
    localStorage.removeItem('onbehalfofaproverData');
  }
}
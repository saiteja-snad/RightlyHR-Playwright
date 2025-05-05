import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subject, takeUntil } from 'rxjs';
import { IJob } from '../../../../Interfaces/letters-model';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { OpenModalService } from '../../../../services/open-modal.service';
import { HttpService } from '../../../../services/http.service';
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
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
@Component({
  selector: 'app-claimsandexpenses-for-you-request',
  imports: [DateformatPipe, CommonModule, ReactiveFormsModule, FormsModule, NoDataFoundComponent, PaginatorModule,
    DropdownModule, NgbPopoverModule, TranslateModule, NgxDocViewerModule],
  templateUrl: './claimsandexpenses-for-you-request.component.html',
  styleUrl: './claimsandexpenses-for-you-request.component.scss',
})

export class ClaimsandexpensesForYouRequestComponent
  implements OnInit, OnDestroy {
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
  destroy$: Subject<boolean> = new Subject<boolean>();
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

  constructor(private modalService: NgbModal, private fb: FormBuilder, private http: HttpService, private sharedModalService: OpenModalService,
    private sanitizer: DomSanitizer, public rbac: RbacService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.getAllPendingApprovals();
  }

  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250), noWhitespaceValidator]],
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250,), noWhitespaceValidator]],
    });
  }

  getAllPendingApprovals() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.http.getData(`PendingApproval/employee/${EmployeeId}?moduleId=19&approvedType=EMP`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.expenseheaderpending = (response.data as ExpenseApprovalResponse[]).filter((item) =>
          item.approvalHeader.status != 'Processed' && item.approvalHeader.status != 'Rejected'
        );
      },
      error: (reason) => console.log(reason),
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
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
        approvedBy: this.empinfo.employeeId.toString(),
      };
      this.sharedModalService.openLoaderModal('Approving Request, Please wait...');
      this.http.putData(`PendingApproval/${this.selectedLeaveData.approvalHeader.id}`, requestBody).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal('Request Approved Successfully');
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
        approvedBy: this.empinfo.employeeId.toString(),
      };
      this.sharedModalService.openLoaderModal('Rejecting Request, Please wait...');
      this.http.putData(`PendingApproval/${this.selectedLeaveData.approvalHeader.id}`, requestBody).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.sharedModalService.openSuccessModal('Request Rejected Successfully');
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
          this.getAllPendingApprovals();
        },
      });
    }
  }

  handleProcess(request: ExpenseApprovalResponse) {
    let requestBody = {
      status: 'Processed',
      approvedBy: this.empinfo.employeeId.toString(),
    };
    this.sharedModalService.openLoaderModal('Processing Request, Please wait...');
    this.http.putData(`PendingApproval/process/${request.approvalHeader.id}`, requestBody).pipe(takeUntil(this.destroy$)).subscribe({
      next: (respone: any) => {
        this.modalService.dismissAll();
        this.sharedModalService.openSuccessModal('Request Processed Successfully');
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
    this.modalService.open(commentspopup, { centered: true, backdrop: 'static', size: 'lg' });
    this.approverComments = value;
  }

  viewItem(expid: number) {
    this.updataid = expid;
    this.http.getitembyid(`Expenses_Header/getby_Expense_ID`, expid).pipe(takeUntil(this.destroy$)).subscribe({
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
          const fileNameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
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
    if (url?.endsWith('jpg') || url?.endsWith('png') || url?.endsWith('jpeg')) {
      this.http.DownloadDataWithQuery('FileSystem/Downloadfile', url).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          const blob = new Blob([res['body']], { type: 'image/png' });
          const objectURL = URL.createObjectURL(blob);
          this.expenseImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          this.toggleViewModal();
        },
        error: (reason) => console.log(reason),
      });
    } else {
      this.expenseViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModal();
    }
  }

  toggleViewModal() {
    this.modalService.dismissAll();
    this.openModal(this.viewattamchment);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
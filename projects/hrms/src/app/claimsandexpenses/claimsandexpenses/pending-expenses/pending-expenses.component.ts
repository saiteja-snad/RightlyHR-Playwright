import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IExpense, IExpenseHeaders } from '../../../Interfaces/claimsandexpenses.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { DateformatPipe } from '../../../pipes/dateformat.pipe';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { FormValidationService } from '../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { DownloadExpenseComponent } from "../../download-expense/download-expense.component";
import { DocumentViewIconComponent } from "../../../icons/document-view-icon/document-view-icon.component";
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { OpenModalService } from '../../../services/open-modal.service';

@Component({
  selector: 'app-pending-expenses',
  imports: [CommonModule, DateformatPipe, TranslateModule, NgxDocViewerModule, FormsModule, NoDataFoundComponent, DataLoaderContentComponent, DownloadExpenseComponent, DocumentViewIconComponent, TableModule, ReactiveFormsModule],
  templateUrl: './pending-expenses.component.html',
  styleUrl: './pending-expenses.component.scss'
})

export class PendingExpensesComponent implements OnInit, OnDestroy {
  empinfo: any
  subscription!: Subscription;
  ExpenseImageUrl: any;
  ExpenseViewURL: any;
  flitredWaitingforApprovalExpenses = new BehaviorSubject<any[]>([]);
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  expenseheaderiteams!: IExpenseHeaders;
  updataid!: number;
  commentsrecivced = [] as any
  searchTerm: any = ''
  approverComments = [] as any[];
  seletedMouthly: any;
  loading = false
  @ViewChild('commentspopup') modalContent: any;
  expenesEmplyeedata = new BehaviorSubject<IExpense[]>([])
  draftsCount: number = 0;
  expensesAttachment: any;
  selectedData = {} as any;
  selectedExpenses: any[] = [];
  selectedExpenseData: any;
  responseSummary: any;
  spinnerLoader = false;
  approveForm!: FormGroup;
  rejectForm!: FormGroup;
  selectedLeaveStatus: any;


  @ViewChild('expenseSummary') expenseSummary: any;
  constructor(private http: HttpService, public formValidation: FormValidationService, private modalService: NgbModal, private sanitizer: DomSanitizer, private SelectedyeartimeOffService: TimeoffYearFilterService, private fb: FormBuilder, private sharedModalService: OpenModalService) { }

  selectedYear: any;
  selectemp: any;
  ngOnInit(): void {
    this.SelectedyeartimeOffService.selectedYear$.subscribe(year => {
      if (year !== null) {
        this.selectedYear = year;

        this.SelectedyeartimeOffService.selectedMounthly$.subscribe(mounthly => {
          if (mounthly !== null) {
            this.seletedMouthly = mounthly;

          }
        })
        this.http.selectedEmployeeIdExpenses$.subscribe((id) => {
          if (id) {
            this.selectemp = id;
            this.getexpensesheaderbyemployeeid();
          } else {
            this.selectemp = null;
            this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
            this.getexpensesheaderbyemployeeid();
          }
        });
      }
    });
  }

  intializeApproveForm() {
    this.approveForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });

    this.approveForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null;
      }
    });
  }

  intializeRejectForm() {
    this.rejectForm = this.fb.group({
      comments: ['', [Validators.required, Validators.maxLength(250)]],
    });

    this.rejectForm.get('comments')?.valueChanges.subscribe((value: string) => {
      if (!value || value.trim() === '') {
        this.selectedLeaveStatus = null;
      }
    });
  }



  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }
  //download expenses popup open function
  openpopupforDownload(content: any, expenseDetails: any) {
    this.selectedData = expenseDetails;
    this.modalService.open(content, { size: 'xl', centered: true });
  }

  comments_Function(comments: any) {
    this.commentsrecivced = comments
  }

  getexpensesheaderbyemployeeid(): void {
    let empId = this.selectemp ?? this.empinfo?.employeeId;
    this.loading = true
    const cleanSearchQuery = this.searchTerm || ''
    this.subscription = this.http
      .getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}&status=Waiting for Approval&month=${this.seletedMouthly}&year=${this.selectedYear}&searchQuery=${cleanSearchQuery}`,).subscribe({
        next: (data: any) => {
          this.loading = false
          const filteredData = data.filter((item: any) => !item.expenseSummary);
          this.expenesEmplyeedata.next(filteredData)

        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  viewItem(expid: number,) {
    this.updataid = expid;
    this.subscription = this.http
      .getitembyid(`Expenses_Header/getby_Expense_ID`, expid).subscribe({
        next: (data: any) => {
          this.expenseheaderiteams = data
        }, error(err) {
          console.log("expensesheadererror", err)
        },
      });
  }

  comments(value: any, commentspopup: any) {
    this.modalService.open(commentspopup, {
      centered: true,
      backdrop: 'static',
      size: 'lg',
    });
    this.approverComments = value;
  }
  private renameFiles(originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }
  onSelectDownload(file: any): void {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file).subscribe({
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
      }
    });
  }

  onViewAttachement(url: any) {
    const lowerUrl = url?.toLowerCase();
    if (lowerUrl?.endsWith('jpg') || lowerUrl?.endsWith('jpeg') || lowerUrl?.endsWith('png')) {
      this.subscription = this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', url)
        .subscribe({
          next: (res: any) => {
            const blob = new Blob([res['body']], { type: 'image/png' });
            const objectURL = URL.createObjectURL(blob);
            this.ExpenseImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            this.ExpenseViewURL = null;
            this.toggleViewModal();
          },
          error: (err) => console.error('Error downloading image:', err),
        });
    } else if (lowerUrl?.endsWith('pdf')) {
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`; // assumed to be full URL
      this.toggleViewModal();
    } else {
      // fallback for other types if needed
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModal();
    }
  }

  toggleViewModal() {
    this.modalService.dismissAll();
    this.openModal(this.viewattamchment)
  }

  isImageFile(url: any): boolean {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.endsWith('.jpg') || lowerUrl.endsWith('.jpeg') || lowerUrl.endsWith('.png');
  }

  selectCheck(value: any) {
    this.selectedExpenses = [...value];
  }

  approveExpense(popup: any, item: any) {
    this.selectedExpenseData = item;

    this.modalService.open(popup, {
      centered: true,
      backdrop: 'static'
    });
  }

  rejectExpense(popup: any, item: any) {
    this.selectedExpenseData = item;

    this.modalService.open(popup, {
      centered: true,
      backdrop: 'static'
    });
  }

  handleAccept(form: FormGroup) {

    this.spinnerLoader = true;

    const payload = {
      requestProcessedBy: this.LOGIN.employeeId.toString(),
      status: 'Approved',
      comments: this.approveForm.value.comments,
      moduleId: 19, // Replace with actual Expense Module Id
      headerRequests:
        this.selectedExpenses.length > 0
          ? this.selectedExpenses.map(item => ({
            headerID: item.pendingApprovalHeader?.id,
            currentStage: item.pendingApprovalHeader?.currentapprovalStage
          }))
          : [
            {
              headerID: this.selectedExpenseData.pendingApprovalHeader?.id,
              currentStage:
                this.selectedExpenseData.pendingApprovalHeader?.currentapprovalStage
            }
          ]
    };

    this.http.putData(
      'v2/PendingApproval/multiapprovals',
      payload
    ).subscribe({
      next: (response: any) => {

        const selectedCount = this.selectedExpenses.length;

        this.selectedExpenses = [];
        this.modalService.dismissAll();

        this.responseSummary = response.data;

        if (selectedCount > 1) {

          this.modalService.open(this.expenseSummary, {
            centered: true,
            backdrop: 'static',
            size: 'lg'
          });

          setTimeout(() => {
            this.modalService.dismissAll();
          }, 3000);

        } else {

          this.sharedModalService.openSuccessModal(
            'Expense request approved successfully'
          );

        }

        this.approveForm.reset();
        this.getexpensesheaderbyemployeeid();
      },
      error: (err) => {
        console.log(err);
        this.modalService.dismissAll();
      },
      complete: () => {
        this.spinnerLoader = false;
      }
    });
  }

  handleReject(form: FormGroup) {

    this.spinnerLoader = true;

    const payload = {
      requestProcessedBy: this.LOGIN.employeeId.toString(),
      status: 'Rejected',
      comments: this.rejectForm.value.comments,
      moduleId: 19, // Replace with actual Expense Module Id
      headerRequests:
        this.selectedExpenses.length > 0
          ? this.selectedExpenses.map(item => ({
            headerID: item.pendingApprovalHeader?.id,
            currentStage: item.pendingApprovalHeader?.currentapprovalStage
          }))
          : [
            {
              headerID: this.selectedExpenseData.pendingApprovalHeader?.id,
              currentStage:
                this.selectedExpenseData.pendingApprovalHeader?.currentapprovalStage
            }
          ]
    };

    this.http.putData(
      'v2/PendingApproval/multiapprovals',
      payload
    ).subscribe({
      next: (response: any) => {

        const selectedCount = this.selectedExpenses.length;

        this.selectedExpenses = [];
        this.modalService.dismissAll();

        this.responseSummary = response.data;

        if (selectedCount > 1) {

          this.modalService.open(this.expenseSummary, {
            centered: true,
            backdrop: 'static',
            size: 'lg'
          });

          setTimeout(() => {
            this.modalService.dismissAll();
          }, 3000);

        } else {

          this.sharedModalService.openSuccessModal(
            'Expense request rejected successfully'
          );

        }

        this.rejectForm.reset();
        this.getexpensesheaderbyemployeeid();
      },
      error: (err) => {
        console.log(err);
        this.modalService.dismissAll();
      },
      complete: () => {
        this.spinnerLoader = false;
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

  openApproveModal(content: any, item: any) {
    this.selectedLeaveStatus = null;   // add this
    this.intializeApproveForm();
    this.selectedExpenseData = item;

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static'
    });
  }

  openRejectModal(content: any, item: any) {
    this.selectedLeaveStatus = null;   // add this
    this.intializeRejectForm();
    this.selectedExpenseData = item;

    this.modalService.open(content, {
      centered: true,
      backdrop: 'static'
    });
  }

  LOGIN: any = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');

  canApproveExpense(exp: any): boolean {

    console.log(JSON.stringify(exp, null, 2));
    const currentApproverId =
      exp?.pendingApprovalHeader?.currentApproverId;

    const loginId =
      this.LOGIN.employeeId?.toString();

    return currentApproverId?.toString() === loginId;
  }

  canShowBulkActions(): boolean {

    if (!this.selectedExpenses?.length) {
      return false;
    }

    return this.selectedExpenses.every(
      expense => this.canApproveExpense(expense)
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
import { Component, ViewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, BehaviorSubject, takeUntil, Subject, debounceTime } from 'rxjs';
import { FormValidationService } from '../../../../../../../preonboarding/src/app/common-services/form-validation.service';
import { environment } from '../../../../../environments/environment';
import { IExpenseHeaders, IExpense } from '../../../../Interfaces/claimsandexpenses.model';
import { HttpService } from '../../../../services/http.service';
import { TimeoffYearFilterService } from '../../../../services/timeoff-year-filter.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DownloadExpenseComponent } from '../../../../claimsandexpenses/download-expense/download-expense.component';
import { DateformatPipe } from '../../../../Pipes/dateformat.pipe';
import { DataLoaderContentComponent } from '../../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-on-behalf-of-expenses-waiting-for-approval',
  imports: [CommonModule, DateformatPipe, NgxDocViewerModule, FormsModule, NoDataFoundComponent, DataLoaderContentComponent, DownloadExpenseComponent],
  templateUrl: './on-behalf-of-expenses-waiting-for-approval.component.html',
  styleUrl: './on-behalf-of-expenses-waiting-for-approval.component.scss'
})
export class OnBehalfOfExpensesWaitingForApprovalComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();
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
  constructor(private http: HttpService, public formValidation: FormValidationService,
    private modalService: NgbModal, private sanitizer: DomSanitizer,
    private SelectedyeartimeOffService: TimeoffYearFilterService) {


  }
  selectedYear: any;
  selectemp: any;
  ngOnInit(): void {
    this.http.selectedEmployeeIdExpensesforonbehalf$.pipe(debounceTime(100),takeUntil(this.destroy$)).subscribe((id) => {
      console.log(id)
      if (id) {
        this.selectemp = id;
        this.getExpensesHeaderByEmployeeId();
      } else {
        this.selectemp = null;
        this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
        this.getExpensesHeaderByEmployeeId();
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

  getExpensesHeaderByEmployeeId(): void {
    this.loading = true;
    const empId = this.selectemp
    const status = 'Waiting for Approval';
    const searchQuery = this.searchTerm?.trim() || '';
    this.http.getData(`v2/Expenses_Header/gettotalamount?EmployeeId=${empId}&status=${encodeURIComponent(status)}&searchQuery=${encodeURIComponent(searchQuery)}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          this.expenesEmplyeedata.next(response);
          const filteredData = response.filter((item: any) => !item.expenseSummary);
          this.expenesEmplyeedata.next(filteredData)
        },
        error: (error: any) => {
          this.loading = false;
          this.expenesEmplyeedata.next([]);
        },
        complete: () => {
          this.loading = false;
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}